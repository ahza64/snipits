/* eslint-env mocha */
import Companies from '../../../src/components/companies/companies';
import CreateCompanyDialog from '../../../src/components/companies/create';
import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';
import { expect } from 'chai';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// Mocks
const components = require('../mocks/components');
const database = require('../mocks/database');

describe('<Companies />', () => {

  before(function() {
    components.init();
    database.init();
  });

  it('check companies table', () => {
    const wrapper = mount(
      <MuiThemeProvider>
        <Companies />
      </MuiThemeProvider>
    );

    var component = wrapper.find(Companies);
    expect(component).to.exist;

    let text = component.text();
    let companies = database.data.companies;
    companies.forEach(function(c) {
      let found = text.indexOf(c.name) >= 0;
      assert.isTrue(found, `${c.name} should be displayed in the table`);
    });
  });

  it('check create new company', () => {
    const wrapper = mount(
      <MuiThemeProvider>
        <Companies />
      </MuiThemeProvider>
    );

    var component = wrapper.find(Companies);
    var dialog = wrapper.find(CreateCompanyDialog);
    expect(dialog).to.exist;

    var text = component.text();
    let newCompany = 'newcompany';
    assert.isTrue(text.indexOf(newCompany) === -1, `${newCompany} should not be displayed before created`);

    // Create new company
    dialog.node.handleCompanyNameChanged({ target: { value: newCompany } });
    dialog.node.handleSubmit();

    text = component.text();
    assert.isTrue(text.indexOf(newCompany) >= 0, `${newCompany} should be displayed after created`);
  });
});