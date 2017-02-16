// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import request from '../../services/request';
import authRedux from '../../reduxes/auth';
import schemaRedux from '../../reduxes/schema';

// Components
import { companyUrl, projectsUrl, activateProjectUrl, deactivateProjectUrl, schemaListUrl, schemaUrl } from '../../config';
import EditIcon from 'material-ui/svg-icons/image/edit'
import Schema from './schema';
import DefaultNavbar from '../navbar/defaultNavbar'
import CreateSchema from './dialogs/createSchema'
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

export default class SchemasLayout extends React.Component {
  constructor() {
    super();

    this.state = {
      schemaList : [],
      projects: [],
      currentProject: null,
      schemaId: null,
      schemaName: null,
      actionMenuTarget: null,
      actionMenuOpen: false,
      createSchemaDialogOpen: false
    }

    this.handleProjectSelectChanged = this.handleProjectSelectChanged.bind(this);
    this.renderActionMenu = this.renderActionMenu.bind(this);
    this.setSchemaList = this.setSchemaList.bind(this);
    this.fetchSchemas = this.fetchSchemas.bind(this);
    this.updateSchemas = this.updateSchemas.bind(this);
    this.renderProjectSelectField = this.renderProjectSelectField.bind(this);
    this.fetchProjects = this.fetchProjects.bind(this);
    this.renderToggle = this.renderToggle.bind(this);
    this.setCurrentProject = this.setCurrentProject.bind(this);
    this.handleEditViewSchema = this.handleEditViewSchema.bind(this);
    this.handleOpenActionMenu = this.handleOpenActionMenu.bind(this);
    this.handleCloseActionMenu = this.handleCloseActionMenu.bind(this);
    this.toggleSchemaStatus = this.toggleSchemaStatus.bind(this);
    this.handleAddSchemaDialogOpen= this.handleAddSchemaDialogOpen.bind(this);
    this.handleAddSchemaDialogClose = this.handleAddSchemaDialogClose.bind(this);
    this.fetchProjects();
    this.updateSchemas();
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

  toggleSchemaStatus(event, schemaId, callback) {
    let url = schemaUrl.replace(':schemaId', schemaId);
    request
    .delete(url)
    .withCredentials()
    .end((err,res) =>{
      if (err) {
        console.error(err);
      } else {
        console.log(res, res.body);
        callback(res.body);
      }
    })
  }

  handleActionMenu(event, schema) {
    this.setState({
      actionMenuOpen: true,
      actionMenuTarget: event.currentTarget,
      schemaId: schema.id,
      schemaName: schema.name
    });
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

  handleEditViewSchema(event){
    event.preventDefault();
    browserHistory.push('/schema/');
  }

  handleOpenActionMenu(event, scheme){
    event.preventDefault();
    schemaRedux.dispatch({
      type:'CHANGE_SCHEMA',
      value: scheme.id
    });
    this.setState({
      actionMenuOpen: true,
      actionMenuTarget: event.currentTarget,
    });
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
    }, this.updateSchemas);
    this.render();
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
        this.setState({
          projects: res.body
        }, this.setState({
          currentProject : res.body[0]
        }));
      }
    });
  }

    setCreateDisable(value){
      this.setState({
        createDisable:value
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
      }, this.updateSchemas);
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
      let url = projectsUrl.replace(':companyId', companyId);
      return request
      .get(url)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err);
        } else {
          this.setState({projects: res.body}, ()=>{
            this.setState({currentProject : this.state.projects[0].id}, this.updateSchemas);
            this.render();
          });
        }
      })
    }

    handleAddSchemaDialogClose(event){
      this.setState({
        createSchemaDialogOpen: false
      })
    }

    handleAddSchemaDialogOpen(event){
      this.setState({
        createSchemaDialogOpen: true
      });
    }

    renderActionMenu(){
      return (
      <Popover
          open={ this.state.actionMenuOpen }
          anchorEl={ this.state.actionMenuTarget }
          anchorOrigin={ { horizontal: 'right', vertical: 'bottom' } }
          targetOrigin={ { horizontal: 'right', vertical: 'top' } }
          onRequestClose={ (event)=>{this.handleCloseActionMenu(event)} } >
          <Menu>
            <MenuItem value="1" primaryText="edit/view"
              onClick={ (event) => this.handleEditViewSchema(event) } />
          </Menu>
        </Popover>
      )
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
          <Col xs={0} sm={0} md={1} lg={1} ></Col>
          <Col xs={0} sm={0} md={2} lg={2} >
            { this.renderProjectSelectField() }
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
            <CreateSchema
              open={ this.state.createSchemaDialogOpen }
              onClose={(event) => {this.handleAddSchemaDialogClose(event)}}
              schemas= { this.state.schemaList }
              currentProject={ this.state.currentProject }
              />
          </Col>
          <Col xs={8} sm={8} md={8} lg={8} >
            <Row>
          <Table selectable={ false }>
            <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
              <TableRow>
                <TableHeaderColumn>id</TableHeaderColumn>
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
                this.state.schemaList.map((scheme, idx) => {
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
                          label="Menu"
                          labelPosition="before"
                          secondary={true}
                          onTouchTap={(event) => this.handleOpenActionMenu(event, scheme)}
                          icon={ <MoreVertIcon /> }
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
      { this.renderActionMenu() }
      </div>
    );
  }
}
