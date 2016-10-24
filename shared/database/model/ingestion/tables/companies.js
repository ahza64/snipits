module.exports = function(sequelize, DataTypes) {
  var Companies = sequelize.define('companies', {
    name: { type: DataTypes.STRING }
  }, {
    classMethods: {
      associate: function(models) {
        Companies.hasMany(models.users);
      }
    }
  });

  return Companies;
};