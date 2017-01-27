module.exports = function(sequelize, DataTypes) {
  var Histories = sequelize.define('ingestion_histories', {
    customerFileName: { type: DataTypes.STRING },
    s3FileName: ingestion.s3FileName,
    userName: { type: DataTypes.STRING },
    adminName: { type: DataTypes.STRING },
    action: { type: DataTypes.STRING }
  }, {
    classMethods: {
      associate: function(models) {
        Histories.belongsTo(models.companies);
        Histories.belongsTo(models.ingestion_configurations);
        Histories.belongsTo(models.ingestion_files);
        Histories.belongsTo(models.users);
        Histories.belongsTo(models.dispatchr_admins);
      }
    }
  });

  return Histories;
};
