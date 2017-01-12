// Components
import Companies from '../../../src/components/companies/companies';
import CreateCompanyDialog from '../../../src/components/companies/create';
import Projects from '../../../src/components/projects/projects';
import CreateProjectDialog from '../../../src/components/projects/dialogs/create';
import Configurations from '../../../src/components/configs/configs';
import EditConfigDialog from '../../../src/components/configs/dialogs/edit';
import DeleteConfigDialog from '../../../src/components/configs/dialogs/delete';
import IngestLib from '../../../src/components/ingest/ingestLib';

import authRedux from '../../../src/reduxes/auth';

// Mocks
const database = require('./database');
const companiesAPI = require('./api/companies');
const projectsAPI = require('./api/projects');
const configsAPI = require('./api/configs');
const watchersAPI = require('./api/watchers');
const ingestionsAPI = require('./api/ingestions');
const historiesAPI = require('./api/histories');

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

  // Replace fetchCompanies method from Configurations
  Configurations.prototype.fetchCompanies = function() {
    var companies = database.data.companies;
    this.setState({
      companies: companies,
      companyId: companies[0].id,
      companyName: companies[0].name
    });
    this.fetchProjects(companies[0].id);
  };

  // Replace fetchProjects method from Configurations
  Configurations.prototype.fetchProjects = function(companyId) {
    var projects = projectsAPI.getProjects(companyId);
    var firstProject = (projects.length > 0) ? projects[0] : null;
    this.setState({
      projects: projects,
      projectId: firstProject ? firstProject.id : null,
      projectName: firstProject ? firstProject.name : null
    });
    if (firstProject) {
      this.fetchConfigs(firstProject.id);
    } else {
      this.setState({
        configs: []
      });
    }
  };

  // Replace fetchConfigs method from Configurations
  Configurations.prototype.fetchConfigs = function(projectId) {
    var configs = configsAPI.getConfigs(projectId);
    this.setState({
      configs: configs
    });
  };

  // Replace handleChangeConfig method from Configurations
  Configurations.prototype.handleChangeConfig = function() {
    var configId = this.state.configSelected.id;
    var watchers = watchersAPI.getWatchers(configId);
    this.setState({
      showEditConfigDialog: true,
      watchers: watchers
    });
  };

  // Replace handleSubmit method from EditConfigDialog
  EditConfigDialog.prototype.handleSubmit = function(event) {
    var config = {
      id: this.state.configId,
      fileType: this.state.configType,
      description: this.state.configDescription,
      status: this.state.configStatus,
      companyId: this.props.companyId,
      workProjectId: this.props.projectId,
      watchers: this.state.emailsListChanged ? this.state.emails : null
    };

    if (configsAPI.saveConfig(config)) {
      this.props.onClose(true);
    } else {
      this.setState({
        configTypeError: 'Configuration Type Already Exists'
      });
    }
  };

  // Replace handleSubmit method from DeleteConfigDialog
  DeleteConfigDialog.prototype.handleSubmit = function(event) {
    let configId = this.props.configId;
    configsAPI.deleteConfig(configId);
    this.props.onClose(true);
  };

  // Replace getIngestions method from IngestLib
  IngestLib.prototype.getIngestions = function(callback) {
    let companyId = authRedux.getState().companyId;
    var ingestions = ingestionsAPI.getIngestions(companyId);
    callback({ body: ingestions });
  };

  // Replace setField method from IngestLib
  IngestLib.prototype.setField = function(data, callback) {
    ingestionsAPI.updateIngestion(data);
    callback(data);
  };

  // Replace createIngestedHistory method from IngestLib
  IngestLib.prototype.createIngestedHistory = function(ingestion) {
    historiesAPI.createHistory(ingestion, 'ingest');
  };

};

module.exports = { 'init': init };