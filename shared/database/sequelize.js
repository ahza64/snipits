'use strict';

// const posgres = require('pg');
const Sequelize = require('sequelize');




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
  require("./connections")(con_name, con);
}



function createConnection(config) {
  console.log("CREATING CONNNECITON", config);
  const POSTGRES_SERVER = config.db_host;
  const POSTGRES_DB = config.db_name;
  const POSTGRES_USER = config.db_user;
  const POSTGRES_PASS = config.db_pass;
  const logger = config.logger ? console.log : false;

  var db = getConnection(config.name, false);  
  if(!db) {
    const DEFAULT = {
      MAX_POOLS: 5,
      MIN_POOLS: 0,
      IDLE: 1000
    };

    var sequelize = new Sequelize(POSTGRES_DB, POSTGRES_USER, POSTGRES_PASS, {
      host: POSTGRES_SERVER,
      dialect: 'postgres',
      pool: {
        max: DEFAULT.MAX_POOLS,
        min: DEFAULT.MIN_POOLS,
        idle: DEFAULT.IDLE
      },
      //logging: console.log, // turn this on or off depending on environment
      logging: logger,
      define: {
        timestamps: true
      }
    });
    setConnection(config.name, sequelize);
  }
  
  return {
    type: config.type,
    connection: getConnection(config.name),
    connected: Promise.resolve(getConnection(config.name))
  };
}

module.exports = createConnection;