var genTcImgGrep = function(ids, imageType, output) {
  if (ids.length === 0) {
    return '';
  }
  var treesIdStr = '';
  for (var i = 0; i < ids.length; i++) {
    if (ids.length - 1 === i) {
      treesIdStr = treesIdStr + '\\"' + ids[i] + '\\"';
    } else {
      treesIdStr = treesIdStr + '\\"' + ids[i] + '\\"\\|';
    }
  }
  return 'cat /var/log/dsp/api-v3__* | ' + 
         'grep "\\"contentType\\"*.*\\"imageType\\"\:\\"' + imageType + '\\"*.*\\"ressourceId\\"\\:\\(' + 
         treesIdStr + '\\)" > ~/' + output + '.txt';
};

module.exports = genTcImgGrep;