let date = new Date();

let histories = [
  {
    id: 1,
    customerFileName: 'input1.txt',
    action: 'upload',
    createdAt: date,
    companyId: 1,
    ingestionConfigurationId: 1,
    ingestionFileId: 1,
    userId: 1,
    userName: 'User 1',
    dispatchrAdminId: null,
    adminName: null
  },
  {
    id: 2,
    customerFileName: 'input1.txt',
    action: 'ingest',
    createdAt: date,
    companyId: 1,
    ingestionConfigurationId: 1,
    ingestionFileId: 1,
    userId: null,
    userName: null,
    dispatchrAdminId: 2,
    adminName: 'Ingestor 1'
  },
  {
    id: 3,
    customerFileName: 'output1.txt',
    action: 'upload',
    createdAt: date,
    companyId: 2,
    ingestionConfigurationId: 4,
    ingestionFileId: 3,
    userId: 2,
    userName: 'User 2',
    dispatchrAdminId: null,
    adminName: null
  },
  {
    id: 4,
    customerFileName: 'output1.txt',
    action: 'ingest',
    createdAt: date,
    companyId: 2,
    ingestionConfigurationId: 4,
    ingestionFileId: 3,
    userId: null,
    userName: null,
    dispatchrAdminId: 3,
    adminName: 'Ingestor 2'
  }
];

module.exports = histories;