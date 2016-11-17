var config = require('dsp_shared/config/config').get();
require('dsp_shared/database/database')(config.meteor);
var koa = require('koa');
var Tree = require('dsp_shared/database/model/tree');
var User = require('dsp_shared/database/model/cufs');
var Line = require('dsp_shared/database/model/circuit');

var app = koa();
var router = require('koa-router')();
var _ = require("underscore");
var esriConfig =  require('dsp_shared/conf.d/config').esriConfig;


//ESRI
const Server = require('dsp_shared/lib/gis/esri/arcserver/index');
const Token = require('dsp_shared/lib/gis/esri/arcserver/token');

router.get('/workr/tower', function*(){

  try {
    var userId = this.req.user._id;
    var trees = [];
    var lines = [];
    var lats = [];
    var longs = [];
    var extent = {};

    var cuf = yield User.findOne({_id: userId});
    _.each(cuf.workorder, wo => {
        trees = trees.concat(wo.tasks);
    });
    trees = _.uniq(trees);

    var treeObjs = yield Tree.find({_id: {$in: trees}});
    var multipoints = [];
    _.each(treeObjs, tree => {
      lines = lines.concat(tree.circuit_name);
      lats = lats.concat(tree.location.coordinates[0]);
      longs = longs.concat(tree.location.coordinates[1]);
      multipoints.push(tree.location.coordinates);
    });
    lines = _.uniq(lines);
    //lines = ['BRIGHTON_DAVIS'];

    //min values of extent
    extent.xmin = _.min(lats).toFixed(4);
    extent.ymin = _.min(longs).toFixed(4);

    //max values of extent
    extent.xmax = _.max(lats).toFixed(4);
    extent.ymax = _.max(longs).toFixed(4);

    //Esri connect
    var server = new Server();
    var token =  new Token(esriConfig.serverUrl, esriConfig.username, esriConfig.password);
    server.setToken(token);
    var folder = yield server.getFolder(esriConfig.towerLayer.folder);
    var service = yield folder.getService(esriConfig.towerLayer.service);
    var layer = yield service.getLayer(esriConfig.towerLayer.layer);
    var whereQuery = "";

    //For all lines, look up line number and generate the where clause
    for(var i=0; i < lines.length; i++){
      var line_obj = yield Line.findOne({ name: lines[i] });
      var line_number = line_obj.line_number;
      if(lines[i] === lines[lines.length - 1]){
        whereQuery = whereQuery + "LINE_NBR='"+ line_number + "'";
      } else {
        whereQuery = whereQuery + "LINE_NBR='"+ line_number + "' or ";
      }
    }
    console.log('WHERE QUERY:', whereQuery);
    var params = {
      where: whereQuery,
      geometryType: 'esriGeometryEnvelope',
      geometry: JSON.stringify(extent),
      spatialRel: 'esriSpatialRelIntersects',
      returnGeometry : true,
      inSR: JSON.stringify({"wkid" : 4326}),
      f: "pjson",
      outFields: 'LINE_NAME, STR_NUM',
      outSR: JSON.stringify({"wkid" : 4326})
    };
    var towers = yield layer.query(params);

    towers = towers.features.map( tower => {
      return {
        x: tower.geometry.x,
        y: tower.geometry.y,
        STR_NUM: tower.attributes.STR_NUM,
        LINE_NAME: tower.attributes.LINE_NAME
      }
    });
    this.body = {};
    this.body.lines = lines;
    this.body.extent = extent;
    this.body.params = params;
    this.body.count = towers.length;
    this.body.towers = towers;
  } catch(e) {
    this.dsp_env.error_message = e.message;
  }

});

app.use(router.routes());
module.exports = app;

// //This is runnable as a stand alone server
// if(require.main === module) {
//   app.use(bodyParser());
//   var logger = require('koa-logger');
//   app.use(logger());
//   app.listen(3000);
// }
