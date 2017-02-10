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
// Styles

import CreateSchema from './dialogs/createSchema'

import TextField from 'material-ui/TextField';
import Badge from 'material-ui/Badge';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
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
      currentProject: null
    }

    this.handleProjectSelectChanged = this.handleProjectSelectChanged.bind(this);
    this.renderActionMenu = this.renderActionMenu.bind(this);
    this.setSchemas = this.setSchemas.bind(this);
    this.fetchSchemas = this.fetchSchemas.bind(this);
    this.updateSchemas = this.updateSchemas.bind(this);
    this.renderProjectSelectField = this.renderProjectSelectField.bind(this);
    this.fetchProjects = this.fetchProjects.bind(this);
    this.componentWillUpdate = this.componentWillUpdate.bind(this);
    this.setCurrentProject = this.setCurrentProject.bind(this);
    this.handleEditViewSchema = this.handleEditViewSchema.bind(this);
    this.addSchema = this.addSchema.bind(this);
    this.setDialog = this.setDialog.bind(this);
    this.setCreateDisable = this.setCreateDisable.bind(this)

    this.fetchProjects();
    this.updateSchemas();
  }

  componentWillMount(){

  }

  componentDidMount(){
    if(this.state.projects.length > 0){
      this.setState({
        currentProject : this.state.projects[0]
      })
    }
  }

  componentWillUpdate(nextProps, nextState) {

  }

  setSchemas(list){
    this.setState({
      schemaList : list
    })
  }

  setDialog(){
    var open = this.state.open;
    this.setState({open : ~open});
  }


  setCurrentProject(projectId){
    this.setState({
      currentProject : projectId
    })
  }

  handleEditViewSchema(event, schemeId){
    event.preventDefault();
    schemaRedux.dispatch({
      type:'CHANGE_SCHEMA',
      value: schemeId
    });
    browserHistory.push('/schema/');
  }

  handleOpenActionMenu(event, schemeId){
    event.preventDefault();
    schemaRedux.dispatch({
      type:'CHANGE_SCHEMA',
      value: schemeId
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
    this.fetchSchemas( res =>{
      this.setSchemas(res.body);
    });
  }

  handleProjectSelectChanged(event, project){
    this.setState({
      currentProject : project
    }, this.updateSchemas);
    this.render();
  }

  addSchema(name){
    var newSchema = {
      name: name
    };

    let url = schemaListUrl.replace(':projectId', this.state.currentProject);
    console.log("*****************", this.state.schemaList.length);
    request
    .put(url)
    .send(newSchema)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error("this err", err);
      } else{
        console.log(res);
      }

    })
  }

  setCreateDisable(value){
    this.setState({createDisable:value});
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
      this.setState({createDisable:value});
    }

    renderActionMenu(){
      return(
      <Popover
          open={ this.state.actionMenuOpen }
          anchorEl={ this.state.actionMenuTarget }
          anchorOrigin={ { horizontal: 'right', vertical: 'bottom' } }
          targetOrigin={ { horizontal: 'right', vertical: 'top' } }
          onRequestClose={ this.handleCloseActionMenu } >
          <Menu>
            <MenuItem value="1" primaryText="Add Ingestion Config"
              onClick={ this.handleCreateConfig } />
            <MenuItem value="2" primaryText="Delete Work Project"
              onClick={ this.handleDeleteProject } />
            <MenuItem value="3" primaryText="See QOWs"
            onClick={ this.goToQOWSchemas } />
          </Menu>
        </Popover>
      )
    }

    handleProjectSelectChanged(event, project){
      this.setState({
        currentProject : project,
        newSchema : false
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
        }
        else {
          this.setState({projects: res.body}, ()=>{
            this.setState({currentProject : this.state.projects[0].id}, this.updateSchemas);
            this.render();
          });
        }
      })
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
            <br></br><br></br>
            <CreateSchema
              open={this.state.open}
              setDialog = {this.setDialog}
              newSchema = {this.state.newSchema}
              createDisable = {this.state.createDisable}
              setCreateDisable = {this.setCreateDisable}
              schemas = {this.state.schemaList}
              addSchema = {this.addSchema}
              />
          </Col>
          <Col xs={8} sm={8} md={8} lg={8} >
            <Row>
          <Table selectable={ false }>
            <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
              <TableRow>
                <TableHeaderColumn>id</TableHeaderColumn>
                <TableHeaderColumn>Name</TableHeaderColumn>
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
                      <TableRowColumn>{ scheme.version }</TableRowColumn>
                      <TableRowColumn>{ scheme.createdAt }</TableRowColumn>
                      <TableRowColumn>{ scheme.updatedAt }</TableRowColumn>
                      <TableRowColumn>
                        <FlatButton
                          label="Edit/View"
                          labelPosition="before"
                          secondary={true}
                          onTouchTap={(event) => this.handleEditViewSchema(event, scheme.id)}
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
