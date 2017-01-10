
const company = require('../company/company');
const ingest_config = require('../config/config');
const ingestion_file = require('../ingestion/ingestion_file')
const user = require('../login/user');

const history = {
  "userName": "testUser",
  "adminName": "testAdmin",
  "action": "ingest",
  "createdAt": Date.now(),
  "updatedAt": Date.now(),
  "companyId": company.id,
  "ingestionConfigurationId": ingest_config.id,
  "ingestionFileId": ingestion_file.id,
  "userId": user.id,
  "email": user.email,
  "customerFileName": ingestion_file.customerFileName
};

module.exports = history;
