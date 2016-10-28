module.exports = function(sequelize, DataTypes) {
  var Watchers = sequelize.define('watchers', {
    watchEmail: { type: DataTypes.STRING }
  }, {
    classMethods: {
      associate: function(models) {
        Watchers.belongsTo(models.companies);
        Watchers.belongsTo(models.ingestions);
      }
    }
  });

  return Watchers;
};