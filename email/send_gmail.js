var credentials = require("./client_secret.json");
var token = require("./email_service_token.json");
var mailcomposer = require("mailcomposer");
var auth = require("./google_api_auth");
var google = require('googleapis');
var BPromise = require('bluebird');


function googleAPISend(mailOptions) {
  var gmail = google.gmail('v1');
  var email_auth = auth.authorize(credentials, token);
  
  var mail = mailcomposer(mailOptions);
  mail.buildAsync = BPromise.promisify(mail.build);

  return mail.buildAsync().then(raw_msg => {
    raw_msg = raw_msg.toString();  
    raw_msg = new Buffer(raw_msg).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');    
    return raw_msg;
  }).then(raw_email => {
    return new BPromise((resolve, reject) => {
      gmail.users.messages.send({
          auth: email_auth,
          userId: 'me',
          resource: {
              raw: raw_email
          }
      }, function(err, response) {
        if(err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    });
  });  
}

var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://app%40dispatchr.co:654natoma@smtp.gmail.com');



function smtpSendMail(mailOptions) {
  // setup e-mail data with unicode symbols
  // mailOptions = {
  //     from: '"Fred Foo" <foo@blurdybloop.com>', // sender address
  //     to: 'gabe@dispatchr.co', // list of receivers
  //     subject: 'Hello ✔', // Subject line
  //     text: 'Hello world 🐴', // plaintext body
  //     html: '<b>Hello world 🐴</b>' // html body
  // };
  
  return new Promise((resolve, reject) => {
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
          reject(error);            
        } else {
          resolve(info.response);
        }
    });
  });  
}




module.exports = smtpSendMail;

// {googleAPISend: googleAPISend, smtpSendMail:smtpSendMail};

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  baker.command(function(to, from, subject, message) {
    googleAPISend({to: to, from: from, subject: subject, text: message});
  }, {command: "sendEmail", required: ["to", "message"]});
  baker.run();
  
}
