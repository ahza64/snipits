const company = require('../company/company');


module.exports = {
  id: 11,
  name: 'Test User',
  email: 'test@test.co',
  password: '$2a$08$rZZw4Pg/cr2JTCL9g0Z1gO.XfIYcVJfAxtXr3PTGNaN1TMC10A/bu',
  status: 'active',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  companyId: company.id
}
