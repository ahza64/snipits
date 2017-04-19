const Cufs = require('dsp_shared/database/model/cufs');
const Tree = require('dsp_shared/database/model/tree');
const Pmds = require('dsp_shared/database/model/pmd');
const moment = require('moment');
const _ = require('underscore');
var mongoose = require('mongoose');

module.exports = {

  *updateTrees(crew, qows) {
    yield Tree.update({_id: {$in: qows}}, {'$set': {assigned_user_id: crew}});
  },

  *updateCrew(id) {
    yield Cufs.update({_id: id}, { '$set': {last_sent_at: moment.utc().toDate()}});
  },

  *updatePmd(pmds, id) {
    yield Pmds.update({ pge_pmd_num: {$in : pmds }}, { $addToSet: { cufs: id }});
  },

  *createWO(id, qows) {
    var tree_limits = {
      tree_inspect: 300,
      tree_trim: 400
    };
    var crew = yield Cufs.findOne({_id: id});
    var total = 0;
    var assigned_count = {};
    var current_workorders = crew.workorder || [];

    var assignedQows = yield this.getAssignedQows(id);
    var trees_current = _.chain(current_workorders).map(workorder => workorder.tasks).flatten().uniq().value();
    var trees_need_workorder = assignedQows.filter(tree => trees_current.indexOf(tree.id) < 0);
    var incomplete_trees = assignedQows.filter(item => !(trees_need_workorder.indexOf(item) > -1));

    var newWO = yield this.create(trees_need_workorder);

    var pmds = newWO.map( (wo) => {
      return wo.pge_pmd_num;
    });
    yield this.updatePmd(pmds, id);
    var workorders_incomplete = current_workorders.filter(workorder => incomplete_trees.some(tree => this.complete(tree, workorder)));
    var sorted_WO = yield this.sort_by_span(newWO, crew._id);
    var cuf_workorders = workorders_incomplete.concat(sorted_WO);
    for(var i=0; i<cuf_workorders.length; i++) {
      var pge_pmd_num = cuf_workorders[i].pge_pmd_num;
      var pmd = yield Pmds.findOne({ pge_pmd_num: pge_pmd_num });
      if(!assigned_count[pge_pmd_num]){
        assigned_count[pge_pmd_num] = {};
        assigned_count[pge_pmd_num].pge_pmd_num = pge_pmd_num;
      }

      if(total < tree_limits[crew.work_type]){
        assigned_count[pge_pmd_num].left += cuf_workorders[i].tasks.length;
        console.log('add_to_cuf', cuf_workorders[i], id);
        yield this.add_to_cuf(cuf_workorders[i], id);
      } else {
        console.log('cancelling ...')
        return;
      }
      total += cuf_workorders[i].tasks.length;
    }
    return yield this.update_cuf_division_data(assigned_count, crew);
  },

  *getAssignedQows(id) {
    return yield Tree.find({assigned_user_id: id});
  },

  *create(trees) {
    var workorders = [];
    var wos = this.build_from_trees(trees);
    var trees_workorder = [];
    wos = this.split_workorders(wos);
    var generate_cuf_workorders = yield this.generate_cuf_workorders(wos);
    return generate_cuf_workorders;
  },

  build_from_trees(trees) {
    var wos = {};

    trees.forEach(tree => {
      var concatstring =  String(tree.pge_pmd_num) + String(tree.span_name);
      if(!wos[concatstring]){
        wos[concatstring] = [];
      }

      wos[concatstring].push(tree);
    });

    return wos;
  },

  split_workorders(workorders) {
    for(var id in workorders) {
      if(workorders[id].length <= 10) { continue; }

      var distances = [];
      var tree_zero = workorders[id][0];
      for (var j = 0; j < workorders[id].length; j++) {
        var tree_wo = workorders[id][j];
        workorders[id][j].distance = this.calculate_distance(tree_zero.x, tree_zero.y, tree_wo.x, tree_wo.y);
        distances.push(workorders[id][j]);
      }

      var distances_sorted = _.sortBy(distances, 'distance');

      for(var k = 0; k < distances_sorted.length; k++) {
        var overflow_index = k - k%10;
        var wosKey = id + overflow_index.toString();
        if(!workorders[wosKey]) { workorders[wosKey] = []; }

        workorders[wosKey].push(distances_sorted[k]);
      }

      workorders[id] = [];
    }

    return workorders;
  },

  calculate_distance: function(lat1, lon1, lat2, lon2) {
    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;

    return dist;
  },

  *generate_cuf_workorders(workorders) {
    var cuf_workorders = [];

    for(id in workorders) {
      var trees = workorders[id];
      if(trees.length === 0){ continue; }
      var out = this.build(id, trees[0]);
      trees.forEach(tree => out.tasks.push(tree.id));
      out.circuit_names = yield this.fetch_circuit_names(trees);
      cuf_workorders.push(out);
    }

    return cuf_workorders;
  },

  build(id, tree) {
    var workorder = {};

    workorder._id = mongoose.Types.ObjectId();
    workorder.uniq_id = id;
    workorder.span_name = tree.span_name;
    workorder.location = {
      type:'Point',
      coordinates: [
        tree.location.coordinates[0],
        tree.location.coordinates[1]
      ]
    };

    workorder.pge_pmd_num = tree.pge_pmd_num;
    workorder.status = 'assigned';
    workorder.priority = 'routine';
    workorder.work_type= 'tree_inspect';
    workorder.name = this.generate_name();
    workorder.tasks = [];

    return workorder;
  },

  generate_name() {
    var text = '';
    var possible = '0123456789';

    for( var i=0; i < 6; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },

  *fetch_circuit_names(trees) {
    var trees_object_ids = trees.map( tree => mongoose.Types.ObjectId(tree.id) );
    var circuit_names = yield Tree.find({
        _id: {$in: trees_object_ids }
      },{
          _id:0,
          circuit_name:1
    });
    trees.map(circuit_name => circuit_name.circuit_name);
    return _.uniq(circuit_names);
  },

  complete: function(incomplete_tree, workorder) {
    return workorder.tasks.indexOf(incomplete_tree.id) != -1;
  },

  *sort_by_span(workorders, cufId) {
    var currentCufProjects = yield Pmds.find({ cufs: cufId }, { pge_pmd_num: 1, _id: -1 });
    var projectsCufCurrentUniq = _.uniq(currentCufProjects.map(pmd => pmd.pge_pmd_num));
    var sorted_workorders = [];

    projectsCufCurrentUniq.forEach(function(project){
      // TODO: Temporary fix to add workorders - logic needs to be re thought
      //var filtered_workorders = workorders.filter(workorder => project === workorder.pge_pmd_num);
      var sorted_project = _.sortBy(workorders, 'span_name');
      sorted_workorders = sorted_workorders.concat(sorted_project);
    });
    console.log('sorted_workorders', sorted_workorders);
    return sorted_workorders;
  },

  *add_to_cuf(workorder, cufId) {
    console.log('WORKORDER AND CUF ------>', workorder, cufId);
    var pge_pmd_num = workorder.pge_pmd_num;
    var pmd = yield Pmds.findOne({ pge_pmd_num: pge_pmd_num });
    yield Cufs.update({ _id: cufId }, { $addToSet: { workorder: workorder }});
    yield Pmds.update({ _id: pmd._id }, { $addToSet: { cufs: cufId }});
    yield this.update_cuf_counts(pge_pmd_num, cufId);
  },

  *update_cuf_counts(options, clear){
    var cuf_id = options.cuf_id;
    var update_condition = { $inc: { data: [] }};
    if(clear){
      update_condition = { $set: { data: [] }};
    }

    yield Cufs.update({ _id: cuf_id }, update_condition);
  },

  *update_cuf_division_data(assigned_count, cuf) {
    var trees_sents = 0;
    var division_data = cuf.division_data || []
    var response = {};

    for(var pmd_num in assigned_count) {
      var current_pmd = division_data.filter(data => data.pge_pmd_num === pmd_num)[0];
			if(!current_pmd) {
				yield Cufs.update({ _id: cuf._id }, { $addToSet: { division_data: assigned_count[pmd_num] }});
			}
    }

    // try {
    //   console.log('CUF ID ====================', cuf);
    //   response = yield this.update_tree_sent_counts(cuf._id);
    //   console.log('response from update_sent_tree_counts ', response.trees_sent);
    // } catch(err) {
    //   console.log('error from update_tree_counts ', err);
    // };

    response.trees_assigned = cuf.trees_assigned;
    return response;
  },

  *update_tree_sent_counts(cuf_id) {
    var cuf = yield Cufs.findOne({ _id: cufId });
    var work_type = cuf.work_type[0];
    var trees_sent = 0;
    var trees_complete = 0;
    var trees = [];

    var total_assigned_trees = CufTrees.find({ cuf_id: cufId }).fetch().map(x => x._id);
    var trees = (cuf.workorder || []).reduce((trees, wo) => trees.concat(wo.tasks), []);
    trees = trees.map(tree => new Meteor.Collection.ObjectID(tree));

    trees_sent = TreeSchemas.find({ _id: { $in: trees }, assigned_user_id: { $ne: null }}).count();
    trees_complete = TreeSchemas.find({ _id: { $in: total_assigned_trees }, assigned_user_id: null }).count();

    Cufs.update({ _id: cufId },{ $set: { trees_sent: trees_sent, trees_complete: trees_complete }});

    return {
      trees_sent: trees_sent,
      trees_complete: trees_complete
    };
  }
};
