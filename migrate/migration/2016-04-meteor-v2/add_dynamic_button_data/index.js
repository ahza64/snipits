var util = require('dsp_tool/util');
var species = require('./data/species.json');
var trimcodes = require('./data/trimcodes.json');
var AppConfig = require('dsp_model/meteor_v3/app_config');
function *run() {

  var result = yield AppConfig.findOneAndUpdate({_id: species._id}, species, {upsert:true});
  console.log("added species config", result);
  result = yield AppConfig.findOneAndUpdate({_id: trimcodes._id}, trimcodes, {upsert:true});
  console.log("added trimcode config", result);
}


if (require.main === module) {
  var baker = require('dsp_tool/baker');
  util.bakerGen(run, {default:true});
  baker.run();
}

module.exports = {
};