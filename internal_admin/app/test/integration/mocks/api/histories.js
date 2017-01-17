// Database
const database = require('../database');

var createHistory = function(ingestion, action) {
  var maxId = 0;
  database.data.histories.forEach(function(h) {
    if (h.id > maxId) {
      maxId = h.id;
    }
  });
  database.data.histories.push({
    id: maxId + 1,
    customerFileName: ingestion.customerFileName,
    action: action,
    createdAt: new Date(),
    companyId: ingestion.companyId,
    ingestionConfigurationId: ingestion.ingestionConfigurationId,
    ingestionFileId: ingestion.id,
    userId: null,
    userName: null,
    dispatchrAdminId: null,
    adminName: null
  });
};

module.exports = {
  'createHistory': createHistory
};