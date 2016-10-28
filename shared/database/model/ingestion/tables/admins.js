module.exports = function(sequelize, DataTypes) {
  var Admins = sequelize.define('admins', {
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING }
  }, {
    classMethods: {
      associate: function(models) {
        Admins.belongsTo(models.companies);
      }
    }
  });

  return Admins;
};