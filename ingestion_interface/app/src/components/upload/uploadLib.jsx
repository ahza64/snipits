// Modules
import React from 'react';
import request from 'superagent';
import { displayFilesUrl, fileHistoryUrl, deleteFileUrl, ingestionRecordUrl, watcherUrl } from '../../config';

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
  }

  getFileStatus(ingestion) {
    return ingestion.ingested ? 'INGESTED' : 'NOT INGESTED';
  }

  getUploadedFiles(callback) {
    var company = authRedux.getState()['company.name'];
    request
    .get(displayFilesUrl + company)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        var files = res.body;
        files.forEach(f => {
          f.status = this.getFileStatus(f.ingestion);
        });
        callback(files);
      }
    });
  }

  deleteUploadedFile(fileName, fileCallback, notiCallBack) {
    var company = authRedux.getState()['company.name'];
    
    request
    .post(deleteFileUrl)
    .withCredentials()
    .send({
      file: fileName,
      company: company
    })
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        this.getUploadedFiles(fileCallback);
        notiCallBack();
        this.writeHistory(fileName, 'delete');
      }
    });
  }

  createIngestionRecord(file) {
    var companyId = authRedux.getState()['company.id'];

    request
    .post(ingestionRecordUrl)
    .withCredentials()
    .send({
      fileName: file.name,
      companyId: companyId
    })
    .end(err => {
      if (err) {
        console.error(err);
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

  writeHistory(fileName, action) {
    request
    .post(fileHistoryUrl)
    .withCredentials()
    .send({
      email: authRedux.getState().email,
      file: fileName,
      action: action
    })
    .end(err => {
      if (err) {
        console.error(err);
      }
    });
  }
}