var util = require('dsp_shared/lib/cmd_utils');
var createCSV = require('dsp_shared/lib/write_csv');

util.connect(["meteor"]);



function testCSV(){

  var fields = ['name', 'number'];
  var data = [
    {
      name : 'Tejas',
      number : '12345'
    },
    {
      name : 'Nick',
      number: '12345'
    }
  ];
  var filename = 'test1.csv';
  createCSV(fields, data, filename);
}

if (require.main === module) {
  var baker = require("dsp_shared/lib/baker");
  baker.command(testCSV);
  baker.run();
}
