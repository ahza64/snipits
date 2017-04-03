// Database
const database = require('../database');

var getTaxonomies = function (schemaId) {

  // var companies = database.data.companies.filter(function (c) {
  //   return c.qowSchemaId === schemaId;
  // });
  //
  // var projects = database.data.projects.filter(function (c) {
  //   return c.qowSchemaId === schemaId;
  // });
  //
  // var schemas = database.data.schemas.filter(function (c) {
  //   return c.qowSchemaId === schemaId;
  // });

  var taxonomies = database.data.taxonomies.filter(function (c) {
    return c.qowSchemaId === schemaId;
  });

  // var data = {
    // companies: companies,
    // projects: projects,
    // schemas: schemas,
    // taxonomies: taxonomies
  // }
  
  return taxonomies
};

module.exports = {
  'getTaxonomies': getTaxonomies
};
