// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import request from '../../services/request';
import authRedux from '../../reduxes/auth';
import schemaRedux from '../../reduxes/schema';

// Components
import { companyUrl, projectsUrl, activateProjectUrl, deactivateProjectUrl, schemaListUrl, schemaUrl } from '../../config';
import Schema from './schema';
import DefaultNavbar from '../navbar/defaultNavbar'
import CreateSchemaDialog from './dialogs/createSchemaDialog'
import TextField from 'material-ui/TextField';
import Badge from 'material-ui/Badge';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import EditIcon from 'material-ui/svg-icons/image/edit'
import Checkbox from 'material-ui/Checkbox'

export default class SchemasLayout extends React.Component {
  constructor() {
    super();

    this.state = {
      companies: [],
      companyName: null,
      companyId: null,
      schemaList : [],
      projects: [],
      currentProject: null,
      schemaId: null,
      schemaName: null,
      createSchemaDialogOpen: false,
      showInactiveSchemas: true
    }
    this.fetchCompanies = this.fetchCompanies.bind(this);
    this.handleCompanySelectChanged = this.handleCompanySelectChanged.bind(this);
    this.fetchProjects = this.fetchProjects.bind(this);
    this.handleProjectSelectChanged = this.handleProjectSelectChanged.bind(this);
    this.setCurrentProject = this.setCurrentProject.bind(this);
    this.setSchemaList = this.setSchemaList.bind(this);
    this.updateSchemas = this.updateSchemas.bind(this);
    this.fetchSchemas = this.fetchSchemas.bind(this);
    this.handleEditViewSchema = this.handleEditViewSchema.bind(this);
    this.handleShowInactiveSchemas= this.handleShowInactiveSchemas.bind(this);
    this.toggleSchemaStatus = this.toggleSchemaStatus.bind(this);

    this.handleAddSchemaDialogOpen= this.handleAddSchemaDialogOpen.bind(this);
    this.handleAddSchemaDialogClose = this.handleAddSchemaDialogClose.bind(this);

    this.renderToggle = this.renderToggle.bind(this);
    this.renderProjectSelectField = this.renderProjectSelectField.bind(this);
    this.renderCompanySelectField= this.renderCompanySelectField.bind(this);

    this.fetchCompanies();
  }

  renderToggle(schema) {
    return (
      <Toggle
        style={ { marginRight: '50px' } }
        defaultToggled={ schema.status }
        onToggle={ (event) => this.toggleSchemaStatus(event, schema.id) }
      />
    );
  }

  handleCompanySelectChanged(event, companyId) {
    let companies = this.state.companies.filter(c => {
      return c.id == companyId;
    });
    let companyName = (companies.length > 0) ? companies[0].name : null;
    this.setState({
      companyId: companyId,
      companyName: companyName
    }, ()=>
    this.fetchProjects(this.state.companyId)
  )}

  fetchCompanies(loadProjects) {
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
        }, () => this.fetchProjects(this.state.companyId))
      }
    });
  }

  toggleSchemaStatus(event, schemaId) {
    let url = schemaUrl.replace(':schemaId', schemaId);
    request
    .delete(url)
    .withCredentials()
    .end((err,res) =>{
      if (err) {
        console.error(err);
      } else {
        console.log(res, res.body);
        this.updateSchemas();
      }
    })
  }

  setSchemaList(list){
    this.setState({
      schemaList : list
    })
  }

  setCurrentProject(projectId){
    this.setState({
      currentProject : projectId
    })
  }

  handleEditViewSchema(event, scheme){
    event.preventDefault();
    schemaRedux.dispatch({
      type:'CHANGE_SCHEMA',
      schema: scheme.id
    });
    browserHistory.push('/schema/');
  }

  fetchSchemas(callback){
    let url = schemaListUrl.replace(':projectId', this.state.currentProject);
    request
    .get(url)
    .withCredentials()
    .end(function (err, res) {
      if (err) {
        console.error(err);
      } else {
        callback(res)
      }
      return res;
    })
  }

  updateSchemas(){
    this.fetchSchemas( res => {
      this.setSchemaList(res.body);
    });
  }

  handleProjectSelectChanged(event, project){
    this.setState({
      currentProject : project
    }, () => this.updateSchemas());
  }


  fetchProjects(companyId, callback) {
    let url = projectsUrl.replace(':companyId', companyId);
    return request
    .get(url)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        try{
        this.setState({
          projects: res.body
        }, () => {
            this.setState({
              currentProject : res.body[0]
            });
          });
        } catch(e){
          console.error("error",e)
        }
      }
    });
  }

    handleCloseActionMenu(event){
      this.setState({
        actionMenuOpen: false,
        actionMenuTarget: null
      });
    }

    handleProjectSelectChanged(event, project){
      this.setState({
        currentProject : project,
        newSchema : false
      }, ()=> this.updateSchemas());
      this.render();
    }

    removeSchema(callback){
      let url = schemaUrl.replace(':schemaId', schemaRedux.getState());
      request
      .delete(url)
      .withCredentials()
      .end((err,res) =>{
        if (err) {
          console.error(err);
        } else {
          console.log(res, res.body);
        }
      })
    }

    fetchProjects(companyId, callback) {
      if (!companyId) return;
      let url = projectsUrl.replace(':companyId', companyId);
      return request
      .get(url)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err);
        } else {
          console.log("projects", res);
          this.setState({projects: res.body}, ()=>{
            this.setState({
              currentProject : this.state.projects[0].id
            },()=>{
              this.updateSchemas();
            });
          });
        }
      })
    }

    handleAddSchemaDialogClose(event){
      this.setState({
        createSchemaDialogOpen: false
      }, () => this.updateSchemas())
    }

    handleAddSchemaDialogOpen(event){
      this.setState({
        createSchemaDialogOpen: true
      });
    }

    handleShowInactiveSchemas(event, isChecked){
      this.setState({
        showInactiveSchemas : isChecked
      })
    }

    renderCompanySelectField() {
      return(
        <SelectField
          floatingLabelText="Company"
          fullWidth={ true }
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

    renderProjectSelectField(){
      return(
        <SelectField
          floatingLabelText="Project"
          fullWidth={ true }
          hintText="Select Work Project"
          value={ this.state.currentProject }
          onChange={ (event, index, value) => this.handleProjectSelectChanged(event, value) } >
          { this.state.projects.map((project, idx) => {
            return(
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

  render() {
    return (
      <div>
        <Row> <DefaultNavbar /> </Row>
        <Row>
          <Col xs={0} sm={0} md={1} lg={1} ></Col>
          <Col xs={0} sm={0} md={2} lg={2} >
            { this.renderProjectSelectField() }
            { this.renderCompanySelectField() }
            Total Project Schemas Found
            <Badge
              badgeContent={ this.state.schemaList.length }
              secondary={ true }
            />
          <br></br>
          <br></br>
            <RaisedButton
              label="Add Schema"
              secondary={true}
              onTouchTap={ (event) => {this.handleAddSchemaDialogOpen(event)} }
              />
            <CreateSchemaDialog
              open={ this.state.createSchemaDialogOpen }
              onClose={(event) => {this.handleAddSchemaDialogClose(event)}}
              schemas= { this.state.schemaList }
              currentProject={ this.state.currentProject }
              />
            <Checkbox
              defaultChecked={true}
              onCheck={(event, isChecked) => this.handleShowInactiveSchemas(event, isChecked)}
              label="Show Inactive Schemas"
              labelPosition="left"
              ></Checkbox>
          </Col>
          <Col xs={8} sm={8} md={8} lg={8} >
            <Row>
          <Table selectable={ false }>
            <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
              <TableRow>
                <TableHeaderColumn>#</TableHeaderColumn>
                <TableHeaderColumn>Name</TableHeaderColumn>
                <TableHeaderColumn>Active</TableHeaderColumn>
                <TableHeaderColumn className='header-pos'>Version</TableHeaderColumn>
                <TableHeaderColumn>Created On</TableHeaderColumn>
                <TableHeaderColumn className='header-pos'>Updated On</TableHeaderColumn>
                <TableHeaderColumn> Btn </TableHeaderColumn>
            </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={ false } selectable={ false }>
              {
                this.state.schemaList
                .sort((a,b) => {return a.id - b.id})
                .map((scheme, idx) => {
                  if (!this.state.showInactiveSchemas && !scheme.status){
                    return;
                  }
                  return (
                    <TableRow key={ idx }>
                      <TableRowColumn>{ idx + 1 }</TableRowColumn>
                      <TableRowColumn>{ scheme.name }</TableRowColumn>
                      <TableRowColumn>{ this.renderToggle(scheme) }</TableRowColumn>
                      <TableRowColumn>{ scheme.version }</TableRowColumn>
                      <TableRowColumn>{ scheme.createdAt }</TableRowColumn>
                      <TableRowColumn>{ scheme.updatedAt }</TableRowColumn>
                      <TableRowColumn>
                        <FlatButton
                          label="Edit/View"
                          labelPosition="before"
                          secondary={true}
                          onTouchTap={(event) => this.handleEditViewSchema(event, scheme)}
                          icon={ <EditIcon /> }
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
      <Col xs={0} sm={0} md={2} lg={2} ></Col>
      </Row>
      </div>
    );
  }
}
