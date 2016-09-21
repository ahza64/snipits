var util = require('dsp_shared/lib/cmd_utils');
var csv = require('csv');
var fs = require('fs');
var pathlib = require('path');

// connect to database and schema
util.connect(["meteor"]);
var USERS = require('dsp_shared/database/model/users');


/**
 * addCompanyToManagers - add company field to Web App Users
 *
 * @param  {String} csvFile - name of csv file
 * @return {void}
 */
function *addCompanyToManagers(csvFile) {
  var path = pathlib.dirname(__filename);
  var users = yield new Promise(function(resolve) {
    csv().from.stream(fs.createReadStream(path+'/' + csvFile)).to.array(function(data){
      var results =[];
      for(var i=0; i<data.length;i++){
        if(data[i][5].indexOf('ManagR') > -1 || data[i][5].indexOf('PlanR') > -1){
          var obj = {};
          obj.name = data[i][0];
          obj.email = data[i][1];
          obj.workType = data[i][2];
          obj.type = data[i][3];
          obj.company = data[i][4];
          obj.ccUser = data[i][5];
          results.push(obj);
        }
      }
      resolve(results);
    });
  });

  for(var j=0; j<users.length; j++){
    var email = users[j].email;
    var user = yield USERS.findOneAndUpdate({'emails.address':email}, {'profile.company': users[j].company}, {upsert:true});
    console.log('---> Company added ', user.profile.name, user.emails[0].address, user.profile.company);
  }
}

//baker module
if (require.main === module) {  
  util.bakerGen(addCompanyToManagers);
  util.bakerRun();
}


module.exports = {addCompanyToManagers: addCompanyToManagers};