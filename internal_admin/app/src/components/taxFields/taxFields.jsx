// Modules
import React from 'react';
import request from '../../services/request';

// Components
import DefaultNavbar from '../navbar/defaultNavbar';
import Taxonomy from '../taxonomy/taxonomy'
import EditTaxValueDialog from './dialogs/edit'
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
      showDeleteTaxonomyDialog: false
    };

    this.handleCreateTaxField = this.handleCreateTaxField.bind(this);
    this.handleCloseEditMenu = this.handleCloseEditMenu.bind(this);
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
          } else {
            this.setState({
              schemas: []
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
          res.body.sort(function (a, b) {
            return a.order - b.order
          })
          var firstTax = (res.body.length > 0) ? res.body[0] : null;
          this.setState({
            taxonomies: res.body,
            taxonomyId: firstTax ? firstTax.id : null,
            taxonomyName: firstTax ? firstTax.fieldName : null,
            taxonomyOrder: firstTax ? firstTax.order : null
          });
          if(firstTax) {
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
            taxonomyValueName: firstTaxValue ? firstTaxValue.fieldName : null
          });
          this.findParentOrder();
        }
      });
    }
  }

// find parent taxonomy values
  fetchParentValues(parentName){
    let url = taxFieldsUrl + '/' + parentName;
    return request
    .get(url)
    .withCredentials()
    .end((err, res) => {
      if(err) {
        console.error(err);
      } else {
        this.setState({
          taxParentValues: res.body
        });
      }
    });
  }

// find the available parent taxonomy value order's value
  findParentOrder(){
    let parentOrder = this.state.taxonomySelected.order - 1;
    if (parentOrder > 0) {
      let parentSelected = this.state.taxonomies.filter(p => {
        return p.order == parentOrder
      });
      this.setState({
        parentSelected: parentSelected[0]
      })
      let parentName = parentSelected[0].fieldName;
      this.fetchParentValues(parentName);
    }
  }

  handleCompanySelectChanged(event, companyId) {
    let companies = this.state.companies.filter(c => {
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
    // this.fetchTaxValues(taxonomyName);
  }

  // handleCreateTaxonomy() {
  //   this.setState({
  //     showEditTaxonomyDialog: true,
  //     taxonomySelected: {}
  //   });
  // }

  handleCreateTaxField() {
    this.findParentOrder();
    this.setState({
      showEditTaxonomyDialog: true
    });
  }

  handleEditTaxValueDialogClose() {
    this.setState({
      showEditTaxonomyDialog: false
    });
  }

  handleCloseEditMenu() {
    this.setState({
      actionMenuOpen: false
    })
  }

  handleActionMenu(event, taxValue) {
    this.setState({
      actionMenuOpen: true,
      actionMenuTarget: event.currentTarget,
      taxValueSelected: taxValue
    })
  }

  renderCompanySelectField() {
    return(
      <SelectField
        floatingLabelText="Company"
        fullWidth={true}
        value={ this.state.companyId }
        onChange={ (event, index, value) => this.handleCompanySelectChanged(event, value) }
        >
        { this.state.companies.map((company, idx) => {
            return(
              <MenuItem key={ idx } value={ company.id } primaryText={ company.name } />
            );
          })
        }
      </SelectField>
    );
  }

  renderProjectSelectField() {
    return(
      <SelectField
        floatingLabelText="Work Project"
        fullWidth={true}
        value={ this.state.projectId }
        onChange={ (event, index, value) => this.handleProjectSelectChanged(event, value) }
        >
        { this.state.projects.map((project, idx) => {
            return(
              <MenuItem key={ idx } value={ project.id } primaryText={ project.name } />
            );
          })
        }
      </SelectField>
    );
  }

  renderSchemaSelectField() {
    return(
      <SelectField
        floatingLabelText="Project Schemas"
        fullWidth={true}
        value={ this.state.schemaId }
        onChange={ (event, index, value) => this.handleSchemaSelectChanged(event, value) }
        >
        { this.state.schemas.map((schema, idx) => {
            return(
              <MenuItem key={ idx } value={ schema.id } primaryText={ schema.name } />
            );
          })
        }
      </SelectField>
    );
  }

  renderTaxonomySelectField() {
    return(
      <SelectField
        floatingLabelText="Taxonomy Field Name"
        fullWidth={true}
        value={ this.state.taxonomyId }
        onChange={ (event, index, value) => this.handleTaxonomySelectChanged(event, value) }
        >
        { this.state.taxonomies.map((taxonomy, idx) => {
            return(
              <MenuItem key={ idx } value={ taxonomy.id } primaryText={ taxonomy.fieldName } />
            );
          })
        }
      </SelectField>
    );
  }

  renderTaxFieldSelectField() {
    if (this.state.taxonomyOrder !== 1 && this.state.taxonomyValues.length > 0){
      return(
        <SelectField
          floatingLabelText="Taxonomy Field Value"
          fullWidth={true}
          value={ this.state.taxonomyValueId }
          onChange={ (event, index, value) => this.handleTaxonomyValueSelectChanged(event, value) }
          >
          { this.state.taxonomyValues.map((taxonomy, idx) => {
            return(
              <MenuItem key={ idx } value={ taxonomy.id } primaryText={ taxonomy.fieldValue } />
            );
          })}
        </SelectField>
      );
    }
  }

  renderEditMenu() {
    return(
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
          />
          <MenuItem
            value="2"
            primaryText="Delete Taxonomy Value"
          />
        </Menu>
      </Popover>
    )
  }

  renderDialogs() {
    return(
      <div>
        <EditTaxValueDialog
          open={ this.state.showEditTaxonomyDialog }
          title={ (this.state.taxValueSelected.id ? "Edit" : "Create") + " Taxonomy Value" }
          onClose={ (saved) => this.handleEditTaxValueDialogClose()}
          taxFieldName={ this.state.taxonomyName }
          taxFieldValueId={ this.state.taxonomyOrder }
          taxParentList={ this.state.taxParentValues }
          parentSelected={ this.state.parentSelected }
          qowSchemaId={ this.state.schemaId }
          workProjectId={ this.state.projectId }
          companyId={ this.state.companyId }
        />
      </div>
    )
  }

  render(){
    return(
      <div>
        { this.renderDialogs() }
        { this.renderEditMenu() }
        <Row><DefaultNavbar/></Row>
        <Row>
          <Col xs={0} sm={0} md={1} lg={1} ></Col>
          <Col xs={0} sm={0} md={2} lg={2} >
            { this.renderCompanySelectField() }
            { this.renderProjectSelectField() }
            { this.renderSchemaSelectField() }
            { this.renderTaxonomySelectField() }
            { this.renderTaxFieldSelectField() }
            <RaisedButton
              label={ ((this.state.taxonomyOrder === 1) ? "Add Root" : "Add Child") + " Value" }
              primary={ true }
              fullWidth={ true }
              onClick={ this.handleCreateTaxField }
            />
            <div>
              Total Taxonomy Field Values Found
            </div>
            <Badge
              badgeContent={ this.state.taxonomyValues.length }
              secondary={ true }
            />
          </Col>
          <Col xs={8} sm={8} md={8} lg={8} >
            <Row>
              <Table selectable={ false }>
                <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
                  <TableRow>
                    <TableHeaderColumn>#</TableHeaderColumn>
                    <TableHeaderColumn>Field Value</TableHeaderColumn>
                    <TableHeaderColumn>Field Name</TableHeaderColumn>
                    <TableHeaderColumn>Parent Id</TableHeaderColumn>
                    <TableHeaderColumn>Created On</TableHeaderColumn>
                    <TableHeaderColumn>Action</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody selectable={ false } displayRowCheckbox={ false }>
                  {
                    this.state.taxonomyValues.map((taxValue, index) => {
                      var pId;
                      if (this.state.taxonomyOrder === 1) {
                        pId = "Root";
                      } else {
                        pId = taxValue.parentId;
                      }
                      return (
                        <TableRow key={ index }>
                          <TableRowColumn>{ index + 1 }</TableRowColumn>
                          <TableRowColumn>{ taxValue.fieldValue }</TableRowColumn>
                          <TableRowColumn>{ taxValue.fieldName }</TableRowColumn>
                          <TableRowColumn>{ pId }</TableRowColumn>
                          <TableRowColumn>{ taxValue.createdAt }</TableRowColumn>
                          <TableRowColumn>
                            <FlatButton
                              label="Edit/Delete"
                              secondary={ true }
                              onClick={ event => this.handleActionMenu(event, taxValue) }
                              />
                          </TableRowColumn>
                        </TableRow>
                      )
                    })
                  }
                </TableBody>
              </Table>
            </Row>
          </Col>
        </Row>
      </div>
    )
  }
}
