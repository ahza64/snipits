// Modules
import React from 'react';
import { browserHistory } from 'react-router';
import * as request from 'superagent';
import authRedux from '../../reduxes/auth';

// Styles
import Nav from 'react-bootstrap/lib/Nav';
import Navbar from 'react-bootstrap/lib/Navbar';
import NavItem from 'react-bootstrap/lib/NavItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';

export default class DefaultNavbar extends React.Component {
  constructor() {
    super();
    this.handleLogout = this.handleLogout.bind(this);
    this.goToUpload = this.goToUpload.bind(this);
    this.goToIngestion = this.goToIngestion.bind(this);
    this.goToAdmin = this.goToAdmin.bind(this);
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
    browserHistory.push('/ingestion');
  }

  goToAdmin() {
    browserHistory.push('/admin');
  }

  render() {
    return (
      <Navbar>
        <Navbar.Header>
          <Navbar.Brand>
            <a href='#'>Dispatchr Ingestion System</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            <NavDropdown eventKey={3} title='Menu' id='basic-nav-dropdown'>
              <MenuItem eventKey={3.1} onClick={ this.goToUpload }>Upload</MenuItem>
              <MenuItem eventKey={3.2} onClick={ this.goToIngestion }>Ingestion</MenuItem>
              <MenuItem eventKey={3.3} onClick={ this.goToAdmin }>Admin</MenuItem>
              <MenuItem divider />
              <MenuItem eventKey={3.3} onClick={ this.handleLogout }>Logout</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}