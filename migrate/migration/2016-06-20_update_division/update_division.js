var _ = require('underscore');
var utils = require('dsp_shared/lib/cmd_utils');
utils.connect(['meteor']);
var BPromise = require('bluebird');
var models = {
    project: require('dsp_shared/database/model/pmd'),
    division: require('dsp_shared/database/model/division'),
    treev3: require('dsp_shared/database/model/tree'),
    argv:{
        _: ['', 'transmission_2015']
    },
    geoTree: require('dsp_shared/database/model/circuit'),
    city: require('dsp_shared/database/model/city')

};

function *run(){
  var pmd = yield models.project.find({type:"Orchard Maintenance"}).select("pge_pmd_num division name type").lean().exec();
  var project_array = [];
  var orchard_nums = [];
  for (var i = 0; i < pmd.length; i++) {
      orchard_nums.push(pmd[i].pge_pmd_num);
  }
  console.log("orchard project_numbers: ", orchard_nums);
  yield models.division.update({project:models.argv["_"][1]},{$pull: {project_details:{$exists:true}}},{multi:true}).exec().then(function(res){
    console.log(res);
  },function(err){
    console.error(err);
  });
  console.time('updating-project-details');
  var division_pipeline =
    [
        {
            $match:
                {
                    project:models.argv["_"][1],
                    pge_pmd_num:{$nin:orchard_nums}
                }
        },{
          $project:{
            _id:1,
            type:1,
            priority:1,
            status:{$substr:["$status",0,2]},
            division:1
          }
        },
        {
            $group:
                {
                    _id:{
                            division:"$division"
                        },
                    total:{
                        $sum:{
                            $cond:[
                                        {
                                                $ne:["$type","orchard"]
                                        },
                                    1,
                                    0
                                ]
                        }
                    },
                    detected:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","11"]
                                                 },{
                                                    $ne:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    allgood:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                   $eq:["$status","21"]
                                                 },{
                                                    $ne:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    not_ready:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","31"]
                                                 },{
                                                    $ne:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    not_ready_1:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","32"]
                                                 },{
                                                    $ne:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    ready:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","41"]
                                                 },{
                                                    $ne:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    ready_1:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","42"]
                                                 },{
                                                    $ne:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    worked:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","51"]
                                                 },{
                                                    $ne:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    worked_1:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","52"]
                                                 },{
                                                    $ne:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    total_orchard:{
                        $sum:{
                            $cond:[
                                        {
                                                $eq:["$type","orchard"]
                                        },
                                    1,
                                    0
                                ]
                        }
                    },
                    detected_orchard:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","11"]
                                                 },{
                                                    $eq:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    allgood_orchard:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","21"]
                                                 },{
                                                    $eq:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    not_ready_orchard:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","31"]
                                                 },{
                                                    $eq:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    not_ready_1_orchard:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","32"]
                                                 },{
                                                    $eq:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    ready_orchard:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","41"]
                                                 },{
                                                    $eq:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    ready_1_orchard:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","420"]
                                                 },{
                                                    $eq:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    worked_orchard:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","51"]
                                                 },{
                                                    $eq:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    worked_1_orchard:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","52"]
                                                 },{
                                                    $eq:["$type","orchard"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    }
                }

        }
   ];

var project_pipeline =
    [
        {
            $match:
                {
                    project:models.argv["_"][1]
                }
        },{
          $project:{
            _id:1,
            type:1,
            priority:1,
            pge_pmd_num:1,
            status:{$substr:["$status",0,2]},
            division:1
          }
        },
        {
            $group:
                {
                    _id:{   
                              pge_pmd_num:"$pge_pmd_num",
                              division:"$division"
                            
                        },
                    total_count_project:{
                        $sum:1
                    },
                    
                    detected_project:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","11"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    allgood_project:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","21"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    not_ready_project:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","31"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    not_ready_1_project:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","32"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    ready_project:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","41"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    ready_1_project:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","42"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    worked_project:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","51"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    },
                    worked_1_project:
                    {
                        $sum:{
                                $cond:[
                                        {
                                            $and:
                                                [{
                                                    $eq:["$status","52"]
                                                 }]
                                    },
                                    1,
                                    0
                                ]
                            }
                    }
                  }
              }
              ];



  var division_counts = yield models.treev3.aggregate(division_pipeline).exec();
  var project_counts = yield models.treev3.aggregate(project_pipeline).exec();
  console.log(division_counts);
  for(var k=0;k<division_counts.length;k++){
    var out = {
      detected_count:division_counts[k].detected,
      allgood_count:division_counts[k].allgood,
      inspected_count:division_counts[k].not_ready + division_counts[k].not_ready_1,
      listed_count:division_counts[k].ready+division_counts[k].ready_1,
      worked_count:division_counts[k].worked+division_counts[k].worked_1,
      total_count:division_counts[k].total,
      detected_count_orchard:division_counts[k].detected_orchard,
      allgood_count_orchard:division_counts[k].allgood_orchard,
      inspected_count_orchard:division_counts[k].not_ready_orchard + division_counts[k].not_ready_1_orchard,
      listed_count_orchard:division_counts[k].ready_orchard+division_counts[k].ready_1_orchard,
      worked_count_orchard:division_counts[k].worked_orchard+division_counts[k].worked_1_orchard,
      total_count_orchard:division_counts[k].total_orchard
    }
    console.log(out);
    if(!division_counts[k]["_id"].division){
      division_counts[k]["_id"].division = "unassigned"
    }
    console.log(typeof division_counts[k].detected, out, division_counts[k], typeof division_counts[k].total_count);
    console.log("UPDATING DIVISION: "+ division_counts[k]["_id"].division.toString());
    yield models.division.update({division:division_counts[k]["_id"].division,project:models.argv["_"][1]},out,{upsert:true,multi:true}).exec().then(function(res){
      console.log(res);
    },function(err){
      console.error(err);
    });
  }
  for(var k=0;k<project_counts.length;k++){
    var project_name_count = yield models.project.find({pge_pmd_num:project_counts[k]._id.pge_pmd_num}).exec();
     
    if(project_name_count.length == 0){
      project_name_count[0] = {};
      project_name_count[0]["name"] = "unassigned";
    }
    if(project_name_count[0]["type"] != "Orchard Maintenance"){
      var out = {
        $push:{
          project_details:{
            pge_pmd_num:project_counts[k]._id.pge_pmd_num,
            name:project_name_count[0]["name"],
            detected_count:project_counts[k].detected_project,
            allgood_count:project_counts[k].allgood_project,
            inspected_count:project_counts[k].not_ready_project + project_counts[k].not_ready_1_project,
            listed_count:project_counts[k].ready_project+project_counts[k].ready_1_project,
            worked_count:project_counts[k].worked_project+project_counts[k].worked_1_project,
            total_count:project_counts[k].total_count_project,
            work_type:project_name_count[0]["type"]
          }
        }
      }
    }
    else{
      var out = {
        $push:{
          project_details:{
            pge_pmd_num:project_counts[k]._id.pge_pmd_num,
            name:project_name_count[0]["name"],
            detected_count_orchard:project_counts[k].detected_project,
            allgood_count_orchard:project_counts[k].allgood_project,
            inspected_count_orchard:project_counts[k].not_ready_project + project_counts[k].not_ready_1_project,
            listed_count_orchard:project_counts[k].ready_project+project_counts[k].ready_1_project,
            worked_count_orchard:project_counts[k].worked_project+project_counts[k].worked_1_project,
            total_count_orchard:project_counts[k].total_count_project,
            work_type:project_name_count[0]["type"]
          }
        }
      }

    }
    console.log(out);
    if(!project_counts[k]["_id"].division){
      project_counts[k]["_id"].division = "unassigned"
    }
    yield models.division.update({division:project_counts[k]["_id"].division,project:models.argv["_"][1]},out,{upsert:true,multi:true}).exec().then(function(res){
      console.log(res);
    },function(err){
      console.error(err);
    });
  }
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
  console.timeEnd('updating-project-details');
  var line_data = yield models.geoTree.find({project:models.argv["_"][1]}).select("name url").lean().exec();
  console.log(line_data);
  yield models.division.update({project:models.argv["_"][1]},{$pull: {line_details:{$exists:true}}},{multi:true}).exec().then(function(res){
    console.log(res);
  },function(err){
    console.error(err);
  });
  console.time('updating-line-details');
  for(var j=0;j<line_data.length;j++){
    var counts = {
      total_count: yield models.treev3.aggregate([{$match:{circuit_name:line_data[j].name,division:{$exists:true},project:models.argv["_"][1],pge_pmd_num:{$nin:orchard_nums}}},{$group:{_id:{division:"$division"},count:{$sum:1}}}]).exec(),
      total_count_orchard: yield models.treev3.aggregate([{$match:{circuit_name:line_data[j].name,division:{$exists:true},project:models.argv["_"][1],pge_pmd_num:{$in:orchard_nums}}},{$group:{_id:{division:"$division"},count:{$sum:1}}}]).exec(),// console.log(total_count_line);
    }
    console.log("counts for ",line_data[j].name," is ",counts);
    for (var keys in counts){
      for(var k=0;k<counts[keys].length;k++){
        //console.log(counts[keys][k]["_id"]["division"],keys,":",counts[keys][k]["count"],line_data[j]["name"]);
        var cate="line_details.$."+keys;
        var out = {}
        out["$set"]={};
        out["$set"][cate]=counts[keys][k]["count"];
        //console.log(out);
        var setupdate = {};
        setupdate[cate]=counts[keys][k]["count"];
        var check = yield models.division.find({division:counts[keys][k]["_id"]["division"],project:models.argv["_"][1],line_details:{$elemMatch:{_id:line_data[j]["_id"],name:line_data[j]["name"],url:line_data[j]["url"]}}}).exec();
        console.log(setupdate)
        if(check.length == 0){
          yield models.division.update({division:counts[keys][k]["_id"]["division"],project:models.argv["_"][1]},{$push:{line_details:{name:line_data[j]["name"],url:line_data[j]["url"],_id:line_data[j]["_id"]}}},{upsert:true,multi:true});
        }
        // console.log({division:counts[keys][k]["_id"]["division"],project:models.argv["_"][1],line_details:{ $elemMatch:{name:line_data[j]["name"]}}});
        yield models.division.update({division:counts[keys][k]["_id"]["division"],project:models.argv["_"][1],line_details:{ $elemMatch:{name:line_data[j]["name"],url:line_data[j]["url"],_id:line_data[j]["_id"]}}},{$set:setupdate},{upsert:true,multi:true}).exec().then(function(res){
          console.log(res);
        },function(err){
          console.error(err);
        });
      }
    }
  }
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
  console.timeEnd('updating-line-details');
  var city_data = yield models.city.find({project:models.argv["_"][1]}).select("city_id city").lean().exec();
  yield models.division.update({project:models.argv["_"][1]},{$pull: {city_details:{$exists:true}}},{multi:true}).exec().then(function(res){
    console.log(res);
  },function(err){
    console.error(err);
  });
  console.time('updating-city-details');
  for(var j=0;j<city_data.length;j++){
    var counts = {
      total_count: yield models.treev3.aggregate([{$match:{city:city_data[j].city,division:{$exists:true},project:models.argv["_"][1],pge_pmd_num:{$nin:orchard_nums}}},{$group:{_id:{division:"$division"},count:{$sum:1}}}]).exec(),
      allgood_count: yield models.treev3.aggregate([{$match:{city:city_data[j].city,division:{$exists:true},project:models.argv["_"][1],pge_pmd_num:{$nin:orchard_nums},status:{$regex:/^21/}}},{$group:{_id:{division:"$division"},count:{$sum:1}}}]).exec(),
      detected_count: yield models.treev3.aggregate([{$match:{city:city_data[j].city,status:{$regex:/^11/},division:{$exists:true},project:models.argv["_"][1],pge_pmd_num:{$nin:orchard_nums}}},{$group:{_id:{division:"$division"},count:{$sum:1}}}]).exec(),
      inspected_count: yield models.treev3.aggregate([{$match:{city:city_data[j].city,$or:[{status:{$regex:/^31/}},{status:{$regex:'/^32/'}}],division:{$exists:true},project:models.argv["_"][1],pge_pmd_num:{$nin:orchard_nums}}},{$group:{_id:{division:"$division"},count:{$sum:1}}}]).exec(),
      listed_count: yield models.treev3.aggregate([{$match:{city:city_data[j].city,$or:[{status:{$regex:/^41/}},{status:{$regex:'/^42/'}}],division:{$exists:true},project:models.argv["_"][1],pge_pmd_num:{$nin:orchard_nums}}},{$group:{_id:{division:"$division"},count:{$sum:1}}}]).exec(),
      worked_count: yield models.treev3.aggregate([{$match:{city:city_data[j].city,$or:[{status:{$regex:/^51/}},{status:{$regex:'/^52/'}}],division:{$exists:true},project:models.argv["_"][1],pge_pmd_num:{$nin:orchard_nums}}},{$group:{_id:{division:"$division"},count:{$sum:1}}}]).exec(),
      total_count_orchard: yield models.treev3.aggregate([{$match:{city:city_data[j].city,division:{$exists:true},project:models.argv["_"][1],pge_pmd_num:{$in:orchard_nums}}},{$group:{_id:{division:"$division"},count:{$sum:1}}}]).exec(),
      allgood_count_orchard: yield models.treev3.aggregate([{$match:{city:city_data[j].city,division:{$exists:true},project:models.argv["_"][1],pge_pmd_num:{$in:orchard_nums},status:{$regex:/^21/}}},{$group:{_id:{division:"$division"},count:{$sum:1}}}]).exec(),
      detected_count_orchard: yield models.treev3.aggregate([{$match:{city:city_data[j].city,status:{$regex:/^11/},division:{$exists:true},project:models.argv["_"][1],pge_pmd_num:{$in:orchard_nums}}},{$group:{_id:{division:"$division"},count:{$sum:1}}}]).exec(),
      inspected_count_orchard: yield models.treev3.aggregate([{$match:{city:city_data[j].city,$or:[{status:{$regex:/^31/}},{status:{$regex:/^32/}}],division:{$exists:true},project:models.argv["_"][1],pge_pmd_num:{$in:orchard_nums}}},{$group:{_id:{division:"$division"},count:{$sum:1}}}]).exec(),
      listed_count_orchard: yield models.treev3.aggregate([{$match:{city:city_data[j].city,$or:[{status:{$regex:/^41/}},{status:{$regex:/^42/}}],division:{$exists:true},project:models.argv["_"][1],pge_pmd_num:{$in:orchard_nums}}},{$group:{_id:{division:"$division"},count:{$sum:1}}}]).exec(),
      worked_count_orchard: yield models.treev3.aggregate([{$match:{city:city_data[j].city,$or:[{status:{$regex:/^51/}},{status:{$regex:/^52/}}],division:{$exists:true},project:models.argv["_"][1],pge_pmd_num:{$in:orchard_nums}}},{$group:{_id:{division:"$division"},count:{$sum:1}}}]).exec()
      // console.log(total_count_line);
    }
    // console.log(counts);
    for (var keys in counts){
      for(var k=0;k<counts[keys].length;k++){
        //console.log(counts[keys][k]["_id"]["division"],keys,":",counts[keys][k]["count"],line_data[j]["name"]);
        var cate="city_details.$."+keys;
        var out = {}
        out["$set"]={};
        out["$set"][cate]=counts[keys][k]["count"];
        //console.log(out);
        var setupdate = {};
        setupdate[cate]=counts[keys][k]["count"];
        var check = yield models.division.find({division:counts[keys][k]["_id"]["division"],project:models.argv["_"][1],city_details:{$elemMatch:{city:city_data[j]["city"]}}}).exec();
        console.log(setupdate)
        if(check.length == 0){
          yield models.division.update({division:counts[keys][k]["_id"]["division"],project:models.argv["_"][1]},{$push:{city_details:{city:city_data[j]["city"],city_id:city_data[j]["city_id"]}}},{upsert:true,multi:true});
        }
        // console.log({division:counts[keys][k]["_id"]["division"],project:models.argv["_"][1],line_details:{ $elemMatch:{name:line_data[j]["name"]}}});
        yield models.division.update({division:counts[keys][k]["_id"]["division"],project:models.argv["_"][1],city_details:{ $elemMatch:{city:city_data[j]["city"],city_id:city_data[j]["city_id"]}}},{$set:setupdate},{upsert:true,multi:true}).exec().then(function(res){
          console.log(res);
        },function(err){
          console.error(err);
        });
      }
    }
  }
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
  console.timeEnd('updating-city-details');
  models.connection.close();
}


if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  utils.bakerGen(run, {default:true});  
  baker.run();  
}
