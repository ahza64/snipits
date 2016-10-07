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
function getAddress(x, y){
 return new Bpromise(function(resolve,reject){
   geocoder.reverse({lat: y, lon: x}, function (err, res) {
     if (err) {
        reject(err);
     }else {
       var address = res[0];
       address.county = address.administrativeLevels.level2long;
       address.state = address.administrativeLevels.level1short;
       address.streetName = address.streetName;
       address.streetNumber = address.streetNumber;
       address.zipcode = address.zipcode;
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

 function getAddressRetry(x, y, retries, delay) {
   if(delay === undefined) {
     delay = 5000;
   }
   return getAddress(x, y).catch(function (err) {
     if(retries === 0) {
       return Bpromise.reject(err);
     } else {
       console.log("get Address Retrying ", retries);
       return new Bpromise(function(resolve, reject) {
         setTimeout(function(){
           getAddressRetry(x, y, retries-1)
           .then(resolve)
           .catch(reject);
         }, delay);
       });
     }
   });
}

module.exports = {getAddress: getAddressRetry};
