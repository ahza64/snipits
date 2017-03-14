module.exports = function (sequelize, DataTypes) {
  var qow_expected_taxonomies = sequelize.define('qow_expected_taxonomies', {
    fieldName: { type: DataTypes.STRING },
    fieldValue: { type: DataTypes.STRING },
    parentId: { type: DataTypes.INTEGER },
    companyId: { type: DataTypes.INTEGER },
    workProjectId: { type: DataTypes.INTEGER },
    qowSchemaId: { type: DataTypes.INTEGER }
  }, {
    classMethods: {
      associate: function (models) {
        qow_expected_taxonomies.belongsTo(models.qow_schemas);
      }
    }
  });

  return qow_expected_taxonomies
}
