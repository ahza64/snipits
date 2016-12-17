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
      delNotice: false,
      token: '',
    };

    this.setDelNotification = this.setDelNotification.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      files: nextProps.files,
      token: nextProps.token
    });
  }

  setDelNotification() {
    this.setState({ delNotice: true });
    setTimeout(() => {
      this.setState({ delNotice: false });
    }, 2500);
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
                      <TableRowColumn style={{ width: '150px' }}>{ moment(file.updatedAt).format('YYYY-MM-DD H:m') }</TableRowColumn>
                      <TableRowColumn>{ file.ingested ? 'INGESTED' : 'NOT INGESTED' }</TableRowColumn>
                      <TableRowColumn>
                        <ActionMenu
                          setDelNotification={ this.setDelNotification }
                          setFiles={ this.props.setFiles }
                          files={ file.fileName }
                          type={ 'SEARCH' }
                          token={ this.state.token }
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
          open={ this.state.delNotice }
          message='File Deleted Successfully'
          autoHideDuration={ 2500 }
        />
      </div>
    );
  }
}