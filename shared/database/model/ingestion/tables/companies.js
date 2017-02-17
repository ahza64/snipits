module.exports = function(sequelize, DataTypes) {
  var Companies = sequelize.define('companies', {
    name: { type: DataTypes.STRING }
  }, {
    classMethods: {
      associate: function(models) {
        Companies.hasMany(models.users);
        Companies.hasMany(models.work_projects);
        Companies.hasMany(models.dispatchr_admins);
        Companies.hasMany(models.ingestion_configurations);
        Companies.hasMany(models.ingestion_files);
        Companies.hasMany(models.ingestion_watchers);
        Companies.hasMany(models.ingestion_histories);
      }
    }
  });
//get by qowID remove set status
// add datasource
// keep versions updated
  return Companies;
};
