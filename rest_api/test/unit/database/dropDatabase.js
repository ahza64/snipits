var BPromise = require('bluebird');

module.exports = function() {
  console.log('droping database');
  const config = require('dsp_shared/config/config').get({log4js : false});  
  var db = require('dsp_shared/database/database')(config.meteor);

  db.connection.db.collectionsAsync = BPromise.promisify(db.connection.db.collections);

  return db.connection.db.collectionsAsync().then(collections => {
    var rmDone = [];
    collections.forEach(collection => {
      if(!collection.namespace.startsWith('dispatcher_unit_test.system') &&
         !collection.namespace.endsWith('identitycounters')
        ) {
        console.log('REMOVING', collection.namespace);
        collection.removeAsync = BPromise.promisify(collection.remove);
        rmDone.push(collection.removeAsync());
      }
    });

    return BPromise.all(rmDone);
  }); 
};