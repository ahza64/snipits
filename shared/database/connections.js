/**
 * This is just a singleton that is holding global connecitons to databases
 */


var connections = {};
module.exports = function(con_name, con, verbose) {
  if(verbose === undefined) {
    verbose = true;
  }
	if(con) {
		connections[con_name] = con;
	}
	if(!connections[con_name] && verbose) {
		console.error("NO CONNECTION FOUND", con_name);		
	}
	return connections[con_name];
};



