// Modules
import React from 'react';
import * as request from 'superagent';
import Dropzone from 'react-dropzone';
import { s3authUrl, ingestionRecordUrl, fileCheckUrl } from '../../config';

// Components
import authRedux from '../../reduxes/auth';
import pageRedux from '../../reduxes/page';
import DefaultNavbar from '../navbar/defaultNavbar';
import UploadedFiles from './uploadedFiles';
import UploadLib from './uploadLib';
import History from './history/history';
import FileExistsWarn from './notification/FileExistsWarn';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Snackbar from 'material-ui/Snackbar';
require('../../../styles/dropzone.scss');

export default class UploadZone extends UploadLib {
  constructor() {
    super();

    this.state = {
      files: [],
      uploadNotice: false,
      fileExistsWarn: false,
      heatmap: {},
      histories: {},
      total: 0
    };

    this.setFiles = this.setFiles.bind(this);
    this.setHistories = this.setHistories.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.setUploadNotice = this.setUploadNotice.bind(this);
    this.setFileExistsWarn = this.setFileExistsWarn.bind(this);
  }

  componentWillMount() {
    var companyId = authRedux.getState()['company.id'];

    request
    .get(ingestionRecordUrl + '/total/' + companyId)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.setState({ total: res.body });
      }
    });
    this.getUploadedFiles(0, this.setFiles);
    this.getHistory((heatmapData, historiesData) => {
      this.setHistories(heatmapData, historiesData);
    });
  }

  setFiles(files) {
    this.setState({ files: files });
  }

  setHistories(heatmapData, historiesData) {
    this.setState({
      heatmap: heatmapData,
      histories: historiesData
    });
  }

  setUploadNotice() {
    this.setState({ uploadNotice: true });
    setTimeout(() => {
      this.setState({ uploadNotice: false });
    }, 2500);
  }

  setFileExistsWarn() {
    this.setState({ fileExistsWarn: false });
  }

  uploadFile(file, signedUrl) {
    var offset = pageRedux.getState();

    request
    .put(signedUrl)
    .set('Content-Type', file.type)
    .send(file)
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        this.createIngestionRecord(file, () => {
          this.getUploadedFiles(offset, (files) => {
            this.setFiles(files);
            this.writeHistory(file.name, 'upload', () => {
              this.getHistory((heatmapData, historiesData) => {
                this.setHistories(heatmapData, historiesData);
                this.setUploadNotice();
              });
            });
          });
        });
      }
    });
  }

  onDrop(files) {
    var company = authRedux.getState()['company.name'];
    var companyId = authRedux.getState()['company.id'];
    var file = files[0];

    request
    .get(fileCheckUrl + '/' + companyId + '/' + file.name)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        if (!res.body) {
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
        } else {
          console.log('Can not upload the same file');
          this.setState({ fileExistsWarn: true });
        }
      }
    });
  }

  render() {
    return (
      <div>
        <Row style={{ height: '50%' }}>
          <Col xs={6} sm={6} md={6} lg={6} >
            <Dropzone onDrop={ this.onDrop }  className='dropzone' multiple={ false }>
              <div className='dropzone-text'>Drop Your File Here</div>
            </Dropzone>
          </Col>
          <Col xs={6} sm={6} md={6} lg={6} >
            <UploadedFiles
              files={ this.state.files }
              setHistories={ this.setHistories }
              setFiles={ this.setFiles }
              total={ this.state.total }
            />
          </Col>
          <Snackbar
            open={ this.state.uploadNotice }
            message='File Uploaded Successfully'
            autoHideDuration={ 2500 }
          />
        </Row>
        <Row style={{ height: '40%' }}>
          <History
            heatmap={ this.state.heatmap }
            histories={ this.state.histories }
          />
        </Row>
        <FileExistsWarn
          open={ this.state.fileExistsWarn }
          setClose={ this.setFileExistsWarn }
        />
      </div>
    );
  }
}