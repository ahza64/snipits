// Components
import Companies from '../../../src/components/companies/companies';
import CreateCompanyDialog from '../../../src/components/companies/create';
import Projects from '../../../src/components/projects/projects';
import CreateProjectDialog from '../../../src/components/projects/dialogs/create';

// Mocks
const database = require('./database');
const companiesAPI = require('./api/companies');
const projectsAPI = require('./api/projects');

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

  // Replace fetchCompanies method from Projects
  Projects.prototype.fetchCompanies = function() {
    var companies = database.data.companies;
    this.setState({
      companies: companies,
      companyId: companies[0].id,
      companyName: companies[0].name
    });
    this.fetchProjects(companies[0].id);
  };

  // Replace fetchProjects method from Projects
  Projects.prototype.fetchProjects = function(companyId) {
    var projects = projectsAPI.getProjects(companyId);
    this.setState({
      projects: projects
    });
  };

  // Replace handleSubmit method from CreateProjectDialog
  CreateProjectDialog.prototype.handleSubmit = function(event) {
    var projectName = this.state.projectName;
    var companyId = this.props.companyId;
    projectsAPI.createProject(projectName, companyId);
    this.props.onClose(true);
  };
};

module.exports = { 'init': init };