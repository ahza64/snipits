let date = new Date();

let ingestions = [
  {
    id: 1,
    customerFileName: 'input1.txt',
    s3FileName: 'c1_p2_states_1482817762821',
    ingested: true,
    description: 'input #1',
    createdAt: date,
    companyId: 1,
    ingestionConfigurationId: 1
  },
  {
    id: 2,
    customerFileName: 'input2.txt',
    s3FileName: 'c1_p2_states_1482217762512',
    ingested: false,
    description: 'input #2',
    createdAt: date,
    companyId: 1,
    ingestionConfigurationId: 1
  },
  {
    id: 3,
    customerFileName: 'output1.txt',
    s3FileName: 'c2_p3_rivers_1482217761232',
    ingested: true,
    description: 'output #1',
    createdAt: date,
    companyId: 2,
    ingestionConfigurationId: 4
  }
];

module.exports = ingestions;