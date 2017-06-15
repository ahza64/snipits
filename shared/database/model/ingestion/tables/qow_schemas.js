module.exports = function(sequelize, DataTypes){
  var qow_schemas = sequelize.define('schemas',{
    name: { type: DataTypes.STRING },
    version: { type : DataTypes.INTEGER },
    newest: {type: DataTypes.BOOLEAN}
  }, {
    classMethods: {
      associate: function (models) {
        qow_schemas.belongsTo(models.work_projects);
      }
    }
  });

  return qow_schemas;
}
