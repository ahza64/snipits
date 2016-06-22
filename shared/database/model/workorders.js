const mongoose = require('mongoose');
const connection = require('dsp_database/connections')('meteor');
const autoIncrement = require('mongoose-auto-increment');
const log = require('log4js').getLogger('generic');
const TreeModel = require('./tree');

autoIncrement.initialize(connection);

const WorkorderSchema = new mongoose.Schema({
  uniq_id: { type: String, index: { unique: true }},
  span_name: String,
  name: Number,
  pge_pmd_num: String,
  city: String,
  streetName: String,
  streetNumber: String,
  zipcode: String,
  tasks: { type: [] }
});

WorkorderSchema.plugin(autoIncrement.plugin, { model: 'workorders', field: 'name', startAt: 1000, incrementBy: 10 });


WorkorderSchema.statics.checkTreeCount = function() {
  var woTreeCount = WorkorderModel.aggregate([
      { $project: { count: { $size: '$tasks' }}},
      { $group: { _id: null, count: { $sum: '$count' }}}
    ]);

  log.info('Verifying tree count');
  return Promise.all([woTreeCount.exec(), TreeModel.find().count()])
  .then((counts) => checkTreeCount(counts));
};

WorkorderSchema.statics.addToWorkorder = function(defaultValues, tree) {
  var pmd = defaultValues.pge_pmd_num || tree.pge_pmd_num;
  var span_name = defaultValues.span_name || tree.span_name;
  var city = tree.city;
  var streetName = tree.streetName;
  var streetNumber = tree.streetNumber;
  var zipcode = tree.zipcode;

  return WorkorderModel.update({ uniq_id: pmd + span_name + streetNumber + streetName + city + zipcode }, { $push: { tasks: tree._id }})
  .then(() => tree)
  .catch(err => {
    log.error(err);
    return tree;
  });
};

WorkorderSchema.statics.generateWorkorders = function() {
  var group = {
    pge_pmd_num: "$pge_pmd_num",
    span_name: "$span_name",
    city: "$city",
    streetName: "$streetName",
    streetNumber: "$streetNumber",
    zipcode: "$zipcode"
  };
  log.debug("aggregating trees");
  var workorders = TreeModel.aggregate([
    { $group: { _id: group, tasks: { $push: "$_id"} }}
  ]);

  return Promise.resolve(workorders.exec())
  .then(generateWorkorder)
  .then(workorders => Promise.all(workorders))
  .catch(err => { log.error(err); });
};

function generateWorkorder(workorders) {
  log.debug("generateWorkorder", workorders.length);
  return workorders.map(wo => {
    var pmd = wo._id.pge_pmd_num;
    var span_name = wo._id.span_name;
    var city = wo._id.city;
    var streetName = wo._id.streetName;
    var streetNumber = wo._id.streetNumber;
    var zipcode = wo._id.zipcode;
    var uniq_id = pmd + span_name + streetNumber + streetName + city + zipcode;
    wo = {
      span_name: span_name,
      pge_pmd_num: pmd,
      tasks: wo.tasks,
      uniq_id: uniq_id,
      city: city,
      streetName: streetName,
      streetNumber: streetNumber,
      zipcode: zipcode
    };
    console.log("SAVING WO", wo.uniq_id);
    return new WorkorderModel(wo).save().then(function(saved){
      log.debug("WORKORDER SAVED", wo.uniq_id);
      return saved;
    });
  });
}

function checkTreeCount(counts) {
  var woTreeCount = counts[0][0].count;
  var treeCount = counts[1];
  return woTreeCount !== treeCount ? log.error('Workorder tree count: #' + woTreeCount + ' doesn\'t match Tree count: #' + treeCount ) : 
                                     log.info('Tree counts match. Total number of trees: #' + treeCount);
}

const WorkorderModel = connection.model("workorders", WorkorderSchema);

module.exports = WorkorderModel;
