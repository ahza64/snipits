module.exports = function(sequelize, DataTypes) {
  var Ingestions = sequelize.define('ingestions', {
    fileName: { type: DataTypes.STRING },
    notified: { type: DataTypes.BOOLEAN },
    ingested: { type: DataTypes.BOOLEAN },
    ingestEmail: { type: DataTypes.STRING }
  }, {
    classMethods: {
      associate: function(models) {
        Ingestions.belongsTo(models.companies);
      }
    }
  });

  return Ingestions;
};