// Modules
import React from 'react';
import * as request from 'superagent';

// Components
import authRedux from '../../reduxes/auth';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import RaisedButton from 'material-ui/RaisedButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import Snackbar from 'material-ui/Snackbar';
const deleteStyle = {
  'color': 'white',
  'width': 70
};

export default class UploadedFiles extends React.Component {
  constructor() {
    super();
    this.state = {
      files: [],
      open: false
    };
    this.getUploadedFiles = this.getUploadedFiles.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  componentWillMount() {
    this.setState({ files: this.props.data });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ files: nextProps.data });
  }

  getUploadedFiles() {
    var company = authRedux.getState()['company.name'];
    var displayUploadsLink = 'http://localhost:3000/displayUpload/' + company;

    request
    .get(displayUploadsLink)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.setState({ files: res.body });
      }
    });
  }

  handleDelete(fileName) {
    console.log('deleting ', fileName);
    var deleteUrl = 'http://localhost:3000/delete';
    var company = authRedux.getState()['company.name'];
    
    request
    .post(deleteUrl)
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