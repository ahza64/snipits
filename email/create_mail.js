var mailcomposer = require("mailcomposer");
var mustache = require("mustache");

var BPromise = require('bluebird');
var fs = BPromise.promisifyAll(require("fs"));
var path = require('path');
var _ = require('underscore');
var send_email = require('./send_email');


function loadFileTemplate(template_name) {
  return fs.readFileAsync(path.dirname(__filename)+"/templates/"+template_name+".json").then(data => {
    return JSON.parse(data);
  });
}
function loadFileDistList(name) {
  return fs.readFileAsync(path.dirname(__filename)+"/distribution_lists/"+name+".json").then(data => {
    return JSON.parse(data);
  });
}



function loadTemplate(template_name) {
  return loadFileTemplate(template_name);
}

function loadDistributionList(name, concat){
  concat = concat || false;
  
  return loadFileDistList(name).then(list => {
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
    message.subject = template.subject;
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
function *generateEmail(to, from, template, values, subject, text, html, send) {
  var message = {};
  
  if(from) {
    message.from = from;
  } else {
    message.from = "Dispatchr <no-reply@dispatchr.co>";
  }

  if(to) {
    if(to.indexOf('@') !== -1) {
      message.to = to;
    } else {
      message.to = yield loadDistributionList(to, true);
    }
  }
  
  if(template) {
    _.extend(message, yield processTemplate(template, values));
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
  
  // console.log("generateEmail", message);
  
  var mail = mailcomposer(message);
  mail.buildAsync = BPromise.promisify(mail.build);
  
  var raw_msg = yield mail.buildAsync();
  raw_msg = raw_msg.toString();

  if(send) {
    var encoded = new Buffer(raw_msg).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    send_email(encoded);
    console.log("SENT");
  }
  
  return raw_msg;
}

module.exports = generateEmail;

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');  
  baker.command(generateEmail, {default: true, opts: 'values'});
  baker.run();
}
