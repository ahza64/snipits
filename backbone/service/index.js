module.exports = require('./service');


if (require.main === module) {


  var service = require('./cmd');
  service.run();
}