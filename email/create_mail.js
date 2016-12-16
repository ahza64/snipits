/**
 * @@author <gabe@dispathcr.co> (Gabriel Littman)
 * @module email/create_mail 
 */
var mustache = require("mustache");

var BPromise = require('bluebird');
var fs = BPromise.promisifyAll(require("fs"));
var path = require('path');
var _ = require('underscore');
var send_gmail = require('./send_gmail');



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
function *generateEmail(to, from, template, values, subject, text, html, replyTo, send) {
  var message = {};
  
  message.to = to;
  message.template = template;
  message.values = values;
  message.from = from;    
  message.replyTo = replyTo;
  message.text = text;
  message.html = html;
  message.subject = subject;
  
  return yield create_email(message, send);
}

/**
 * @param {Object}  options            options
 * @param {String}  options.to         email address or distribution list 
 * @param {String}  options.from       from who is the email from
 * @param {String}  options.replyTo    from who should be set as reply to
 * @param {String}  options.template   template name
 * @param {String}  options.subject    email subject, template takes presidence
 * @param {String}  options.text       text email body , template takes presidence
 * @param {String}  options.html       html email body, template takes presidence
 * @param {Boolean} options.send       if ture email will be sent
 * @return {Object} result
 * @return {Object} result.sent        true if email was sent
 * @return {Object} result.error       error message if email not sent
 * @return {Object} result.{other}     other final options used to send email
 */
function *create_email(options, send) {
  
  options.from = options.from || "Dispatchr <no-reply@dispatchr.co>";
  options.replyTo = options.replyTo || options.from;
  
  if(options.template) {
    _.extend(options, yield processTemplate(options.template, options.values));
    delete options.template;
  } 

  if(options.to) {
    if(options.to.indexOf('@') === -1) {
      options.to = yield loadDistributionList(options.to, true);
    }
  }
  
  options.sent = false;
  // console.log("generateEmail", options);
  if(send) {
    return yield send_gmail(options).then((send_response) => {
      options.sent = true;
      options.send_response = send_response;
    }).catch(error => {
      options.sent = false;
      options.error = error;
    });    
  } else {
    options.sent = false;
    options.error = 'Send Not Requested';
  } 
  return options;
}

module.exports = create_email;

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');  
  var util = require('dsp_shared/lib/cmd_utils');
  util.connect(["postgres"]);
  
  baker.command(generateEmail, {command: "generateEmail", default: true, opts: 'values'});
  baker.run();
}
