#!/bin/env node
/**
* @overview This tool creates xsd from pg&e documentation for use in verfiying xml output.
*
* node vmd_export/xsdgen.js  vmd_export/src-docs/work-requests.txt
*
*/
// var utils = require('../tool/util');
var BPromise = require('bluebird');
var fs = require("fs");
var readFile = BPromise.promisify(fs.readFile);
var writeFile = BPromise.promisify(fs.writeFile);

require("../lib/starts_with");
var swig  = require('swig');
var assert = require("assert");
var _ = require("underscore");
var path = require("path");

/**
 * @param input  location of the document to translate to an xsd
 * @param output location of xsd document to create
 */
function *run(input, output) {
  var file = yield readFile(input);

  var lines = file.toString().split('\n');
  var hiearchy = buildHiearchy(lines);
  var definitions = buildDefinitions(lines);
  
  console.log("Found Definitions", _.keys(definitions));
  
  var xsd = generate(hiearchy, definitions);
  xsd = swig.renderFile('vmd_export/templates/xmlschema.xsd.tmpl', {subdoc: xsd})+"\n";
  if(!output.endsWith('.xsd')) {
    var base = path.basename(input);
    if(base.endsWith('.txt')) {
      base = base.substring(0, base.length-4)+".xsd";
    }
    output+="/"+base;
  }
  writeFile(output,xsd);
}

/**
 *  Adds a tab to each line in the string
 */
function addTab(doc) {
  var lines = doc.split('\n');
  lines = _.map(lines, function(line) { 
    return '\t'+line;
  });
  return lines.join('\n');  
}

/**
 *  Generates xsd based on hiearchy and definitions
 */
function generate(hiearchy, definitions, tabs) {
  tabs = tabs || 0;
  var subdocs = "";
  var doc;
  _.each(hiearchy.children, function(node){
    subdocs += generate(node, definitions, tabs+1);
  });
  if(tabs > 0) {
    subdocs = addTab(subdocs);
  }
  if(hiearchy.name) {
    console.log("Generating: ", hiearchy.name);
    doc = definitions[hiearchy.name];
    doc.subdoc+=subdocs;
    doc = swig.renderFile('vmd_export/templates/complex.xsd.tmpl', doc)+"\n";
  } else {
    doc = subdocs;
  } 
  return doc;
}

/**
 *  Count the tabs at the begining of line
 */  
function countTabs(line) {
  for(var i = 0; i < line.length; i++) {
    if(line[i] !== '\t') {
      break;
    }
  }
  return i;
}

/**
 *  
 */  
function buildHiearchy(lines){
  var hiearchy = {children: []};
  var cur_tabs = 0;
  var last_read = null;
  var parent = hiearchy;
  
  for(var i = 0; i < lines.length; i++){
    var line = lines[i];
    var tabs = countTabs(line);
    line = line.trim();
    var parts = line.trim().split(/\s+/);    
    var name = parts[0];
    name = name.substring(1, name.length-1);
    if(line.startsWith("<")) {
      if(tabs > cur_tabs) {
        assert(tabs === cur_tabs+1);
        parent = last_read;
      } else if(tabs < cur_tabs) {
        for(var j = 0; j < tabs-cur_tabs; j++) {
          parent = parent.parent;
        }      
      } 
      last_read = {name: name, parent: parent, children: []};
      parent.children.push(last_read);
      cur_tabs = tabs;
    }
      
    if(line === "Object Definitions:"){
      //End Building Hiearchy
      break;
    }
  }  
  return hiearchy;
}

function buildDefinitions(lines) {
  var starts_def = false;
  var defining = null;
  var definitions = {};
  for(var i = 0; i < lines.length; i++){
    var line = lines[i];
    line = line.trim();
    if(line === "Object Definitions:"){
      starts_def = true;
    }
    if(starts_def) {
      if(line.startsWith("<")) {
        if(defining) {        
          if(line.startsWith("</")) {                    
            definitions[defining.name] = defining;
            defining = null;
          } else {
            defining.subdoc += addToDefinition(lines[i]);
          }
        } else {
          defining = startDefinition(lines[i]);
        }
      } 
    }      
  }
  return definitions;
}

function startDefinition(line) {
  var parts = line.trim().split(/\s+/);    
  return {line: line, name: parts[0].substring(1, parts[0].length-1), subdoc: ""};
}

function addToDefinition(line) {
  var parts = line.trim().split(/\s+/);    
  var name = parts[0];
  var type = parts[1];
  
  var doc = {};
  var regex = /\s*(.*)\(([^()]+)\)/;    
  var results;
  
  doc.line = line.trim();  
  doc.name = name.substring(1, name.length-1);
  type = type.replace("*", "");
  if(type.startsWith("numeric")) {
    //parse numeric(7, 2)
    type+=parts[2];
    results = type.match(regex);      
    type =  results[1];
    results = results[2].split(",");
    doc.total = Number(results[0].trim());
    doc.fraction = Number(results[1].trim());
  }else if(type.startsWith("char") || type.startsWith("varchar")) {
    results = type.match(regex);
    type =  results[1];
    doc.length = Number(results[2]);
  }
  doc = swig.renderFile('vmd_export/templates/'+type+'.xsd.tmpl', doc)+"\n";
  return doc;
}



if (require.main === module) {
  var baker = require('../tool/baker.js');
  baker.command(run, {default: true});
  baker.run();  
}