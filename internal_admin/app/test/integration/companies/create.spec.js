/* eslint-env mocha */
import CreateCompanyDialog from '../../../src/components/companies/create';
import React from 'react';
import { mount } from 'enzyme';
import { shallow } from 'enzyme';
import {assert} from 'chai';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

describe('<CreateCompanyDialog />', () => {

  it('check init', () => {
    const wrapper = mount(
      <MuiThemeProvider>
        <CreateCompanyDialog open={ true } />
      </MuiThemeProvider>
    );
    var dialog = wrapper.find(CreateCompanyDialog);
    assert.strictEqual(dialog.node.state.companyName, '', 'company name should be empty');
    var buttonDisabled = dialog.node.isConfirmButtonDisabled();
    assert.strictEqual(buttonDisabled, true, 'confirm button should be disabled');
  });

  it('check validation', () => {
    const wrapper = mount(
      <MuiThemeProvider>
        <CreateCompanyDialog open={ true } />
      </MuiThemeProvider>
    );

    let disabled = {
      'company': false,
      'Company': false,
      'company1': false,
      'company_1': true,
      'company1.1': false,
      'company#1': true,
    };

    let dialog = wrapper.find(CreateCompanyDialog);

    for (var name in disabled) {
      dialog.node.handleCompanyNameChanged({ target: { value: name } });
      let buttonDisabled = dialog.node.isConfirmButtonDisabled();
      assert.strictEqual(buttonDisabled, disabled[name],
        `confirm button should be ${ disabled[name] ? 'disabled' : 'enabled'} for name: ${name}`);
    }
  });
});