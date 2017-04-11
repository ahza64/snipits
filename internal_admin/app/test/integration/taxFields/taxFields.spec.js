/* eslint-env mocha */
// styles
import Badge from 'material-ui/Badge';
import RaisedButton from 'material-ui/RaisedButton';

// modules
import React from 'react';
import { mount } from 'enzyme';
import { assert, expect } from 'chai';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import TaxFields from '../../../src/components/taxFields/taxFields';
// import EditTaxonomyDialog from '../../../src/components/taxonomy/dialogs/edit';
// import DeleteTaxonomyDialog from '../../../src/components/taxonomy/dialogs/delete';
// import NotificationDialog from '../../../src/components/taxonomy/dialogs/notification';
// import ValidationDialog from '../../../src/components/taxonomy/dialogs/validation';

// Mocks
const components = require('../mocks/components');
const database = require('../mocks/database');
const taxonomiesAPI = require('../mocks/api/taxonomies');

describe('<TaxFields />', () => {
  before(() => {
    components.init();
    database.init();
  });

  function mountComponent() {
    const wrapper = mount(
      <MuiThemeProvider>
        <TaxFields />
      </MuiThemeProvider>
    );
    const expTaxonomy = wrapper.find(TaxFields);
    expect(expTaxonomy).to.exist;
    return expTaxonomy;
  }

  it('checks create new expected taxonomy', () => {
    let component = mountComponent();
    // select comapny, project and schema
    let company = database.data.companies[0];
    let project = database.data.projects[0];
    let schema = database.data.schemas[0];
  });
});
