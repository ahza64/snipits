/**
 * @overview  the file adds an admin to the database that
 * any test might rely on
 * @param {Object} done - marks end of block
 */
const Company = require('dsp_shared/database/model/ingestion/tables').companies;
const company = require('../company/company');

before(function(done) {
  Company.create(company).then(() => {
    done()
  });
});
after(function (done) {
  Company.destroy({where: { id: company.id }}).then(function() {
    done();
  });
});
