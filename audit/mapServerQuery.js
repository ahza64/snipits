'use strict';

/**
 * Outer: map service
 * Inner: feature layer
 */

var https = require('https');
var lodash = require('lodash');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const BASE_URL = 'https://esri.dispatchr.co:6443/arcgis/rest/services/TRANSMISSION_2015/';
const MAP_SERVICES = [
  'SPRING_30_DELIVERY_1'
];

/**
 * We require TREEID to be first, as it's the most important and used to check
 * validity of the query
 * @type {Array}
 */
const FIELDS = [
  'TREEID',
  'LINE_NAME',
  'VOLTAGE',
  'PMD_NUM'
];

function constructQueryUrl(service, layerID, objectID) {
  var url = BASE_URL + service + '/MapServer/' + layerID + '/query?where=';
  url += 'OBJECTID>=' + objectID;
  url += '&geometry=0%2C0&geometryType=esriGeometryEnvelope';
  url += '&spatialRel=esriSpatialRelIntersects&outFields=*';
  url += '&returnGeometry=true&returnIdsOnly=false&returnCountOnly=false';
  url += '&returnZ=false&returnM=false&returnDistinctValues=false&f=pjson';
  return url;
}

function constructServiceQueryUrl(service) {
  return BASE_URL + service + '/MapServer?f=pjson';
}

// TODO: Needs a termination clause
function getLayer(service, id, objectID, trees) {
  var trees = trees || [];
  var json = {};
  // console.log('service: ' + service);
  // console.log('id: ' + id);
  // console.log('objectID: ' + objectID);
  // console.log('trees: ' + trees);
  return getURL(constructQueryUrl(service, id, objectID))
  .then(res => {
    json = res;
    return extractFields(res);
  }).then(fields => {
    trees = trees.concat(fields);
    return getMaxObjectID(json);
  }).then(maxID => getLayer(service, id, maxID + 1, trees));
}

/**
 * Given a service name and the service's layer IDs, grab all of the trees
 *
 * @param  {String}           service   The service name
 * @param  {Array[Integer]}   layerIDs  An array of layer IDs
 * @return {[type]}                     [description]
 */
function getLayers(service, layerIDs) {
  var ObjectID = 1;
  var promises = [];
  layerIDs.forEach(id => {
    var p = new Promise((resolve, reject) => {
      getLayer(service, id, ObjectID)
      .then(res => {
        // console.log(res);
        resolve(res);
      });
    });
    promises.push(p);
  });
  Promise.all(promises);
}

/**
 * Get the maximum object ID so we can construct the next query
 *
 * @param  {Object}  json     The json our server returned
 * @return {Integer}          The last objectID we got
 */
function getMaxObjectID(json) {
  return lodash.max(json.features.map(item => item.attributes.OBJECTID));
}

/**
 * Given json, extract the fields we're interested in.
 *
 * @param  {String}   json      The json our server returned
 * @return {[type]}      [description]
 */
function extractFields(json) {
  var data = [];
  json = JSON.parse(json);
  var p = new Promise((resolve, reject) => {
    if (Object.keys(json.fieldAliases).indexOf(FIELDS[0]) === -1) {
      resolve([]);
    } else {
      json.features.forEach(feature => {
        var tree = {};
        FIELDS.forEach(field => {
          tree[field] = feature.attributes[field] || null;
        });
        data.push(tree);
      });
      resolve(data);
    }
  });
  return p;
}

/**
 * Promise wrapper around GETting data from a given url.
 *
 * @param  {String}  url  The URL we want to retrieve
 * @return {Any}          This promise resolves with whatever data was retrieved
 */
function getURL(url) {
  var data = '';
  var p = new Promise((resolve, reject) => {
    try {
      https.get(url, res => {
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
    } catch (e) {
      reject(e);
    }
  });
  return p;
}

/**
 * GET the layer IDs, given a service name.  Wrap it all in a promise.
 *
 * @param  {String}   service   A service name hosted by the server
 * @return {Object}             A json object - the server response
 *                              Note we actually return a promise - this
 *                              object is the promise's resolution.
 */
function getLayerIDs(service) {
  return getURL(constructServiceQueryUrl(service));
}

/**
 * Given a response from the server, return a list of layer IDs
 *
 * @param  {String}         json    What we got from calling getLayerIDs()
 * @return {Array[Integer]}         An array of layer IDs
 */
function extractLayerIDs(json) {
  var p = new Promise((resolve, reject) => {
    try {
      json = JSON.parse(json);
      resolve(json.layers.map(item => item.id));
    } catch (e) {
      reject(e);
    }
  });
  return p;
}

function main() {
  var data = '';
  MAP_SERVICES.forEach(service => {
    getLayerIDs(service)
    .then(extractLayerIDs)
    .then(layerIDs => getLayers(service, layerIDs))
    .catch(err => console.error(err));
    // .then(console.log('Done!'));
  });
}

main();
