'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    var p = [];
    p.push(queryInterface.createTable(
      'admins', {
      name: { type: Sequelize.STRING },
      email: { type: Sequelize.STRING },
      password: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING },
      role: { type: Sequelize.STRING }
    },{
      schema: 'public'                      // default: public, PostgreSQL only.
    }));
    p.push(queryInterface.createTable(
      'companies', {
          name: { type: Sequelize.STRING }
      },{
      schema: 'public'                      // default: public, PostgreSQL only.
    }));
    p.push(queryInterface.createTable(
      'histories', {
      fileName: { type: Sequelize.STRING },
      action: { type: Sequelize.STRING },
      time: { type: Sequelize.DATE }
    },{
      schema: 'public'                      // default: public, PostgreSQL only.
    }));
    p.push(queryInterface.createTable(
      'ingest_histories', {
          fileName: { type: Sequelize.STRING },
          description: { type: Sequelize.STRING },
          ingested: { type: Sequelize.BOOLEAN }
      },{
        schema: 'public'                      // default: public, PostgreSQL only.
      }));
    p.push(queryInterface.createTable(
      'users', {
          name: { type: Sequelize.STRING },
          email: { type: Sequelize.STRING },
          password: { type: Sequelize.STRING },
          status: { type: Sequelize.STRING },
          deleted: { type: Sequelize.BOOLEAN },
          deletedAt: { type: Sequelize.TIME }
    },{
      schema: 'public'                      // default: public, PostgreSQL only.
    }));
    p.push(queryInterface.createTable(
      'watchers', {
          watchEmail: { type: Sequelize.STRING }
        },{
      schema: 'public'                      // default: public, PostgreSQL only.
    }));
    return Promise.all(p);
  },
  down: function (queryInterface) {
    var p = [];
    p.push(queryInterface.dropTable('admins'));
    p.push(queryInterface.dropTable('companies'));
    p.push(queryInterface.dropTable('ingest_histories'));
    p.push(queryInterface.dropTable('ingestions'));
    p.push(queryInterface.dropTable('users'));
    p.push(queryInterface.dropTable('watchers'));
    return Promise.all(p);
  }
};
