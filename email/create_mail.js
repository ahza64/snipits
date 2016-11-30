var mustache = require("mustache");

var BPromise = require('bluebird');
var fs = BPromise.promisifyAll(require("fs"));
var path = require('path');
var _ = require('underscore');
var send_email = require('./send_email');



function loadDBTemplate(template_name) {
  var EmailTemplate = require('dsp_shared/database/model/email/template'); 
  return EmailTemplate.findAll({template_name: template_name}).then(templates => {
    var tmpl = {body: {}};
    for(var i = 0; i < templates.length; i++) {
      tmpl.subject = templates[i].subject;
      tmpl.body[templates[i].body_type] = templates[i].body;
    }
    console.log("TEMPLATE", tmpl);
    return tmpl;
  });
}


function loadFileTemplate(template_name) {
  return fs.readFileAsync(path.dirname(__filename)+"/templates/"+template_name+".json").then(data => {
    return JSON.parse(data);
  });
}


function loadDBDistList(name) {
  var DistList = require('dsp_shared/database/model/email/distribution_list'); 
  return DistList.findAll({list_name: name}).then(emails => {
    var list = [];
    for(var i = 0; i < emails.length; i++) {
      list.push({name: emails[i].name, email: emails[i].email});
    }
    
    return list;
  });
}


function loadFileDistList(name) {
  return fs.readFileAsync(path.dirname(__filename)+"/distribution_lists/"+name+".json").then(data => {
    return JSON.parse(data);
  });
}



function loadTemplate(template_name) {
  return loadFileTemplate(template_name).catch( () => {
    return loadDBTemplate(template_name);
  });
}

function loadDistributionList(name, concat){
  concat = concat || false;
  
  return loadFileDistList(name).catch(()=> {
    return loadDBDistList(name);
  }).then(list => {
    if(!concat) {
      return list;
    } else {
      var out = [];
      for(var i = 0; i < list.length; i++) {
        var item = list[i];
        
        if(item.name) {
          var entry = "";
          entry += item.name;
          entry += `  <${item.email}>`;
          out.push(entry);
        } else {
          out.push(item.email);
        }
      }
      return out.join(', ');
    }
  });
}

function *processTemplate(template, values) {
  var message = {};
  template = yield loadTemplate(template);
  
  if(template.subject) {
    message.subject = mustache.render(template.subject, values);
  }
  
  if(template.body) {
    for(var type in template.body) {
      if(template.body.hasOwnProperty(type))  {
        var body = template.body[type];
        if(values) {
          body = mustache.render(body, values);
        }
        message[type] = body;          
      }
    }
  }
  return message;
}

/**
 * 
 */
function *generateEmail(to, from, template, values, subject, text, html, replyTo, dry_run) {
  var message = {};
  
  message.to = to;
  message.template = template;
  message.values = values;
  
  if(from) {
    message.from = from;
    message.replyTo = from;
  } else {
    message.from = "Dispatchr <no-reply@dispatchr.co>";
    message.replyTo = from;
  }
  
  if(replyTo) {
    message.replyTo = replyTo;
  }

  if(text) {
    message.text = text;
  }
  if(html) {
    message.html = html;
  }
  if(subject) {
    message.subject = subject;
  }
  return yield send(message, dry_run);
}

/**
 * @param options
 * @param options.to    - email address or distirbution list
 * @param options.from
 * @param options.template
 * @param options.html
 * @param options.text
 * @param options.replyTo
 */
function *send(options, dry_run) {
  console.log("SEND...", options, dry_run);
  if(options.template) {
    _.extend(options, yield processTemplate(options.template, options.values));
    delete options.template;
  } 

  if(options.to) {
    if(options.to.indexOf('@') === -1) {
      options.to = yield loadDistributionList(options.to, true);
    }
  }
  
  // console.log("generateEmail", options);
  if(dry_run) {
    return [false, options, 'Send Not Requested'];
  } else {
    return yield send_email(options).then((result) => {
      return [true, options, result];
    }).catch(error => {
      return [false, options, error];
    });    
  }  
}

module.exports = send;

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');  
  var util = require('dsp_shared/lib/cmd_utils');
  util.connect(["postgres"]);
  
  baker.command(function*(to, from, template, values, subject, text, html, dry_run, reply) {
    console.log("SDFDSF", to, from, template, values, subject, text, html, dry_run, reply);
    return yield generateEmail(to, from, template, values, subject, text, html, dry_run, reply);
  }, {command: "generateEmail", default: true, opts: 'values'});
  baker.run();
}
