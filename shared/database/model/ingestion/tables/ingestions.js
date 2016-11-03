module.exports = function(sequelize, DataTypes) {
  var Ingestions = sequelize.define('ingestions', {
    fileName: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    ingested: { type: DataTypes.BOOLEAN }
  }, {
    classMethods: {
      associate: function(models) {
        Ingestions.belongsTo(models.companies);
        Ingestions.hasMany(models.watchers);
      }
    }
  });

  return Ingestions;
};