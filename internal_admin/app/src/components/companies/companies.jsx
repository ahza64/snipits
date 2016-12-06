// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import * as request from 'superagent';

// Components
import DefaultNavbar from '../navbar/defaultNavbar';
import CreateCompanyDialog from './create';
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
      search: '',
      dialog: false,
      actionMenuOpen: false
    };

    this.fetchCompanies = this.fetchCompanies.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.isMatchSearchRegex = this.isMatchSearchRegex.bind(this);
    this.handleCloseActionMenu = this.handleCloseActionMenu.bind(this);
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
      dialog: true
    });
  }

  handleDialogCancel() {
    this.setState({
      dialog: false
    });
  }

  handleDialogSubmit(companyName) {
    console.log(companyName);
    this.setState({
      dialog: false
    });
    this.fetchCompanies();
  }

  reformatDate(dateStr) {
    var formated='-';
    try {
      var date=new Date(dateStr);
      var mm = date.getMonth() + 1; // getMonth() is zero-based
      var dd = date.getDate();
      formated = [
        date.getFullYear(),
        (mm>9 ? '' : '0') + mm,
        (dd>9 ? '' : '0') + dd
      ].join('/');
    } catch (err) {
      console.err(err);
    }
    return formated;
  }

  handleCloseActionMenu() {
    this.setState({
      actionMenuOpen: false,
    });
  }

  renderActionMenu() {
    return(
      <Popover
          open={ this.state.actionMenuOpen }
          anchorEl={ this.state.actionMenuTarget }
          anchorOrigin={ { horizontal: 'right', vertical: 'bottom' } }
          targetOrigin={ { horizontal: 'right', vertical: 'top' } }
          onRequestClose={ this.handleCloseActionMenu }
        >
          <Menu>
            <MenuItem value="1" primaryText="Add Work Project" />
            <MenuItem value="2" primaryText="Add Customer User" />
            <MenuItem value="3" primaryText="Add Ingestor" />
          </Menu>
        </Popover>
    );
  }

  handleActionMenu(event) {
    event.preventDefault();
    this.setState({
      actionMenuOpen: true,
      actionMenuTarget: event.currentTarget,
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
              <CreateCompanyDialog open={ this.state.dialog }
                onCancel={ (event) => this.handleDialogCancel(event) }
                onSubmit={ (name) => this.handleDialogSubmit(name) } />
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
                          <TableRowColumn>{ this.reformatDate(company.createdAt) }</TableRowColumn>
                          <TableRowColumn>
                            <FlatButton
                              label="Action Menu"
                              labelPosition="before"
                              secondary={true}
                              icon={ <MoreVertIcon /> }
                              onTouchTap={ event => this.handleActionMenu(event) }
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
