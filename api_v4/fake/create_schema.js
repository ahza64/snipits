/**
 * @fileOverview This script will generate fake data using api v4
 * Create a schema
 */

const config = require('dsp_shared/config/config').get({log4js:false});
const util = require('dsp_shared/lib/cmd_utils');
util.connect([]);
const Schema = require('dsp_shared/database/model/schema');

const schema_model = {
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

function *create_schema(schema_name, storage_name, config_name) {
  console.log(`Calling create_schema for ${schema_name}`);
  if (Schema.create) {
    const model = {};
    Object.keys(schema_model).forEach((field) => {
      const type = prepareAttributes(schema_model[field]);
      model[field] = type;
    });
    yield Schema.create(schema_name, '0.0.1', 'v4', model, storage_name, schemaConfig[config_name]);
    setTimeout(() => {
      Schema.closeConnections();
    }, 2000);
  }
}

if (require.main === module) {
  util.bakerGen(create_schema);
  util.bakerRun();
}
