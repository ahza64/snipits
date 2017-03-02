let date = new Date();

let configs = [
  {
    id: 1,
    fileType: 'states',
    description: 'polygons',
    status: 'active',
    createdAt: date,
    companyId: 1,
    workProjectId: 2
  },
  {
    id: 2,
    fileType: 'counties',
    description: 'polylines',
    status: 'inactive',
    createdAt: date,
    companyId: 1,
    workProjectId: 2
  },
  {
    id: 3,
    fileType: 'cities',
    description: 'points',
    status: 'active',
    createdAt: date,
    companyId: 1,
    workProjectId: 2
  },
  {
    id: 4,
    fileType: 'rivers',
    description: 'lines',
    status: 'active',
    createdAt: date,
    companyId: 2,
    workProjectId: 3
  },
];

module.exports = configs;