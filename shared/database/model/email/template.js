const Sequelize = require('sequelize');
const sequelize = require('dsp_database/connections')('postgres');

const SCHEMA = {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  template_name: { type: Sequelize.STRING, allowNull: false },
  subject: { type: Sequelize.STRING, allowNull: false },
  body_type: { type: Sequelize.STRING, allowNull: false },
  body: { type: Sequelize.STRING, allowNull: false },
  updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.now },
  createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.now }  
};

const CONFIG = {
  name: {
    singular: 'email_template',
    plural: 'email_templates'
  },
  timestamps: true
};

const EmailTemplate = sequelize.define('email_templates', SCHEMA, CONFIG);

module.exports = EmailTemplate;
