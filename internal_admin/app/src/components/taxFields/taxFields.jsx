// Modules
import React from 'react';
import moment from 'moment';
import request from '../../services/request';

// Components
import DefaultNavbar from '../navbar/defaultNavbar';
import Taxonomy from '../taxonomy/taxonomy';
import EditTaxValueDialog from './dialogs/edit';
import DeleteTaxValueDialog from './dialogs/delete';
import DeleteTaxValuesDialog from './dialogs/deleteValues';
import { companyUrl, projectsUrl, schemaListUrl, taxonomiesUrl, taxFieldsUrl } from '../../config';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Badge from 'material-ui/Badge';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';


export default class TaxFields extends React.Component {

  constructor() {
    super();
    this.state = {
      companies: [],
      projects: [],
      schemas: [],
      taxonomies: [],
      taxonomyValues: [],
      schemaValues: [],
      viewValues: [],
      taxParentValues: [],
      companyId: null,
      companyName: null,
      projectId: null,
      projectName: null,
      schemaId: null,
      schemaName: null,
      taxonomyId: null,
      taxonomyName: null,
      parentOrder: null,
      parentSelected: {},
      taxValueSelected: {},
      taxonomySelected: {},
      showEditTaxonomyDialog: false,
      actionMenuOpen: false,
      showDeleteTaxValDialog: false,
      showDeleteTaxValuesDialog: false
    };

    this.fetchCompanies = this.fetchCompanies.bind(this);
    this.handleCreateTaxField = this.handleCreateTaxField.bind(this);
    this.handleCloseEditMenu = this.handleCloseEditMenu.bind(this);
    this.handleDeleteTaxVal = this.handleDeleteTaxVal.bind(this);
    this.handleEditTaxField = this.handleEditTaxField.bind(this);
    this.handleRemoveValues = this.handleRemoveValues.bind(this);
    this.handleViewValuesBySchema = this.handleViewValuesBySchema.bind(this);
  }

  componentWillMount() {
    this.fetchCompanies();
  }

  fetchCompanies() {
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
          companyName: firstCompany ? firstCompany.name : null
        });
        if (firstCompany) {
          this.fetchProjects(firstCompany.id);
        }
      }
    });
  }

  fetchProjects(companyId) {
    if (companyId) {
      let url = projectsUrl.replace(':companyId', companyId);
      return request
      .get(url)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err);
        } else {
          var firstProject = (res.body.length > 0) ? res.body[0] : null;
          this.setState({
            projects: res.body,
            projectId: firstProject ? firstProject.id : null,
            projectName: firstProject ? firstProject.name : null
          });
          if (firstProject) {
            this.fetchSchemas(firstProject.id);
          } else {
            this.setState({
              schemas: [],
              schemaId: null,
              taxonomies: [],
              taxonomyId: null,
              taxonomyValues: []
            })
          }
        }
      });
    }
  }

  fetchSchemas(projectId) {
    if (projectId) {
      let url = schemaListUrl.replace(':projectId', projectId);
      return request
      .get(url)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err);
        } else {
          var firstSchema = (res.body.length > 0) ? res.body[0] : null;
          this.setState({
            schemas: res.body,
            schemaId: firstSchema ? firstSchema.id : null,
            schemaName: firstSchema ? firstSchema.name : null
          });
          if (firstSchema) {
            this.fetchTaxonomies(firstSchema.id);
            // this.fetchSchemaValues(firstSchema.id);
          } else {
            this.setState({
              schemas: [],
              taxonomies: [],
              taxonomyId: null,
              taxonomyValues: []
            });
          }
        }
      });
    }
  }

  fetchTaxonomies(schemaId) {
    if (schemaId) {
      let url = taxonomiesUrl + '/' + schemaId;
      return request
      .get(url)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err);
        } else {
          res.body.taxonomies.sort((a, b) => {
            return a.order - b.order;
          });
          var firstTax = (res.body.taxonomies.length > 0) ? res.body.taxonomies[0] : null;
          this.setState({
            taxonomies: res.body.taxonomies,
            taxonomyId: firstTax ? firstTax.id : null,
            taxonomyName: firstTax ? firstTax.fieldName : null,
            taxonomyOrder: firstTax ? firstTax.order : null,
            schemaValues: res.body.values,
            viewValues: res.body.taxonomies
          });
          if (firstTax) {
            this.fetchTaxValues(firstTax.fieldName);
            this.setState({
              taxonomySelected: firstTax
            });
          }
        }
      });
    }
  }

  fetchTaxValues(taxFieldName) {
    if (taxFieldName) {
      let url = taxFieldsUrl + '/' + taxFieldName;
      return request
      .get(url)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err);
        } else {
          var firstTaxValue = (res.body.length > 0) ? res.body[0] : null;
          this.setState({
            taxonomyValues: res.body,
            taxonomyValueId: firstTaxValue ? firstTaxValue.id : null,
            taxonomyValue: firstTaxValue ? firstTaxValue.fieldValue : null,
            taxonomyValueName: firstTaxValue ? firstTaxValue.fieldName : null,
            viewValues: res.body
          });
          this.findParentOrder();
        }
      });
    }
  }

// find parent taxonomy values
  fetchParentValues(parentName) {
    let url = taxFieldsUrl + '/' + parentName;
    return request
    .get(url)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.setState({
          taxParentValues: res.body
        });
      }
    });
  }

// find the available parent taxonomy value order's value
  findParentOrder() {
    let parentOrder = this.state.taxonomySelected.order - 1;
    if (parentOrder > 0) {
      let parentSelected = this.state.taxonomies.filter((p) => {
        return p.order == parentOrder
      });
      this.setState({
        parentSelected: parentSelected[0]
      });
      let parentName = parentSelected[0].fieldName;
      this.fetchParentValues(parentName);
    }
  }

  handleCompanySelectChanged(event, companyId) {
    let companies = this.state.companies.filter((c) => {
      return c.id == companyId;
    });
    let companyName = (companies.length > 0) ? companies[0].name : null;
    this.setState({
      companyId: companyId,
      companyName: companyName
    });
    this.fetchProjects(companyId);
  }

  handleProjectSelectChanged(event, projectId) {
    let projects = this.state.projects.filter(p => {
      return p.id == projectId;
    });
    let projectName = (projects.length > 0) ? projects[0].name : null;
    this.setState({
      projectId: projectId,
      projectName: projectName
    });
    this.fetchSchemas(projectId);
  }

  handleSchemaSelectChanged(event, schemaId) {
    let schemas = this.state.schemas.filter(p => {
      return p.id == schemaId;
    });
    let schemaName = (schemas.length > 0) ? schemas[0].name : null;
    this.setState({
      schemaId: schemaId,
      schemaName: schemaName
    });
    this.fetchTaxonomies(schemaId);
  }

  handleTaxonomySelectChanged(event, taxonomyId) {
    let taxonomies = this.state.taxonomies.filter(p => {
      return p.id == taxonomyId;
    });
    let taxonomyName = (taxonomies.length > 0) ? taxonomies[0].fieldName : null;
    let taxonomyOrder = (taxonomies.length > 0) ? taxonomies[0].order : null;
    let taxonomySelected = (taxonomies.length > 0) ? taxonomies[0] : null;
    this.setState({
      taxonomyId: taxonomyId,
      taxonomyName: taxonomyName,
      taxonomyOrder: taxonomyOrder,
      taxonomySelected: taxonomySelected
    });
    this.fetchTaxValues(taxonomyName);
  }

  handleTaxonomyValueSelectChanged(event, taxonomyValueId) {
    let taxonomyValues = this.state.taxonomyValues.filter(p => {
      return p.id == taxonomyValueId;
    });
    let taxonomyValueName = (taxonomyValues.length > 0) ? taxonomyValues[0].fieldName : null;
    let taxonomyValueField = (taxonomyValues.length > 0) ? taxonomyValues[0].fieldValue : null;
    this.setState({
      taxonomyValueId: taxonomyValueId,
      taxonomyValueName: taxonomyValueName,
      taxonomyValueField: taxonomyValueField
    });
  }

  handleCreateTaxField() {
    this.findParentOrder();
    this.setState({
      showEditTaxonomyDialog: true,
      taxValueSelected: {}
    });
  }

  handleEditTaxField() {
    this.findParentOrder();
    this.setState({
      showEditTaxonomyDialog: true,
      actionMenuOpen: false
    });
  }

  handleEditTaxValueDialogClose(saved) {
    this.setState({
      showEditTaxonomyDialog: false
    });
    if (saved) {
      this.fetchTaxValues(this.state.taxonomySelected.fieldName);
    }
  }

  handleCloseEditMenu() {
    this.setState({
      actionMenuOpen: false
    });
  }

  handleActionMenu(event, taxValue) {
    this.setState({
      actionMenuOpen: true,
      actionMenuTarget: event.currentTarget,
      taxValueSelected: taxValue
    });
  }

  handleDeleteTaxVal() {
    this.setState({
      actionMenuOpen: false,
      showDeleteTaxValDialog: true
    });
  }

  handleDeleteTaxValDialogClose() {
    this.setState({
      showDeleteTaxValDialog: false,
      showDeleteTaxValuesDialog: false
    });
    this.fetchTaxValues(this.state.taxonomySelected.fieldName);
  }

  handleRemoveValues() {
    this.setState({
      showDeleteTaxValuesDialog: true
    });
  }

  handleViewValuesBySchema() {
    if (this.state.viewValues === this.state.taxonomyValues) {
      this.setState({
        viewValues: this.state.schemaValues,
        taxonomySelected: this.state.taxonomies[0],
        taxonomyId: this.state.taxonomies[0].id,
        taxonomyName: this.state.taxonomies[0].fieldName
      });
    } else {
      this.setState({
        viewValues: this.state.taxonomyValues
      });
    }
  }

  renderCompanySelectField() {
    return (
      <SelectField
        floatingLabelText="Company"
        fullWidth={ true }
        value={ this.state.companyId }
        onChange={ (event, index, value) => this.handleCompanySelectChanged(event, value) }
      >
        { this.state.companies.map((company, idx) => {
          return (
            <MenuItem key={ idx } value={ company.id } primaryText={ company.name } />
          );
        })}
      </SelectField>
    );
  }

  renderProjectSelectField() {
    return (
      <SelectField
        floatingLabelText="Work Project"
        fullWidth={ true }
        value={ this.state.projectId }
        onChange={ (event, index, value) => this.handleProjectSelectChanged(event, value) }
      >
        { this.state.projects.map((project, idx) => {
          return (
            <MenuItem key={ idx } value={ project.id } primaryText={ project.name } />
          );
        })}
      </SelectField>
    );
  }

  renderSchemaSelectField() {
    return (
      <SelectField
        floatingLabelText="Project Schemas"
        fullWidth={ true }
        value={ this.state.schemaId }
        onChange={ (event, index, value) => this.handleSchemaSelectChanged(event, value) }
      >
        { this.state.schemas.map((schema, idx) => {
          return (
            <MenuItem key={ idx } value={ schema.id } primaryText={ schema.name } />
          );
        })}
      </SelectField>
    );
  }

  renderTaxonomySelectField() {
    if (this.state.viewValues === this.state.taxonomyValues) {
      return (
        <SelectField
          floatingLabelText="Taxonomy Field Name"
          fullWidth={ true }
          value={ this.state.taxonomyId }
          onChange={ (event, index, value) => this.handleTaxonomySelectChanged(event, value) }
        >
          { this.state.taxonomies.map((taxonomy, idx) => {
            return (
              <MenuItem key={ idx } value={ taxonomy.id } primaryText={ taxonomy.fieldName } />
            );
          })}
        </SelectField>
      );
    }
  }

  renderEditMenu() {
    return (
      <Popover
        open={ this.state.actionMenuOpen }
        anchorEl={ this.state.actionMenuTarget }
        anchorOrigin={ { horizontal: 'right', vertical: 'bottom' } }
        targetOrigin={ { horizontal: 'right', vertical: 'top' } }
        onRequestClose={ this.handleCloseEditMenu }
      >
        <Menu>
          <MenuItem
            value="1"
            primaryText="Edit Taxonomy Value"
            onClick={ this.handleEditTaxField }
          />
          <MenuItem
            value="2"
            primaryText="Delete Taxonomy Value"
            onClick={ this.handleDeleteTaxVal }
          />
        </Menu>
      </Popover>
    );
  }

  renderDialogs() {
    return (
      <div>
        <EditTaxValueDialog
          open={ this.state.showEditTaxonomyDialog }
          title={ (this.state.taxValueSelected.id ? "Edit" : "Create") + " Taxonomy Value" }
          onClose={ saved => this.handleEditTaxValueDialogClose(saved) }
          taxFieldName={ this.state.taxonomyName }
          taxFieldValueOrder={ this.state.taxonomyOrder }
          taxValueSelected={ this.state.taxValueSelected }
          taxParentList={ this.state.taxParentValues }
          taxonomyValues={ this.state.taxonomyValues }
          parentSelected={ this.state.parentSelected }
          schemaId={ this.state.schemaId }
          workProjectId={ this.state.projectId }
          companyId={ this.state.companyId }
          fieldValue={ this.state.taxValueSelected.fieldValue }
        />
        <DeleteTaxValueDialog
          open={ this.state.showDeleteTaxValDialog }
          onClose={ deleted => this.handleDeleteTaxValDialogClose(deleted) }
          taxValId={ this.state.taxValueSelected.id }
        />
        <DeleteTaxValuesDialog
          open={ this.state.showDeleteTaxValuesDialog }
          schemaId={ this.state.schemaId }
          onClose={ deleted => this.handleDeleteTaxValDialogClose(deleted) }
        />
      </div>
    );
  }

  render() {
    return (
      <div>
        { this.renderDialogs() }
        { this.renderEditMenu() }
        <Row><DefaultNavbar /></Row>
        <Row>
          <Col xs={ 0 } sm={ 0 } md={ 1 } lg={ 1 } />
          <Col xs={ 0 } sm={ 0 } md={ 2 } lg={ 2 } >
            <RaisedButton
              label={ ((this.state.taxonomySelected.order === 1) ? "Add Root" : "Add Child") + " Value" }
              primary={ true }
              fullWidth={ true }
              onClick={ this.handleCreateTaxField }
              disabled={ !this.state.taxonomyId || (this.state.viewValues !== this.state.taxonomyValues)}
            />
            { this.renderCompanySelectField() }
            { this.renderProjectSelectField() }
            { this.renderSchemaSelectField() }
            { this.renderTaxonomySelectField() }
            <div>
              Total of all values for the selected schema: "{ this.state.schemaName }"
            </div>
            <div>
              <Badge
                badgeContent={ this.state.schemaValues.length }
                secondary={ true }
              />
            </div>
            <Row>
              <div>
                ---------------------------------------------------------
              </div>
              <div>
                View all expected taxonomy values by selected { (this.state.viewValues === this.state.taxonomyValues) ? 'schema' : 'taxonomy' }
              </div>
              <RaisedButton
                label={ (this.state.viewValues === this.state.taxonomyValues) ? "View values by Schema" : "View values by Taxonomy" }
                primary={ true }
                fullWidth={ true }
                onClick={ this.handleViewValuesBySchema }
              />
              <div>
                Remove expected taxonomy values by Schema: "{ this.state.schemaName }"
              </div>
              <RaisedButton
                label="Remove all Values"
                secondary={ true }
                fullWidth={ true }
                onClick={ this.handleRemoveValues }
              />
            </Row>
          </Col>
          <Col xs={ 8 } sm={ 8 } md={ 8 } lg={ 8 } >
            <Row>
              <Table selectable={ false }>
                <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
                  <TableRow>
                    <TableHeaderColumn>#</TableHeaderColumn>
                    <TableHeaderColumn>Field Value</TableHeaderColumn>
                    <TableHeaderColumn>Field Name</TableHeaderColumn>
                    <TableHeaderColumn>Parent Id</TableHeaderColumn>
                    <TableHeaderColumn>Parent Name</TableHeaderColumn>
                    <TableHeaderColumn>Created On</TableHeaderColumn>
                    <TableHeaderColumn>Action</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody selectable={ false } displayRowCheckbox={ false }>
                  {
                    this.state.viewValues.map((taxValue, index) => {
                      var pId;
                      var pName;
                      if (taxValue.parentId === null) {
                        pId = "Root";
                        pName = "Root";
                      } else {
                        pId = taxValue.parentId;
                        if (pId) {
                          let pValue = this.state.schemaValues.filter(p => {
                            return p.id == pId;
                          });
                          if (pValue.length > 0) {
                            pName = pValue[0].fieldValue;
                          }
                        }
                      }
                      return (
                        <TableRow key={ index }>
                          <TableRowColumn>{ index + 1 }</TableRowColumn>
                          <TableRowColumn>{ taxValue.fieldValue }</TableRowColumn>
                          <TableRowColumn>{ taxValue.fieldName }</TableRowColumn>
                          <TableRowColumn>{ pId }</TableRowColumn>
                          <TableRowColumn>{ pName }</TableRowColumn>
                          <TableRowColumn>{ moment(taxValue.createdAt).format('YYYY/MM/DD') }</TableRowColumn>
                          <TableRowColumn>
                            <FlatButton
                              label="Edit/Delete"
                              secondary={ true }
                              onClick={ event => this.handleActionMenu(event, taxValue) }
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
        </Row>
      </div>
    );
  }
}
