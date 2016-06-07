var Monky = require('monky');


module.exports = function(mongoose) {
  var monky = new Monky(mongoose);
  require('../resources/pdf/pdf-resource_mock')(monky);
  return monky;
};
