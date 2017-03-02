// Modules
import React from 'react';
import request from '../../services/request';
import { fileHistoryUrl, deleteFileUrl, ingestionRecordUrl, searchUrl, ingestionConfigUrl } from '../../config';

// Components
import authRedux from '../../reduxes/auth';

export default class UploadLib extends React.Component {
  constructor() {
    super();

    this.writeHistory = this.writeHistory.bind(this);
    this.getUploadedFiles = this.getUploadedFiles.bind(this);
    this.deleteUploadedFile = this.deleteUploadedFile.bind(this);
    this.createIngestionRecord = this.createIngestionRecord.bind(this);
    this.getHistory = this.getHistory.bind(this);
    this.getSearchResults = this.getSearchResults.bind(this);
  }

  getUploadedFiles(offset, callback) {
    var companyId = authRedux.getState()['company.id'];

    request
    .get(ingestionRecordUrl + '/all/' + companyId + '/' + offset)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        var files = res.body;
        callback(files);
      }
    });
  }

  getSearchResults(token, callback, offset = 0, projectsFilter = 0, ingestionsFilter = 0) {
    var companyId = authRedux.getState()['company.id'];

    request
    .get(searchUrl + '/' + companyId + '/' + projectsFilter + '/' + ingestionsFilter + '/' + offset + '/' + token)
    .withCredentials()
    .on('progress', (event) => {
      this.setState({ searching: event.percent });
    })
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        callback(res.body);
      }
    });
  }

  deleteUploadedFile(fileId, callback) {
    var company = authRedux.getState()['company.name'];

    request
    .post(deleteFileUrl)
    .withCredentials()
    .send({
      fileId: fileId
    })
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        callback();
      }
    });
  }

  createIngestionRecord(file, s3FileName, configId, callback) {
    var companyId = authRedux.getState()['company.id'];

    request
    .post(ingestionRecordUrl)
    .withCredentials()
    .send({
      customerFileName: file.name,
      companyId: companyId,
      ingestionConfigurationId: configId,
      s3FileName: s3FileName
    })
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        callback(res.body);
      }
    });
  }

  getIngestionRecord(fileName, callback) {
    var companyId = authRedux.getState()['company.id'];

    request
    .get(ingestionRecordUrl + '/' + fileName + '/' + companyId)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        callback(res);
      }
    });
  }

  writeHistory(file, action, callback) {
    request
    .post(fileHistoryUrl)
    .withCredentials()
    .send({
      email: authRedux.getState().email,
      ingestionFileId: file.id,
      customerFileName: file.customerFileName,
      action: action
    })
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        callback();
      }
    });
  }

  getHistory(callback) {
    var companyId = authRedux.getState()['company.id'];

    request
    .get(fileHistoryUrl + '/' + companyId)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        var body = res.body;
        callback(body.heatmapData, body.historiesData);
      }
    });
  }

  getAllFiles(callback){
    var companyId = authRedux.getState()['company.id'];

    request
    .get(ingestionRecordUrl + '/projectIds/' + companyId)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        var body = res.body;
        callback(body);
      }
    });

  }

  changeFileConfiguration(fileId, newConfigId, callback) {
    request
    .put(ingestionConfigUrl)
    .send({
      fileId: fileId,
      configId: newConfigId
    })
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
        callback(null, err);
      } else {
        callback(res.body.s3FileName, null);
      }
    });
  }

}
