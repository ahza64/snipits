// Modules
import React from 'react';
import request from 'superagent';
import { fileHistoryUrl, deleteFileUrl, ingestionRecordUrl, watcherUrl, searchUrl, ingestionConfigUrl } from '../../config';

// Components
import authRedux from '../../reduxes/auth';

export default class UploadLib extends React.Component {
  constructor() {
    super();

    this.writeHistory = this.writeHistory.bind(this);
    this.getFileStatus = this.getFileStatus.bind(this);
    this.getUploadedFiles = this.getUploadedFiles.bind(this);
    this.deleteUploadedFile = this.deleteUploadedFile.bind(this);
    this.createIngestionRecord = this.createIngestionRecord.bind(this);
    this.setWatcherEmail = this.setWatcherEmail.bind(this);
    this.getWatcherEmail = this.getWatcherEmail.bind(this);
    this.getHistory = this.getHistory.bind(this);
    this.getSearchResults = this.getSearchResults.bind(this);
  }

  getFileStatus(ingestion) {
    return ingestion.ingested ? 'INGESTED' : 'NOT INGESTED';
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
        files.forEach(f => {
          f.status = this.getFileStatus(f);
        });
        callback(files);
      }
    });
  }

  getSearchResults(token, callback) {
    var companyId = authRedux.getState()['company.id'];

    request
    .get(searchUrl + '/' + companyId + '/' + token)
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

  getWatcherEmail(fileName, callback) {
    request
    .get(watcherUrl + '/' + fileName)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        callback(res.body);
      }
    });
  }

  setWatcherEmail(fileName, watcherEmails, callback) {
    var companyId = authRedux.getState()['company.id'];

    request
    .post(watcherUrl)
    .withCredentials()
    .send({
      fileName: fileName,
      watcherEmails: watcherEmails,
      companyId: companyId
    })
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        callback();
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
