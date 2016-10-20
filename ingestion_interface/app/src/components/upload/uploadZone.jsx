// Modules
import React from 'react';
import * as request from 'superagent';
import Dropzone from 'react-dropzone';
import { displayFilesUrl, fileHistoryUrl, s3authUrl } from '../../config';

// Components
import authRedux from '../../reduxes/auth';
import DefaultNavbar from '../navbar/DefaultNavbar';
import UploadedFiles from './uploadedFiles';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Snackbar from 'material-ui/Snackbar';
require('../../../styles/dropzone.scss');

export default class UploadZone extends React.Component {
  constructor() {
    super();
    this.state = {
      files: [],
      open: false
    };
    this.onDrop = this.onDrop.bind(this);
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
        this.setState({ files: res.body });
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
        var signedUrl = res.text;

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

            request
            .post(fileHistoryUrl)
            .withCredentials()
            .send({
              email: authRedux.getState().email,
              file: file.name,
              action: 'upload'
            })
            .end(err => {
              if (err) {
                console.error(err);
              }
            });
          }
        });
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