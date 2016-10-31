// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import * as request from 'superagent';

// Components
import { ingestionUrl } from '../../config';
import authRedux from '../../reduxes/auth';
import ActionMenu from './actionMenu';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

export default class IngestList extends React.Component {
  constructor() {
    super();

    this.state = {
      ingestions: []
    };

    this.getIngestionStatus = this.getIngestionStatus.bind(this);
  }

  componentWillMount() {
    var companyId = authRedux.getState().companyId;
    if (companyId) {
      request
      .get(ingestionUrl + '/' + companyId)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err);
        } else {
          this.setState({ ingestions: res.body });
        }
      });
    }
  }

  getIngestionStatus(ingested) {
    return ingested ? 'INGESTED' : 'NOT INGESTED';
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
              <TableHeaderColumn>Action</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={ false } selectable={ false }>
            { 
              this.state.ingestions.map((ingestion, idx) => {
                return (
                  <TableRow key={ idx }>
                    <TableRowColumn>{ idx }</TableRowColumn>
                    <TableRowColumn>{ ingestion.fileName }</TableRowColumn>
                    <TableRowColumn>{ ingestion.updatedAt }</TableRowColumn>
                    <TableRowColumn>{ this.getIngestionStatus(ingestion.ingested) }</TableRowColumn>
                    <TableRowColumn>
                      <ActionMenu />
                    </TableRowColumn>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>       
      </div>
    );
  }
}