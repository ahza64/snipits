
module.exports = function (sequelize, DataTypes) {
  var qow_taxonomies = sequelize.define('qow_taxonomies', {
    fieldName: { type: DataTypes.STRING },
    order: { type: DataTypes.INTEGER },
    nodeType: { type: DataTypes.STRING },
    keys: { type: DataTypes.STRING },
    companyId: { type: DataTypes.INTEGER },
    workProjectId: { type: DataTypes.INTEGER },
    qowSchemaId: { type: DataTypes.INTEGER }
  }, {
    classMethods: {
      associate: function (models) {
        qow_taxonomies.belongsTo(models.schemas);
      }
    }
  });

  return qow_taxonomies
}
