const Sequelize = require('sequelize');
const sequelize = require('dsp_database/connections')('postgres');

const SCHEMA = {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: Sequelize.STRING, alloNull: false },
  template: { type: Sequelize.STRING, alloNull: false },
  created: { type: Sequelize.DATE, defaultValue: Sequelize.now }
};

const CONFIG = {
  name: {
    singular: 'email_template',
    plural: 'email_templates'
  },
  timestamps: false
};

const EmailTemplate = sequelize.define('email_templates', DEFINITION_OBJECT, CONFIGURATION_OBJECT);

module.exports = TreeHistoryModel;

module.exports.establishRelationships = () => { };
