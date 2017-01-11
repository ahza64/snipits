// Database
const database = require('../database');

var getWatchers = function(configId) {
  var watchers = database.data.watchers.filter(function(w) {
    return w.ingestionConfigurationId === configId;
  });
  return watchers;
};

var saveWatchers = function(companyId, configId, emails) {
  var watchers = database.data.watchers.filter(function(w) {
    return w.ingestionConfigurationId === configId;
  });
  if (emails) {
    var maxId = 0;
    database.data.watchers.forEach(function(w) {
      if (w.id > maxId) {
        maxId = w.id;
      }
    });

    emails.forEach(function(email) {
      let found = watchers.filter(function(w) {
        return w.email.toLowerCase() === email;
      });
      if (found.length === 0) {
        database.data.watchers.push({
          id: maxId+1,
          email: email,
          companyId: companyId,
          ingestionConfigurationId: configId,
          createdAt: new Date()
        });
        maxId++;
      }
    });
  }
};

module.exports = {
  'getWatchers': getWatchers,
  'saveWatchers': saveWatchers
};