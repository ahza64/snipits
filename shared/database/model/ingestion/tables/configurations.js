module.exports = function(sequelize, DataTypes) {
  var Configurations = sequelize.define('ingestion_configurations', {
    fileType: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING }
  }, {
    classMethods: {
      associate: function(models) {
        Configurations.belongsTo(models.companies);
        Configurations.belongsTo(models.work_projects);
        Configurations.hasMany(models.ingestion_files);
        Configurations.hasMany(models.ingestion_watchers);
        Configurations.hasMany(models.ingestion_histories);
      }
    }
  });

  return Configurations;
};
