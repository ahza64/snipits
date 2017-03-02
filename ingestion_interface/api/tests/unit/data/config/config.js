
const company = require('../company/company');
const project = require('../project/project');

const config = {
  "id": 33,
  "fileType": "admin",
  "description": "123",
  "status": "active",
  "createdAt": Date.now(),
  "updatedAt": Date.now(),
  "companyId": company.id,
  "workProjectId": project.id
};

module.exports = config;
