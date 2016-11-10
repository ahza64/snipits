const fs = require('fs');
const anchor = '{"date":';

module.exports = function(pathToLog) {
  var log_str = fs.readFileSync(pathToLog + '.txt').toString();
  var log_str_arr = log_str.split(anchor);
  var log_json_arr = [];

  log_str_arr.forEach(str => {
    if (str.length > 1) {
      str = anchor + str;
      log_json_arr.push(JSON.parse(str));
    }
  });

  fs.writeFileSync(pathToLog + '.json', JSON.stringify(log_json_arr));

  return require(pathToLog + '.json');
};