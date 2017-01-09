// Init data
const companies = require('./data/companies');

var data = {};

var init = function(){
  data = {
    companies: companies
  };
}

var clear = function(){
  data = {
    companies: []
  };
};

init();

module.exports = {
  'data': data,
  'init': init,
  'clear': clear
};