// Database
const database = require('../database');

var getTaxonomies = function (schemaId) {
  var taxonomies = database.data.taxonomies.filter(function (c) {
    return c.qowSchemaId === schemaId;
  });
  return taxonomies
};

module.exports = {
  'getTaxonomies': getTaxonomies
};
