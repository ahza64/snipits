const bcrypt = require('bcrypt-nodejs');

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
        Admins.hasMany(models.histories);
      }
    },
    instanceMethods: {
      generateHash: function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
      },
      validPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
      },
    }
  });

  return Admins;
};