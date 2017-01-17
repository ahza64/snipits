// Database
const database = require('../database');

var getIngestions = function(companyId) {
  var ingestions = database.data.ingestions.filter(function(ingestion) {
    return ingestion.companyId === companyId;
  });
  return ingestions;
};

var updateIngestion = function(ingestion) {
  database.data.ingestions.forEach(function(i) {
    if (i.id === ingestion.ingestionId) {
      if (ingestion.ingested) {
        i.ingested = ingestion.ingested;
      }
      if (ingestion.description) {
        i.description = ingestion.description;
      }
    }
  });
};

module.exports = {
  'getIngestions': getIngestions,
  'updateIngestion': updateIngestion
};