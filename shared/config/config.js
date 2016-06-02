/**
    config.js - exports a singleton that contians global configurations     
*/
require("sugar");
var fs  = require('fs');
var _   = require('underscore');
var dir = "conf.d";

var configs = ( function() {
    // http://addyosmani.com/resources/essentialjsdesignpatterns/book/#singletonpatternjavascript
    
    var instance;

    function initConfigs(options) {
        var config = {};
        options = options || {};
        var file_list = fs.readdirSync(dir);
        for(var idx = 0; idx < file_list.length; idx++) {    
          if(file_list[idx].endsWith("json")) {
            var file = fs.readFileSync(dir+"/"+file_list[idx], {'encoding': 'utf8'});
            file = JSON.parse(file);
    
            //Merge this file into configs (could do something more sophisticated here)
            for (var attrname in file) { 
              if(file.hasOwnProperty(attrname)) { 
                config[attrname] = file[attrname];
              } 
            }
          }
        }
        if(options.overrides) {
          _.extend(config, options.overrides);
        }
        
        if(options.log4js !== false) {
          var log4js = require('log4js');
          require('log4js-json-layout');
          require('log4js-node-mongodb');
          //update mongo logging config
          var appenders = config.logging.appenders;
          for(var i = 0 ; i < appenders.length; i++ ) {
            if(appenders[i].connectionString === "AUTOCONFIG") {
              appenders[i].connectionString = config.database.mongo_db_host+":"+
                                              config.database.mongo_db_port+"/"+
                                              config.database.mongo_db_name;
            }
          }
          log4js.configure(config.logging);
        }
        // console.log("LOGGING CONFIG", config.logging);
        return config;
    }
    return {
        get: function(options) {
            if( !instance ) {
                instance = initConfigs(options);
            }
            return instance;
        }
    };
})();

//console.log(configs.get())
module.exports = configs;