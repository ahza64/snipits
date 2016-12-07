/**
 * @fileOverview api url
 */

// Base Url
const port = require('dsp_shared/conf.d/config.json').admin.api_port;
const base = 'http://localhost:' + port;

// API
const loginUrl = base + '/login';
const logoutUrl = base + '/logout';
const displayFilesUrl = base + '/displayUpload/';
const deleteFileUrl = base + '/delete';
const fileHistoryUrl = base + '/history';
const s3authUrl = base + '/s3auth';
const companyUrl = base + '/company';
const projectUrl = base + '/project';
const userUrl = base + '/user';
const usersUrl = base + '/users';
const activateUserUrl = base + '/users/:id/activate';
const deactivateUserUrl = base + '/users/:id/deactivate';
const deleteUserUrl = base + '/users/:id';
const ingestionUrl = base + '/ingestions';

export {
  loginUrl,
  logoutUrl,
  displayFilesUrl,
  deleteFileUrl,
  fileHistoryUrl,
  s3authUrl,
  companyUrl,
  projectUrl,
  userUrl,
  usersUrl,
  activateUserUrl,
  deactivateUserUrl,
  deleteUserUrl,
  ingestionUrl
};
