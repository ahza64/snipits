module.exports = function(sequelize, DataTypes){
  var qow_fields = sequelize.define('schema_fields', {
    name: { type: DataTypes.STRING },
    required: { type: DataTypes.BOOLEAN},
    qowSchemaId: { type: DataTypes.INTEGER},
    version: { type: DataTypes.INTEGER},
    type: { type : DataTypes.STRING },
    status: {type: DataTypes.BOOLEAN }
  }, {
    classMethods: {
      associate: function (models) {
        qow_fields.belongsTo(models.schemas);
      }
    }
  });
  return qow_fields;
}
