// Modules
import React from 'react';
import * as request from 'superagent';

// Components
import authRedux from '../../reduxes/auth';
import UploadLib from './uploadLib';
import ActionMenu from './actionMenu';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Snackbar from 'material-ui/Snackbar';

export default class UploadedFiles extends UploadLib {
  constructor() {
    super();

    this.state = {
      files: [],
      open: false
    };

    this.setFiles = this.setFiles.bind(this);
    this.setDelNotification = this.setDelNotification.bind(this);
  }

  componentWillMount() {
    this.setState({ files: this.props.data });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ files: nextProps.data });
  }

  setFiles(files) {
    this.setState({ files: files });
  }

  setDelNotification() {
    this.setState({ open: true });
  }

  render() {
    return (
      <div>
        <Table selectable={ false }>
          <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
            <TableRow>
              <TableHeaderColumn>ID</TableHeaderColumn>
              <TableHeaderColumn>File</TableHeaderColumn>
              <TableHeaderColumn>Last Modified Time</TableHeaderColumn>
              <TableHeaderColumn>Status</TableHeaderColumn>
              <TableHeaderColumn>Menu</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={ false } selectable={ false }>
            { 
              this.state.files.map((file, idx) => {
                return (
                  <TableRow key={ idx }>
                    <TableRowColumn>{ idx }</TableRowColumn>
                    <TableRowColumn>{ file.Key }</TableRowColumn>
                    <TableRowColumn>{ file.LastModified }</TableRowColumn>
                    <TableRowColumn>{ file.status }</TableRowColumn>
                    <TableRowColumn>
                      <ActionMenu
                        setDelNotification={ this.setDelNotification }
                        setFiles={ this.setFiles }
                        setHistories={ this.props.setHistories }
                        files={ file.Key }
                      />
                    </TableRowColumn>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>
        <Snackbar
          open={ this.state.open }
          message='File Deleted Successfully'
          autoHideDuration={ 2500 }
        />
      </div>
    );
  }
}