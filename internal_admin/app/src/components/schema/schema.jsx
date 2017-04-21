// added packages reactabular lodash react-edit uuid
// react-bootstrap-table babel-preset-stage-0 (in .babelrc) babelify react-hot-loader toastr
import React from 'react';

// Components
// import * as edit from 'react-edit';
// import uuid from 'uuid';

import RaisedButton from 'material-ui/RaisedButton';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import schemaRedux from '../../reduxes/schema';
import request from '../../services/request';
import { schemaListUrl, schemaUrl, schemaFieldUrl } from '../../config';
import DefaultNavbar from '../navbar/defaultNavbar';
import CreateFieldDialog from './dialogs/createFieldDialog';

export default class QowSchema extends React.Component {
  constructor() {
    super();

    this.state = {
      name: '',
      fields: [],
      schemaList: [],
      schemaId: null,
      projectId: null,
      createFieldDialogOpen: false,
    };
    this.fetchSchemaList = this.fetchSchemaList.bind(this);
    this.refreshSchemaList = this.refreshSchemaList.bind(this);
    this.fetchSchema = this.fetchSchema.bind(this);

    this.setSchemaFields = this.setSchemaFields.bind(this);
    this.updateSchemaFields = this.updateSchemaFields.bind(this);
    this.deleteField = this.deleteField.bind(this);

    this.handleCreateFieldDialogOpen = this.handleCreateFieldDialogOpen.bind(this);
    this.handleCreateFieldDialogClose = this.handleCreateFieldDialogClose.bind(this);

    this.renderCreateFieldDialog = this.renderCreateFieldDialog.bind(this);
    this.renderSchemaSelectField = this.renderSchemaSelectField.bind(this);
    this.refreshSchemaList();
    this.updateSchemaFields();
  }

  componentWillMount() {
    this.setState({
      schemaId: schemaRedux.getState()
    });
  }

  setSchemaFields(fields) {
    this.setState({
      fields: fields
    });
  }

  updateSchemaFields() {
    this.getSchemaFields((res) => {
      this.setSchemaFields(res);
    });
  }

  getSchemaFields(callback) {
    var schemaId = schemaRedux.getState();
    if (!schemaId) { return; }
    let url = schemaFieldUrl.replace(':schemaFieldId', schemaId);
    request
    .get(url)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error('errrr', err);
      } else {
        callback(res.body);
      }
    });
  }

  refreshSchemaList() {
    this.fetchSchema((body) => { this.fetchSchemaList(body.workProjectId); });
  }

  fetchSchemaList(projectId) {
    let url = schemaListUrl.replace(':projectId', projectId);
    var self = this;
    request
    .get(url)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        self.setState({
          schemaList: res.body
        });
      }
    });
  }

  fetchSchema(cb) {
    let url = schemaUrl.replace(':schemaId', schemaRedux.getState());
    request
    .get(url)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error("error", err);
      }
      this.setState({
        schema: res.body,
        projectId: res.body.workProjectId
      });
      cb(res.body);
    });
  }

  handleCreateFieldDialogOpen(event) {
    this.setState({
      createFieldDialogOpen: true
    });
  }

  handleCreateFieldDialogClose() {
    this.setState({
      createFieldDialogOpen: false
    }, () => this.updateSchemaFields());
  }

  deleteField(event, field) {
    let url = schemaFieldUrl.replace(':schemaFieldId', field.id);
    request
    .delete(url)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        var newFields = this.state.fields.filter((x) => { return x.id !== field.id; });
        this.setState({
          fields: newFields
        });
      }
    });
  }

  handleSchemaChange(event, value) {
    this.setState({
      schemaId: value
    });
    schemaRedux.dispatch({
      type: 'CHANGE_SCHEMA',
      schema: value
    });
    this.updateSchemaFields();
  }

  renderCreateFieldDialog() {
    return (
      <CreateFieldDialog
        open={ this.state.createFieldDialogOpen }
        onClose={ () => { this.handleCreateFieldDialogClose(); } }
      />
    );
  }

  renderSchemaSelectField() {
    return (
      <SelectField
        floatingLabelText="Select a Schema"
        fullWidth={ true }
        value={ this.state.schemaId }
        onChange={ (event, index, value) => this.handleSchemaChange(event, value) }
      >
        {
          this.state.schemaList.map((s, idx) => {
            return(
              <MenuItem key={ idx } value={ s.id } primaryText={ s.name } />
            );
          })
        }
      </SelectField>
    );
  }

  render() {
    return (
      <div>
        <Row> <DefaultNavbar /> </Row>
        <Row>
          <Col xs={ 0 } sm={ 0 } md={ 1 } lg={ 1 } ></Col>
          <Col xs={ 0 } sm={ 0 } md={ 2 } lg={ 2 } >
            <RaisedButton
              label="Add Field"
              secondary={ true }
              onTouchTap={ (event) => { this.handleCreateFieldDialogOpen(event); } }
            />
            { this.renderSchemaSelectField() }
            { this.renderCreateFieldDialog() }
          </Col>
          <Col xs={ 8 } sm={ 8 } md={ 8 } lg={ 8 } >
            <Row>
              <Table selectable={ false }>
                <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
                  <TableRow>
                    <TableHeaderColumn>#</TableHeaderColumn>
                    <TableHeaderColumn>Name</TableHeaderColumn>
                    <TableHeaderColumn>Type</TableHeaderColumn>
                    <TableHeaderColumn>Required</TableHeaderColumn>
                    <TableHeaderColumn className='header-pos'>Version</TableHeaderColumn>
                    <TableHeaderColumn>Created On</TableHeaderColumn>
                    <TableHeaderColumn> Delete </TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={ false } selectable={ true }>
                  {
                  this.state.fields
                  .sort((a, b) => { return a.id - b.id; })
                  .map((field, idx) => {
                    return (
                      <TableRow key={ idx }>
                        <TableRowColumn>{ idx + 1 }</TableRowColumn>
                        <TableRowColumn>{ field.name }</TableRowColumn>
                        <TableRowColumn>{ field.type }</TableRowColumn>
                        <TableRowColumn>{ field.required ? "TRUE" : "FALSE" }</TableRowColumn>
                        <TableRowColumn>{ field.version }</TableRowColumn>
                        <TableRowColumn>{ field.createdAt }</TableRowColumn>
                        <TableRowColumn>
                          <RaisedButton
                            onClick={ (event) => { this.deleteField(event, field); } }
                            label="delete"
                            labelPosition="after"
                            icon={ <DeleteIcon /> }
                          />
                        </TableRowColumn>
                      </TableRow>
                    );
                  })
                }
                </TableBody>
              </Table>
            </Row>
          </Col>
          <Col xs={ 0 } sm={ 0 } md={ 2 } lg={ 2 } ></Col>
        </Row>
      </div>
    );
  }
}
