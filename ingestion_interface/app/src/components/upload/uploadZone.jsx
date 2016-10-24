// Modules
import React from 'react';
import * as request from 'superagent';
import Dropzone from 'react-dropzone';
import { s3authUrl, ingestionRecordUrl } from '../../config';

// Components
import authRedux from '../../reduxes/auth';
import DefaultNavbar from '../navbar/DefaultNavbar';
import UploadedFiles from './uploadedFiles';
import UploadLib from './uploadLib';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Snackbar from 'material-ui/Snackbar';
require('../../../styles/dropzone.scss');

export default class UploadZone extends UploadLib {
  constructor() {
    super();

    this.uploadFile = this.uploadFile.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  createIngestionRecord(file) {
    var companyId = authRedux.getState()['company.id'];

    request
    .post(ingestionRecordUrl)
    .withCredentials()
    .send({
      fileName: file.name,
      ingestEmail: 'tech@dispatchr.co',
      companyId: companyId
    })
    .end(err => {
      if (err) {
        console.error(err);
      }
    });
  }

  uploadFile(file, signedUrl) {
    request
    .put(signedUrl)
    .set('Content-Type', file.type)
    .send(file)
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        this.getUploadedFiles();
        this.setState({ open: true });
        this.writeHistory(file.name, 'upload');
        this.createIngestionRecord(file);
      }
    });
  }

  onDrop(files) {
    var company = authRedux.getState()['company.name'];
    var file = files[0];

    request
    .post(s3authUrl)
    .send({
      name: file.name,
      type: file.type,
      company: company,
      action: 'putObject'
    })
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.uploadFile(file, res.text);
      }
    });
  }

  componentDidMount() {
    this.getUploadedFiles();
  }

  render() {
    return (
      <Row>
        <Col xs={6} sm={6} md={6} lg={6} >
          <Dropzone onDrop={ this.onDrop }  className='dropzone' multiple={ false }>
            <div className='dropzone-text'>Drop Your File Here</div>
          </Dropzone>
        </Col>
        <Col xs={6} sm={6} md={6} lg={6} >
          <UploadedFiles data={ this.state.files } />
        </Col>
        <Snackbar
          open={ this.state.open }
          message='File Uploaded Successfully'
          autoHideDuration={ 2500 }
        />
      </Row>
    );
  }
}