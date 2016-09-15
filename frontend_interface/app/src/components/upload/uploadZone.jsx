// Modules
import React from 'react';
import * as request from 'superagent';
import Dropzone from 'react-dropzone';

// Components
import authRedux from '../../reduxes/auth';
import DefaultNavbar from '../navbar/DefaultNavbar';
import UploadedFiles from './uploadedFiles';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
require('../../../styles/dropzone.scss');

export default class UploadZone extends React.Component {
  constructor() {
    super();
    this.state = { uploads: [] };
    this.onDrop = this.onDrop.bind(this);
  }

  getUploadedFiles() {
    var company = authRedux.getState().company;
    var displayUploadsLink = 'http://localhost:3000/displayUpload/' + company;

    request
    .get(displayUploadsLink)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.setState({ uploads: res.body });
      }
    });
  }

  onDrop(files) {
    console.log('Received files: ', files);
    var company = authRedux.getState().company;
    var uploadData = new FormData();
    var uploadLink = 'http://localhost:3000/upload/' + company;

    files.forEach(file => {
      uploadData.append(file.name, file);
    });

    request
    .post(uploadLink)
    .send(uploadData)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Uploaded files: ', res);
        this.getUploadedFiles();
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
          <Dropzone onDrop={ this.onDrop }  className='dropzone'>
            <div className='dropzone-text'>Drop Your File Here</div>
          </Dropzone>
        </Col>
        <Col xs={6} sm={6} md={6} lg={6} >
          <UploadedFiles data={ this.state.uploads } />
        </Col>
      </Row>
    );
  }
}