// Database
const database = require('../database');

var getUsers = function(companyId) {
  var users = database.data.admins.concat(database.data.users);
  users = JSON.parse(JSON.stringify(users));
  for (var i = 0; i < users.length; i++) {
    users[i].index = i;
  }
  return users;
};

var saveUser = function(user) {
  var users = user.role ? database.data.admins : database.data.users;
  if (user.id) {
    users.forEach(function(u) {
      if (u.id === user.id) {
        u.name = user.firstname + ' ' + user.lastname;
        u.email = user.email;
        u.password = user.password || u.password;
        u.status = user.status || u.status;
        u.updatedAt = new Date();
      }
    });
  } else {
    var maxId = 0;
    for(var i = 0; i < users.length; i++) {
      if (users[i].id > maxId) {
        maxId = users[i].id;
      }
    }
    users.push({
      id: maxId + 1,
      name: user.firstname + ' ' + user.lastname,
      email: user.email,
      password: user.password,
      role: user.role,
      status: user.status || 'active',
      companyId: user.companyId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
};

var setActive = function(user, active) {
  var users = user.role ? database.data.admins : database.data.users;
  users.forEach(function(u) {
    if (u.id === user.id) {
      u.status = active ? 'active' : 'inactive';
    }
  });
};

var deleteUser = function(userId, role) {
  if (role) {
    database.data.admins = database.data.admins.filter(function(user) {
      return user.id !== userId;
    });
  } else {
    database.data.users = database.data.users.filter(function(user) {
      return user.id !== userId;
    });
  }
};

module.exports = {
  'getUsers': getUsers,
  'saveUser': saveUser,
  'setActive': setActive,
  'deleteUser': deleteUser
};