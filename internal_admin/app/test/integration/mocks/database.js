// Init data
const companies = require('./data/companies');
const projects = require('./data/projects');
const configs = require('./data/configs');
const watchers = require('./data/watchers');

var data = {};

var init = function(){
  data = {
    companies: companies,
    projects: projects,
    configs: configs,
    watchers: watchers
  };
}

var clear = function(){
  data = {
    companies: [],
    projects: [],
    configs: [],
    watchers: []
  };
};

init();

module.exports = {
  'data': data,
  'init': init,
  'clear': clear
};