module.exports = function(sequelize, DataTypes){
  var qow_fields = sequelize.define('qow_fields',{
    name: { type: DataTypes.STRING },
    required: { type: DataTypes.BOOLEAN},
    version: { type: DataTypes.INTEGER},
    type: { type : DataTypes.STRING }
  }, {
    classMethods: {
      associate: function (models) {
        qow_fields.belongsTo(models.qow_schemas);
      }
    }
  });
  return qow_fields;
}
