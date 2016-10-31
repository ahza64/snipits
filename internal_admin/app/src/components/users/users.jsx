// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import * as request from 'superagent';
import { usersUrl, activateUserUrl, deactivateUserUrl, deleteUserUrl } from '../../config';
//import {List, ListItem, MakeSelectable} from 'material-ui/List';
import IconButton from 'material-ui/IconButton';
import Toggle from 'material-ui/Toggle';

// Components
import DefaultNavbar from '../navbar/defaultNavbar';

// Styles
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import RaisedButton from 'material-ui/RaisedButton';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

export default class Users extends React.Component {
  constructor() {
    super();
    this.state = { users: [] };
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

  renderUserInfo(user) {
    return (
      <p>
        <span> { user.email } </span> -- { user.status } -- { user.company.name } { user.deleted ? ' -- deleted' : '' }
      </p>
    );
  }

  render() {
    return (
      <div>
        <Row><DefaultNavbar /></Row>
        <Row>
          <Col xs={0} sm={0} md={2} lg={2} ></Col>
          <Col xs={12} sm={12} md={8} lg={8} >
            <Table selectable={ false }>
              <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
                <TableRow>
                  <TableHeaderColumn>#</TableHeaderColumn>
                  <TableHeaderColumn>NAME</TableHeaderColumn>
                  <TableHeaderColumn>INFO</TableHeaderColumn>
                  <TableHeaderColumn>STATUS</TableHeaderColumn>
                  <TableHeaderColumn>DELETE</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={ false } selectable={ false }>
                { 
                  this.state.users.map((user, idx) => {
                    return (
                      <TableRow key={ idx }>
                        <TableRowColumn>{ idx }</TableRowColumn>
                        <TableRowColumn>{ user.name }</TableRowColumn>
                        <TableRowColumn>{ this.renderUserInfo(user) }</TableRowColumn>
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
          </Col>
          <Col xs={0} sm={0} md={2} lg={2} ></Col>
        </Row>
      </div>
    );
  }
}
