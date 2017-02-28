
module.exports = function (sequelize, DataTypes) {
  var qow_taxonomies = sequelize.define('qow_taxonomies', {
    field_name: { type: DataTypes.STRING },
    order: { type: DataTypes.INTEGER },
    node_type: { type: DataTypes.STRING },
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
