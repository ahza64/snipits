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
       console.log("REVERSE GEO CODE", err.message, res);
       if(err[19] !== "Z"){
         setTimeout(function () {
             getAddress(x, y).then(function(result){
               resolve(result);
             });
         }, 5000);
       } else{
         reject(err);
       }
     }else {
       var address = res[0];
       address.streetName = address.streetName;
       if(!address.streetName) {
         console.error("Could not find streetName", [x, y]);
         // if(address.county.endsWith("County")) {
         //   address.county = address.county.substring(0, address.county.length - " County".length);
         // }
       // } else {
       //   console.error("Could not find streetName", [x, y]);
       }
       resolve(address);
     }
   });
 });
}

module.exports = {getAddress};
