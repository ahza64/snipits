/* eslint-env mocha */
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Login from '../../../src/components/login/login';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { mount } from 'enzyme';
import { assert } from 'chai';
import { expect } from 'chai';

import { browserHistory } from 'react-router';

// Mocks
const components = require('../mocks/components');
const database = require('../mocks/database');

describe('<Login />', () => {

  var currentPage = '/';
  var browserHistoryPush;

  before(function() {
    components.init();
    database.init();
    browserHistoryPush = browserHistory.push;
    browserHistory.push = function(page) {
      currentPage = page;
    };
  });

  after(function() {
    browserHistory.push = browserHistoryPush;
  });

  beforeEach(function() {
    currentPage = '/';
  });

  function mountComponent() {
    const wrapper = mount(
      <MuiThemeProvider>
        <Login />
      </MuiThemeProvider>
    );
    return wrapper.find(Login);
  }

  function checkLogin(user, expectedPage) {
    var component = mountComponent();

    var username = component.find(TextField).at(0);
    username.find('input').simulate('change', { target: { value: user.email } });
    var password = component.find(TextField).at(1);
    password.find('input').simulate('change', { target: { value: user.password } });
    var button = component.find(RaisedButton);
    button.find('button').simulate('click');

    assert.strictEqual(currentPage, expectedPage, `check redirect page`);
  }

  it('check admin login', () => {
    var admins = database.data.admins.filter(function(admin) {
      return admin.role === 'DA';
    });
    assert.isTrue(admins.length > 0, `database should contain at least one admin`);
    checkLogin(admins[0], '/companies/');
  });

  it('check ingestor login', () => {
    var admins = database.data.admins.filter(function(admin) {
      return admin.role === 'DI';
    });
    assert.isTrue(admins.length > 0, `database should contain at least one ingestor`);
    checkLogin(admins[0], '/ingest/');
  });

  it('check incorrect password', () => {
    var admins = database.data.admins.filter(function(admin) {
      return admin.role === 'DA';
    });
    assert.isTrue(admins.length > 0, `database should contain at least one admin`);
    var admin = {
      email: admins[0].email,
      password: admins[0].password + '---'
    };
    checkLogin(admin, '/');
  });

});