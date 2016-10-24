/** 
 * @fileOverview api url
 */

// Base Url
const port = '3333';
const base = 'http://localhost:' + port;

// API
const loginUrl = base + '/login';
const displayFilesUrl = base + '/displayUpload/';
const deleteFileUrl = base + '/delete';
const fileHistoryUrl = base + '/history';
const s3authUrl = base + '/s3auth';
const companyUrl = base + '/company';
const userUrl = base + '/user';
const ingestionRecordUrl = base + '/ingestions';

export {
  loginUrl,
  displayFilesUrl,
  deleteFileUrl,
  fileHistoryUrl,
  s3authUrl,
  companyUrl,
  userUrl,
  ingestionRecordUrl,
};