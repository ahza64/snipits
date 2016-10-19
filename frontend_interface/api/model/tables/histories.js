module.exports = function(sequelize, DataTypes) {
  var Histories = sequelize.define('histories', {
    fileName: { type: DataTypes.STRING },
    uploadTime: { type: DataTypes.DATE },
    ingestTime: { type: DataTypes.DATE },
    deleteTime: { type: DataTypes.DATE },
  }, {
    classMethods: {
      associate: function(models) {
        Histories.belongsTo(models.users, {
          as: 'upload'
        });
        Histories.belongsTo(models.users, {
          as: 'ingest'
        });
        Histories.belongsTo(models.users, {
          as: 'delete'
        });
      }
    }
  });

  return Histories;
};