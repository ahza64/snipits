// Database
const database = require('../database');

var createCompany = function(companyName) {
  var companies = database.data.companies;
  var exists = false;
  var maxId = 0;
  for (var i = 0; i < companies.length; i++) {
    if (companies[i].name.toLowerCase() === companyName.toLowerCase()) {
      exists = true;
    }
    if (companies[i].id > maxId) {
      maxId = companies[i].id;
    }
  }
  if (!exists) {
    companies.push({
      id: maxId+1,
      name: companyName,
      createAt: new Date()
    });
  }
};

module.exports = {
  'createCompany': createCompany
};