// Components
import Companies from '../../../src/components/companies/companies';
import CreateCompanyDialog from '../../../src/components/companies/create';

// Mocks
const database = require('./database');
const companiesAPI = require('./api/companies');

var init = function() {
  // Replace fetchCompanies method from Companies
  Companies.prototype.fetchCompanies = function() {
    this.setState({ companies: database.data.companies });
  };

  // Replace handleSubmit method from CreateCompanyDialog
  CreateCompanyDialog.prototype.handleSubmit = function(event) {
    companiesAPI.createCompany(this.state.companyName);
    this.props.onClose(true);
  };
};

module.exports = { 'init': init };