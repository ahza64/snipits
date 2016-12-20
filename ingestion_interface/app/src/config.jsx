/**
 * @fileOverview api url
 */

// Base Url
const port = require('dsp_shared/conf.d/config.json').mooncake.api_port;
const base = 'http://localhost:' + port;

// API
const loginUrl = base + '/login';
const logoutUrl = base + '/logout';
//const displayFilesUrl = base + '/displayUpload/';
const fileCheckUrl = base + '/check/same';
const deleteFileUrl = base + '/delete';
const fileHistoryUrl = base + '/history';
const s3authUrl = base + '/s3auth';
const companyUrl = base + '/company';
const userUrl = base + '/user';
const ingestionRecordUrl = base + '/ingestions';
const watcherUrl = base + '/watchers';
const searchUrl = base + '/searchingestions';
const projectsUrl = base + '/projects/:companyId'
const configsUrl = base + '/configs/:projectId'

export {
  loginUrl,
  logoutUrl,
  //displayFilesUrl,
  fileCheckUrl,
  deleteFileUrl,
  fileHistoryUrl,
  s3authUrl,
  companyUrl,
  userUrl,
  ingestionRecordUrl,
  watcherUrl,
  searchUrl,
  projectsUrl,
  configsUrl,
};