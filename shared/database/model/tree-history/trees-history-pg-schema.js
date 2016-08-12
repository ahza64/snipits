const Sequelize = require('sequelize');
const sequelize = require('dsp_database/connections')('postgres');

const DEFINITION_OBJECT = {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  action_value: { type: Sequelize.JSON, alloNull: false },
  object_type: { type: Sequelize.STRING, alloNull: false },
  object_id: { type: Sequelize.STRING, alloNull: false },
  performer_id: { type: Sequelize.STRING },
  performer_type: { type: Sequelize.STRING },
  request_created: { type: Sequelize.DATE },
  created: { type: Sequelize.DATE, defaultValue: Sequelize.now }
};

const CONFIGURATION_OBJECT = {
  name: {
    singular: 'history',
    plural: 'histories'
  },
  timestamps: false
};

const TreeHistoryModel = sequelize.define('histories', DEFINITION_OBJECT, CONFIGURATION_OBJECT);

module.exports = TreeHistoryModel;

module.exports.establishRelationships = () => { };
