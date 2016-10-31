// Modules
import React from 'react';
import * as request from 'superagent';

// Components
import { ingestionUrl, fileHistoryUrl } from '../../config';
import authRedux from '../../reduxes/auth';

export default class IngestLib extends React.Component {
  constructor() {
    super();

    this.getIngestions = this.getIngestions.bind(this);
    this.setIngested = this.setIngested.bind(this);
    this.createIngestedHistory = this.createIngestedHistory.bind(this);
  }

  getIngestions(callback) {
    var companyId = authRedux.getState().companyId;
    if (companyId) {
      request
      .get(ingestionUrl + '/' + companyId)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err);
        } else {
          callback(res);
        }
      });
    }
  }

  setIngested(ingestionId, callback) {
    request
    .put(ingestionUrl)
    .withCredentials()
    .send({
      ingestionId: ingestionId
    })
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        callback();
      }
    });
  }

  createIngestedHistory(fileName) {
    var email = authRedux.getState().email;
    var action = 'ingest';

    request
    .post(fileHistoryUrl)
    .withCredentials()
    .send({
      email: email,
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