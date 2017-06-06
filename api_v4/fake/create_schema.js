/**
 * @fileOverview This script will generate fake data using api v4
 * Create a schema
 */

require('dsp_shared/config/config').get({ log4js: false });

const util = require('dsp_shared/lib/cmd_utils');
const treesSchema = require('./schemas/trees.json');
const fltreesSchema = require('./schemas/fltrees.json');
const cufsSchema = require('./schemas/cufs.json');
const projectsSchema = require('./schemas/projects.json');
const sossSchema = require('./schemas/soss.json');

util.connect([]);
const Schema = require('dsp_shared/database/model/schema');

const schemas = {
  trees: treesSchema,
  fltrees: fltreesSchema,
  cufs: cufsSchema,
  projects: projectsSchema,
  soss: sossSchema
};

const default_schema_model = {
  companyId: {
    type: 'Number',
    required: false,
    editable: false,
    visible: false
  },
  company: {
    type: 'String',
    required: true,
    editable: true,
    visible: true
  },
  name: {
    type: 'String',
    required: true,
    editable: true,
    visible: true
  },
  type: {
    type: 'String',
    required: true,
    editable: true,
    visible: true
  },
  count: {
    type: 'Number',
    required: true,
    editable: true,
    visible: true
  },
  time: 'Date',
  price: 'Number',
  location: {
    type: 'GeoJSON',
    required: true,
    editable: false,
    visible: false
  }
};

const schemaConfig = {
  test: {
    filters: {
      companyId: 'companyId'
    }
  },
  non_strict: {
    strict: false
  }
};

function prepareAttributes(attrs) {
  const defaultAttrs = {
    required: false,
    editable: false,
    visible: true
  };
  let prepared = null;
  if (typeof attrs === 'string') {
    prepared = Object.assign(defaultAttrs, { type: attrs });
  } else {
    prepared = Object.assign(defaultAttrs, attrs);
  }
  return prepared;
}

function urlToConfig(url) {
  let config = null;
  if (typeof url === 'string') {
    const re = /(http|https):\/\/([^:^/]+):(\d+)\/(.*)/i;
    const params = url.match(re);
    if (params) {
      config = {
        protocol: params[1],
        host: params[2],
        port: params[3],
        route: params[4],
        dataField: 'data',
        user: 'user',
        password: '123'
      };
    }
  }
  return config;
}

function *create_schema(schema_name, storage_name, config_name) {
  console.log(`Calling create_schema for ${schema_name}`);
  if (Schema.create) {
    const schemaModel = schemas[schema_name] || default_schema_model;
    const model = {};
    Object.keys(schemaModel).forEach((field) => {
      const type = prepareAttributes(schemaModel[field]);
      model[field] = type;
    });
    let config = null;
    if (storage_name === 'crud') {
      const url = config_name;
      config = urlToConfig(url);
    } else if (config_name && schemaConfig[config_name]) {
      config = schemaConfig[config_name];
    }
    yield Schema.create(schema_name, '0.0.1', 'v4', model, storage_name, config);
    setTimeout(() => {
      Schema.closeConnections();
    }, 2000);
  }
}

if (require.main === module) {
  util.bakerGen(create_schema);
  util.bakerRun();
}
