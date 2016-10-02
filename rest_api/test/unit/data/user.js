module.exports = {
  // The way to extract cookie
  /*cookie = res.header['set-cookie'].map(function(r) {
    return r.replace('; path=/; httponly', '');
  }).join('; ');*/
  cookie: 'dispatchr:sess=eyJwYXNzcG9ydCI6eyJ1c2VyIjoiNTdlZ' + 
          'WFkYjc4OTVhYzljNWRjZGZhMWQ3In0sIl9leHBpcmUiOj' +
          'E0NzU0NzAxOTE2ODQsIl9tYXhBZ2UiOjg2NDAwMDAwfQ==; ' + 
          'dispatchr:sess.sig=DP8-Mp0AIv9YPLuB5EMdH66xSOg',
  user: {
    _id: '57eeadb7895ac9c5dcdfa1d7',
    vehicle: '',
    name: 'TEST TEST',
    first: 'TEST',
    last: 'TEST',
    user: '',
    uniq_id: 'TEST@TEST.com',
    project: [],
    work_type: [],
    scuf: 'TESTSCUF@TEST.com',
    phone_number: '2095590879',
    status: 'active',
    company: 'Dispatchr',
    workorder: [
      {
        '_id' : '802d544b6b24407b34a11a6b',
        'uniq_id' : '134035006/041-005/040',
        'span_name' : '006/041-005/040',
        'location' : {
          'type' : 'Point',
          'coordinates' : [
            -122.065787809848,
            37.9027379249197
          ]
        },
        'pge_pmd_num' : '134035',
        'circuit_names': ['TR00111502'],
        'status' : 'assigned',
        'priority' : 'routine',
        'work_type' : 'tree_inspect',
        'name' : '796355',
        'tasks' : [
          '577e334ebbf5a3119891c12b',
          '577e3387bbf5a3119891c239'
        ]
      }
    ],
    password: '$2a$10$blbQY8yKMd3c3SnPzPOBseJORPyjY/i61Wf2avdQHpknRlJ.AfnRu',
    last_sent_at: null
  }
};