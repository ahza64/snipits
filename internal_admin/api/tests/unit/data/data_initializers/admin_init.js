const Admin = require('dsp_shared/database/model/ingestion/tables').dispatchr_admins;
const admin = require('../login/admin');

before(function(done) {
Admin.create(admin).then(() => {
    done();
  });
});
after(function (done) {
  Admin.destroy({where: { email: admin.email }}).then(function() {
    done();
  });
});
