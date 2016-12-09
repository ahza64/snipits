// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import * as request from 'superagent';
const moment = require('moment');

// Components
import DefaultNavbar from '../navbar/defaultNavbar';
import CreateProjectDialog from './dialogs/create';
import DeleteProjectDialog from './dialogs/delete';
import { companyUrl, projectsUrl, activateProjectUrl, deactivateProjectUrl } from '../../config';

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

// Constants
const STATUS_ACTIVE = 'active';
const STATUS_INACTIVE = 'inactive';

export default class Projects extends React.Component {
  constructor() {
    super();

    this.state = {
      companies: [],
      projects: [],
      projectsFiltered: [],
      companyId: null,
      companyName: null,
      search: '',
      showAddProjectDialog: false,
      showDeleteProjectDialog: false,
      actionMenuOpen: false
    };

    this.fetchCompanies = this.fetchCompanies.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleCloseActionMenu = this.handleCloseActionMenu.bind(this);
    this.handleAddProjectDialogClose = this.handleAddProjectDialogClose.bind(this);
    this.handleAddCompanyDialogClose = this.handleAddCompanyDialogClose.bind(this);
    this.handleAddProject = this.handleAddProject.bind(this);
    this.handleDeleteProject = this.handleDeleteProject.bind(this);
  }

  componentWillMount() {
    this.fetchCompanies(true);
  }

  componentWillUpdate(nextProps, nextState) {
    // Projects filter
    if ((nextState.projects !== this.state.projects) ||
      (nextState.search !== this.state.search)){
        var regexp = new RegExp(nextState.search, 'i');
        var filtered = nextState.projects.filter(p => {
          return (!nextState.search) || (p.name.match(regexp));
        });
        this.setState({
          projectsFiltered: filtered
        });
    }
  }

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
          this.setState({
            projects: res.body
          });
        }
      });
    }
  }

  handleSearch(event, value) {
    this.setState({
      search: value,
    });
  }

  handleOpenActionMenu(event) {
    this.setState({
      openActionMenu: true,
    });
  }

  handleAddCompanyClick(event) {
    this.setState({
      showAddCompanyDialog: true
    });
  }

  handleAddCompanyDialogClose(saved) {
    this.setState({
      showAddCompanyDialog: false
    });
    if (saved) {
      this.fetchCompanies();
    }
  }

  handleCloseActionMenu() {
    this.setState({
      actionMenuOpen: false,
    });
  }

  handleAddProject() {
    this.setState({
      actionMenuOpen: false,
      showAddProjectDialog: true
    });
  }

  handleActionMenu(event, project) {
    this.setState({
      actionMenuOpen: true,
      actionMenuTarget: event.currentTarget,
      projectId: project.id,
      projectName: project.name
    });
  }

  handleAddProjectDialogClose(saved) {
    this.setState({
      showAddProjectDialog: false
    });
    if (saved) {
      this.fetchProjects(this.state.companyId);
    }
  }

  handleDeleteProjectDialogClose(deleted) {
    this.setState({
      showDeleteProjectDialog: false
    });
    if (deleted) {
      this.fetchProjects(this.state.companyId);
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

  updateProjectStatus(id, status) {
    var projects = this.state.projects.map(p => {
      if (p.id === id) {
        p.status = status;
        return p;
      } else {
        return p;
      }
    });
    this.setState({
      projects: projects
    });
  }

  toggleProjectStatus(event, active, project) {
    var url;
    if(active) {
      url = activateProjectUrl.replace(':id', project.id);
    } else {
      url = deactivateProjectUrl.replace(':id', project.id);
    }

    return request
    .put(url)
    .withCredentials()
    .end(err => {
      if(err) {
        console.error(err);
      } else {
        console.log('Project',project.name,'is', active ? 'activated.' : 'deactivated.');
        this.updateProjectStatus(project.id, active ? STATUS_ACTIVE: STATUS_INACTIVE);
      }
    });
  }

  handleDeleteProject() {
    this.setState({
      actionMenuOpen: false,
      showDeleteProjectDialog: true
    });
  }

  renderActionMenu() {
    return(
      <Popover
          open={ this.state.actionMenuOpen }
          anchorEl={ this.state.actionMenuTarget }
          anchorOrigin={ { horizontal: 'right', vertical: 'bottom' } }
          targetOrigin={ { horizontal: 'right', vertical: 'top' } }
          onRequestClose={ this.handleCloseActionMenu } >
          <Menu>
            <MenuItem value="1" primaryText="Add Igestion Config" />
            <MenuItem value="2" primaryText="Delete Work Project"
              onClick={ this.handleDeleteProject } />
          </Menu>
        </Popover>
    );
  }

  renderCompanySelectField() {
    return(
      <SelectField
        floatingLabelText="Company"
        value={this.state.value}
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

  renderToggle(project) {
    return (
      <Toggle
        style={ { marginRight: '50px' } }
        defaultToggled={ project.status === STATUS_ACTIVE }
        onToggle={ (event, active) => this.toggleProjectStatus(event, active, project) }
      />
    );
  }

  render() {
    return (
      <div>
        <CreateProjectDialog open={ this.state.showAddProjectDialog }
          companyId={ this.state.companyId } companyName={ this.state.companyName }
          onClose={ (saved) => this.handleAddProjectDialogClose(saved) } />
        <DeleteProjectDialog open={ this.state.showDeleteProjectDialog }
          projectId={ this.state.projectId } projectName={ this.state.projectName }
          onClose={ (deleted) => this.handleDeleteProjectDialogClose(deleted) } />
        <Row><DefaultNavbar /></Row>
        <Row>
          <Col xs={0} sm={0} md={1} lg={1} ></Col>
          <Col xs={0} sm={0} md={2} lg={2} >
            <RaisedButton label='Add Work Project' primary={ true } fullWidth={ true }
              onClick={ this.handleAddProject } />
            { this.renderCompanySelectField() }
            <TextField
                hintText='Search By Project ... '
                fullWidth={ true }
                value={ this.state.search }
                onChange={ this.handleSearch }
              />
            Total Work Projects Found
            <Badge
              badgeContent={ this.state.projectsFiltered.length }
              secondary={ true }
            />
          </Col>
          <Col xs={8} sm={8} md={8} lg={8} >
            <Row>
              <Table selectable={ false }>
                <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
                  <TableRow>
                    <TableHeaderColumn>#</TableHeaderColumn>
                    <TableHeaderColumn>Work Project</TableHeaderColumn>
                    <TableHeaderColumn>Active</TableHeaderColumn>
                    <TableHeaderColumn>Created On</TableHeaderColumn>
                    <TableHeaderColumn>Action</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={ false } selectable={ false }>
                  {
                    this.state.projectsFiltered.map((project, idx) => {
                      return (
                        <TableRow key={ idx }>
                          <TableRowColumn>{ idx + 1 }</TableRowColumn>
                          <TableRowColumn>{ project.name }</TableRowColumn>
                          <TableRowColumn>{ this.renderToggle(project) }</TableRowColumn>
                          <TableRowColumn>{ moment(project.createdAt).format('YYYY/MM/DD') }</TableRowColumn>
                          <TableRowColumn>
                            <FlatButton
                              label="Action Menu"
                              labelPosition="before"
                              secondary={true}
                              icon={ <MoreVertIcon /> }
                              onTouchTap={ event => this.handleActionMenu(event, project) }
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
