function createWO(cuf_id, trees) {
  console.log('number of trees in createWO before ',trees.length);
  var wos = {},
  workorders = [];
  for(var i=0; i<trees.length; i++) {
    var tree = trees[i];

    // String(tree.streetNumber) + String(tree.streetName) +
    var concatstring =  String(tree.pge_pmd_num) + String(tree.span_name);
    if(!wos[concatstring]){
      wos[concatstring] = [];
    }

    wos[concatstring].push(tree);
  }

  for(var workorderID in wos){
    if(wos[workorderID].length > 10){
      var distances = [];
      var tree_zero = wos[workorderID][0];
      for (var j=0;j<wos[workorderID].length;j++){
        var tree_wo = wos[workorderID][j];
        wos[workorderID][j].distance = distance(tree_zero.x,tree_zero.y,tree_wo.x,tree_wo.y);
        distances.push(wos[workorderID][j]);
      }
      var distances_sorted = _.sortBy(distances,'distance');
      for(var k=0;k<distances_sorted.length;k++){
        var overflow_index = k-k%10;
        var wosKey = workorderID + overflow_index.toString();
        if(!wos[wosKey]) {
          wos[wosKey] = [];
          wos[wosKey].push(distances_sorted[k]);
        } else {
          wos[wosKey].push(distances_sorted[k]);
        }
      }

      wos[workorderID] = [];
    }
  }

  var trees_workorder = [];
  var points = [];
  for(workorderID in wos){
    var out = {};
    if(wos[workorderID].length === 0) {
      continue;
    }
    var first_tree = wos[workorderID][0];
    out._id = new Meteor.Collection.ObjectID()._str;
    out.uniq_id = workorderID;
    out.span_name = first_tree.span_name;
    out.location = {
      type:'Point',
      coordinates:[
        first_tree.x,
        first_tree.y
      ]
    };

    var current_workorder = {};
    current_workorder.workorder_id = out._id;
    current_workorder.locations = [];
    out.pge_pmd_num = first_tree.pge_pmd_num;
    out.status = 'assigned';
    out.priority = 'routine';
    out.work_type= 'tree_inspect';
    out.name = makeid();
    out.tasks = [];
    for(var m = 0;m<wos[workorderID].length;m++){
      var current_tree = wos[workorderID][m];
      out.tasks.push(current_tree.id);
      trees_workorder.push(current_tree.id);
      current_workorder.locations.push({
         location: {
         type:'Point',
         coordinates:[
           first_tree.x,
           first_tree.y
         ]
       }
     });

      points.push(current_workorder);
      workorders.push(out);
    }
  }
  return workorders;
}


