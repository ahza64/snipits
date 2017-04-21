/**
 * @fileOverview api url
 */

// Base Url
const config = require('dsp_shared/conf.d/config.json');
const port = config.admin.api_port;
const base = config.admin.external_host + config.admin.url_prefix.substring(0, config.admin.url_prefix.length-1) + '/api';

// API
const loginUrl = base + '/login';
const logoutUrl = base + '/logout';
const displayFilesUrl = base + '/displayUpload/';
const deleteFileUrl = base + '/delete';
const fileHistoryUrl = base + '/history';
const s3authUrl = base + '/s3auth';
const companyUrl = base + '/company';
const projectsUrl = base + '/projects/:companyId';
const projectUrl = base + '/project';
const deleteProjectUrl = base + '/project/:id';
const activateProjectUrl = base + '/project/:id/activate';
const deactivateProjectUrl = base + '/project/:id/deactivate';
const configsUrl = base + '/configs/:projectId';
const configUrl = base + '/config';
const schemaListUrl = base + '/schemas/:projectId';
const schemaFieldUrl = base + '/schemaField/:schemaFieldId';
const schemaUrl = base + '/schema/:schemaId';
const deleteConfigUrl = base + '/config/:id';
const watchersUrl = base + '/watcher/:configId';
const userUrl = base + '/user';
const usersUrl = base + '/users';
const activateUserUrl = base + '/users/:id/activate';
const deactivateUserUrl = base + '/users/:id/deactivate';
const deleteUserUrl = base + '/users/:id';
const ingestionUrl = base + '/ingestions';
const taxonomiesUrl = base + '/taxonomies';
const taxFieldsUrl = base + '/taxfields';
export {
  loginUrl,
  logoutUrl,
  displayFilesUrl,
  deleteFileUrl,
  fileHistoryUrl,
  s3authUrl,
  companyUrl,
  projectsUrl,
  projectUrl,
  deleteProjectUrl,
  activateProjectUrl,
  deactivateProjectUrl,
  configsUrl,
  configUrl,
  deleteConfigUrl,
  watchersUrl,
  userUrl,
  usersUrl,
  activateUserUrl,
  deactivateUserUrl,
  deleteUserUrl,
  ingestionUrl,
  schemaListUrl,
  schemaUrl,
  schemaFieldUrl,
  taxonomiesUrl,
  taxFieldsUrl
};
