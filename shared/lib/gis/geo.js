//diameter of the earth
var units_per_radian = {'meter': 6378100, 
                        'm': 6378100, 
                        'feet': 20925524.9,
                        'ft': 20925524.9,
                        'miles': 20925524.9/5280,                      
                        'mile':  20925524.9/5280,
                        'yards': 20925524.9/3,
                        'r': 1,
                        'radian': 1,
                        'degree': 180/Math.PI};

function toRadians(value, unit){          
  // console.log("toRadians", value, unit, value/units_per_radian[unit]);
  return value/units_per_radian[unit];
}
function fromRadians(value, unit){
  // console.log("fromRadians", value, unit, value * units_per_radian[unit]);
  return value * units_per_radian[unit];
}


function distanceBetween(loc1, loc2, unit) {
  // console.log("distanceBetween", loc1, loc2);
  /** Converts numeric degrees to radians */
  unit = unit || "meter";
  if(loc1.location) {
    loc1 = loc1.location;
  }
  if(loc2.location) {
    loc2 = loc2.location;
  }
  
  var isNumeric =  function( obj ) {
      return !Array.isArray( obj ) && (obj - parseFloat( obj ) + 1) >= 0;
  };
  
  if(isNumeric(loc1.x)){
    loc1 = [loc1.x, loc1.y];
  }
  if(isNumeric(loc2.x)){
    loc2 = [loc2.x, loc2.y];
  }
  

  if(loc1.coordinates) {
    var lon1 = loc1.coordinates[0];
    var lat1 = loc1.coordinates[1];    
  } else {
    lon1 = loc1[0];
    lat1 = loc1[1];
  }
  if(loc2.coordinates) {
    var lon2 = loc2.coordinates[0];
    var lat2 = loc2.coordinates[1];
  } else {
    lon2 = loc2[0];
    lat2 = loc2[1];
  }
  // console.log(lon1, lat1, lon1, lat2);
  // console.log("LOC", typeof lat1);
  // var R = units_per_radian[unit];
  var φ1 = toRadians(lat1, 'degree');
  var φ2 = toRadians(lat2, 'degree');
  var Δφ = toRadians(lat2-lat1, 'degree');
  var Δλ = toRadians(lon2-lon1, 'degree');

  var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  var d = fromRadians(c, unit);
  // var d = R * c;
  // console.log("GOT A DISTANCE", φ1, φ2, Δφ, Δλ, a, c, d, unit);
  return d;
}

function findExtent(locations) {
  var loc = locations[0];
  if(loc.location) {
    loc = loc.location;
  }
  var minX = loc.coordinates[0];
  var maxX = loc.coordinates[0];
  var minY = loc.coordinates[1];
  var maxY = loc.coordinates[1];
  
  for(var i = 0; i < locations.length; i++) {
    loc = locations[i];
    if(loc.location) {
      loc = loc.location;
    }
    // console.log("FINDING", loc);
    minX = Math.min(loc.coordinates[0], minX);
    maxX = Math.max(loc.coordinates[0], maxX);
    minY = Math.min(loc.coordinates[1], minY);
    maxY = Math.max(loc.coordinates[1], maxY);
  }
  return {minX: minX, minY: minY, maxX: maxX, maxY: maxY};
}

function findCenter(locations) {
  var extent = findExtent(locations);
  var x = extent.minX+(extent.maxX-extent.minX)/2;
  var y = extent.minY+(extent.maxY-extent.minY)/2;
  return [x, y];
}

module.exports = {
  distanceBetween: distanceBetween,
  fromRadians: fromRadians,
  toRadians: toRadians,
  findExtent: findExtent,
  findCenter: findCenter
};