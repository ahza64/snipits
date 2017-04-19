// Init data
const companies = require('./data/companies');
const projects = require('./data/projects');
const configs = require('./data/configs');
const watchers = require('./data/watchers');
const ingestions = require('./data/ingestions');
const histories = require('./data/histories');
const admins = require('./data/admins');
const users = require('./data/users');
const schemas = require('./data/schemas');
const taxonomies = require('./data/taxonomies');
const taxFields = require('./data/taxFields');

var data = {};

var init = function(){
  data = {
    taxFields: taxFields,
    taxonomies: taxonomies,
    schemas: schemas,
    companies: companies,
    projects: projects,
    configs: configs,
    watchers: watchers,
    ingestions: ingestions,
    histories: histories,
    admins: admins,
    users: users
  };
}

var clear = function(){
  data = {
    taxFields: [],
    taxonomies: [],
    schemas: [],
    companies: [],
    projects: [],
    configs: [],
    watchers: [],
    ingestions: [],
    histories: [],
    admins: [],
    users: []
  };
};

init();

module.exports = {
  'data': data,
  'init': init,
  'clear': clear
};
