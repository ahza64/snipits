const Sequelize = require('sequelize');
const sequelize = require('dsp_database/connections')('postgres');

const SCHEMA = {
  id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
  list_name: { type: Sequelize.STRING, allowNull: false },
  name: { type: Sequelize.STRING, allowNull: false },
  email: { type: Sequelize.STRING, allowNull: false },
  updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.now },
  createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.now }    
};

const CONFIG = {
  name: {
    singular: 'email_distribution_list',
    plural: 'email_distribution_list'
  },
  timestamps: true
};

const DistributionList = sequelize.define('email_distribution_lists', SCHEMA, CONFIG);

module.exports = DistributionList;
