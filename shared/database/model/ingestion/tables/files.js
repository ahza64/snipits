module.exports = function(sequelize, DataTypes) {
  var Files = sequelize.define('ingestion_files', {
    customerFileName: { type: DataTypes.STRING },
    s3FileName: { type: DataTypes.STRING },
    ingested: { type: DataTypes.BOOLEAN },
    description: { type: DataTypes.STRING }
  }, {
    classMethods: {
      associate: function(models) {
        Files.belongsTo(models.companies);
        Files.belongsTo(models.ingestion_configurations);
        Files.hasMany(models.ingestion_histories);
      }
    }
  });

  return Files;
};
