// Init data
const companies = require('./data/companies');
const projects = require('./data/projects');
const configs = require('./data/configs');
const watchers = require('./data/watchers');
const ingestions = require('./data/ingestions');
const histories = require('./data/histories');

var data = {};

var init = function(){
  data = {
    companies: companies,
    projects: projects,
    configs: configs,
    watchers: watchers,
    ingestions: ingestions,
    histories: histories
  };
}

var clear = function(){
  data = {
    companies: [],
    projects: [],
    configs: [],
    watchers: [],
    ingestions: [],
    histories: []
  };
};

init();

module.exports = {
  'data': data,
  'init': init,
  'clear': clear
};