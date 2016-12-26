// Modules
import React from 'react';
const moment = require('moment');
const _  = require('underscore');

// Components
import ActionMenu from '../../upload/menu/actionMenu';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Snackbar from 'material-ui/Snackbar';

export default class ResultList extends React.Component {
  constructor() {
    super();

    this.state = {
      files: [],
      notice: false,
      noticeMessage: '',
      token: '',
    };

    this.setNotification = this.setNotification.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      files: nextProps.files,
      token: nextProps.token
    });
  }

  setNotification(message) {
    this.setState({
      notice: true,
      noticeMessage: message
    });
    setTimeout(() => {
      this.setState({ notice: false });
    }, 2500);
  }

  handleDescriptionChanged(fileId, newDescription) {
    var files = this.state.files.map(function(file) {
      if (file.id === fileId) {
        file.description = newDescription;
      }
      return file;
    });
    this.setState({
      files: files
    });
    this.setNotification('File Description Changed Successfully');
  }

  handleConfigurationChanged(fileId, projectId, configId, newS3FileName) {
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
    this.setNotification('File Configuration Changed Successfully');
  }

  handleFileDeleted(fileId) {
    var files=[];
    for (var i = 0; i < this.state.files.length; i++) {
      var file = this.state.files[i];
      if (file.id !== fileId ) {
        files.push(file);
      }
    }
    this.setState({
      files: files
    });
    this.setNotification('File Deleted Successfully');
  }

  handleError(err) {
    if ((err) && (err.status === 409)) {
      this.setNotification('Configuration already contains the file with the same name');
    }
  }

  render() {
    var files = this.state.files;
    var filesCount = _.countBy(files, f => {
      return f.ingested ? 'ingested' : 'uningested';
    });

    return (
      <div>
        <Row>
          <h5>{ this.state.files.length } found / { filesCount.ingested | 0 } ingested</h5>
        </Row>
        <Row>
          <Table selectable={ false }>
            <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
              <TableRow>
                <TableHeaderColumn style={{ width: '5px' }}>#</TableHeaderColumn>
                <TableHeaderColumn style={{ width: '350px' }}>File</TableHeaderColumn>
                <TableHeaderColumn style={{ width: '150px' }}>Last Modified Time</TableHeaderColumn>
                <TableHeaderColumn>Status</TableHeaderColumn>
                <TableHeaderColumn>Menu</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={ false } selectable={ false }>
              {
                files.map((file, idx) => {
                  return (
                    <TableRow key={ idx }>
                      <TableRowColumn style={{ width: '5px' }}>{ idx + 1 }</TableRowColumn>
                      <TableRowColumn style={{ width: '350px' }}>{ file.customerFileName }</TableRowColumn>
                      <TableRowColumn style={{ width: '150px' }}>{ moment(file.updatedAt).format('YYYY-MM-DD HH:mm') }</TableRowColumn>
                      <TableRowColumn>{ file.ingested ? 'INGESTED' : 'NOT INGESTED' }</TableRowColumn>
                      <TableRowColumn>
                        <ActionMenu
                          companyId={ file.companyId }
                          fileId={ file.id }
                          fileName={ file.customerFileName }
                          projectId={ file["ingestion_configuration.projectId"] }
                          configId={ file.ingestionConfigurationId }
                          description={ file.description }
                          onDescriptionChanged={ (fileId, newDescription) =>
                            this.handleDescriptionChanged(fileId, newDescription) }
                          onConfigurationChanged={ (fileId, projectId, configId, newS3FileName) =>
                            this.handleConfigurationChanged(fileId, projectId, configId, newS3FileName) }
                          onFileDeleted={ (fileId) => this.handleFileDeleted(fileId) }
                          onError={ (err) => this.handleError(err) }
                          type={ 'SEARCH' }
                        />
                      </TableRowColumn>
                    </TableRow>
                  );
                })
              }
            </TableBody>
          </Table>
        </Row>
        <Snackbar
          open={ this.state.notice }
          message={ this.state.noticeMessage }
          autoHideDuration={ 2500 }
        />
      </div>
    );
  }
}