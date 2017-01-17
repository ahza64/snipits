/* eslint-env mocha */
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Users from '../../../src/components/users/users';
import EditUserDialog from '../../../src/components/users/dialogs/edit';
import DeleteUserDialog from '../../../src/components/users/dialogs/delete';
import Toggle from 'material-ui/Toggle';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import { TableBody, TableRow } from 'material-ui/Table';
import { mount } from 'enzyme';
import { assert } from 'chai';
import { expect } from 'chai';

// Mocks
const components = require('../mocks/components');
const database = require('../mocks/database');
const usersAPI = require('../mocks/api/users');

// Statuses
const ACTIVE = 'active';
const INACTIVE = 'inactive';

describe('<Users />', () => {

  before(function() {
    components.init();
    database.init();
  });

  function mountComponent() {
    const wrapper = mount(
      <MuiThemeProvider>
        <Users />
      </MuiThemeProvider>
    );
    return wrapper.find(Users);
  }

  function getActiveUsersNumber(users) {
    var activeUsersNumber = 0;
    users.forEach(function(user) {
      if (user.status === ACTIVE) {
        activeUsersNumber++;
      }
    });
    return activeUsersNumber;
  }

  function checkFoundActive(text, found, active) {
    var re = /(\d+)\s*found\s*\/\s*(\d+)\s*active/i;
    var matches = text.match(re);
    assert.isOk(matches, `total information should be displayed on the component`);
    assert.equal(matches[1], found, `total number of users should be ${found}`);
    assert.equal(matches[2], active, `active users number should be ${active}`);
  }

  function checkTableContent(component, users) {
    var table = component.find(TableBody);
    var rows = table.find(TableRow);
    assert.equal(rows.length, users.length, `table row count should be ${users.length}`);
    for (var i = 0; i < users.length; i++) {
      var row = rows.at(i);
      const user = users[i];
      const role = user.role || 'CU';
      const text = row.text();

      assert.include(text, user.name, `check user name`);
      assert.include(text, user.email, `check user email`);
      assert.include(text, role, `check user role`);

      var toggle = row.find(Toggle);
      const switched = toggle.node.state.switched;
      assert.strictEqual(switched, user.status === ACTIVE, `check user status`);
    }
  }

  it('check users table', () => {
    var component = mountComponent();
    var users = usersAPI.getUsers();

    const total = users.length;
    const active = getActiveUsersNumber(users);

    checkFoundActive(component.text(), total, active);
    checkTableContent(component, users);
  });

  it('check users filter', () => {
    var component = mountComponent();
    var search = 'user';
    var re = new RegExp(search, 'i');
    var users = usersAPI.getUsers().filter(function(user) {
      return user.name.match(re);
    });

    var total = users.length;
    var active = getActiveUsersNumber(users);

    var searchField = component.find(TextField);
    searchField.find('input').simulate('change', { target: { value: search } });

    var text = component.text();
    checkFoundActive(component.text(), total, active);
    checkTableContent(component, users);
  });

  function splitName(name) {
    const nameSeparatorIndex = name.indexOf(' ');
    if (nameSeparatorIndex >= 0) {
      return {
        firstName: name.substring(0, nameSeparatorIndex),
        lastName: name.substring(nameSeparatorIndex+1, name.length)
      };
    } else {
      return {
        firstName: name,
        lastName: ''
      };
    }
  }

  function checkSavedUser(user) {
    var saved = usersAPI.getUsers().filter(function(u) {
      let found = (u.name === user.name)
        && (u.email === user.email)
        && (u.companyId === user.companyId)
        && (u.password === user.password);
      if (user.id) {
        found &= u.id === user.id;
      }
      return found;
    });
    assert.lengthOf(saved, 1);
    assert.strictEqual(saved[0].role, user.role !== 'CU' ? user.role : null,
      `check saved user role`);
  }

  function openDialog(component, user) {
    if (user.id) {
      // Edit user
      var users=usersAPI.getUsers();
      var index = -1;
      for(var i = 0; i < users.length; i++) {
        if ((users[i].id === user.id) && (users[i].role === user.role)) {
          index = i;
        }
      }
      if (index >= 0) {
        var table = component.find(TableBody);
        var rows = table.find(TableRow);
        var row = rows.at(index);
        var editButton = row.find(RaisedButton).first();
        editButton.find('button').simulate('click');
      }
    } else {
      // Create user
      var createButton = component.find(RaisedButton).first();
      createButton.find('button').simulate('click');
    }
    var dialog = component.find(EditUserDialog);
    expect(dialog).to.exist;
    assert.isTrue(dialog.node.props.open, `dialog should be opened`);
    return dialog;
  }

  function createOrUpdateUser(component, user) {
    // Open dialog
    var dialog = openDialog(component, user);

    // Fill properties
    const name = splitName(user.name);
    dialog.node.handleCompanySelectChanged({}, user.companyId);
    dialog.node.handleRoleChanged({}, user.role);
    dialog.node.handleFirstNameChanged({ target: { value: name.firstName } });
    dialog.node.handleLastNameChanged({ target: { value: name.lastName } });
    dialog.node.handleEmailChanged({ target: { value: user.email } });
    dialog.node.handlePasswordChanged({ target: { value: user.password } });
    dialog.node.handleConfirmChanged({ target: { value: user.password } });

    // Save user
    dialog.node.handleSubmit({});
    assert.isFalse(dialog.node.props.open, `dialog should be closed after new user saved`);

    // Check saved user
    checkSavedUser(user);
  }

  it('check create new user', () => {
    var component = mountComponent();
    var company = database.data.companies[0];
    const user = {
      companyId: company.id,
      role: 'CU',
      name: 'User 3',
      email: 'user3@test.com',
      password: '123'
    };
    createOrUpdateUser(component, user);
  });

  it('check create new ingestor', () => {
    var component = mountComponent();
    var company = database.data.companies[1];
    const user = {
      companyId: company.id,
      role: 'DI',
      name: 'Ingestor 3',
      email: 'ingestor3@test.com',
      password: '1234'
    };
    createOrUpdateUser(component, user);
  });

  it('check create new admin', () => {
    var component = mountComponent();
    const user = {
      companyId: null,
      role: 'DA',
      name: 'Admin 2',
      email: 'admin2@test.com',
      password: '12345'
    };
    createOrUpdateUser(component, user);
  });

  it('check edit user', () => {
    const original = database.data.users[0];
    var component = mountComponent();
    const user = {
      id: original.id,
      companyId: original.companyId,
      role: original.role,
      name: 'User Name',
      email: 'newemail@test.com',
      password: '321'
    };
    createOrUpdateUser(component, user);
  });

  function changeStatus(active) {
    var component = mountComponent();
    var users = usersAPI.getUsers();

    var totalUsers = users.length;
    var activeUsers = getActiveUsersNumber(users);

    var index = -1;
    for(var i = 0; i < users.length; i++) {
      if (users[i].status === (active ? INACTIVE : ACTIVE)) {
        index = i;
      }
    }

    assert.notEqual(index, -1,
      `list should contain at least one ${active ? 'inactive' : 'active'} user`);

    var table = component.find(TableBody);
    var rows = table.find(TableRow);
    var row = rows.at(index);
    var toggle = row.find(Toggle);

    // Set Active / Inactive
    toggle.node.setToggled(active);
    toggle.find('input').simulate('change', { target: { active: active } });

    checkFoundActive(component.text(), totalUsers, activeUsers + (active ? 1 : -1));
  }

  it('check deactive user', () => {
    changeStatus(false);
  });

  it('check activate user', () => {
    changeStatus(true);
  });

  it('check delete user', () => {
    var component = mountComponent();
    var users = usersAPI.getUsers();
    var total = users.length;
    var active = getActiveUsersNumber(users);

    const index = 1;
    const user = users[index];

    // Click Delete Button
    var table = component.find(TableBody);
    var rows = table.find(TableRow);
    var row = rows.at(index);
    var deleteButton = row.find(RaisedButton).last();
    deleteButton.find('button').simulate('click');

    // Check Dialog
    var dialog = component.find(DeleteUserDialog);
    expect(dialog).to.exist;
    assert.isTrue(dialog.node.props.open, `dialog should be opened`);

    // Confirm Delete Action
    dialog.node.handleSubmit({});

    var found = usersAPI.getUsers().filter(function(u) {
      return (u.id === user.id) && (u.role === user.role);
    });

    assert.lengthOf(found, 0, `user should be deleted from database`);
    const newTotal = total - 1;
    const newActive = active - (user.status === ACTIVE ? 1 : 0);
    checkFoundActive(component.text(), newTotal, newActive);
  });

});