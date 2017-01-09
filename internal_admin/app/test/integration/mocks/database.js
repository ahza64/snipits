// Init data
const companies = require('./data/companies');
const projects = require('./data/projects');

var data = {};

var init = function(){
  data = {
    companies: companies,
    projects: projects
  };
}

var clear = function(){
  data = {
    companies: [],
    projects: []
  };
};

init();

module.exports = {
  'data': data,
  'init': init,
  'clear': clear
};