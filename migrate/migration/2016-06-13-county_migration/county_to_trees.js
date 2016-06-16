
var geocode = require('dsp_shared/lib/gis/google_geocode');
var util = require('dsp_shared/lib/cmd_utils');

// connect to database and schema
util.connect(["meteor"]);
var TREE = require('dsp_shared/database/model/tree');


/**
 * addCounty - add county field to the tree collection
 *
 * @return {void}
 */
function addCounty(){
  console.log("ADD COUNTY");
  TREE.find({status: {$regex: /^[^06]/}, project: 'transmission_2015', county: {$exists: false}}).count().then(function(count){
    console.log("Tree Count", count);
  });

  var trees = TREE.find({status: {$regex: /^[^06]/}, project: 'transmission_2015', county: {$exists: false}}).stream();

  trees.on('data', function(doc){
    if(!doc.county && doc.project === 'transmission_2015'){
      this.pause();
      var coord = doc.location.coordinates;
      var lat = coord[0];
      var long = coord[1];
      var self = this;
      setTimeout(function(){
      geocode.getAddress(lat, long).then(function(res){
        if(res.county !== undefined){
          TREE.update({_id: doc._id}, {county: res.county, state: res.administrativeLevels.level1short}, function(err){
            if(err){
              throw err;
            }
            else{
              console.log(res.county, res.administrativeLevels.level1short, doc._id);
              self.resume();
            }
          });
        } else {
          self.resume();
        }
      }, function (err) {
        console.error("geocode fail", err);
        self.resume();
      });
     },200);
    }
  });

  trees.on('error', function (err) {
  // handle err
  console.error(err);
  });

  trees.on('close', function () {
  // all done
  console.log("ALL DONE");
  });
}

function addStreetNumber(){
  console.log("ADD COUNTY");
  TREE.find({status: {$regex: /^[^06]/}, project: 'transmission_2015', streetNumber: {$exists:false}}).count().then(function(count){
    console.log("Tree Count", count);
  });

  var trees = TREE.find({status: {$regex: /^[^06]/}, project: 'transmission_2015', streetNumber: {$exists:false}}).stream();

  trees.on('data', function(doc){
    if(!doc.streetNumber && doc.project === 'transmission_2015'){
      this.pause();
      var coord = doc.location.coordinates;
      var lat = coord[0];
      var long = coord[1];
      var self = this;
      setTimeout(function(){
      geocode.getAddress(lat, long).then(function(res){
        //self.resume();
        if(res.streetNumber !== undefined){
          TREE.update({_id: doc._id}, {streetNumber: res.streetNumber}, function(err){
            if(err){
              throw err;
            }
            else{
              console.log(res.streetNumber, res.administrativeLevels.level1short, doc._id);
              self.resume();
            }
          });
        } else {
          self.resume();
        }
      }, function (err) {
        console.error("geocode fail", err);
        self.resume();
      });
    }, 200);
    }
  });

  trees.on('error', function (err) {
  // handle err
  console.error(err);
  });

  trees.on('close', function () {
  // all done
  console.log("ALL DONE");
  });
}

//baker module
if (require.main === module) {
var baker = require("dsp_shared/lib/baker");
baker.command(addCounty);
baker.command(addStreetNumber);
baker.run();
}
