// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import * as request from 'superagent';
const moment = require('moment');

// Components
import DefaultNavbar from '../navbar/defaultNavbar';
import CreateCompanyDialog from './create';
import CreateProjectDialog from '../projects/dialogs/create';
import EditUserDialog from '../users/dialogs/edit';
import { companyUrl } from '../../config';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import RaisedButton from 'material-ui/RaisedButton';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import FlatButton from 'material-ui/FlatButton';
import IconMenu from 'material-ui/IconMenu';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

export default class Companies extends React.Component {
  constructor() {
    super();

    this.state = {
      companies: [],
      companyId: null,
      companyName: null,
      search: '',
      showAddCompanyDialog: false,
      showAddProjectDialog: false,
      showAddUserDialog: false,
      actionMenuOpen: false,
      userRole: 'CU'
    };

    this.fetchCompanies = this.fetchCompanies.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.isMatchSearchRegex = this.isMatchSearchRegex.bind(this);
    this.handleCloseActionMenu = this.handleCloseActionMenu.bind(this);
    this.handleAddProjectDialogClose = this.handleAddProjectDialogClose.bind(this);
    this.handleAddCompanyDialogClose = this.handleAddCompanyDialogClose.bind(this);
    this.handleAddProject = this.handleAddProject.bind(this);
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
        this.setState({ companies: res.body });
      }
    });
  }

  handleSearch(event, value) {
    this.setState({ search: value });
  }

  isMatchSearchRegex(companyName) {
    var search = this.state.search;
    if (!search) {
      return true;
    }
    var regexp = new RegExp(search, 'i');
    return companyName.match(regexp);
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

  handleAddUser(role) {
    this.setState({
      actionMenuOpen: false,
      showAddUserDialog: true,
      userRole: role,
      addUserDialogTitle: (role === 'CU') ? 'Create Customer User' : 'Create Ingestor'
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
            <MenuItem value="1" primaryText="Add Work Project"
              onClick={ this.handleAddProject } />
            <MenuItem value="2" primaryText="Add Customer User"
              onClick={(event) => this.handleAddUser("CU") } />
            <MenuItem value="3" primaryText="Add Ingestor"
              onClick={(event) => this.handleAddUser("DI") } />
          </Menu>
        </Popover>
    );
  }

  handleActionMenu(event, company) {
    event.preventDefault();
    this.setState({
      actionMenuOpen: true,
      actionMenuTarget: event.currentTarget,
      companyId: company.id,
      companyName: company.name
    });
  }

  handleAddProjectDialogClose(saved) {
    this.setState({
      showAddProjectDialog: false
    });
  }

  handleAddUserDialogClose(saved) {
    this.setState({
      showAddUserDialog: false
    });
  }

  render() {
    var companies = this.state.companies;
    companies = companies.filter(x => {
      return this.isMatchSearchRegex(x.name);
    });

    return (
      <div>
        <Row><DefaultNavbar /></Row>
        <Row>
          <Col xs={0} sm={0} md={2} lg={2} ></Col>
          <Col xs={8} sm={8} md={8} lg={8} >
            <Row>
              <RaisedButton label='Add company' primary={ true }
                onClick={ (event) => this.handleAddCompanyClick(event) }/>
              <CreateCompanyDialog open={ this.state.showAddCompanyDialog }
                onClose={ (saved) => this.handleAddCompanyDialogClose(saved) } />
              <CreateProjectDialog open={ this.state.showAddProjectDialog }
                companyId={ this.state.companyId } companyName={ this.state.companyName }
                onClose={ (saved) => this.handleAddProjectDialogClose(saved) } />
              <EditUserDialog open={ this.state.showAddUserDialog }
                title={ this.state.addUserDialogTitle }
                companies={ this.state.companies }
                user={ { companyId: this.state.companyId, role: this.state.userRole} }
                onClose={ (saved) => this.handleAddUserDialogClose(saved) } />
              <TextField
                  hintText='Search companies ... '
                  fullWidth={ true }
                  value={ this.state.search }
                  onChange={ this.handleSearch }
                />
            </Row>
            <Row>
              <Table selectable={ false }>
                <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
                  <TableRow>
                    <TableHeaderColumn>#</TableHeaderColumn>
                    <TableHeaderColumn>Company Name</TableHeaderColumn>
                    <TableHeaderColumn>Created On</TableHeaderColumn>
                    <TableHeaderColumn>Action</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={ false } selectable={ false }>
                  {
                    companies.map((company, idx) => {
                      return (
                        <TableRow key={ idx }>
                          <TableRowColumn>{ idx + 1 }</TableRowColumn>
                          <TableRowColumn>{ company.name }</TableRowColumn>
                          <TableRowColumn>{ moment(company.createdAt).format('YYYY/MM/DD') }</TableRowColumn>
                          <TableRowColumn>
                            <FlatButton
                              label="Action Menu"
                              labelPosition="before"
                              secondary={true}
                              icon={ <MoreVertIcon /> }
                              onTouchTap={ event => this.handleActionMenu(event, company) }
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
