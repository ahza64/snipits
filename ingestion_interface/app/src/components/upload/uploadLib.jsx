// Modules
import React from 'react';
import request from 'superagent';
import { displayFilesUrl, fileHistoryUrl, deleteFileUrl, ingestionRecordUrl } from '../../config';

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
    this.getIngestorEmail = this.getIngestorEmail.bind(this);
    this.setIngestorEmail = this.setIngestorEmail.bind(this);
  }

  getFileStatus(ingestion) {
    if (!ingestion.notified && !ingestion.ingested) {
      return 'NOT NOTIFIED';
    } else if (ingestion.notified && ingestion.ingested) {
      return 'INGESTED';
    } else if (ingestion.notified && !ingestion.ingested) {
      return 'NOTIFIED';
    } else {
      return 'INGESTED';
    }
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
      ingestEmail: '',
      companyId: companyId
    })
    .end(err => {
      if (err) {
        console.error(err);
      }
    });
  }

  getIngestorEmail(callback) {
    request
    .get(ingestionRecordUrl)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        callback(res.body);
      }
    });
  }

  setIngestorEmail(fileName) {
    var companyId = authRedux.getState()['company.id'];

    request
    .put(ingestionRecordUrl)
    .withCredentials()
    .send({
      fileName: fileName,
      companyId: companyId
    })
    .end(err => {
      if (err) {
        console.error(err);
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