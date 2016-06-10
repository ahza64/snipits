var util = require('dsp_shared/lib/cmd_utils');
var csv = require('csv');
var fs = require('fs');
var pathlib = require('path');

// connect to database and schema
util.connect(["meteor"])
var CUF = require('dsp_shared/database/model/cufs');
var USERS = require('dsp_shared/database/model/users');

/**
 * addCompanyToCufs - add company field to cufs
 *
 * @param  {String} csvFile - csv file
 * @return {void}
 */
function addCompanyToCufs(csvFile) {
  path = pathlib.dirname(__filename);
  csv().from.stream(fs.createReadStream(path+'/' + csvFile)).to.array(function(data){
    var users =[]
    for(var i=0; i<data.length;i++){
      if(data[i][5].indexOf('ManagR') > -1 || data[i][5].indexOf('PlanR') > -1){
        var obj = {};
        obj.name = data[i][0];
        obj.email = data[i][1];
        obj.workType = data[i][2];
        obj.type = data[i][3];
        obj.company = data[i][4];
        obj.ccUser = data[i][5];
        users.push(obj);
      }
    }
    for(var j=0; j<users.length; j++){
      USERS.findOne({'emails.address': users[j].email}, function(err, user_docs){
        if(err){
          console.error(err);
        }
        else{
          var set_company = user_docs.profile.company;
          CUF.update({scuf: user_docs.emails[0].address}, {company: set_company}, {multi:true}, function(err, cuf){
            if(err){
              console.error(err);
            }
            else{
              console.log('Company field added for '+ user_docs.profile.name + '\'s Crew', cuf);
            }
          });
        }
      });
    }
  });
}

/**
 * cufsWithNoCompany - find all cufs with no company attribute
 *
 * @return {void}
 */
function cufsWithNoCompany(){
  CUF.find({company:null}, 'name scuf',function(err, cufs){
    if(err) throw err;
    for(var i=0;i<cufs.length;i++){
      console.log(cufs[i].name, cufs[i].scuf, cufs[i]._id);
    }
  })
}

//baker module
if (require.main === module) {
  var baker = require("dsp_shared/lib/baker");
  baker.command(addCompanyToCufs);
  baker.command(cufsWithNoCompany);
  baker.run();
}
