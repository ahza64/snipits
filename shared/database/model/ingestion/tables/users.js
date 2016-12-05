const bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
  var Users = sequelize.define('users', {
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING }
  }, {
    classMethods: {
      associate: function(models) {
        Users.belongsTo(models.companies);
        Users.hasMany(models.ingestion_histories);
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

  return Users;
};
