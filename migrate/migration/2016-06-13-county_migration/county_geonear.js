var util = require('dsp_shared/lib/cmd_utils');

// connect to database and schema
util.connect(["meteor"]);
var TREE = require('dsp_shared/database/model/tree');


/**
 * geoNearCounty - use geonear and find the county of the nearest tree and add it to the tree with no county
 *
 * @return {void}
 */
function geoNearCounty(){
  console.log('Trees with no county');
  TREE.find({status: {$regex: /^[^06]/}, project: 'transmission_2015', county: {$exists: false}}).count().then(function(count){
    console.log("Tree Count", count);
  });

  var trees = TREE.find({status: {$regex: /^[^06]/}, project: 'transmission_2015', county: {$exists: false}}).stream();

  trees.on('data', function(doc){
    if(!doc.county){
      this.pause();
      var self = this;
      TREE.geoNear(doc.location, {minDistance: 0, maxDistance: 17000, spherical: true, query:{county:{$exists:true}}, limit:1}, function(err, nearbyTree){
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
                console.log(err);
                self.resume();
              }
              else{
                console.log(doc.county, doc._id);
                self.resume();
              }
            });
          }
        }
      });
    }
  })
}

//baker module
if (require.main === module) {
  var baker = require("dsp_shared/lib/baker");
  baker.command(geoNearCounty);
  baker.run();
}
