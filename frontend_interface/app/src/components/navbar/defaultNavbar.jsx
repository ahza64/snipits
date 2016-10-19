// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import * as request from 'superagent';
import authRedux from '../../reduxes/auth';
import { isRoleAuthorized } from '../auth/auth';

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
    this.goToUpload = this.goToUpload.bind(this);
    this.goToIngestion = this.goToIngestion.bind(this);
    this.goToAdmin = this.goToAdmin.bind(this);
    this.showIngest = this.showIngest.bind(this);
    this.showAdmin = this.showAdmin.bind(this);
  }

  handleLogout(event) {
    event.preventDefault();

    request
    .get('http://localhost:3000/logout')
    .withCredentials()
    .end(err => {
      if (err) {
        console.error(err);
      } else {
        authRedux.dispatch({
          type: 'LOGOUT'
        });
        browserHistory.push('/');
      }
    });
  }

  goToUpload() {
    browserHistory.push('/upload');
  }

  goToIngestion() {
    browserHistory.push('/ingest');
  }

  goToAdmin() {
    browserHistory.push('/admin');
  }

  showIngest() {
    if (isRoleAuthorized('ingest')) {
      return (<MenuItem eventKey={1.2} onClick={ this.goToIngestion }>Ingest</MenuItem>);
    }
  }

  showAdmin() {
    if (isRoleAuthorized('admin')) {
      return (<MenuItem eventKey={1.3} onClick={ this.goToAdmin }>Admin</MenuItem>);
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
              <MenuItem eventKey={1.1} onClick={ this.goToUpload }>Upload</MenuItem>
              { this.showIngest() }
              { this.showAdmin() }
              <MenuItem divider />
              <MenuItem eventKey={1.4} onClick={ this.handleLogout }>Logout</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}