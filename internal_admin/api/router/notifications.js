// Configs
const config = require('dsp_shared/conf.d/config.json').mooncake;

// Utils
const Util = require('util');

// Mail service
const Service = require('../../../email/service');

// Collections
const Ingestions = require('dsp_shared/database/model/ingestion/tables').ingestion_files;
const Watchers = require('dsp_shared/database/model/ingestion/tables').ingestion_watchers;

// Send email notification to new customer user
var userCreated = function*(companyName, user, password) {
  try {
    if ((user) && (user.email) && (user.email.indexOf('@') != -1)) {
      var subject = "Ingestion Platform | Registration Details";
      var text = [
        Util.format('Hello %s!', user.name),
        Util.format('You were added as customer user of %s:', companyName),
        Util.format('Login: %s', user.email),
        Util.format('Password: %s', password)
      ].join('\n');
      var recipient = Util.format('%s <%s>', user.name, user.email);
      yield sendEmail(subject, text, recipient);
    }
  } catch (e) {
    console.error(e);
  }
};

// Send email notifications to watchers
var fileIngested = function*(user, fileId) {
  try {
    var ingestion = yield Ingestions.findOne({
      where: { id: fileId },
      raw: true
    });
    if (ingestion.ingested) {
      var watchers = yield Watchers.findAll({
        where: { ingestionConfigurationId: ingestion.ingestionConfigurationId },
        raw: true
      });
      yield sendToWatchers(user, ingestion, watchers);
    }
  } catch (e) {
    console.error(e);
  }
};

var sendToWatchers = function*(user, ingestion, watchers) {
  if (watchers) {
    var recipient = '';
    for (var i = 0; i < watchers.length; i++) {
      if ((watchers[i].email) && (watchers[i].email.indexOf('@') != -1)) {
        if (recipient.length > 0) {
          recipient += ', ';
        }
        recipient += watchers[i].email;
      }
    }
    if (recipient.length > 0) {
      var subject = "Ingestion Platform | File Ingested";
      var fileName = Util.format('%s (%s)', ingestion.customerFileName, ingestion.s3FileName);
      var text = Util.format('The file %s was ingested by %s (%s).', fileName, user.name, user.email);
      yield sendEmail(subject, text, recipient);
    }
  }
};

var sendEmail = function*(subject, text, recipient) {
  var sender = config.notifications.sender || 'gabe@dispatchr.co';
  return new Promise(function (resolve, reject) {
    Service.request({
      host: config.notifications.host || '127.0.0.1',
      port: config.notifications.port || '5555',
      to: recipient,
      from: Util.format('Ingestion Platform <%s>', sender),
      subject: subject,
      text: text
    }).then((result) => {
      resolve(result);
    }).catch((error) => {
      console.error(error);
      resolve(null);
    });
  });
};

module.exports = { 'userCreated': userCreated, 'fileIngested': fileIngested };
