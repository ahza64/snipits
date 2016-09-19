var newTree = {
  "circuit_name": "EcoBoost",
  "pge_pmd_num": "911",
  "pge_detection_type": "VC1p_AF",
  "location": {
    "type": "Point",
    "coordinates": [
      -121 + Math.random(),
      37 + Math.random()
    ]
  },
  "division": "Millbrae",
  "project": "transmission_2015",
  "streetName": "Interstate 101",
  "city": "Millbrae",
  "county": "San Mateo",
  "count": 1,
  "dbh": null,
  "height": 29.09000015,
  "health": 100,
  "species": "unknown",
  "map_annotations": [],
  "type": "tree",
  "status" : 99999
};

var edittedTree = {
  "species" : "is editted",
  "health"  : 123
};

function randomTreeGen() {
  var randomLongitude = -47 + Math.random();
  var randomLattitude = -22 + Math.random();
  var height = Math.random() * 100;
  var health = Math.random() * 100;
  var pge_pmd_num = Math.floor(Math.random() * (100000));

  var newTree = {
    "circuit_name": "EcoBoost",
    "pge_pmd_num": pge_pmd_num,
    "location": {
      "type": "Point",
      "coordinates": [
        randomLongitude,
        randomLattitude
      ]
    },
    "height": height,
    "health": health,
    "species": "cow",
    "map_annotations": [],
    "type": "tree",
    "status" : 30000009
  };
  return newTree;
};

var postData = {
  'species' : 'arugula',
  'address' : '123 abc st.',
  'height'  : 71.75
};
var edittedData = {
  'species' : 'editted',
  'height'  : 1000
};

module.exports = {
  randomTreeGen: randomTreeGen,
  newTree: newTree,
  edittedTree : edittedTree,
  completePatch : {
    "assignment_complete" : true
  },
  postData : postData,
  edittedData : edittedData
};
