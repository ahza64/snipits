module.exports = function(sequelize, DataTypes){
  var qow_schemas = sequelize.define('qow_schemas',{
    name: { type: DataTypes.STRING },
    version: { type : DataTypes.INTEGER },
    status: {type: DataTypes.BOOLEAN }
  }, {
    classMethods: {
      associate: function (models) {
        qow_schemas.belongsTo(models.work_projects);
      }
    }
  });

  return qow_schemas;
}
