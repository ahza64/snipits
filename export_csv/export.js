#!/bin/env node
var config = require('dsp_config/config');
var parse = require('csv-parse');
require("dsp_lib/starts_with.js");

if(config.mongo_db_user) {
  config.mongo_db_user = 'dsp';
  config.mongo_db_pass = 'dsp';
}

var utils = require('dsp_lib/cmd_utils');
var Cache = require('dsp_model/cache');
var Tree = require('dsp_model/tree');
var Grid = require('dsp_model/grid');
var PMD = require('dsp_model/pmd');
var WorkOrder = require('dsp_model/work_order');
var User = require('dsp_model/user');
var Asset = require('dsp_model/asset');

var _ = require('underscore');
var moment = require('moment');
var assert = require('assert');
var log = require('log4js').getLogger('['+__filename+']');
var BPromise = require('bluebird');



var transform_tree = require('./transform/tree');
require('sugar');


var photo_row = {
  TREEID: null,
  FILENAME: null
};

var user_row = {
  USER_NAME: null,
  USER_ID: null,
  EMAIL: null
};



var workorder_row = {
  WO_NAME: null,
  WO_TYPE: null,
  WO_STATUS: null,
  WO_STATUS_DATE: null,
  ASSIGNED_USER_ID: null,
  WO_NUMBER: null,
  NUM_OBJECTS: null,
  PROJECT_ID: "TRANS_2016",
  INSPECTOR: null,
  INSPECTOR_COMPANY: null
};

var inspect_workorders = {};
var trim_workorders = {};
function *dump_tree() {
  var grids = yield Grid.model.find().exec();
  var pmds = yield PMD.model.find().exec();  
  
  pmds = _.indexBy(pmds, 'pge_pmd_num');
  
  var export_cache = yield readCachedExport();
  
  var row_data = [];
  for(var i = 0; i < grids.length; i++) {
    var grid = grids[i];
    log.info("Dump Inspection for: ", grid.name, grid._id);
    var trees = yield Tree.model.find({grid: grid._id, status: {$in: ["ready", "newTree"]}}).lean().exec();
    for(var j = 0; j < trees.length; j++) {
      var tree = trees[j];
      var row = transform_tree(tree);
      if(yield shouldExportRow(tree, row, export_cache[row.DISPATCHR_ID])) {
        collectPhotos(tree);
    
        if(tree.inspector_wo) {
          inspect_workorders[tree.inspector_wo.toString()] = true;      
        }  
        if(tree.trimmer_status === "complete") {        
          trim_workorders[tree.trimmer_wo.toString()] = true;      
        }                      
        row_data[row.DISPATCHR_ID] = row;
      } 
    }
  }    
  return row_data;
}

function previouslyExported(row, export_cache) {

  if(export_cache) {
    return true;
  }
  return false;
}


function *shouldExportRow(tree, row, export_cache) {
  if(!tree.exported && export_cache) {
    log.warn("Found exported tree without export date", tree._id, export_cache);
    // yield Tree.patch(tree._id, {exported: export_cache});
  }
  
  if(!previouslyExported(row, export_cache)) {
    if(!row.TRIM_CODE && tree.priority !== "allgood"  ) {
      log.error("Excluding Tree", tree._id, tree.tree_id);
    } else {
      return true;
    }     
  } else {
    row.UPDATE = true;
    //TODO: Perhaps more conditions to update row
    if(tree.trimmer_complete_time > tree.exported) {
      return true;
    }
  }
  return false;
}


var photos = [];
function collectPhotos(tree) {
  tree.tasks = tree.tasks || [];
  for(var k  = 0; k < tree.tasks.length; k++) {
    var image_id = tree.tasks[k].image;
    if(image_id) {
      var row = photoRow(image_id, tree);
      photos.push(row);
    }
    image_id = tree.tasks[k].after_image;
    if(image_id) {
      row = photoRow(image_id, tree);
      photos.push(row);
    }    
  }  
}

function photoRow(image_id, tree) {
  var row = _.extend({}, photo_row);
  row.FILENAME = image_id+".jpg";
  row.TREEID = tree.qsi_tree_id || tree._id;
  return row;  
}



var work_types = {
  "tree_inspect": "Work Packet",
  "tree_trim": "Work Request"
};

var wo_status = {
  "unassigned": "Unassigned", 
  "assigned": "Assigned",
  "complete": "Completed"
};

function *dump_work(work_type, workorder_ids) {
  var grids = yield Grid.model.find({}).exec();
  var row_data = {};
  work_type = work_type || "tree_inspect";
  for(var i = 0; i < grids.length; i++) {
    var grid = grids[i];
    log.info("Dump "+work_type+" work for: ", grid.name, grid._id, workorder_ids.length);
    var workorders = yield WorkOrder.model.find({ _id: {$in: workorder_ids},
                                                  grid: grid._id, 
                                                  work_type: work_type,
                                                  status: {$nin: ["deleted", "invalid", "suspended"]}
                                                }).lean().exec();
    for(var j = 0; j < workorders.length; j++) {
      var wo = workorders[j];
      var user = yield getWorkorderUser(wo, work_type);
      var row = generateWorkOrderRow(wo, user);
      row_data[wo._id] = row;
    }
  }
  return row_data; 
}
function generateWorkOrderRow(wo, user) {
  var row = _.extend({}, workorder_row);

  row.WO_NAME = "WO-T-"+wo.name;
  row.WO_TYPE = work_types[wo.work_type];
  row.WO_STATUS = wo_status[wo.status];
  row.WO_STATUS_DATE = wo.complete_time || wo.updated;
  row.WO_NUMBER = wo._id;
  row.NUM_OBJECTS = wo.tasks.length;

  if(wo.work_type === "tree_inspect") {
    row.INSPECTOR_COMPANY = ACRT_INSPECT_COMPANY;
  } else if(wo.work_type === "tree_trim") {
    row.INSPECTOR_COMPANY = TREES_INC_COMPANY_ID;
  }

  if(row.WO_STATUS_DATE) {
    row.WO_STATUS_DATE = moment(row.WO_STATUS_DATE).format("YYYY-MM-DD");
  }

  if(user) {
    row.INSPECTOR = user.first_name;
    row.ASSIGNED_USER_ID = user._id;
    if(user.last_name) {
      row.INSPECTOR += " "+user.last_name;
    }
  }
  return row;
}

function *getWorkorderUser(wo, work_type) {
  for(var i = 0; i < wo.tasks.length; i++) {
    var user = yield getTreeUser(wo.tasks[i], work_type);
    if(user) {
      return user;
    }
  }
  return null;
}

var user_cache = {};
function *getTreeUser(tree, work_type) {
  var user_id = null; 
  if(work_type === "tree_inspect") {
    user_id = tree.inspector_user;  
  } else if( work_type === "tree_trim") {
    user_id = tree.trimmer_user;  
  }
  
  var user = null;

  if(user_id) {
    if(user_cache[user_id]) {
      user = user_cache[user_id];
    } else {
      user = yield User.read(user_id);
      if(user){
        user_cache[user_id] = user;
      }
    }
  }

  return user;
}


function dump_users(tabs){
  var row_data = [];
  var users = _.values(user_cache);
  _.each(users, function(user){
    log.info(user.first_name, user.last_name, user._id);
  });

  for(var i = 0; i < users.length; i++) {
    var user = users[i];
    if(user) {
      var row = _.extend({}, user_row);
    
      row.USER_NAME = user.first_name;
      if(user.last_name) {
              row.USER_NAME += " "+user.last_name;
            }    
            row.USER_ID = user._id;
            row.EMAIL = user.email;
            row_data.push(row);
    }
  }
  var csv = utils.dumpAsCSV(row_data, tabs);
  return csv;
} 

function readTreeCSVExport(file_path){
  return new BPromise(function(resolve, reject){
    if(file_path) {
      if(! file_path.endsWith(".csv")) {
        file_path = file_path+"/"+"trees.csv";
      }
    } else {
      file_path = "export/trees.csv";
    }

    var parser = parse({columns: true});    
    var input = fs.createReadStream(file_path);
    input.pipe(parser);
    var trees = {};

    parser.on('readable', function(){
      while(true){
        var record = parser.read();
        if( record ) {
          trees[record.DISPATCHR_ID] = record;
        } else {
          break;
        }
      }
    });
    
    parser.on('end', function(){
      log.info("CSV Tree Count:", _.size(trees));
      resolve(trees);
    });
    parser.on('error', function(error){
      reject(error);
    });
  });
}

function *cacheExport(data) {
  log.info("WRITING CACHE");
  var cache = yield Cache.findOne({name: "qsi_export"}).exec();
  if(!cache) {
    cache = new Cache({name: "qsi_export"});
  }
  log.info("WRITING CACHE", _.size(cache.data), _.size(JSON.stringify(cache.data)));
  cache.data = data;
  cache.updated = new Date();
  
  log.info("WRITING CACHE", _.size(data), _.size(JSON.stringify(cache.data)));
  
  yield cache.save();
  return cache;
}

function *readCachedExport() {
  var cache = yield Cache.findOne({name: "qsi_export"}).exec();
  if(cache && _.size(cache.data) > 0) {
    log.info("GOT CACHE", _.size(cache.data));
    return cache.data;
  }
  return {};
}


function *cache_export(file, date){
  var data = yield readTreeCSVExport(file);
  var cache = yield readCachedExport();
  if(date) {
    date = Date.create(date);
  }
  var exported_dates = {};
  _.each(cache, function(value, key){
    if(value && value.exported) {
      exported_dates[key] = value.exported;
    } else {
      exported_dates[key] = value;
    }    
  });
  
  _.each(data, function(value, key){
    value.exported = date;
    cache[key] = value;
    exported_dates[key] = date;
  });
  yield cacheExport(exported_dates);      
}

function markTreesExported(file, exported, date) {
  if(exported === undefined) {
    exported = true;
  }

  if(file) {
    if(!file.endsWith(".csv")) {
      file = file+"/"+"trees.csv";
    }
  } else {
    file = "export/trees.csv";
  }

  var parser = parse({columns: true});    
  var input = fs.createReadStream(file);
  input.pipe(parser);
  var tree_ids = [];
  parser.on('readable', function(){
    while(true){
      var record = parser.read();
      if( record ) {
        tree_ids.push(record.DISPATCHR_ID);
      } else {
        break;
      }
    }
  });
  return new BPromise(function(resolve, reject){
    parser.on('end', function(){
      if(exported) {
        if(date) {
          exported = Date.create(date);
        } else {
          exported = new Date();
        }
      } else {
        exported = null;
      }

      var p = Tree.model.update({_id: {$in:tree_ids}}, {exported: exported}, {multi: true}).exec();
      p.then(function(result){
        log.info("Update Result:", result);
        resolve(result);
      }, function(error){
        log.error("Update Error", error);
        reject(error);
      });          
    });
  });
}

if (require.main === module) {

  var baker = require('./baker');
  baker.command(function(){
    return utils.generatorWithDb(dump_tree());
  }, {command: "inspect"});  

  baker.command(function(work_type, work_orders, csv, tabs){
    if(work_orders) {
      work_orders = work_orders.split(',');
    }
    return utils.generatorWithDb(function*(){
      var rows = yield dump_work(work_type, work_orders);
      if(csv) {
        return utils.dumpAsCSV(_.values(rows), tabs);
      }
      return rows;
    });
  }, {command: "work"});
    
  baker.command(dump_users, {command: "user"});  


  var fs = require('fs'); 
  var writeFile = BPromise.promisify(require('fs').writeFile);
  var mkdir = BPromise.promisify(require('fs').mkdir);
  baker.command(function(tabs){
    return utils.generatorWithDb(function*(){
      if(!fs.existsSync('export')) {
        yield mkdir('export');
      }      
      var trees = yield dump_tree();
      var inpsect_work = yield dump_work("tree_inspect", _.keys(inspect_workorders));
      var trim_work = yield dump_work("tree_trim", _.keys(trim_workorders));
      
      _.each(trees, function(tree_row){
        if(tree_row.INSPECT_WO_NUMBER) {
          assert(inpsect_work[tree_row.INSPECT_WO_NUMBER]);
        }
        if(tree_row.TRIM_WO_NUMBER) {
          assert(trim_work[tree_row.TRIM_WO_NUMBER]);
        }
      });
      
      trees = utils.dumpAsCSV(_.values(trees), tabs);
      inpsect_work = utils.dumpAsCSV(_.values(inpsect_work), tabs);
      trim_work = utils.dumpAsCSV(_.values(trim_work), tabs);
      
      var users = dump_users(tabs);
      
      for(var i = 0; i < photos.length; i++) {      
        var row = photos[i];
        var asset_id = row.FILENAME.substring(0, row.FILENAME.length-4);
        var asset = yield Asset.read(asset_id);
        if(asset) {
          var buffer = new Buffer(asset.data.substring("data:image/jpeg;base64".length), "base64");
          yield writeFile("export/"+row.FILENAME, buffer);
        } else {
          log.error("missing image", row);
          photos.splice(i, 1);
          i--;
        }
      }

      yield writeFile("export/trees.csv", trees);
      yield writeFile("export/inspect_work.csv", inpsect_work);
      yield writeFile("export/trim_work.csv", trim_work);
      yield writeFile("export/users.csv", users);
      yield writeFile("export/photos.csv", utils.dumpAsCSV(photos, tabs));
    });
  }, {command: "all"});  
  
  baker.command(function(file, date){
    return utils.generatorWithDb(cache_export(file, date));
  }, {command: "cache_export"});

  baker.command(function(file, exported, date){
    return utils.generatorWithDb(function*(){
      if(exported) {
        yield cache_export(file, date);
        log.info("CACHED...");
      }
      yield markTreesExported(file, exported, date);
    });
  }, {command: "markExported"});
  
  baker.run();  
}

