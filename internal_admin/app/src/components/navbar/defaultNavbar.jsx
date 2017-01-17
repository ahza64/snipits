// Modules
const urlPrefix = require('dsp_shared/conf.d/config.json').admin.url_prefix;
import React from 'react';
import { browserHistory } from 'react-router';
import request from '../../services/request';
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
    this.goToCompanies = this.goToCompanies.bind(this);
    this.showCompanies = this.showCompanies.bind(this);
    this.goToProjects = this.goToProjects.bind(this);
    this.showProjects = this.showProjects.bind(this);
    this.goToIngest = this.goToIngest.bind(this);
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

  goToCompanies() {
    browserHistory.push(urlPrefix + 'companies/');
  }

  showCompanies() {
    if (authRedux.getState().role === 'DA') {
      return (<MenuItem eventKey={1.4} onClick={ this.goToCompanies }>Companies</MenuItem>);
    }
  }

  goToProjects() {
    browserHistory.push(urlPrefix + 'projects/');
  }

  showProjects() {
    if (authRedux.getState().role === 'DA') {
      return (<MenuItem eventKey={1.5} onClick={ this.goToProjects }>Work Projects</MenuItem>);
    }
  }

  goToConfigs() {
    browserHistory.push(urlPrefix + 'configs/');
  }

  showConfigs() {
    if (authRedux.getState().role === 'DA') {
      return (<MenuItem eventKey={1.6} onClick={ this.goToConfigs }>Ingestion Configurations</MenuItem>);
    }
  }

  goToIngest() {
    browserHistory.push(urlPrefix + 'ingest/');
  }

  showIngest() {
    if (authRedux.getState().role === 'DI') {
      return (<MenuItem eventKey={1.1} onClick={ this.goToIngest }>Ingest</MenuItem>);
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
              { this.showCompanies() }
              { this.showProjects() }
              { this.showConfigs() }
              { this.showIngest() }
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
