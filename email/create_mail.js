var mailcomposer = require("mailcomposer");
var mustache = require("mustache");

var fs = require("fs");



function loadFileTemplate(file_name) {

}
//
// function loadMongoTemplate(template_name) {
//
// }
//

email: {
  to: []
  list: "vmd_export"
  from: "noreply@dispatchr.co"
  template: "template1"
  values: {}
  email:
}

distribution_list: {
  "vmd_export": {
    emails: [
    
    ]
  },
  {
    
  }
}


template: {
  
}





function generateEmail(template, values) {
  var raw = mustache.render(template, values);
  return raw;
}


if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  
  baker.command(function test() {
    
  });
  
  
  
  
  baker.run();
}
