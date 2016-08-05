/* global before, after, describe, it */
/**
* @fileOverview testing migration of v2 (classroom) data schema to v3.5 (circut city+)
* 
* 
*/
var test_name = "tree_migrate";
var config_override = {
  dispatchr: {
    mongo_db_host: "localhost",
    mongo_db_port: 27017,
    mongo_db_name: 'dispatcher_'+test_name+'_' + new Date().getTime(),
    name:"dispatchr"    
  },
  meteor: {
    mongo_db_host: "localhost",
    mongo_db_port: 27017,
    mongo_db_name: 'dispatcher_meteor'+test_name+'_' + new Date().getTime(),
    name:"meteor"    
  },
  api_port: 36341,
  logging: {
      replaceConsole: true,
      "appenders": [
          {
              "type": "console",
          }
      ]  
  }
};
var config = require('dsp_config/configure').get({overrides: config_override});
var log = require('log4js').getLogger(test_name);
var database = require('dsp_model/database');
var tree1 = require("./v2_tree1.json");
var tree2 = require('./complete_tree.json');
var tree3 = require("./span_grouped.json");
var tree4 = require("./ignored_detection.json");
var tree5 = require("./raptortree.json");
var pmd = require("./pmd.json");
var grid = require("./grid.json");
var inspector = require("./inspector.json");
var trimmer = require("./trimmer.json");
var migration;
var co = require('co');
require('should');

var db;
before(function connect_mongo(done){  
  console.log("BEFORE");  
  // Get mongo all connected before we do anythign else
  database(config.meteor);
  db = database(config.dispatchr);
  db.connection.once('open', function() {
    migration = require("dsp_migrate/migration/2016-04-meteor-v2/tree_v2_to_tree_v3");
    var Grid = require('dsp_model/grid');  
    var PMD = require('dsp_model/pmd');
    var User = require('dsp_model/user');
    
    co(function*(){
      grid = yield Grid.create(grid);    
      pmd = yield PMD.create(pmd);    
      try{
        trimmer = yield User.create(trimmer);    
        inspector = yield User.create(inspector);    
      } catch(e) {
        console.error(e);
      }
      done();  
    })();
  });
});

after(function drop_test_database(done) {
  // log.debug("droping database");
  db.connection.db.dropDatabase(config.mongo_db_name);
  done();
});


describe("Migrate tree from v2 to v3", function describe_model() {
  it("should successfully migrate a single tree", function(done){
    co(function*(){
      // console.log(tree1);
      var migrated = yield migration._migrateTree(tree1);
      // console.log(migrated);
      migrated.pi_user_id.toString().should.be.eql(inspector.vehicle.toString());
      migrated.tc_user_id.toString().should.be.eql(trimmer.vehicle.toString());

      migrated.pge_pmd_num.should.be.eql(tree1.pge_pmd_num);
      
      migrated.status[0].should.be.eql('5');//status
      migrated.status[1].should.be.eql('2');//source
      migrated.status[2].should.be.eql('1');//priority
      migrated.status[3].should.be.eql('0');//vc code (none)
      migrated.status[4].should.be.eql('0');//assigned
      migrated.status[5].should.be.eql('0');//dog
      migrated.status[6].should.be.eql('0');//irate_customer
      migrated.status[7].should.be.eql('1');//notify customr
      migrated.status[8].should.be.eql('0');//ntw needed      
      migrated.status[9].should.be.eql('1');//access
      migrated.status[10].should.be.eql('0');//refused
      migrated.status[11].should.be.eql('2');//veh type
      migrated.status[12].should.be.eql('0');//env

      done();      
    })();
  });
  
  it("should migrate a complete tree succuessfully", function(done){
    co(function*(){
      var migrated = yield migration._migrateTree(tree2);
      migrated.status[0].should.be.eql('5');//status
      
      migrated.tc_image.should.not.be.null;
      
      done();
    })();
  });
  
  it("should migrate a span_grouped trees as ignored", function(done){
    co(function*(){
      var migrated = yield migration._migrateTree(tree3);
      migrated.status[0].should.be.eql('0');//status
      done();
    })();
  });
  it("should migrate some detection types as ignored", function(done){
    co(function*(){
      var detections = ["VC3c", "VC3p", "VC2p"];
      for(var i = 0; i < detections.length; i++) {
        tree4.qsi_priority = detections[i];
        var migrated = yield migration._migrateTree(tree4);    
        migrated.status[0].should.be.eql('0');//status        
        migrated.pge_detection_type.should.be.eql(detections[i]);
      }
      done();
    })();
  });
  it("should not add raptor nest on accident", function(done){
    co(function*(){
      var migrated = yield migration._migrateTree(tree5);
      console.log("migrated",migrated.status);
      migrated.status[12].should.not.be.eql('3');//status
      done();
    })();
  });

});

