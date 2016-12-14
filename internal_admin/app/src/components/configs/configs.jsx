// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import * as request from 'superagent';
const moment = require('moment');

// Components
import DefaultNavbar from '../navbar/defaultNavbar';
import EditConfigDialog from './dialogs/edit';
import DeleteConfigDialog from './dialogs/delete';
import { companyUrl, projectsUrl, configsUrl, watchersUrl } from '../../config';

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

export default class Configurations extends React.Component {
  constructor() {
    super();

    this.state = {
      companies: [],
      projects: [],
      configs: [],
      companyId: null,
      companyName: null,
      projectId: null,
      projectName: null,
      configSelected: {},
      watchers: [],
      showEditConfigDialog: false,
      showDeleteConfigDialog: false,
      actionMenuOpen: false
    };

    this.fetchCompanies = this.fetchCompanies.bind(this);
    this.handleCloseActionMenu = this.handleCloseActionMenu.bind(this);
    this.handleCreateConfig = this.handleCreateConfig.bind(this);
    this.handleChangeConfig = this.handleChangeConfig.bind(this);
    this.handleDeleteConfig = this.handleDeleteConfig.bind(this);
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
            this.fetchConfigs(firstProject.id);
          } else {
            this.setState({
              configs: []
            });
          }
        }
      });
    }
  }

  fetchConfigs(projectId) {
    if (projectId) {
      let url = configsUrl.replace(':projectId', projectId);
      return request
      .get(url)
      .withCredentials()
      .end((err, res) => {
        if (err) {
          console.error(err);
        } else {
          this.setState({
            configs: res.body,
          });
        }
      });
    }
  }

  handleOpenActionMenu(event) {
    this.setState({
      openActionMenu: true,
    });
  }

  handleCloseActionMenu() {
    this.setState({
      actionMenuOpen: false,
    });
  }

  handleCreateConfig() {
    this.setState({
      actionMenuOpen: false,
      showEditConfigDialog: true,
      configSelected: {},
      watchers: null
    });
  }

  handleChangeConfig() {
    let url = watchersUrl.replace(':configId', this.state.configSelected.id);
    return request
    .get(url)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.setState({
          actionMenuOpen: false,
          showEditConfigDialog: true,
          watchers: res.body
        });
      }
    });
  }

  handleActionMenu(event, config) {
    this.setState({
      actionMenuOpen: true,
      actionMenuTarget: event.currentTarget,
      configSelected: config
    });
  }

  handleEditConfigDialogClose(saved) {
    this.setState({
      showEditConfigDialog: false
    });
    if (saved) {
      this.fetchConfigs(this.state.projectId);
    }
  }

  handleDeleteConfigDialogClose(deleted) {
    this.setState({
      showDeleteConfigDialog: false
    });
    if (deleted) {
      this.fetchConfigs(this.state.projectId);
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
    this.fetchConfigs(projectId);
  }

  handleDeleteConfig() {
    this.setState({
      actionMenuOpen: false,
      showDeleteConfigDialog: true
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
            <MenuItem value="1" primaryText="Settings"
              onClick={ this.handleChangeConfig } />
            <MenuItem value="2" primaryText="Delete"
              onClick={ this.handleDeleteConfig }/>
          </Menu>
        </Popover>
    );
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

  renderDialogs() {
    return(
      <div>
        <EditConfigDialog open={ this.state.showEditConfigDialog }
          title={ (this.state.configSelected.id ? "Change" : "Create") + " Ingestion Configuration" }
          companyId={ this.state.companyId }
          projectId={ this.state.projectId }
          projectName={ this.state.projectName }
          configId={ this.state.configSelected.id }
          fileType={ this.state.configSelected.fileType }
          status={ this.state.configSelected.status }
          description={ this.state.configSelected.description }
          watchers={ this.state.watchers }
          onClose={ (saved) => this.handleEditConfigDialogClose(saved) } />
        <DeleteConfigDialog open={ this.state.showDeleteConfigDialog }
          configId={ this.state.configSelected.id }
          fileType={ this.state.configSelected.fileType }
          onClose={ (deleted) => this.handleDeleteConfigDialogClose(deleted) } />
      </div>
    );
  }

  render() {
    return (
      <div>
        { this.renderDialogs() }
        <Row><DefaultNavbar /></Row>
        <Row>
          <Col xs={0} sm={0} md={1} lg={1} ></Col>
          <Col xs={0} sm={0} md={2} lg={2} >
            <RaisedButton label='Add Configuration' primary={ true } fullWidth={ true }
              onClick={ this.handleCreateConfig }
              disabled={ !this.state.projectId } />
            { this.renderCompanySelectField() }
            { this.renderProjectSelectField() }
            Total Configuration Found
            <Badge
              badgeContent={ this.state.configs.length }
              secondary={ true } />
          </Col>
          <Col xs={8} sm={8} md={8} lg={8} >
            <Row>
              <Table selectable={ false }>
                <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
                  <TableRow>
                    <TableHeaderColumn>#</TableHeaderColumn>
                    <TableHeaderColumn>Company</TableHeaderColumn>
                    <TableHeaderColumn>Work Project</TableHeaderColumn>
                    <TableHeaderColumn>Ingestion Type</TableHeaderColumn>
                    <TableHeaderColumn>Created On</TableHeaderColumn>
                    <TableHeaderColumn>Action</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={ false } selectable={ false }>
                  {
                    this.state.configs.map((config, idx) => {
                      return (
                        <TableRow key={ idx }>
                          <TableRowColumn>{ idx + 1 }</TableRowColumn>
                          <TableRowColumn>{ this.state.companyName }</TableRowColumn>
                          <TableRowColumn>{ this.state.projectName }</TableRowColumn>
                          <TableRowColumn>{ config.fileType }</TableRowColumn>
                          <TableRowColumn>{ moment(config.createdAt).format('YYYY/MM/DD') }</TableRowColumn>
                          <TableRowColumn>
                            <FlatButton
                              label="Action Menu"
                              labelPosition="before"
                              secondary={true}
                              icon={ <MoreVertIcon /> }
                              onTouchTap={ event => this.handleActionMenu(event, config) }
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
