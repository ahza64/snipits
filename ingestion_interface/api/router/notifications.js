// Configs
const config = require('dsp_shared/conf.d/config.json').mooncake;

// Utils
const Util = require('util');

// Mail service
const Service = require('../../../email/service');

// Collections
const Admins = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;

// Send email notification
var send = function*(user, ingestion, action) {
  try {
    if ((config.notifications) && (config.notifications.enabled === true)) {
      if (action === 'upload') {
        yield sendUploadNotifications(user, ingestion);
      }
      if (action === 'delete') {
        yield sendDeleteNotifications(user, ingestion);
      }
    }
  } catch (e) {
    console.error(e);
  }
};

var sendUploadNotifications = function*(user, ingestion) {
  var subject = "Ingestion Platform Notification";
  var fileName = Util.format('%s (%s)', ingestion.customerFileName, ingestion.s3FileName);
  var text = Util.format('The file %s was uploaded by %s (%s).', fileName, user.name, user.email);
  yield sendNotifications(ingestion, subject, text);
};

var sendDeleteNotifications = function*(user, ingestion) {
  var subject = "Ingestion Platform Notification";
  var fileName = Util.format('%s (%s)', ingestion.customerFileName, ingestion.s3FileName);
  var text = Util.format('The file %s was deleted by %s (%s).', fileName, user.name, user.email);
  yield sendNotifications(ingestion, subject, text);
};

var sendNotifications = function*(ingestion, subject, text) {
  var ingestors = yield getIngestors(ingestion.companyId);
  if (ingestors) {
    var recipient = '';
    for (var i = 0; i < ingestors.length; i++) {
      if ((ingestors[i].email) && (ingestors[i].email.indexOf('@') != -1)) {
        if (recipient.length > 0) {
          recipient += ', ';
        }
        recipient += Util.format('%s <%s>', ingestors[i].name, ingestors[i].email);
      }
    }
    if (recipient.length > 0) {
      yield sendEmail(subject, text, recipient);
    }
  }
};

var getIngestors = function*(companyId) {
  return yield Admins.findAll({
    where: {
      companyId: companyId,
      role: 'DI'
    },
    raw: true
  });
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

module.exports = { 'send': send };
