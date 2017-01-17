/* eslint-env mocha */
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import EditUserDialog from '../../../../src/components/users/dialogs/edit';
import { mount } from 'enzyme';
import { assert } from 'chai';

// Mocks
const components = require('../../mocks/components');
const database = require('../../mocks/database');

class EditUserDialogWrapper extends EditUserDialog {
  render() {
    return (
      <MuiThemeProvider>
        <EditUserDialog
          open={ this.state.open || this.props.open }
          companies={ this.state.companies || this.props.companies }
          user={ this.state.user || this.props.user } />
      </MuiThemeProvider>
    );
  }
}

describe('<EditUserDialog />', () => {

  before(function() {
    components.init();
    database.init();
  });

  function mountWrapper(props) {
    const wrapper = mount(
      <EditUserDialogWrapper
        open={ props.open }
        companies={ props.companies }
        user={ props.user } />);
    return wrapper;
  }

  function mountComponent(props) {
    const wrapper = mountWrapper(props);
    return wrapper.find(EditUserDialog);
  }

  function getDialog() {
    const companies = database.data.companies;
    const companyId = companies[0].id;
    const user = {
      companyId: companyId
    };
    const props = {
      open: true,
      companies: companies,
      user: user
    };
    var component = mountComponent(props);
    return component;
  }

  it('check email validation', () => {
    var dialog = getDialog();
    var isEmailCorrect = {
      '': false,
      'email': false,
      'e@mail': false,
      'e@mail.com': true
    };
    for (var email in isEmailCorrect) {
      const correct = isEmailCorrect[email];
      dialog.node.handleEmailChanged({ target: { value: email } });
      dialog.node.handleSubmit({});
      const error = dialog.node.state.emailError ? true : false;
      assert.equal(error, !correct,
        `${email} should${correct ? ' not' : ''} throw emailError`);
    }
  });

  it('check password validation', () => {
    var dialog = getDialog();
    dialog.node.handleEmailChanged({ target: { value: 'e@mail.com' } });
    var isPasswordCorrect = {
      '': false,
      'password': true
    };
    for (var password in isPasswordCorrect) {
      const correct = isPasswordCorrect[password];
      dialog.node.handlePasswordChanged({ target: { value: password } });
      dialog.node.handleSubmit({});
      const error = dialog.node.state.passwordError ? true : false;
      assert.equal(error, !correct,
        `${password} should${correct ? ' not' : ''} throw passwordError`);
    }
  });

  it('check confirm validation', () => {
    var dialog = getDialog();
    dialog.node.handleEmailChanged({ target: { value: 'e@mail.com' } });
    dialog.node.handlePasswordChanged({ target: { value: 'password' } });
    var isConfirmCorrect = {
      '': false,
      'pwd': false,
      'password': true
    };
    for (var confirm in isConfirmCorrect) {
      const correct = isConfirmCorrect[confirm];
      dialog.node.handleConfirmChanged({ target: { value: confirm } });
      dialog.node.handleSubmit({});
      const error = dialog.node.state.confirmError ? true : false;
      assert.equal(error, !correct,
        `${confirm} should${correct ? ' not' : ''} throw confirmError`);
    }
  });

  it('check user propertires', () => {
    const companies = database.data.companies;
    const companyId = companies[0].id;
    const firstName = 'Norbert';
    const lastName = 'Wiener';

    const user = {
      id: 1,
      name: firstName + ' ' + lastName,
      companyId: companyId,
      email: 'e@mail.com',
      password: 'password',
      confirm: 'password'
    };

    const props = {
      open: false,
      companies: companies,
      user: user
    };

    var wrapper = mountWrapper(props);
    // Open Dialog
    wrapper.node.setState({ open: true });
    var dialog = wrapper.find(EditUserDialog);

    const html = document.getElementsByTagName('body')[0].innerHTML;
    assert.isTrue(html.includes(firstName), `${firstName} should be displayed in the dialog content`);
    assert.isTrue(html.includes(lastName), `${lastName} should be displayed in the dialog content`);
    assert.isTrue(html.includes(user.email), `${user.email} should be displayed in the dialog content`);
    assert.equal(dialog.node.state.password, user.password, `check user's password`);
    assert.equal(dialog.node.state.confirm, user.confirm, `check user's password confirm`);
  });

});