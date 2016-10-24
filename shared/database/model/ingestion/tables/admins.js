module.exports = function(sequelize, DataTypes) {
  var Admins = sequelize.define('admins', {
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING }
  });

  return Admins;
};