var util = require('dsp_shared/lib/cmd_utils');
var BPromise = require('bluebird');
// connect to database and schema
util.connect(["meteor"]);
var TREE = require('dsp_shared/database/model/tree');

function *run(field) {
  var fields = field || ["city", "county"];
  if(!Array.isArray(fields)) {
    fields = fields.split(',');
  } 
  
  for(var i = 0; i < fields.length; i++) {
    var type = fields[i];
    if(type === "city") {
      return yield geoNearCity();
    } else if(type === "county") {
      return yield geoNearCounty();
    } else {
      console.error('Field must be city or county');
    }
  }
}


/**
 * geoNearCounty - use geonear and find the county of the nearest tree and add it to the tree with no county
 *
 * @return {void}
 */
function geoNearCounty(){
  return new BPromise(function(resolve, reject){
    console.log('Trees with no county');
    TREE.find({status: {$regex: /^[^06]/}, project: 'transmission_2015', county: null}).count().then(function(count){
      console.log("Tree Count", count);
    });

    var trees = TREE.find({status: {$regex: /^[^06]/}, project: 'transmission_2015', county: null}).stream();
  
    trees.on('data', function(doc){
      if(!doc.county){
        this.pause();
        var self = this;
        TREE.geoNear(doc.location, {
          minDistance: 0, 
          maxDistance: 17000, 
          spherical: true, 
          query:{county: {$ne: null}}, limit:1
        }, 
        function(err, nearbyTree){
          if(err){
            console.error(err);
            self.resume();
          }
          else{
            if(nearbyTree[0] === undefined){
              console.log('------> No Nearby Tree for', doc._id);
              self.resume();
            }
            else{
              doc.county = nearbyTree[0].obj.county;
              TREE.update({_id: doc._id}, {county: doc.county}, function(err){
                if(err){
                  console.log('update err', err);
                  self.resume();
                }
                else{
                  console.log('updated', doc.county, doc._id);
                  self.resume();
                }
              });
            }
          }
        });
      }
    });

    trees.on('error', function (err) {
      // handle err
      reject(err);
      console.error(err);
    });

    trees.on('close', function () {
      // all done
      resolve();
      console.log("ALL DONE");
    });
  });
}

function geoNearCity(){
  return new BPromise(function(resolve, reject){
    console.log('Trees with no county');
    TREE.find({status: {$regex: "^[^06]"}, project: 'transmission_2015', city: null}).count().then(function(count){
      console.log("Tree Count", count);
    });

    var trees = TREE.find({status: {$regex: /^[^06]/}, project: 'transmission_2015', city: null}).stream();

    trees.on('data', function(doc){
      if(!doc.city){
        this.pause();
        var self = this;
        var query = {minDistance: 0, maxDistance: 5500, spherical: true, query:{city:{$ne: null}}, limit:1};
        TREE.geoNear(doc.location, query, function(err, nearbyTree){
          if(err){
            console.error(err);
            self.resume();
          }
          else{
            if(nearbyTree[0] === undefined){
              console.log('------> No Nearby Tree for', doc._id);
              self.resume();
            }
            else{
              doc.city = nearbyTree[0].obj.city;
              TREE.update({_id: doc._id}, {city: doc.city}, function(err){
                if(err){
                  console.log(err);
                  self.resume();
                }
                else{
                  console.log(doc.city, doc._id);
                  self.resume();
                }
              });
            }
          }
        });
      }
    });
    trees.on('error', function (err) {
      // handle err
      reject(err);
      console.error(err);
    });

    trees.on('close', function () {
      // all done
      resolve();
      console.log("ALL DONE");
    });
  });

}

//baker module
if (require.main === module) {
  var baker = require("dsp_shared/lib/baker");
  util.bakerGen(run, {default: true});
  baker.command(geoNearCounty);
  baker.command(geoNearCity);
  baker.run();
}
