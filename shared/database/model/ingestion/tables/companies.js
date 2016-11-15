module.exports = function(sequelize, DataTypes) {
  var Companies = sequelize.define('companies', {
    name: { type: DataTypes.STRING }
  }, {
    classMethods: {
      associate: function(models) {
        Companies.hasMany(models.users);
        Companies.hasMany(models.admins);
        Companies.hasMany(models.ingestions);
        Companies.hasMany(models.watchers);
      }
    }
  });

  return Companies;
};