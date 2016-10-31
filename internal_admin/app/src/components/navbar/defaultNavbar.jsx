// Modules
const urlPrefix = require('dsp_shared/conf.d/config.json').admin.url_prefix;
import React from 'react';
import { browserHistory } from 'react-router';
import * as request from 'superagent';
import authRedux from '../../reduxes/auth';
import { logoutUrl } from '../../config';

// Styles
import Nav from 'react-bootstrap/lib/Nav';
import Navbar from 'react-bootstrap/lib/Navbar';
import NavItem from 'react-bootstrap/lib/NavItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import smLogo from '../../../styles/assets/sm-logo.png';
import '../../../styles/logo.scss';
import '../../../styles/navbar.scss';

export default class DefaultNavbar extends React.Component {
  constructor() {
    super();
    this.handleLogout = this.handleLogout.bind(this);
    this.goToIngest = this.goToIngest.bind(this);
    this.goToCreate = this.goToCreate.bind(this);
    this.showCreate = this.showCreate.bind(this);
    this.goToUsers = this.goToUsers.bind(this);
    this.showUsers = this.showUsers.bind(this);
  }

  handleLogout(event) {
    event.preventDefault();

    request
    .get(logoutUrl)
    .withCredentials()
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        authRedux.dispatch({
          type: 'LOGOUT'
        });
        browserHistory.push(urlPrefix);
      }
    });
  }

  goToIngest() {
    browserHistory.push(urlPrefix + 'ingest/');
  }

  showIngest() {
    if (authRedux.getState().role === 'DI') {
      return (<MenuItem eventKey={1.1} onClick={ this.goToIngest }>Ingest</MenuItem>);
    }
  }

  goToCreate() {
    browserHistory.push(urlPrefix + 'create/');
  }

  showCreate() {
    if (authRedux.getState().role === 'DA') {
      return (<MenuItem eventKey={1.2} onClick={ this.goToCreate }>Create</MenuItem>);
    }
  }

  goToUsers() {
    browserHistory.push(urlPrefix + 'users/');
  }

  showUsers() {
    if (authRedux.getState().role === 'DA') {
      return (<MenuItem eventKey={1.3} onClick={ this.goToUsers }>Users</MenuItem>);
    }
  }

  render() {
    return (  
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <a href='#'>
              <img className='sm-logo' src={ smLogo } />
            </a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            <NavDropdown eventKey={1} title='Menu' id='basic-nav-dropdown'>
              { this.showIngest() }
              { this.showCreate() }
              { this.showUsers() }
              <MenuItem divider />
              <MenuItem eventKey={1.4} onClick={ this.handleLogout }>Logout</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
