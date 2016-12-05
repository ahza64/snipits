module.exports = function(sequelize, DataTypes) {
  var Watchers = sequelize.define('ingestion_watchers', {
    email: { type: DataTypes.STRING }
  }, {
    classMethods: {
      associate: function(models) {
        Watchers.belongsTo(models.companies);
        Watchers.belongsTo(models.ingestion_configurations);
      }
    }
  });

  return Watchers;
};
