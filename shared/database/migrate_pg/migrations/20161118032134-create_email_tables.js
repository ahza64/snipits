'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    var p = [];
    p.push(queryInterface.createTable(
      'email_templates', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        template_name: { type: Sequelize.STRING, allowNull: false },
        subject: { type: Sequelize.STRING, allowNull: false },
        body_type: { type: Sequelize.STRING, allowNull: false },
        body: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.now },
        createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.now }  
    },{
      schema: 'public',                      // default: public, PostgreSQL only.
      hooks: {
        beforeCreate: function (row, options, fn) {
          row.createdAt = new Date();
          row.updatedAt = new Date();
          fn(null, row);
        },
        beforeUpdate: function (row, options, fn) {
          row.updatedAt = new Date();
          fn(null, row);
        }
      }
    }));
    p.push(queryInterface.createTable(
      'email_distribution_lists', {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        list_name: { type: Sequelize.STRING, allowNull: false },
        name: { type: Sequelize.STRING, allowNull: false },
        email: { type: Sequelize.STRING, allowNull: false },
        updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.now },
        createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.now }    
    },{
      schema: 'public',                      // default: public, PostgreSQL only.
      hooks: {
        beforeCreate: function (row, options, fn) {
          row.createdAt = new Date();
          row.updatedAt = new Date();
          fn(null, row);
        },
        beforeUpdate: function (row, options, fn) {
          row.updatedAt = new Date();
          fn(null, row);
        }
      }
    }));
    return Promise.all(p);
  },
  down: function (queryInterface) {
    var p = [];
    p.push(queryInterface.dropTable('email_templates'));
    p.push(queryInterface.dropTable('email_distribution_lists'));
    return Promise.all(p);
  }
};
