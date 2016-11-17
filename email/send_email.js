var credentials = require("./client_secret.json");
var token = require("./email_service_token.json");

var auth = require("./google_api_auth");
var google = require('googleapis');


function makeBody(to, from, subject, message) {
    var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "from: ", from, "\n",
        "subject: ", subject, "\n\n",
        message
    ].join('');

    var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
        return encodedMail;
}


function sendMessage(raw_email) {
  var gmail = google.gmail('v1');
  var email_auth = auth.authorize(credentials, token);
  return new Promise((resolve, reject) => {
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
}


module.exports = sendMessage;

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  baker.command(function(to, from, subject, message) {
    var raw = makeBody(to, from, subject, message);
    sendMessage(raw);
  }, {command: "sendEmail", required: ["to", "message"]});
  baker.run();
}
