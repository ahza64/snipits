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
  .then((counts) => { return checkTreeCount(counts);});
};

WorkorderSchema.statics.updateTreesWithoutWorkorders = function(startDate, endDate) {
  startDate = startDate || new Date('2016-05-01');
  endDate = endDate || new Date();
  return TreeModel.find({ created: { $gte: startDate, $lt: endDate }})
  .then(trees => trees.reduce(addToWorkorder, Promise.resolve()));
};

WorkorderSchema.statics.buildWorkorder = function(tree, defaultValues) {
  defaultValues = defaultValues || {};
  var pmd = defaultValues.pge_pmd_num || tree.pge_pmd_num;
  var span_name = defaultValues.span_name || tree.span_name;
  var city = tree.city;
  var streetName = tree.streetName;
  var streetNumber = tree.streetNumber;
  var zipcode = tree.zipcode;
  
  var uniq_id = pmd + span_name + streetNumber + streetName + city + zipcode;
  
  var newWo = {
    span_name: span_name,
    pge_pmd_num: pmd,
    tasks: [],
    uniq_id: uniq_id,
    city: city,
    streetName: streetName,
    streetNumber: streetNumber,
    zipcode: zipcode
  };
  return newWo;
};


WorkorderSchema.statics.getUniqId = function(tree_or_workorder, defaultValues) {
  var wo = WorkorderModel.buildWorkorder(tree_or_workorder, defaultValues);
  return wo.uniq_id;
};


WorkorderSchema.statics.addToWorkorder = function(defaultValues, tree) {

  var uniq_id = WorkorderModel.getUniqId(tree, defaultValues);
  return WorkorderModel.findOne({ "tasks": tree._id })
  .then(wo => {
    if(wo === null) {
      return WorkorderModel.findOne({uniq_id: uniq_id});
    } else {
      if(wo.uniq_id !== uniq_id) {
        console.log("Tree work order has uniq_id missmatch", tree._id, uniq_id);
      }
      return wo;
    }  
  })
  .then(wo => {
    if(wo && wo.tasks.find(id => id.toString() === tree._id.toString())) {
      return wo;
    }

    if(wo){
      return WorkorderModel.update({ uniq_id: uniq_id }, { $push: { tasks: tree._id }});
    } else {

      var newWo = WorkorderModel.buildWorkorder(tree, defaultValues);
      newWo.tasks.push(tree._id);
      return new WorkorderModel(newWo).save();
    }
  })
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
    var newWo = WorkorderModel.buildWorkorder(wo._id);//wo._id is aggrigation
    newWo.tasks = wo.tasks;
    console.log("SAVING WO", wo.uniq_id);
    return new WorkorderModel(wo).save().then(function(saved){
      log.debug("WORKORDER SAVED", wo.uniq_id);
      return saved;
    });
  });
}

function addToWorkorder(promisedTree, tree) {
  return promisedTree
  .then(() => Promise.resolve(WorkorderModel.addToWorkorder({}, tree)));
}

function checkTreeCount(counts) {
  var woTreeCount = counts[0][0].count;
  var treeCount = counts[1];
  if(woTreeCount !== treeCount) { 
    log.error('Workorder tree count: #' + woTreeCount + ' doesn\'t match Tree count: #' + treeCount );
  } else {
    log.info('Tree counts match. Total number of trees: #' + treeCount);
  }
  return woTreeCount === treeCount;
}

const WorkorderModel = connection.model("workorders", WorkorderSchema);

module.exports = WorkorderModel;
