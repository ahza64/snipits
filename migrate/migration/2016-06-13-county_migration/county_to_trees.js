
var geocode = require('dsp_shared/lib/gis/google_geocode');
var util = require('dsp_shared/lib/cmd_utils');

// connect to database and schema
util.connect(["meteor"])
var TREE = require('dsp_shared/database/model/tree');

function addCounty(){
  console.log("ADD COUNTY");
  var trees = TREE.find().stream();
  trees.on('data', function(doc){
    if(!doc.county){
      this.pause();
      var coord = doc.location.coordinates;
      var lat = coord[0];
      var long = coord[1];
      var self = this;
      geocode.getAddress(lat, long).then(function(res){
        if(res.county !== undefined){
          TREE.update({_id: doc._id}, {county: res.county, state: res.administrativeLevels.level1short}, function(err, tree){
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
  // for(var i=0; i<trees.length; i++){
  //   var tree = trees[i];
  //   var coordinates = tree.location.coordinates;
  //   var lat = coordinates[0];
  //   var long = coordinates[1];
  //   geocode.getAddress(lat, long).then(function(res){
  //     console.log(res.county);
  //     TREE.update({_id: tree._id}, {county: res.county}, function(err, tree){
  //       if(err){
  //         throw err;
  //       }
  //       else{
  //         console.log('County Added for Tree', tree._id);
  //       }
  //     })
  //   });
  // }

  // for(var i=0; i<trees.length; i++){
  //   var tree = trees[i];
  //
  // }



  // for(var i=0; i<trees.length; i++){
  //   var tree = trees[i];
  // }

  // TREE.findOne('565426212895a53d2840f606', function(err, tree){
  //   if(err){
  //     throw err;
  //   }
  //   else{
  //     console.log(tree.location.coordinates);
  //     var lat = tree.location.coordinates[0];
  //     var long = tree.location.coordinates[1];
  //     geocode.getAddress(lat, long).then(function(res){
  //       console.log(res);
  //     });
  //   }
  // });



//baker module
if (require.main === module) {
  var baker = require("dsp_shared/lib/baker");
  baker.command(addCounty);
  baker.run();
}
