// Database
const database = require('../database');
const watchersAPI = require('./watchers');

var getConfigs = function(projectId) {
  var configs = database.data.configs.filter(function(c) {
    return c.workProjectId === projectId;
  });
  return configs;
};

var saveConfig = function(config) {
  var configs = getConfigs(config.workProjectId);
  var fileTypeExists = false;

  for (var i = 0; i < configs.length; i++) {
    if (configs[i].fileType.toLowerCase() === config.fileType.toLowerCase()) {
      fileTypeExists = true;
    }
  }

  if (!fileTypeExists) {
    var allConfigs = database.data.configs;
    var maxId = 0;
    for (var i = 0; i < allConfigs.length; i++) {
      if (allConfigs[i].id > maxId) {
        maxId = allConfigs[i].id;
      }
    }
    allConfigs.push({
      id: maxId + 1,
      fileType: config.fileType,
      description: config.description,
      status: config.status ? config.status : 'active',
      companyId: config.companyId,
      workProjectId: config.workProjectId,
      createAt: new Date()
    });
    watchersAPI.saveWatchers(config.companyId, maxId + 1, config.watchers);
    return true;
  } else {
    return false;
  }
};

var deleteConfig = function(configId) {
  database.data.configs = database.data.configs.filter(function(c) {
    return c.id !== configId;
  });
  database.data.watchers = database.data.watchers.filter(function(w) {
    return w.ingestionConfigurationId !== configId;
  });
};

module.exports = {
  'getConfigs': getConfigs,
  'saveConfig': saveConfig,
  'deleteConfig': deleteConfig
};