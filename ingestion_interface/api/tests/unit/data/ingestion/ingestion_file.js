
const company = require('../company/company');
const ingest_config = require('../config/config');

const ingest_file = {
  "customerFileName": "admin",
  "s3FileName": "123",
  "ingested": false,
  "description": "test description",
  "createdAt": Date.now(),
  "updatedAt": Date.now(),
  "companyId": company.id,
  "ingestionConfigurationId": ingest_config.id
};

module.exports = ingest_file;
