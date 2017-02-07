// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import request from '../../services/request';
import authRedux from '../../reduxes/auth';
import projectRedux from '../../reduxes/project';
// Components
import { companyUrl, projectsUrl, activateProjectUrl, deactivateProjectUrl, qowsUrl } from '../../config';
import EditIcon from 'material-ui/svg-icons/image/edit'
import Schema from './schema';
import DefaultNavbar from '../navbar/defaultNavbar'
// Styles
import TextField from 'material-ui/TextField';
import Badge from 'material-ui/Badge';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

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
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.setSchemas = this.setSchemas.bind(this);
    this.fetchSchemas = this.fetchSchemas.bind(this);
    this.updateSchemas = this.updateSchemas.bind(this);
    this.renderProjectSelectField = this.renderProjectSelectField.bind(this);
    this.fetchProjects = this.fetchProjects.bind(this);
    this.componentWillUpdate = this.componentWillUpdate.bind(this);
    this.setCurrentProject = this.setCurrentProject.bind(this);

    this.fetchProjects();
    this.updateSchemas();
  }

  componentWillMount(){
    if (this.state.projects.length > 0) {
      this.setCurrentProject(this.state.projects[0].id);
    }
  }

  componentDidMount(){
    if(this.state.projects.length > 0){
      console.log('set currentProject');
      this.setState({
        currentProject : this.state.projects[0]
      })
    }
  }

  componentWillUpdate(nextProps, nextState) {
    console.log('nextState', nextState);

  }

  setSchemas(list){
    this.setState({
      schemaList : list
    })
  }

  setCurrentProject(projectId){
    this.setState({
      currentProject : projectId
    })
  }

  fetchSchemas(callback){
    console.log('========fetchSchemas for proj#', this.state.currentProject);
    request
    .get('http://localhost:3335/schemas/' + this.state.currentProject)
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

  renderProjectSelectField(){
    return(
      <SelectField
        floatingLabelText="Project"
        fullWidth={ true }
        value={ this.state.currentProject }
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

  render() {
    return (
      <div>
        <Row> <DefaultNavbar /> </Row>
        <Row>
          <Col xs={0} sm={0} md={1} lg={1} ></Col>
          <Col xs={0} sm={0} md={2} lg={2} >

            { this.renderProjectSelectField() }

            Total Work Projects Found
            <Badge
              badgeContent={ this.state.projects.length }
              secondary={ true }
            />
          </Col>
          <Col xs={8} sm={8} md={8} lg={8} >
            <Row>
          Here are your schemas
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
