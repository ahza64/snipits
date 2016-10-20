module.exports = function(sequelize, DataTypes) {
  var Users = sequelize.define('users', {
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING }
  }, {
    classMethods: {
      associate: function(models) {
        Users.belongsTo(models.companies);
      }
    }
  });

  return Users;
};