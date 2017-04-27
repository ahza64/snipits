// Modules
import React from 'react';
// Components
import Badge from 'material-ui/Badge';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import EditIcon from 'material-ui/svg-icons/image/edit';
import AddBoxIcon from 'material-ui/svg-icons/content/add-box';

import { companyUrl, projectsUrl, schemaListUrl, schemaUrl, schemaFieldUrl } from '../../config';
import request from '../../services/request';
import DefaultNavbar from '../navbar/defaultNavbar';
import CreateSchemaDialog from './dialogs/createSchemaDialog';
import SchemaEditDialog from './dialogs/schemaEditDialog';

export default class SchemasLayout extends React.Component {
  constructor() {
    super();

    this.state = {
      companies: [],
      companyName: null,
      companyId: null,

      schemaList: [],
      schema: [],
      schemaId: null,
      schemaEditOpen: false,

      projects: [],
      currentProject: null,

      createSchemaDialogOpen: false,
      showInactiveSchemas: true,
    };
    this.getCompanies = this.getCompanies.bind(this);
    this.handleCompanySelectChanged = this.handleCompanySelectChanged.bind(this);
    this.getProjects = this.getProjects.bind(this);
    this.handleProjectSelectChanged = this.handleProjectSelectChanged.bind(this);
    this.setCurrentProject = this.setCurrentProject.bind(this);
    this.setSchemaList = this.setSchemaList.bind(this);
    this.updateSchemas = this.updateSchemas.bind(this);
    this.handleShowInactiveSchemas = this.handleShowInactiveSchemas.bind(this);
    this.toggleSchemaStatus = this.toggleSchemaStatus.bind(this);
    this.getSchemas = this.getSchemas.bind(this);

    this.updateSchema = this.updateSchema.bind(this);
    this.renderSchemaEditDialog = this.renderSchemaEditDialog.bind(this);
    this.handleEditViewSchema = this.handleEditViewSchema.bind(this);
    this.handleAddSchemaDialogOpen = this.handleAddSchemaDialogOpen.bind(this);
    this.handleAddSchemaDialogClose = this.handleAddSchemaDialogClose.bind(this);

    this.renderSchema = this.renderSchema.bind(this);
    this.renderProjectSelectField = this.renderProjectSelectField.bind(this);
    this.renderCompanySelectField = this.renderCompanySelectField.bind(this);
    this.renderSchemaSelectField = this.renderSchemaSelectField.bind(this);

    this.closeSchemaEdit = this.closeSchemaEdit.bind(this);
    this.openSchemaEdit = this.openSchemaEdit.bind(this);

    this.getCompanies();
    this.updateSchemas();
  }

  getCompanies() {
    return request
    .get(companyUrl)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        var firstCompany = (res.body.length > 0) ? res.body[0] : null;
        this.setState({
          companies: res.body,
          companyId: firstCompany ? firstCompany.id : null,
          companyName: firstCompany ? firstCompany.name : null,
        }, () => this.getProjects(this.state.companyId));
      }
    });
  }

  getProjects(companyId) {
    let url = projectsUrl.replace(':companyId', companyId);
    console.log(url);
    return request
    .get(url)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        try {
          this.setState({
            projects: res.body,
          }, () => {
            this.setState({
              currentProject: res.body[0],
              schemaId: null
            });
          });
          console.log(this.state);
        } catch (e) {
          console.error("error", e);
        }
      }
    });
  }

  getSchemas(callback) {
    let url = schemaListUrl.replace(':projectId', this.state.currentProject);
    request
    .get(url)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else if (callback) {
        callback(res);
      }
    });
  }

  getSchema(callback) {
    if (!this.state.schemaId) { return; }
    let url = schemaFieldUrl.replace(':schemaFieldId', this.state.schemaId);
    console.log(url);
    request
    .get(url)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error('err', err);
      } else if (callback) {
        callback(res.body);
      }
    });
  }

  removeSchema() {
    let url = schemaUrl.replace(':schemaId', this.state.schema);
    request
    .delete(url)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        console.log(res, res.body);
      }
    });
  }

  toggleSchemaStatus(event, schemaId) {
    let url = schemaUrl.replace(':schemaId', schemaId);
    request
    .delete(url)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.updateSchemas();
      }
    });
  }

  setSchemaList(list) {
    this.setState({
      schemaList: list,
    });
  }

  setCurrentProject(projectId) {
    this.setState({
      currentProject: projectId,
    });
  }


  setSchemaFields(fields) {
    console.log("setSchemaFields", fields);
    this.setState({
      schema: fields
    });
  }

  updateSchemas() {
    this.getSchemas((res) => {
      console.log("updateSchemas res", res);
      this.setSchemaList(res.body);
    });
  }

  updateSchema(cb) {
    this.getSchema((res) => {
      console.log("res", res);
      this.setSchemaFields(res);
      if (cb) {
        cb(res);
      }
    });
  }

  handleCompanySelectChanged(event, companyId) {
    console.log("handleCompanySelectChanged");
    let companies = this.state.companies.filter((c) => {
      return c.id === companyId;
    });
    let companyName = (companies.length > 0) ? companies[0].name : null;
    this.setState({
      companyId: companyId,
      companyName: companyName,
      schema: [],
      schemaId: null
    }, () => this.getProjects(this.state.companyId));
  }

  handleSchemaChange(event, value) {
    console.log("handleSchemaChange", value);
    this.setState({
      schemaId: value
    }, () => this.updateSchema());
  }

  handleProjectSelectChanged(event, idx, projectID) {
    console.log("handleProjectSelectChanged");
    this.setState({
      currentProject: projectID,
      schema: [],
      schemaId: null
    }, () => this.updateSchemas());
  }

  handleCloseActionMenu(event) {
    this.setState({
      actionMenuOpen: false,
      actionMenuTarget: null,
    });
  }

  handleEditViewSchema(event, scheme) {
    event.preventDefault();
    console.log(scheme);
    this.setState({
      schema: scheme
    });
  }

  handleAddSchemaDialogClose(saved, res) {
    this.setState({
      createSchemaDialogOpen: false
    }, () => this.updateSchemas());
  }

  handleAddSchemaDialogOpen(event) {
    this.setState({
      createSchemaDialogOpen: true
    });
  }

  handleShowInactiveSchemas(event, isChecked) {
    this.setState({
      showInactiveSchemas: isChecked
    });
  }


  renderSchemaSelectField() {
    return (
      <SelectField
        floatingLabelText="Select a Schema"
        fullWidth
        value={ this.state.schemaId }
        onChange={ (event, index, value) => this.handleSchemaChange(event, value) }
      >
        {
          this.state.schemaList.map((s, idx) => {
            return (
              <MenuItem key={ idx } value={ s.id } primaryText={ s.name } />
            );
          })
        }
      </SelectField>
    );
  }

  renderCompanySelectField() {
    return (
      <SelectField
        floatingLabelText="Company"
        fullWidth
        value={ this.state.companyId }
        onChange={ (event, index, value) => this.handleCompanySelectChanged(event, value) }
      >
        {
          this.state.companies.map((company, idx) => {
            return (
              <MenuItem key={ idx } value={ company.id } primaryText={ company.name } />
            );
          })
        }
      </SelectField>
    );
  }

  renderProjectSelectField() {
    return (
      <SelectField
        floatingLabelText="Project"
        fullWidth
        hintText="Select Work Project"
        value={ this.state.currentProject }
        onChange={ (event, index, value) =>
          this.handleProjectSelectChanged(event, index, value) } >
        { this.state.projects.map((project, idx) => {
          return (
            <MenuItem
              key={ idx }
              value={ project.id }
              primaryText={ project.name }
            />
          );
        })}
      </SelectField>
    );
  }

  renderSchema(){
    return(
      <Table selectable={ false }>
        <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
          <TableRow>
            <TableHeaderColumn>#</TableHeaderColumn>
            <TableHeaderColumn>Name</TableHeaderColumn>
            <TableHeaderColumn>Type</TableHeaderColumn>
            <TableHeaderColumn>Required</TableHeaderColumn>
            <TableHeaderColumn className='header-pos'>Version</TableHeaderColumn>
            <TableHeaderColumn>Created On</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={ false } selectable>
          {
            this.state.schema
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
                </TableRow>
              );
            })
          }

        </TableBody>
      </Table>
    );
  }

  openSchemaEdit(event) {
    this.updateSchema((res) => {
      this.setState({
        schemaEditOpen: true
      });
    });
  }

  closeSchemaEdit(saved, res) {
    if (saved) {
      this.setState({
        schemaId: res.id,
      }, () => {
        this.updateSchemas();
        this.updateSchema();
      });
    }

    this.setState({
      schemaEditOpen: false
    });
  }


  renderSchemaEditDialog() {
    if (this.state.schemaEditOpen) {
      return(
        <SchemaEditDialog
          schema={ this.state.schema }
          schemaId={ this.state.schemaId }
          onClose={ (saved, res) => this.closeSchemaEdit(saved, res) }
          open={ this.state.schemaEditOpen }
        />
      );
    } else {
      return null;
    }
  }

  render() {
    return (
      <div>
        <Row> <DefaultNavbar /> </Row>
        <Row>
          <Col xs={ 0 } sm={ 0 } md={ 1 } lg={ 1 } ></Col>
          <Col xs={ 0 } sm={ 0 } md={ 2 } lg={ 2 } >
            { this.renderCompanySelectField() }
            { this.renderProjectSelectField() }
            { this.renderSchemaSelectField()  }
            { this.renderSchemaEditDialog() }


          Total Project Schemas Found
          <Badge
            badgeContent={ this.state.schemaList.length }
            secondary
          />
            <br />
            <br />
            <RaisedButton
              label="Add Schema"
              labelPosition="after"
              disabled={ !this.state.currentProject }
              onTouchTap={ (event) => { this.handleAddSchemaDialogOpen(event); } }
              icon={ <AddBoxIcon /> }
            />
            <br />
            <br />
            <RaisedButton
              onClick={ (event) => this.openSchemaEdit(event) }
              name="SchemaEditor"
              label="Edit Schema"
              labelPosition="after"
              disabled={ !this.state.schemaId }
              secondary
              icon={ <EditIcon /> }
            />

            <CreateSchemaDialog
              open={ this.state.createSchemaDialogOpen }
              onClose={ (saved) => { this.handleAddSchemaDialogClose(saved); } }
              schemas={ this.state.schemaList }
              currentProject={ this.state.currentProject }
              updateSchemas={ this.updateSchemas }
            />

          </Col>
          <Col xs={ 8 } sm={ 8 } md={ 8 } lg={ 8 } >
            <Row>
              { this.renderSchema() }
            </Row>
          </Col>
          <Col xs={ 0 } sm={ 0 } md={ 2 } lg={ 2 } ></Col>
        </Row>
      </div>
    );
  }
}
