/* jshint bitwise: false */
// https://github.com/Esri/terraformer-arcgis-parser/issues/10
function _fromCompressedGeometry( /*String*/ str) { //, /*SpatialReference*/ sr) {
  var xDiffPrev = 0,
  yDiffPrev = 0,
  points = [],
  x, y,
  strings,
  coefficient;

  // Split the string into an array on the + and - characters
  strings = str.match(/((\+|\-)[^\+\-]+)/g);

  // The first value is the coefficient in base 32
  coefficient = parseInt(strings[0], 32);

  for (var j = 1; j < strings.length; j += 2) {
    // j is the offset for the x value
    // Convert the value from base 32 and add the previous x value
    x = (parseInt(strings[j], 32) + xDiffPrev);
    xDiffPrev = x;

    // j+1 is the offset for the y value
    // Convert the value from base 32 and add the previous y value
    y = (parseInt(strings[j + 1], 32) + yDiffPrev);
    yDiffPrev = y;

    points.push([x / coefficient, y / coefficient]);
  }

  return points;
}

//https://geonet.esri.com/thread/99932

function extractInt(src, nStartPos) {  
  // Read one integer from compressed geometry string by using passed position  
  // Returns extracted integer, and re-writes nStartPos for the next integer  
  var bStop = false;  
  var result = "";  
  var nCurrentPos = nStartPos;  
  while (!bStop) {  
    var cCurrent = src[nCurrentPos];  
    if (cCurrent === '+' || cCurrent === '-' || cCurrent === '|') {  
      if (nCurrentPos !== nStartPos) {  
        bStop = true;  
        continue;  
      }  
    }  
    result += cCurrent;  
    nCurrentPos++;  
    if (nCurrentPos === src.length) {
      // check overflow  
      bStop = true;  
    }
  }  
  var nResult = 0;  
  if (result.length !== 0) {  
    nResult = fromStringRadix32(result.toString());  
    nStartPos = nCurrentPos;  
  }  
  return nResult;  
}  
function createPathFromCompressedGeometry(compresedGeometry){  
  var points = [];  

  var nIndex = 0;  
  var dMultBy = parseFloat(extractInt(compresedGeometry, nIndex)); // exception  
  var nLastDiffX = 0;  
  var nLastDiffY = 0;  
  var nLength = compresedGeometry.length; // reduce call stack  

  while (nIndex !== nLength) {  
    // extract number  
    var nDiffX = extractInt(compresedGeometry, nIndex); // exception  
    var nDiffY = extractInt(compresedGeometry, nIndex); // exception  

    // decompress  
    var nX = nDiffX + nLastDiffX;  
    var nY = nDiffY + nLastDiffY;  
    var dX = parseFloat(nX / dMultBy);  
    var dY = parseFloat(nY / dMultBy);  
    // add result item  
    // var point = new esri.geometry.Point(dX, dY, new esri.SpatialReference({ wkid: 3414 }));
    var point = [dX, dY];
    //point.x = dX;  
    //point.y = dY;  
    points.push(point); // memory exception  
    // prepare for next calculation  
    nLastDiffX = nX;  
    nLastDiffY = nY;  
  }  
  return points;  
} 

function fromStringRadix32(s) {  
  // Sample input and output: +1lmo -> 55000  
  var result = 0;  
  for (var i = 1; i < s.length; i++) {  
    var cur = s[i];  
    //Assert.IsTrue((cur >= '0' && cur <= '9') || (cur >= 'a' && cur <= 'v'), "Cannot parse CompressedGeometry");  
    if (cur >= '0' && cur <= '9'){  
      result = (result << 5) + parseInt(cur) - parseInt('0');  
    }else if (cur >= 'a' && cur <= 'v'){  
      result = (result << 5) + parseInt(cur) - parseInt('a') + 10;  
    }
    //else Assert.Fail("Cannot parse CompressedGeometry");  
  }  
  if (s[0] === '-'){  
    result = -result;
  }  
  return result;  
}  

module.exports = {
  decompress: _fromCompressedGeometry,
  decompress2: createPathFromCompressedGeometry
};