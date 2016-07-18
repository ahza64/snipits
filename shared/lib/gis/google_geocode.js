var Bpromise = require('bluebird');
var geocoderProvider = 'google';
var extra = {
  apiKey: 'AIzaSyBUIRSmyeNNxy323BxyefxD2vnRV85Rfik', // for Mapquest, OpenCage, Google Premier
  //apiKey: 'AIzaSyDHBL-NBSDB94mPrZcQmQGbg-Zg1K-CFBE', //Tejas's API Key
  formatter: null
};
var httpAdapter = 'https';
var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

/**
 * @description reverse geo code coordinates for address
 * @param {Float} x coordinate (logitude)
 * @param {Floay} y coordinate (latitude)
 */
function getAddress(x, y, error_count){
 return new Bpromise(function(resolve,reject){
   geocoder.reverse({lat: y, lon: x}, function (err, res) {
     if (err) {
       error_count = error_count || 0;
       error_count += 1;
       console.log("REVERSE GEO CODE", err.message, err.code, x, y, error_count, res);
       setTimeout(function () {
             getAddress(x, y, error_count).then(function(result){
               resolve(result);
             });
       }, 5000*error_count);
     }else {
       var address = res[0];
       address.county = address.administrativeLevels.level2long;		 
       address.state = address.administrativeLevels.level1short;
       address.streetName = address.streetName;
       if(address.county) {		 
         if(address.county.endsWith("County")) {		 
           address.county = address.county.substring(0, address.county.length - " County".length);		 
         }		 
       }       
       resolve(address);
     }
   });
 });
}

module.exports = {getAddress};
