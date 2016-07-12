/* globals phantom:true */
"use strict";
var page = require('webpage').create(),
system = require('system'),
address, output;

address = system.args[1];
output = system.args[2];

var dpi = 100;
page.viewportSize = { width: 1300, height: 1080 };
page.paperSize = {
  width: page.viewportSize.width+'px', 
  height: page.viewportSize.height*1.5 +'px', 
  orientation: 'portrait', 
  margin: '0.5cm' 
};
page.settings.dpi = dpi;
page.zoomFactor = 0.5;

var content = '';
content += '<head>';
content += '<style type="text/css"> html {zoom: 0.4 !important; } </style>';

page.onError = function(msg, trace) {

  var msgStack = ['ERROR: ' + msg];

  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
    });
  }

  console.error(msgStack.join('\n'));

};


page.open(address, function (status) {
  if (status === 'fail') {
    console.log('Unable to load the address!');
    phantom.exit(1);
  } else {
    page.onConsoleMessage = function(msg) {
      if(msg === 'phantom: ready') {
        window.setTimeout(function () {
          //page.content = page.content.replace('<head>', content);
          console.log(page.content);
          page.render(output);
          phantom.exit();
        }, 1000);
      }
    };
  }
});



