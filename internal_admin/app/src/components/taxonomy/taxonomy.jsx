// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import request from '../../services/request';
const moment = require('moment');

// Components
import DefaultNavbar from '../navbar/defaultNavbar';
import EditTaxonomyDialog from './dialogs/edit';
import { companyUrl, projectsUrl, schemaListUrl, taxonomiesUrl } from '../../config';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import SelectField from 'material-ui/SelectField';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import IconMenu from 'material-ui/IconMenu';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Toggle from 'material-ui/Toggle';
import Badge from 'material-ui/Badge';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import '../../../styles/header.scss';



export default class Taxonomy extends React.Component {
  constructor() {
    super();
    this.state = {
      companies: [],
      projects: [],
      schemas: [],
      taxonomies: [],
      companyId: null,
      companyName: null,
      projectId: null,
      projectName: null,
      schemaId: null,
      schemaName: null,
      taxonomySelected: {},
      showEditTaxonomyDialog: false,
      actionMenuOpen: false
    };

    this.fetchCompanies = this.fetchCompanies.bind(this);
    this.handleCreateTaxonomy = this.handleCreateTaxonomy.bind(this);
    this.handleEditChangeTax = this.handleEditChangeTax.bind(this);
    this.handleEditDeleteTax = this.handleEditDeleteTax.bind(this);
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
          console.log("..............", this.state.schemas);
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
    console.log("************ schemaId", schemaId);
    if (schemaId) {
      let url = taxonomiesUrl + '/' + schemaId;
      return request
      .get(url)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err);
        } else {
          this.setState({
            taxonomies: res.body,
          });
          console.log("============ taxonomies", res.body);
        }
      });
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

  handleSchemaSelectChanged(event, projectId) {
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

  handleCreateTaxonomy() {
    this.setState({
      showEditTaxonomyDialog: true
    });
  }

  handleEditTaxonomyDialogClose() {
    this.setState({
      showEditTaxonomyDialog: false
    });
    this.fetchTaxonomies(this.state.schemaId);
  }

  handleActionMenu(event, taxonomy) {
    this.setState({
      actionMenuOpen: true,
      actionMenuTarget: event.currentTarget,
      taxonomySelected: taxonomy
    });
    console.log("action menu selected tax", this.state.actionMenuOpen);
  }

  handleEditChangeTax() {
    console.log("handleEditChangeTax");
  }

  handleEditDeleteTax() {
    console.log("handleEditDeleteTax");
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

  renderEditMenu() {
    return(
      <Popover
        open={ this.state.actionMenuOpen }
        anchorEl={ this.state.actionMenuTarget }
        anchorOrigin={ { horizontal: 'right', vertical: 'bottom' } }
        targetOrigin={ { horizontal: 'right', vertical: 'top' } }
        >
        <Menu>
          <MenuItem
            value="1"
            primaryText="Edit Taxonomy"
            onClick={ this.handleEditChangeTax }
            />
          <MenuItem
            value="2"
            primaryText="Delete Taxonomy"
            onClick={ this.handleEditDeleteTax}
            />
        </Menu>
      </Popover>
    )
  }

//TODO pass selectedTax as props to dialog
  renderDialogs() {
    return (
      <div>
        <EditTaxonomyDialog
          open={ this.state.showEditTaxonomyDialog }
          title={ (this.state.taxonomySelected.id ? "Edit" : "Create") + " Taxonomy"}
          companyId={ this.state.companyId }
          companyName={ this.state.companyName }
          projectId={ this.state.projectId }
          projectName={ this.state.projectName }
          schemaId={ this.state.schemaId }
          schemaName={ this.state.schemaName }
          onClose={ (saved) => this.handleEditTaxonomyDialogClose(saved) } />
      </div>
    );
  }

  render() {
    return (
      <div>
        { this.renderDialogs() }
        <Row> <DefaultNavbar /> </Row>
        <Row>
          <Col xs={0} sm={0} md={1} lg={1} ></Col>
          <Col xs={0} sm={0} md={2} lg={2} >
            <RaisedButton
              label='Add Taxonomy'
              primary={ true }
              fullWidth={ true }
              onClick={ this.handleCreateTaxonomy } />
            { this.renderCompanySelectField() }
            { this.renderProjectSelectField() }
            { this.renderSchemaSelectField() }
            <div>
              Total Taxonomy Fields Found
            </div>
            <Badge
              badgeContent={ this.state.taxonomies.length }
              secondary={ true }/>
          </Col>
          <Col xs={8} sm={8} md={8} lg={8} >
            <Row>
              <Table selectable={ false }>
                <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
                  <TableRow>
                    <TableHeaderColumn>#</TableHeaderColumn>
                    <TableHeaderColumn>Field Name</TableHeaderColumn>
                    <TableHeaderColumn>Created On</TableHeaderColumn>
                    <TableHeaderColumn className='header-pos'>Order</TableHeaderColumn>
                    <TableHeaderColumn>Node Type</TableHeaderColumn>
                    <TableHeaderColumn>Keys</TableHeaderColumn>
                    <TableHeaderColumn>Action</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody selectable={ false } displayRowCheckbox={ false }>
                    {
                      this.state.taxonomies.map((taxonomy, index) => {
                        return (
                          <TableRow key={ index }>
                              <TableRowColumn>{ index + 1 }</TableRowColumn>
                              <TableRowColumn>{ taxonomy.fieldName }</TableRowColumn>
                              <TableRowColumn>{ taxonomy.createdAt }</TableRowColumn>
                              <TableRowColumn>{ taxonomy.order }</TableRowColumn>
                              <TableRowColumn>{ taxonomy.nodeType }</TableRowColumn>
                              <TableRowColumn>{ taxonomy.keys }</TableRowColumn>
                              <TableRowColumn>
                                <FlatButton
                                  label="Edit"
                                  labelPosition="before"
                                  secondary={ true }
                                  onTouchTap={ event => this.handleActionMenu(event, taxonomy)}
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
        { this.renderEditMenu() }
      </div>
    );
  }
}
