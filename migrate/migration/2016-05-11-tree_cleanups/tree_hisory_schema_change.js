
const mongoose = require('mongoose');

const treeHistorySchema = new mongoose.Schema({
  action_code: { type: String, required: true },
  action_field: { type: String, required: true },
  action_value_from: { type: {} },
  action_value_to: { type: {} },
  object_type: { type: String, required: true },
  object_id: { type: String, required: true },
  performer_id: { type: String },
  performer_type: { type: String },
  platform_id: { type: String },
  platform_version: { type: String },
  created: { type: Date }
}, {strict:false});

var util = require('dsp_tool/util');
var connection = require('dsp_model/connections')('meteor');
var TreeHistory = connection.model('treehistories', treeHistorySchema);

String.prototype.replaceAt=function(index, character) {
    return this.substr(0, index) + character + this.substr(index+character.length);
};



function *run(fix){
  console.debug("run migration");  
  var histories = yield TreeHistory.find({created: null});
  
  for(var i = 0; i < histories.length; i++){
    var hist = histories[i];
    var created = hist._id.getTimestamp();
    var action_value = hist.get('action_value');
    console.log();    
    console.log("hist_id", hist._id);
    console.log("fixing created", hist.created, created);
    console.log("fixing action_value_to", hist.action_value_to, action_value);
    console.log("fixing action_value_from", hist.action_value_from, "<value missing>");
    if(fix) {
      hist.created = created;
      hist.action_value_to = action_value;
      hist.action_value_from = '<value unknown>';
      yield hist.save();
    }
  }

  
}

if (require.main === module) {
  var baker = require('dsp_tool/baker');
  util.bakerGen(run, {default:true});
  baker.run();
}

