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
		this.setField = this.setField.bind(this);
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

	setField(data, callback) {
		request
		.put(ingestionUrl)
		.withCredentials()
		.send(data)
		.end(err => {
			if (err) {
				console.error(err);
			} else {
				callback(data);
			}
		});
	}

	setDescription(ingestionId, text, callback) {
		var data = { ingestionId: ingestionId, description: text };
		this.setField(data, callback);
	}

  setIngested(ingestionId, ingested, callback) {
		var data = { ingestionId: ingestionId, ingested:ingested };	
		this.setField(data, callback);
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
