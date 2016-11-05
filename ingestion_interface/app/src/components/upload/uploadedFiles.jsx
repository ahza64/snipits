// Modules
import React from 'react';
import * as request from 'superagent';

// Components
import authRedux from '../../reduxes/auth';
import pageRedux from '../../reduxes/page';
import UploadLib from './uploadLib';
import ActionMenu from './menu/actionMenu';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
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
      delNotice: false,
      total: 0
    };

    this.setDelNotification = this.setDelNotification.bind(this);
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

  setDelNotification() {
    this.setState({ delNotice: true });
    setTimeout(() => {
      this.setState({ delNotice: false });
    }, 2500);
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
                <TableHeaderColumn style={{ width: '350px' }}>File</TableHeaderColumn>
                <TableHeaderColumn style={{ width: '200px' }}>Last Modified Time</TableHeaderColumn>
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
                      <TableRowColumn style={{ width: '350px' }}>{ file.fileName }</TableRowColumn>
                      <TableRowColumn style={{ width: '200px' }}>{ file.updatedAt }</TableRowColumn>
                      <TableRowColumn>{ file.status }</TableRowColumn>
                      <TableRowColumn>
                        <ActionMenu
                          setDelNotification={ this.setDelNotification }
                          setFiles={ this.props.setFiles }
                          setHistories={ this.props.setHistories }
                          setTotal={ this.props.setTotal }
                          files={ file.fileName }
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
                disabled={ pageRedux.getState() + offsetInterval > this.state.total }
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
          open={ this.state.delNotice }
          message='File Deleted Successfully'
          autoHideDuration={ 2500 }
        />
      </div>
    );
  }
}