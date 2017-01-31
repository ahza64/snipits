// Modules
import React from 'react';
import request from '../../services/request';
import Dropzone from 'react-dropzone';
import { s3authUrl, ingestionRecordUrl, fileCheckUrl } from '../../config';

// Components
import authRedux from '../../reduxes/auth';
import pageRedux from '../../reduxes/page';
import DefaultNavbar from '../navbar/defaultNavbar';
import UploadedFiles from './uploadedFiles';
import UploadLib from './uploadLib';
import History from './history/history';
import FileExistsWarn from './notification/fileExistsWarn';
import SelectConfigDialog from './dialogs/selectConfigDialog';
import Search from '../find/findMain';
import SearchBar from '../find/searchbar/searchBar';
import Filters from './filters/filters';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Snackbar from 'material-ui/Snackbar';
import LinearProgress from 'material-ui/LinearProgress';
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
      total: 0,
      percent: 0,
      showSelectConfigDialog: false,
      uploadFileName: null,
      selectedConfig: {},
      token: '',
      projectId: 0,
      configId: 0
    };

    this.setToken = this.setToken.bind(this);
    this.setFiles = this.setFiles.bind(this);
    this.setHistories = this.setHistories.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.setUploadNotice = this.setUploadNotice.bind(this);
    this.setFileExistsWarn = this.setFileExistsWarn.bind(this);
    this.setTotal = this.setTotal.bind(this);
    this.displayProgressBar = this.displayProgressBar.bind(this);
    this.setSearchTotal = this.setSearchTotal.bind(this);
    this.setProjectId = this.setProjectId.bind(this);
    this.setConfigId = this.setConfigId.bind(this);

  }

  setFiles(files) {
    this.setState({ files: files });
  }

  setToken(token) {
    this.setState({ token: token });
  }

  setProjectId(projectId){
    this.setState({projectId: projectId})
  }

  setConfigId(configId){
    this.setState({configId: configId})
  }

  componentWillMount() {
    var companyId = authRedux.getState()['company.id'];
    this.setState({
      companyId: companyId
    });

    request
    .get(ingestionRecordUrl + '/total/' + companyId)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.setState( res.body );
      }
    });
    this.getUploadedFiles(0, this.setFiles);
    this.fetchHistories();
  }

  fetchHistories() {
    this.getHistory((heatmapData, historiesData) => {
      this.setHistories(heatmapData, historiesData);
    });
  }

  setTotal(bool) {
    var curTotal = this.state.total;
    this.setState({ total: bool ? curTotal + 1 : curTotal - 1 });
  }

  setSearchTotal(total) {
    this.setState({ total: total });
  }

  setFiles(files) {
    if (files.ingestions){
      this.setState({ files: files.ingestions})
    } else {
      this.setState({ files: files });
    }
  }

  setHistories(heatmapData, historiesData) {
    this.setState({
      heatmap: heatmapData,
      histories: historiesData
    });
  }

  setUploadNotice(bool) {
    this.setState({ uploadNotice: bool });
  }

  setFileExistsWarn() {
    this.setState({ fileExistsWarn: false });
  }

  uploadFile(file, s3FileName, configId, signedUrl) {
    var offset = pageRedux.getState();
    this.setUploadNotice(true);

    request
    .put(signedUrl)
    .set('Content-Type', file.type)
    .send(file)
    .on('progress', (event) => {
      this.setState({ percent: event.percent });
    })
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        this.createIngestionRecord(file, s3FileName, configId, (ingestion) => {
          this.getUploadedFiles(offset, (files) => {
            this.setFiles(files);
            this.writeHistory(ingestion, 'upload', () => {
              this.getHistory((heatmapData, historiesData) => {
                this.setHistories(heatmapData, historiesData);
                this.setTotal(true);
                this.setUploadNotice(false);
                this.setState({ percent: 0 });
              });
            });
          });
        });
      }
    });
  }

  onDrop(files) {
    this.newFile = files[0];
    this.setState({
      showSelectConfigDialog: true,
      uploadFileName: this.newFile.name
    });
  }

  uploadNewFile(file, s3FileName, configId) {
    var company = authRedux.getState()['company.name'];
    var companyId = authRedux.getState()['company.id'];
    request
    .get(fileCheckUrl + '/' + configId + '/' + file.name)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        if (!res.body) {
          request
          .post(s3authUrl)
          .send({
            name: s3FileName,
            type: file.type,
            companyId: companyId,
            action: 'putObject'
          })
          .withCredentials()
          .end((err, res) => {
            if (err) {
              console.error(err);
            } else {
              request
              .get(ingestionRecordUrl + '/total/' + companyId)
              .withCredentials()
              .end((err, res) => {
                if (err) {
                  console.error(err);
                } else {
                  this.setState( res.body );
                }
              });
              this.uploadFile(file, s3FileName, configId, res.text);
              this.fetchHistories();
            }
          });
        } else {
          console.log('Can not upload the same file');
          this.setState({ fileExistsWarn: true });
        }
      }
    });
  }

  createS3FileName(project, config) {
    var company = authRedux.getState()['company.name'];
    var s3FileName = company.toLowerCase() + '_' +
      project.toLowerCase() + '_' +
      config.toLowerCase() + '_' +
      (new Date()).getTime();
    s3FileName = s3FileName.replace(/\s/g, '_');
    return s3FileName;
  }

  handleSelectConfigDialogClose(projectId, configId, projectName, configName) {
    this.setState({
      showSelectConfigDialog: false,
    });
    console.log("state after dialog close=====>", this.state);
    if(configId) {
      this.setState({
        selectedConfig: {
          projectId: projectId,
          configId: configId
        }
      });
      var s3FileName = this.createS3FileName(projectName, configName);
      this.uploadNewFile(this.newFile, s3FileName, configId);
    }
  }

  displayProgressBar() {
    if (this.state.percent === 0 || this.state.percent === 100) {
      return 'none';
    } else {
      return '';
    }
  }

  handleFileDescriptionChanged(fileId, newDescription) {
    var files = this.state.files.map(function(file) {
      if (file.id === fileId) {
        file.description = newDescription;
      }
      return file;
    });
    this.setState({
      files: files
    });
  }

  handleFileDeleted(fileId) {
    var offset = pageRedux.getState();
    this.getUploadedFiles(offset, (files) => {
      this.setFiles(files);
      this.getHistory((heatmapData, historiesData) => {
        this.setHistories(heatmapData, historiesData);
        this.setTotal(false);
      });
    });
  }

  handleFileConfigurationChanged(fileId, projectId, configId, newS3FileName) {
    var files = this.state.files.map(function(file) {
      if (file.id === fileId) {
        file['ingestion_configuration.projectId'] = projectId;
        file.ingestionConfigurationId = configId;
        file.s3FileName = newS3FileName;
      }
      return file;
    });
    this.setState({
      files: files
    });
    this.fetchHistories();
  }

  render() {
    console.log("uploadzone files: ", this.state.files)
    return (
      <div>
        <SelectConfigDialog open={ this.state.showSelectConfigDialog}
          companyId={ this.state.companyId }
          companyName={ this.state.companyName }
          fileName={ this.state.uploadFileName }
          projectId={ this.state.selectedConfig.projectId }
          configId={ this.state.selectedConfig.configId }
          onClose={ (projectId, configId, projectName, configName) =>
            this.handleSelectConfigDialogClose(projectId, configId, projectName, configName) } />
        <Row style={{ height: '50%', height: '375px' }}>
          <Col xs={4} sm={4} md={4} lg={4} >
            <Dropzone onDrop={ this.onDrop }  className='dropzone' multiple={ false }>
              <div className='dropzone-text'>
                Drop Your File Here,
                <h3>select project and configuration after dropping your file.</h3>
                <LinearProgress
                  mode='determinate'
                  value={ this.state.percent }
                  max={ 100 }
                  min={ 0 }
                  style={{ display: this.displayProgressBar() }}
                />
              </div>
            </Dropzone>
          </Col>
          <Col xs={8} sm={8} md={8} lg={8} >
            <SearchBar
              setFiles={ this.setFiles }
              setToken={ this.setToken }
              setSearchTotal={ this.setSearchTotal }
            />
            <Filters
              files={ this.state.files }
              token={ this.state.token }
              setFiles={ this.setFiles }
              setSearchTotal={ this.setSearchTotal }
              setProjectId={ this.setProjectId }
              setConfigId={ this.setConfigId }
              companyId={ this.state.companyId }
            />
            <UploadedFiles
              onFileDeleted={ (fileId) => this.handleFileDeleted(fileId) }
              onFileDescriptionChanged={ (fileId, newDescription) =>
                this.handleFileDescriptionChanged(fileId, newDescription) }
              onFileConfigurationChanged={ (fileId, projectId, configId, newS3FileName) =>
                this.handleFileConfigurationChanged(fileId, projectId, configId, newS3FileName) }
              files={ this.state.files }
              setHistories={ this.setHistories }
              setFiles={ this.setFiles }
              setTotal={ this.setTotal }
              total={ this.state.total }
              token={ this.state.token }
            />
          </Col>
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
        <Snackbar
          open={ this.state.uploadNotice }
          message='File Uploading'
        />
      </div>
    );
  }
}
