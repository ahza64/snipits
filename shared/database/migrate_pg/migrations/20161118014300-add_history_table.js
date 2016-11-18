'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.createTable('histories',{
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        action_value: { type: Sequelize.JSON, allowNull: false },
        object_type: { type: Sequelize.STRING, allowNull: false },
        object_id: { type: Sequelize.STRING, allowNull: false },
        performer_id: { type: Sequelize.STRING },
        performer_type: { type: Sequelize.STRING },
        request_created: { type: Sequelize.DATE },
        source: {type: Sequelize.STRING },
        created: { type: Sequelize.DATE, defaultValue: Sequelize.now }
      },{
        schema: 'public'                      // default: public, PostgreSQL only.
      }
    );
  },

  down: function (queryInterface) {
    return queryInterface.dropTable('histories');
  }
};
