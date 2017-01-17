// Database
const database = require('../database');

var getProjects = function(companyId) {
  var projects = database.data.projects.filter(function(p) {
    return p.companyId === companyId;
  });
  return projects;
};

var createProject = function(projectName, companyId) {
  var projects = getProjects(companyId);
  var exists = false;

  for (var i = 0; i < projects.length; i++) {
    if (projects[i].name.toLowerCase() === projectName.toLowerCase()) {
      exists = true;
    }
  }

  if (!exists) {
    var allProjects = database.data.projects;
    var maxId = 0;
    for (var i = 0; i < allProjects.length; i++) {
      if (allProjects[i].id > maxId) {
        maxId = allProjects[i].id;
      }
    }
    allProjects.push({
      id: maxId + 1,
      name: projectName,
      createAt: new Date(),
      companyId: companyId
    });
  }
};

module.exports = {
  'getProjects': getProjects,
  'createProject': createProject
};