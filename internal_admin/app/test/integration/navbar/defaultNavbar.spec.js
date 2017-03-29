/* eslint-env mocha */
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import DefaultNavbar from '../../../src/components/navbar/defaultNavbar';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { mount } from 'enzyme';
import { assert } from 'chai';

import authRedux from '../../../src/reduxes/auth';

describe('<DefaultNavbar />', () => {

  function initRedux(role) {
    authRedux.dispatch({
      type: 'LOGIN',
      user: {
        role: role
      }
    });
  }

  function mountComponent() {
    const wrapper = mount(
      <MuiThemeProvider>
        <DefaultNavbar />
      </MuiThemeProvider>
    );
    return wrapper.find(DefaultNavbar);
  }

  function checkMenuItems(role, menuItems) {
    initRedux(role);
    var component = mountComponent();
    var navDropdown = component.find(NavDropdown);

    var foundMenuItems = [];
    navDropdown.find(MenuItem).forEach(function(item) {
      const text = item.text();
      if (text.length > 0) {
        foundMenuItems.push(text);
      }
    });
    assert.sameMembers(foundMenuItems, menuItems,
      `check menu items`);
  }

  it('check menu items for admin role', () => {
    const role = 'DA';
    const menuItems = [
      'Companies',
      'Work Projects',
      'Ingestion Configurations',
      'Users',
      'Logout',
      'Schemas',
      'Taxonomy',
      'Taxonomy Field Values'
    ];
    checkMenuItems(role, menuItems);
  });

  it('check menu items for ingestor role', () => {
    const role = 'DI';
    const menuItems = [
      'Ingest',
      'Logout'
    ];
    checkMenuItems(role, menuItems);
  });

});
