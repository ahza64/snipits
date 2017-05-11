module.exports = function(sequelize, DataTypes) {
  var Projects = sequelize.define('work_projects', {
    name: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING }
  }, {
    classMethods: {
      associate: function(models) {
        Projects.belongsTo(models.companies);
        Projects.hasMany(models.ingestion_configurations);
        Projects.hasMany(models.schemas);
      }
    }
  });

  return Projects;
};
