let date = new Date();

let users = [
  {
    id: 1,
    name: 'User 1',
    email: 'user1@mail.com',
    password: 'pwd',
    status: 'active',
    createdAt: date,
    updatedAt: date,
    companyId: 1
  },
  {
    id: 2,
    name: 'User 2',
    email: 'user2@mail.com',
    password: 'pwd',
    status: 'inactive',
    createdAt: date,
    updatedAt: date,
    companyId: 2
  },
];

module.exports = users;