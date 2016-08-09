'use strict';

/**
 * Outer: map service
 * Inner: feature layer
 */

var https = require('https');
var fs = require('fs');
var lodash = require('lodash');

/**
 * Allow for connecting to a server with a self-signed SSL certificate
 * @type {String}
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const BASE_URL = 'https://esri.dispatchr.co:6443/arcgis/rest/services/TRANSMISSION_2015/';

/**
 * These are deliveries
 * @type {Array}
 */
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

/**
 * A default object that won't cause the entire batch to fail, but also won't
 * factor into the final results.
 *
 * @type {Object}
 */
const DEFAULT_JSON = {
  "fieldAliases": "foo",
  "features": []
};

/**
 * Called when a promise should reject with an error.
 *
 * @param  {Error}      err      The thrown error
 * @param  {Function}   reject   The rejection function
 * @return {Void}
 */
function rejectError(err, reject) {
  console.error(err);
  console.error(err.stack)
  reject(err);
}

/**
 * The main query URL used to get individual trees.
 *
 * @param  {String}   service   The service (delivery) we want
 * @param  {Integer}  layerID   Which layer within the service we want
 * @param  {Integer}  objectID  Used to deal with paged responses
 * @return {String}             A fully-formed query that returns JSON
 */
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

/**
 * Get all the trees within a given layer.
 * Takes care of the paged responses by calling itself recursively.
 *
 * @param  {String}   service   The name of the service(delivery) we want
 * @param  {Integer}  id        The id of the layer within the service we want
 * @param  {Integer}  objectID  (Optional) Used to deal with paged responses.
 * @param  {Array}    trees     (Optional) An array of previously found trees.
 * @return {Array}              All the trees in this given layer
 */
function getLayer(service, id, objectID, trees) {
  var trees = trees || [];
  var objectID = objectID || 1;
  var json = {};
  return getURL(constructQueryUrl(service, id, objectID))
  .then(res => {
    json = res;
    return extractFields(res);
  }).then(fields => {
    trees = trees.concat(fields);
    return getMaxObjectID(json);
  }).then(maxID => {
    if (maxID) {
      return getLayer(service, id, maxID + 1, trees)
    } else {
      return trees;
    }
  });
}

/**
 * Given a service name and the service's layer IDs, grab all of the trees
 *
 * @param  {String}           service   The service name
 * @param  {Array[Integer]}   layerIDs  An array of layer IDs
 * @return {[type]}                     [description]
 */
function getLayers(service, layerIDs) {
  var promises = [];
  var finished = 0;
  var total = layerIDs.length;
  layerIDs.forEach(id => {
    var p = new Promise((resolve, reject) => {
      getLayer(service, id)
      .then(res => {
        finished += 1;
        console.log('Resolved layer ' + finished + '/' + total);
        resolve(res);
      });
    });
    promises.push(p);
  });
  return Promise.all(promises).then(values => {
    return {
      name: service,
      trees: lodash.concat(values)
    };
  });
}

/**
 * Write to disk the trees within a given delivery
 *
 * @param  {Object}   obj   key -> delivery name, val -> trees
 * @return {Void}
 */
function writeOutput(obj) {
  console.log('Writing output');
  var p = new Promise((resolve, reject) => {
    var filename = obj.name + '.json';
    fs.writeFile(filename, JSON.stringify(obj.trees), (err) => {
      if (err) {
        rejectError(err, reject);
      } else {
        resolve();
      }
    });
  });
  return p;
}

/**
 * Get the maximum object ID so we can construct the next query
 *
 * @param  {Object}  json     The json our server returned
 * @return {Integer}          The last objectID we got
 */
function getMaxObjectID(json) {
  var p = new Promise((resolve, reject) => {
    try {
      var max = lodash.max(json.features.map(item => item.attributes.OBJECTID));
      resolve(max);
    } catch (e) {
      rejectError(e, reject);
    }
  });
  return p;
}

/**
 * Given json, extract the fields we're interested in.
 *
 * @param  {Object}   json      The json our server returned
 * @return {Array}              An array of tree properties
 */
function extractFields(json) {
  var data = [];
  var p = new Promise((resolve, reject) => {
    try {
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
    } catch (e) {
      rejectError(e, reject);
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
        res.on('end', () => {
          data = JSON.parse(data);
          // Because the ESRI server doesn't set an HTTP response code that
          // is not >= 400, we need to instead parse the json and inspect it
          // for the 'error' property.
          if (data.error) {
            resolve(DEFAULT_JSON);
          } else {
            resolve(data);
          }
        });
      });
    } catch (e) {
      rejectError(e, reject);
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
 * @param  {Object}         json    What we got from calling getLayerIDs()
 * @return {Array[Integer]}         An array of layer IDs
 */
function extractLayerIDs(json) {
  var p = new Promise((resolve, reject) => {
    try {
      resolve(json.layers.map(item => item.id));
    } catch (e) {
      rejectError(e, reject);
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
    .then(writeOutput)
    .catch(err => console.error(err.stack));
  });
}

main();
