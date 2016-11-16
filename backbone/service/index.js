module.exports = require('./service');


if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');  
  baker.command(, {default: true});
  baker.run();
}

cmd = require