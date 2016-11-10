var log = require("dsp_config/config").get().getLogger("["+__filename+"]");
var mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
require("dsp_lib/starts_with");





var connections = {};
function getConnection(con_name, verbose) {
  if(verbose === undefined) {
    verbose = true;
  }
	if(!connections[con_name] && verbose) {
		console.error("NO DATABASE FOUND", con_name);		
	}
	return connections[con_name];
}

function setConnection(con_name, con) {
  connections[con_name] = con;
  require("./connections")(con_name, con.connection);
}


  


module.exports = function init_db(config) {
    
    var user_pass = "";
    if(config.mongo_db_user) {
      user_pass = config.mongo_db_user;
      
      if(config.mongo_db_pass) {
        user_pass += ":"+config.mongo_db_pass;
      }
      user_pass += "@";
    }
    
    var url = "mongodb://"+user_pass+config.mongo_db_host+":"+config.mongo_db_port+"/"+config.mongo_db_name;
    var options = {
        server: {
          socketOptions: {
            keepAlive: 1 
          }
        },
        replset: {
          socketOptions: {
            keepAlive: 1
          },
          auto_reconnect:false,
          poolSize: 10,
          strategy: "ping",
          connectWithNoPrimary: true,
          slaveOk: true,
        }
      };


    if(config.mongo_use_repl_sec){
      url = url + "?readPreference=secondary";
      options.replset.rs_name = config.mongo_rs_name;
    }
    

    var connection;
    var db = getConnection(config.name, false);
    if(!db) {
      var promise = new Promise(function(resolve, reject){      
        connection = retryConnection(config.name, url, options, 0, 5, resolve, reject);
      });      
      
      promise.then(function(connection){
        var db = getConnection(config.name, false);
        db.connection = connection;
      });
      
      db = {
        connection: connection,
        connected: promise,
        mongoose: mongoose
      };      
      setConnection(config.name, db);
    }
    

    return db;
    //mongoose is a singleton and you can get this connection at anytime if you require(mongoose)
};

function retryConnection(db_name, url, options, error_count, error_max, resolve, reject) {
  log.info("Trying: Connecting to MongoDb(mongoose): ", url);
  log.info("using options to connect: ", options);
  var db = mongoose.createConnection(url,options);
  db.on("error", function(err) {
    log.error("Error: MongoDb error", error_count, url, err.message, db.readyState);
    if(db.readyState === 0) {//disconnected
      error_count++;        
      if(error_count < error_max) {
        setTimeout(function(){
          retryConnection(db_name, url, options, error_count+1, error_max, resolve, reject);
        }, 1000*error_count);          
      } else {
        reject(err.message);
      }
    }
  });

  db.once("open", function() {
    error_count = 0;
    log.info("Success: Connected to MongoDb(mongoose) ", url);
    resolve(db);
  }); 
  return db;    
}
