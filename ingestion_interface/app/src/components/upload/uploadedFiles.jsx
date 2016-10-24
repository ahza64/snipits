// Modules
import React from 'react';
import * as request from 'superagent';
import { fileHistoryUrl, deleteFileUrl } from '../../config';

// Components
import authRedux from '../../reduxes/auth';
import UploadLib from './uploadLib';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Snackbar from 'material-ui/Snackbar';
const deleteStyle = {
  'color': 'white'
};

export default class UploadedFiles extends UploadLib {
  constructor() {
    super();

    this.handleDelete = this.handleDelete.bind(this);
  }

  componentWillMount() {
    this.setState({ files: this.props.data });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ files: nextProps.data });
  }

  handleDelete(fileName) {
    var company = authRedux.getState()['company.name'];
    
    request
    .post(deleteFileUrl)
    .withCredentials()
    .send({
      file: fileName,
      company: company
    })
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        this.getUploadedFiles();
        this.setState({ open: true });
        this.writeHistory(fileName, 'delete');
      }
    });
  }

  render() {
    return (
      <div>
        <Table>
          <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
            <TableRow>
              <TableHeaderColumn>ID</TableHeaderColumn>
              <TableHeaderColumn>File</TableHeaderColumn>
              <TableHeaderColumn>Last Modified Time</TableHeaderColumn>
              <TableHeaderColumn>Status</TableHeaderColumn>
              <TableHeaderColumn>Action</TableHeaderColumn>
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
                      <FloatingActionButton mini={ true } secondary={ true } onClick={ () => this.handleDelete(file.Key) }>
                        <Glyphicon glyph='trash' style={ deleteStyle } />
                      </FloatingActionButton>
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