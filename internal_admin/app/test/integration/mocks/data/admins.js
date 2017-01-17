let date = new Date();

let admins = [
  {
    id: 1,
    name: 'Main Admin',
    email: 'admin@mail.com',
    password: 'pwd',
    status: 'active',
    role: 'DA',
    createdAt: date,
    updatedAt: date,
    companyId: null
  },
  {
    id: 2,
    name: 'Ingestor 1',
    email: 'ingestor1@mail.com',
    password: 'pwd',
    status: 'active',
    role: 'DI',
    createdAt: date,
    updatedAt: date,
    companyId: 1
  },
  {
    id: 3,
    name: 'Ingestor 2',
    email: 'ingestor2@mail.com',
    password: 'pwd',
    status: 'active',
    role: 'DI',
    createdAt: date,
    updatedAt: date,
    companyId: 2
  },
];

module.exports = admins;