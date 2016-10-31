module.exports = function(sequelize, DataTypes) {
  var Histories = sequelize.define('histories', {
    fileName: { type: DataTypes.STRING },
    action: { type: DataTypes.STRING },
    time: { type: DataTypes.DATE }
  }, {
    classMethods: {
      associate: function(models) {
        Histories.belongsTo(models.users, {
          as: 'user'
        });
        Histories.belongsTo(models.admins, {
          as: 'admin'
        });
      }
    }
  });

  return Histories;
};