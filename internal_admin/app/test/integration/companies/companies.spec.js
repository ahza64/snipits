/* eslint-env mocha */
import Companies from '../../../src/components/companies/companies';
import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';
import { expect } from 'chai';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// Test data
const data = require('./companies.data');

class TestCompanies extends Companies {
  fetchCompanies() {
    this.setState({ companies: data.companies });
  }
}

describe('<Companies />', () => {

  it('check companies table', () => {
    const wrapper = mount(
      <MuiThemeProvider>
        <TestCompanies />
      </MuiThemeProvider>
    );

    var component = wrapper.find(TestCompanies);
    expect(component).to.exist;

    let text = component.text();
    let companies = data.companies;
    companies.forEach(function(c) {
      let found = text.indexOf(c.name) >= 0;
      assert.isTrue(found, `${c.name} should be displayed in the table`);
    });
  });
});