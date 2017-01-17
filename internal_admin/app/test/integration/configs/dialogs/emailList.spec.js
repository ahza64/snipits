/* eslint-env mocha */
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import EmailsList from '../../../../src/components/configs/dialogs/emailsList';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import { mount } from 'enzyme';
import { assert } from 'chai';

describe('<EmailsList />', () => {

  var emailsList = [];

  beforeEach(function() {
    emailsList = ['a@aa.aa', 'b@bb.bb', 'c@cc.cc'];
  });

  function onChange(emails) {
    emailsList = emails;
  }

  function mountComponent() {
    const wrapper = mount(
      <MuiThemeProvider>
        <EmailsList emails={ emailsList } onChange={ (emails) => onChange(emails) } />
      </MuiThemeProvider>
    );
    return wrapper.find(EmailsList);
  }

  it('check list', () => {
    var component = mountComponent();
    var text = component.text();
    emailsList.forEach(function(email) {
      const displayed = text.indexOf(email) >= 0;
      assert.isTrue(displayed, `${email} should be displayed at the list`);
    });
  });

  it('check email add', () => {
    var component = mountComponent();
    const newEmail = 'd@dd.dd';

    // Add new email
    var textField = component.find(TextField);
    textField.find('input').simulate('change', { target: { value: newEmail } });
    const buttonEnabled = !component.node.isAddButtonDisabled();
    assert.strictEqual(buttonEnabled, true, 'add button should be enabled');
    var addButton = component.find(FlatButton);
    addButton.simulate('touchTap');

    assert.isTrue(emailsList.includes(newEmail), `${newEmail} should be added to emails array`);
    assert.strictEqual(emailsList.length, 4, 'emails array should be increased');
  });

  it('check email delete', () => {
    var component = mountComponent();
    const email = 'b@bb.bb';
    const index = emailsList.indexOf(email);

    // Delete email
    var deleteButtons = component.find(IconButton);
    deleteButtons.at(index).simulate('touchTap',{});

    assert.isFalse(emailsList.includes(email), `${email} should be deleted from emails array`);
    assert.strictEqual(emailsList.length, 2, 'emails array should be decreased');
  });
});