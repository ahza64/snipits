// Components
import Companies from '../../../src/components/companies/companies';
import CreateCompanyDialog from '../../../src/components/companies/create';
import Projects from '../../../src/components/projects/projects';
import CreateProjectDialog from '../../../src/components/projects/dialogs/create';
import Configurations from '../../../src/components/configs/configs';
import EditConfigDialog from '../../../src/components/configs/dialogs/edit';
import DeleteConfigDialog from '../../../src/components/configs/dialogs/delete';
import IngestLib from '../../../src/components/ingest/ingestLib';
import Users from '../../../src/components/users/users';
import EditUserDialog from '../../../src/components/users/dialogs/edit';
import DeleteUserDialog from '../../../src/components/users/dialogs/delete';
import Login from '../../../src/components/login/login';
import Taxonomies from '../../../src/components/taxonomy/taxonomy';

import authRedux from '../../../src/reduxes/auth';

// Mocks
const database = require('./database');
const companiesAPI = require('./api/companies');
const projectsAPI = require('./api/projects');
const configsAPI = require('./api/configs');
const watchersAPI = require('./api/watchers');
const ingestionsAPI = require('./api/ingestions');
const historiesAPI = require('./api/histories');
const usersAPI = require('./api/users');
const taxonomiesAPI = require('./api/taxonomies');

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

  // Replace saveUser method from EditUserDialog
  EditUserDialog.prototype.saveUser = function() {
    var role = this.state.role;
    role = (role !== 'CU') ? role : null;
    var companyId = this.state.companyId;
    var password = this.state.password;
    var userId = this.props.user.id;
    if ((userId) && (password === 'password')) {
      password = null;
    }

    var user = {
      id: userId,
      firstname: this.state.firstName,
      lastname: this.state.lastName,
      email: this.state.email,
      password: password,
      companyId: (role !== 'DA') ? companyId : null,
      role: role
    };

    usersAPI.saveUser(user);
    if (this.props.onClose) {
      this.props.onClose(true);
    }
  };

  // Replace renderCircularProgress method from EditUserDialog
  EditUserDialog.prototype.renderCircularProgress = function() {
    return;
  };

  // Replace fetchCompanies method from Users
  Users.prototype.fetchCompanies = function() {
    var companies = database.data.companies;
    this.setState({ companies: companies });
  };

  // Replace fetchUser method from Users
  Users.prototype.fetchUser = function() {
    var users = usersAPI.getUsers();
    this.setState({ users: users });
  };

  // Replace toggleUserStatus method from Users
  Users.prototype.toggleUserStatus = function(event, active, user) {
    usersAPI.setActive(user, active);
    this.updateUserStatus(user.index, active ? 'active' : 'inactive');
  };

  // Replace handleSubmit method from DeleteUserDialog
  DeleteUserDialog.prototype.handleSubmit = function(event) {
    usersAPI.deleteUser(this.props.userId, this.props.role);
    this.props.onClose(true);
  };

  // Replace login method from Login
  Login.prototype.login = function(loginData, callback) {
    var admins = usersAPI.getAdmin(loginData.email, loginData.password);
    if (admins.length === 1) {
      callback(null, { body: admins[0] });
    } else {
      // Run callback and ignore console.error
      var error = console.error;
      try {
        console.error = function(msg) {};
        callback({ status: 401, message: '' }, { body: null })
      } finally {
        console.error = error;
      }
    }
  };

//TODO this thing. finish bringing in the data
// Replace fetchCompanies method from Taxonomies
Taxonomies.prototype.fetchCompanies = function() {
  var companies = database.data.companies;
  var projects = database.data.projects;
  var schemas = database.data.schemas;
  var taxonomies = database.data.taxonomies;
  this.setState({
    companies: companies,
    companyId: companies[0].id,
    companyName: companies[0].name
  });
  // this.fetchProjects(companies[0].id);
};

// Replace fetchProjects method from Taxonomies
// Taxonomies.prototype.fetchProjects = function(companyId) {
//   var projects = taxonomiesAPI.getTaxonomies();
//   var firstProject = (projects.length > 0) ? projects[0] : null;
//   this.setState({
//     projects: projects,
//     projectId: firstProject ? firstProject.id : null,
//     projectName: firstProject ? firstProject.name : null
//   });
//   if (firstProject) {
//     this.fetchSchemas(firstProject.id);
//   } else {
//     this.setState({
//       schemas: [],
//       schemaId: null,
//       taxonomies: []
//     });
//   }
// };

//TODO build mock schema API
// Replace fetchSchemas method from Taxonomies
// Taxonomies.prototype.fetchSchemas = function(projectId) {
//   var schemas = schemaAPI.getSchemas(projectId);
//   this.setState({
//     configs: configs
//   });
// };

// Replace fetchTaxonomies method from Taxonomies
// Taxonomies.prototype.fetchTaxonomies = function(schemaId) {
//   var taxonomies = taxonomiesAPI.getTaxonomies(schemaId);
//   this.setState({
//     taxonomies: taxonomies
//   });
// };
};

module.exports = { 'init': init };
