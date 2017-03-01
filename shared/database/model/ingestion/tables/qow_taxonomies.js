
module.exports = function (sequelize, DataTypes) {
  var qow_taxonomies = sequelize.define('qow_taxonomies', {
    fieldName: { type: DataTypes.STRING },
    order: { type: DataTypes.INTEGER },
    nodeType: { type: DataTypes.STRING },
    keys: { type: DataTypes.STRING }
  }, {
    classMethods: {
      associate: function (models) {
        qow_taxonomies.belongsTo(models.qow_schemas);
      }
    }
  });

  return qow_taxonomies
}
