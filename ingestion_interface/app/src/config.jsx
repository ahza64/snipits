/**
 * @fileOverview api url
 */

// Base Url
const port = require('dsp_shared/conf.d/config.json').mooncake.api_port;
const base = require('dsp_shared/conf.d/config.json').mooncake.external_host + '/api';

// API
const loginUrl = base + '/login';
const logoutUrl = base + '/logout';
const fileCheckUrl = base + '/check/same';
const deleteFileUrl = base + '/delete';
const fileHistoryUrl = base + '/history';
const s3authUrl = base + '/s3auth';
const companyUrl = base + '/company';
const userUrl = base + '/user';
const ingestionRecordUrl = base + '/ingestions';
const ingestionConfigUrl = base + '/ingestions/config';
const searchUrl = base + '/searchingestions';
const projectsUrl = base + '/projects/:companyId'
const configsUrl = base + '/configs/:projectId'

export {
  loginUrl,
  logoutUrl,
  fileCheckUrl,
  deleteFileUrl,
  fileHistoryUrl,
  s3authUrl,
  companyUrl,
  userUrl,
  ingestionRecordUrl,
  ingestionConfigUrl,
  searchUrl,
  projectsUrl,
  configsUrl,
};
