// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import * as request from 'superagent';
const _ = require('underscore');
const moment = require('moment');

// Components
import { ingestionUrl } from '../../config';
import authRedux from '../../reduxes/auth';
import IngestLib from './ingestLib';
import ActionMenu from './actionMenu';
import InlineEdit from 'react-edit-inline';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import TextField from 'material-ui/TextField';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

export default class IngestList extends IngestLib {
  constructor() {
    super();

    this.state = {
      ingestions: [],
      search: '',
    };

    this.getIngestionStatus = this.getIngestionStatus.bind(this);
    this.resetIngestionList = this.resetIngestionList.bind(this);
    this.dataChanged = this.dataChanged.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.isMatchSearchRegex = this.isMatchSearchRegex.bind(this);
  }

  dataChanged(id, text) {
    this.setDescription(id, text, ()=> {
      var ingestions = this.state.ingestions.map(ing => {
        if(ing.id === id) {
          ing.description = text;
        }
        return ing;
      });
      this.setState({ ingestions: ingestions });
    });
  }

  componentWillMount() {
    this.getIngestions((res) => {
      this.setState({ ingestions: res.body });
    });
  }

  resetIngestionList(ingestions) {
    this.setState({ ingestions: ingestions });
  }

  getIngestionStatus(ingested) {
    return ingested ? 'INGESTED' : 'NOT INGESTED';
  }

  handleSearch(event, value) {
    this.setState({ search: value });
  }

  isMatchSearchRegex(ingestion) {
    var search = this.state.search;
    var regexp = new RegExp(search, 'i');
    return ingestion.customerFileName.match(regexp);
  }

  render() {
    var ingestions = this.state.ingestions;
    ingestions = ingestions.filter(i => {
      return this.isMatchSearchRegex(i);
    });
    var ingestedCount = _.countBy(ingestions, i => {
      return i.ingested ? 'ingested' : 'uningested';
    });

    return (
      <div>
        <Row>
          <TextField
            hintText='Search Ingestions ... '
            fullWidth={true}
            value={ this.state.search }
            onChange={ this.handleSearch }
          />
        </Row>
        <Row>
          <h5>
            { ingestions.length } found / { ingestedCount.ingested | 0 } ingested
          </h5>
        </Row>
        <Row>
          <Table selectable={ false }>
            <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
              <TableRow>
                <TableHeaderColumn style={{ width: '50px' }}>ID</TableHeaderColumn>
                <TableHeaderColumn>File Name</TableHeaderColumn>
                <TableHeaderColumn>System File Name</TableHeaderColumn>
                <TableHeaderColumn>Description</TableHeaderColumn>
                <TableHeaderColumn>Last Modified Time</TableHeaderColumn>
                <TableHeaderColumn>Status</TableHeaderColumn>
                <TableHeaderColumn>Action</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={ false } selectable={ false }>
              {
                ingestions.map((ingestion, idx) => {
                  return (
                    <TableRow key={ idx }>
                      <TableRowColumn style={{ width: '50px' }}>{ idx + 1 }</TableRowColumn>
                      <TableRowColumn>{ ingestion.customerFileName }</TableRowColumn>
                      <TableRowColumn>{ ingestion.s3FileName }</TableRowColumn>
                      <TableRowColumn>
												<InlineEdit
												activeClassName="editing"
												change={ (data) => { this.dataChanged(ingestion.id, data.description )} }
												ingestion={ingestion}
												text={ ingestion.description || ''}
												paramName="description"
												style={{
													backgroundColor: 'yellow',
													minWidth: 150,
													display: 'inline-block',
													margin: 0,
													padding: 0,
													fontSize: 15,
													outline: 0,
													border: 0
												}}
												/>
                      </TableRowColumn>
                      <TableRowColumn>{ moment(ingestion.updatedAt).format('YYYY/MM/DD hh:mm') }</TableRowColumn>
                      <TableRowColumn>{ this.getIngestionStatus(ingestion.ingested) }</TableRowColumn>
                      <TableRowColumn>
                        <ActionMenu
                          ingestions={ this.state.ingestions }
                          idx={ idx }
                          ingestion={ ingestion }
                          resetIngestionList={ this.resetIngestionList }
                        />
                      </TableRowColumn>
                    </TableRow>
                  );
                })
              }
            </TableBody>
          </Table>
        </Row>
      </div>
    );
  }
}
