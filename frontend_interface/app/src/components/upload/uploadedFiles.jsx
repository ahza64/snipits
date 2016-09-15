// Modules
import React from 'react';
import * as request from 'superagent';

// Components
import authRedux from '../../reduxes/auth';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

export default class UploadedFiles extends React.Component {
  constructor() {
    super();
    this.state = { files: [] };
  }

  componentWillMount() {
    this.setState({ files: this.props.data });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ files: nextProps.data });
  }

  render() {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn>ID</TableHeaderColumn>
            <TableHeaderColumn>File</TableHeaderColumn>
            <TableHeaderColumn>Upload Time</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody>
          { 
            this.state.files.map((file, idx) => {
              return (
                <TableRow key={ idx }>
                  <TableRowColumn>{ idx }</TableRowColumn>
                  <TableRowColumn>{ file }</TableRowColumn>
                  <TableRowColumn>Now</TableRowColumn>
                </TableRow>
              );
            })
          }
        </TableBody>
      </Table>
    );
  }
}