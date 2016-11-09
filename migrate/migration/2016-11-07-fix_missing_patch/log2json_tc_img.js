const fs = require('fs');
const anchor = '{"date":';
var log_str = fs.readFileSync('./logs/tc_img_log.txt').toString();

var log_str_arr = log_str.split(anchor);
var log_json_arr = [];

log_str_arr.forEach(str => {
  if (str.length > 1) {
    str = anchor + str;
    log_json_arr.push(JSON.parse(str));
  }
});

fs.writeFile('./logs/tc_img_log.json', JSON.stringify(log_json_arr), (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(log_json_arr);
    console.log('--> JSON log written');
  }
});