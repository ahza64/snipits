var BPromise = require('bluebird');
var geocode = require('dsp_shared/lib/gis/google_geocode');
var util = require('dsp_shared/lib/cmd_utils');
var _ = require('underscore');

// connect to database and schema
util.connect(["meteor"]);
var TREE = require('dsp_shared/database/model/tree');


/**
 * addCounty - add county field to the tree collection
 *
 * @return {void}
 */
function *updateAddress(field){
  console.log("ADD COUNTY");
  var conditions = {
    status: {$regex: /^[^06]/}, 
    project: 'transmission_2015', 
  };
  
  var all = {
    streetName: {streetName: null},
    city: {city: null},
    county: {county: null},
    state: {state: null},
    zipcode: {zipcode: null},
    streetNumber: {streetNumber: null}
  };
  
  var fields = _.extend({}, all, {all: {$or: _.values(all)}}, 
                                 {default: {$or:_.values(_.omit(all, "streetNumber"))} } );
  field = field || "default";
  
  if(field) {
    if(!fields[field]) {
      throw new Error("Invalid Field: "+field);
    } else {
      _.extend(conditions, fields[field]);
    }
  }
    
  console.log("CONDTIONS", conditions);
  
  
  
  var count = yield TREE.find().count(conditions);
  console.log("Tree Count", count);

  var trees = TREE.find(conditions).stream();
  var updated = 0;	

  return yield new BPromise(function(resolve, reject){
    trees.on('data', function(doc){
      this.pause();
      var coord = doc.location.coordinates;
      var lat = coord[0];
      var long = coord[1];
      var self = this;
      setTimeout(function(){
        geocode.getAddress(lat, long).then(function(res){
          var update = {
            city: res.city || doc.city, 
            zipcode: res.zipcode,
            streetNumber: res.streetNumber,
            streetName: res.streetName,
            county: res.county || doc.county, 
            state: res.state || doc.state
          };            
          TREE.update({_id: doc._id}, update, function(err){
            if(err){
              throw err;
            }
            else {
              updated++;
              console.log(updated, update, doc._id);
              self.resume();
            }
          });
        }, function (err) {
          console.error("geocode fail", err);
          self.resume();
        });
      },100);   
    });

    trees.on('error', function (err) {
      // handle err
      console.error(err);
      reject(err);
    });

    trees.on('close', function () {
      // all done
      console.log("ALL DONE");
      resolve();
    });
  });

}



//baker module
if (require.main === module) {
  util.bakerGen(updateAddress, {default: true});
  util.bakerRun();
}
