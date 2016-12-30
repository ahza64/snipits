// Modules
import React from 'react';
import * as request from 'superagent';
const moment = require('moment');

// Components
import authRedux from '../../reduxes/auth';
import pageRedux from '../../reduxes/page';
import UploadLib from './uploadLib';
import ActionMenu from './menu/actionMenu';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Snackbar from 'material-ui/Snackbar';
import ChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import ChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import IconButton from 'material-ui/IconButton';

const offsetInterval = 5;

export default class UploadedFiles extends UploadLib {
  constructor() {
    super();

    this.state = {
      files: [],
      notice: false,
      noticeMessage: '',
      total: 0
    };

    this.setNotification = this.setNotification.bind(this);
    this.changePage = this.changePage.bind(this);
    this.renderPage = this.renderPage.bind(this);
  }

  componentWillMount() {
    this.setState({
      files: this.props.files,
      total: this.props.total
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      files: nextProps.files,
      total: nextProps.total
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
    this.setNotification('File Description Changed Successfully');
    if (this.props.onFileDescriptionChanged) {
      this.props.onFileDescriptionChanged(fileId, newDescription);
    }
  }

  handleConfigurationChanged(fileId, projectId, configId, newS3FileName) {
    this.setNotification('File Configuration Changed Successfully');
    if (this.props.onFileConfigurationChanged) {
      this.props.onFileConfigurationChanged(fileId, projectId, configId, newS3FileName);
    }
  }

  handleFileDeleted(fileId) {
    this.setNotification('File Deleted Successfully');
    if (this.props.onFileDeleted) {
      this.props.onFileDeleted(fileId);
    }
  }

  handleError(err) {
    if ((err) && (err.status === 409)) {
      this.setNotification('Configuration already contains the file with the same name');
    }
  }

  changePage(opr) {
    pageRedux.dispatch({ type: opr });
    var offset = pageRedux.getState();

    if (offset > this.state.total) {
      pageRedux.dispatch({ type: 'PREV' });
    } else if (offset < 0) {
      pageRedux.dispatch({ type: 'NEXT' });
    } else {
      this.getUploadedFiles(offset, this.props.setFiles);
    }
  }

  renderPage() {
    return pageRedux.getState() + this.state.files.length + ' of ' + this.state.total + ' in total';
  }

  render() {
    return (
      <div>
        <Row>
          <Table selectable={ false }>
            <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
              <TableRow>
                <TableHeaderColumn style={{ width: '5px' }}>#</TableHeaderColumn>
                <TableHeaderColumn style={{ width: '350px' }}>File Name</TableHeaderColumn>
                <TableHeaderColumn style={{ width: '350px' }}>Sytem File Name</TableHeaderColumn>
                <TableHeaderColumn style={{ width: '150px' }}>Last Modified Time</TableHeaderColumn>
                <TableHeaderColumn>Status</TableHeaderColumn>
                <TableHeaderColumn>Menu</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={ false } selectable={ false }>
              {
                this.state.files.map((file, idx) => {
                  return (
                    <TableRow key={ idx }>
                      <TableRowColumn style={{ width: '5px' }}>{ pageRedux.getState() + idx + 1 }</TableRowColumn>
                      <TableRowColumn style={{ width: '350px' }}>{ file.customerFileName }</TableRowColumn>
                      <TableRowColumn style={{ width: '350px' }}>{ file.s3FileName }</TableRowColumn>
                      <TableRowColumn style={{ width: '150px' }}>{ moment(file.updatedAt).format('YYYY-MM-DD H:m') }</TableRowColumn>
                      <TableRowColumn>{ file.status }</TableRowColumn>
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
                          type={ 'UPLOAD' }
                        />
                      </TableRowColumn>
                    </TableRow>
                  );
                })
              }
            </TableBody>
          </Table>
        </Row>
          <Col xs={10} sm={10} md={10} lg={10} ></Col>
          <Col xs={2} sm={2} md={2} lg={2} >
            <Row>
              <IconButton
                disabled={ pageRedux.getState() <= 0 }
                onClick={ () => this.changePage('PREV') }>
                <ChevronLeft/>
              </IconButton>
              <IconButton
                disabled={ pageRedux.getState() + offsetInterval >= this.state.total }
                onClick={ () => this.changePage('NEXT') }>
                <ChevronRight/>
              </IconButton>
            </Row>
            <Row>
              { this.renderPage() }
            </Row>
          </Col>
        <Row>
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