// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import * as request from 'superagent';
const _ = require('underscore');

// Components
import DefaultNavbar from '../navbar/defaultNavbar';
import { usersUrl, activateUserUrl, deactivateUserUrl, deleteUserUrl } from '../../config';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import RaisedButton from 'material-ui/RaisedButton';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import Toggle from 'material-ui/Toggle';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

export default class Users extends React.Component {
  constructor() {
    super();

    this.state = {
      users: [],
      search: '',
    };

    this.toggleUserStatus = this.toggleUserStatus.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.fetchUser = this.fetchUser.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.isMatchSearchRegex = this.isMatchSearchRegex.bind(this);
  }

  componentWillMount() {
    this.fetchUser();
  }

  toggleUserStatus(event, active, user) {
    let url;

    if(active) {
      url = activateUserUrl.replace(':id', user.id);
    } else {
      url = deactivateUserUrl.replace(':id', user.id);
    }

    return request
    .put(url)
    .withCredentials()
    .end(err => {
      if(err) {
        console.error(err);
      } else {
        console.log('User is ', active ? 'activated.' : 'deactivated.');
        this.fetchUser();
        this.render();
      }
    });
  }

  deleteUser(user) {
    let url = deleteUserUrl.replace(':id', user.id);

    return request
    .delete(url)
    .withCredentials()
    .end(err => {
      if(err) {
        console.error(err);
      } else {
        console.log('User is deleted.');
      }
    });
  }

  fetchUser() {
    return request
    .get(usersUrl)
    .withCredentials()
    .end((err, res) => {
      if (err) {
        console.error(err);
      } else {
        this.setState({ users: res.body });
      }
    });
  }

  renderToggle(user) {
    return (
      <Toggle
        style={{ marginRight: '50px' }}
        defaultToggled={ user.status === 'active'}
        onToggle={ (event, activate) => this.toggleUserStatus(event, activate, user) }
      />
    );
  }

  handleSearch(event, value) {
    this.setState({ search: value });
  }

  isMatchSearchRegex(username) {
    var search = this.state.search;
    if (!search) {
      return true;
    }
    var regexp = new RegExp(search, 'i');
    return username.match(regexp);
  }

  render() {
    var users = this.state.users;
    users = users.filter(x => {
      return this.isMatchSearchRegex(x.name);
    });
    var usersCount = _.countBy(users, x => {
      return x.status;
    });

    return (
      <div>
        <Row><DefaultNavbar /></Row>
        <Row>
          <Col xs={0} sm={0} md={2} lg={2} ></Col>
          <Col xs={12} sm={12} md={8} lg={8} >
            <Row>
              <TextField
                hintText='Search users ... '
                fullWidth={true}
                value={ this.state.search }
                onChange={ this.handleSearch }
              />
            </Row>
            <Row>
              <h5>
                { users.length } found / { usersCount.active | 0 } active
              </h5>
            </Row>
            <Row>
              <Table selectable={ false }>
                <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
                  <TableRow>
                    <TableHeaderColumn>#</TableHeaderColumn>
                    <TableHeaderColumn>Name</TableHeaderColumn>
                    <TableHeaderColumn>Email</TableHeaderColumn>
                    <TableHeaderColumn>Company</TableHeaderColumn>
                    <TableHeaderColumn>Role</TableHeaderColumn>
                    <TableHeaderColumn>Status</TableHeaderColumn>
                    <TableHeaderColumn>Active/Inactive</TableHeaderColumn>
                    <TableHeaderColumn>Delete</TableHeaderColumn>
                  </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={ false } selectable={ false }>
                  { 
                    users.map((user, idx) => {
                      return (
                        <TableRow key={ idx }>
                          <TableRowColumn>{ idx + 1 }</TableRowColumn>
                          <TableRowColumn>{ user.name }</TableRowColumn>
                          <TableRowColumn>{ user.email }</TableRowColumn>
                          <TableRowColumn>{ user.company && user.company.name || 'Dispatchr' }</TableRowColumn>
                          <TableRowColumn>{ user.role || 'CU' }</TableRowColumn>
                          <TableRowColumn>{ user.status }</TableRowColumn>
                          <TableRowColumn>{ this.renderToggle(user) }</TableRowColumn>
                          <TableRowColumn>
                            <RaisedButton label='DELETE' secondary={ true } onClick={ (event) => this.deleteUser(user) } />
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
