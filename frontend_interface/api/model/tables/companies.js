module.exports = function(sequelize, DataTypes) {
  var Companies = sequelize.define('companies', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Companies.hasMany(models.users);
      }
    }
  });

  return Companies;
};