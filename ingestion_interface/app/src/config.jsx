/** 
 * @fileOverview api url
 */

// Base Url
const port = require('dsp_shared/conf.d/config.json').mooncake.api_port;
const base = 'http://localhost:' + port;

// API
const loginUrl = base + '/login';
const logoutUrl = base + '/logout';
const displayFilesUrl = base + '/displayUpload/';
const deleteFileUrl = base + '/delete';
const fileHistoryUrl = base + '/history';
const s3authUrl = base + '/s3auth';
const companyUrl = base + '/company';
const userUrl = base + '/user';
const ingestionRecordUrl = base + '/ingestions';
const watcherUrl = base + '/watchers';

export {
  loginUrl,
  logoutUrl,
  displayFilesUrl,
  deleteFileUrl,
  fileHistoryUrl,
  s3authUrl,
  companyUrl,
  userUrl,
  ingestionRecordUrl,
  watcherUrl,
};