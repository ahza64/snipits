// Modules
import React from 'react';
import request from 'superagent';
import { displayFilesUrl } from '../../config';

// Components
import authRedux from '../../reduxes/auth'; 

export default class UploadLib extends React.Component {
  constructor() {
    super();
    this.getFileStatus = this.getFileStatus.bind(this);
    this.getUploadedFiles = this.getUploadedFiles.bind(this);
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

  getUploadedFiles() {
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
        this.setState({ files: files });
      }
    });
  }
}