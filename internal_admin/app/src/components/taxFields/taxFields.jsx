
import React from 'react';
import request from '../../services/request';

import DefaultNavbar from '../navbar/defaultNavbar';
import Taxonomy from '../taxonomy/taxonomy'
import { companyUrl, projectsUrl, schemaListUrl, taxonomiesUrl, taxFieldsUrl } from '../../config';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Badge from 'material-ui/Badge';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';





export default class TaxFields extends React.Component {

  constructor() {
    super();
    this.state = {
      companies: [],
      projects: [],
      schemas: [],
      taxonomies: [],
      taxonomyValues: [],
      companyId: null,
      companyName: null,
      projectId: null,
      projectName: null,
      schemaId: null,
      schemaName: null,
      taxonomyId: null,
      taxonomyName: null,
      taxonomySelected: {},
      showEditTaxonomyDialog: false,
      actionMenuOpen: false,
      showDeleteTaxonomyDialog: false
    };

    this.fetchCompanies = this.fetchCompanies.bind(this);
    // this.handleCreateTaxonomy = this.handleCreateTaxonomy.bind(this);
    // this.handleEditChangeTax = this.handleEditChangeTax.bind(this);
    // this.handleEditDeleteTax = this.handleEditDeleteTax.bind(this);
    // this.handleCloseEditMenu = this.handleCloseEditMenu.bind(this);
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
          var firstTax = (res.body.length > 0) ? res.body[0] : null;
          this.setState({
            taxonomies: res.body,
            taxonomyId: firstTax ? firstTax.id : null,
            taxonomyName: firstTax ? firstTax.fieldName : null
          });
          console.log("============ taxonomies", res.body);
          if(firstTax) {
            this.fetchTaxValues(firstTax.fieldName);
          }
        }
      });
    }
  }

  fetchTaxValues(taxFieldName) {
    console.log("fetch tax values name", taxFieldsUrl);
    if (taxFieldName) {
      let url = taxFieldsUrl + '/' + taxFieldName;
      return request
      .get(url)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err);
        } else {
          this.setState({
            taxonomyValues: res.body
          });
          console.log("taxonomyValues", res.body);
        }
      });
    }
  }

  renderCompanySelectField() {
    return(
      <SelectField
        floatingLabelText="Company"
        fullWidth={true}
        value={ this.state.companyId }
        onChange={ (event, index, value) => this.handleCompanySelectChanged(event, value) } >
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
        onChange={ (event, index, value) => this.handleProjectSelectChanged(event, value) } >
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
        onChange={ (event, index, value) => this.handleSchemaSelectChanged(event, value) } >
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
        onChange={ (event, index, value) => this.handleSchemaSelectChanged(event, value) } >
        { this.state.taxonomies.map((taxonomy, idx) => {
            return(
              <MenuItem key={ idx } value={ taxonomy.id } primaryText={ taxonomy.fieldName } />
            );
          })
        }
      </SelectField>
    );
  }

  render(){
    return(
      <div>
        <Row><DefaultNavbar/></Row>
        <Row>
          <Col xs={0} sm={0} md={1} lg={1} ></Col>
          <Col xs={0} sm={0} md={2} lg={2} >
            { this.renderCompanySelectField() }
            { this.renderProjectSelectField() }
            { this.renderSchemaSelectField() }
            { this.renderTaxonomySelectField() }
            <div>
              Total Taxonomy Field Values Found
            </div>
            <Badge
              badgeContent={ this.state.taxonomyValues.length }
              secondary={ true }
              />
            <RaisedButton
              label='Add Field Value'
              primary={ true }
              fullWidth={ true }
              onClick={ this.handleCreateTaxonomy }
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
                      return (
                        <TableRow key={ index }>
                          <TableRowColumn>{ index + 1 }</TableRowColumn>
                          <TableRowColumn>{ taxValue.fieldValue }</TableRowColumn>
                          <TableRowColumn>{ taxValue.fieldName }</TableRowColumn>
                          <TableRowColumn>{ taxValue.parentId }</TableRowColumn>
                          <TableRowColumn>{ taxValue.createdAt }</TableRowColumn>
                          <TableRowColumn>Action</TableRowColumn>
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
