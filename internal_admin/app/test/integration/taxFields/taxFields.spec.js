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
import EditTaxValueDialog from '../../../src/components/taxFields/dialogs/edit';
import DeleteExpTaxonomyDialog from '../../../src/components/taxFields/dialogs/delete';
import DeleteBySchemaExpTaxDialog from '../../../src/components/taxFields/dialogs/deleteValues';

// Mocks
const components = require('../mocks/components');
const database = require('../mocks/database');

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

  function checkTable(companyIndex, projectIndex, schemaIndex, taxonomyIndex) {
    let component = mountComponent();
    let company = database.data.companies[companyIndex];
    let project = database.data.projects[projectIndex];
    let schema = database.data.schemas[schemaIndex];
    let taxonomy = database.data.taxonomies[taxonomyIndex];
    component.node.handleCompanySelectChanged({}, company.id);
    component.node.handleProjectSelectChanged({}, project.id);
    component.node.handleSchemaSelectChanged({}, schema.id);
    component.node.handleTaxonomySelectChanged({}, taxonomy.id);

    let text = component.text();
    var expTaxonomies = database.data.taxFields.filter(function (c) {
      return c.fieldName === taxonomy.fieldName;
    });
    expTaxonomies.forEach((c) => {
      assert.isTrue(text.includes(c.fieldName), `${c.fieldName} should be displayed in the table`);
    });

    let badge = component.find(Badge);
    let badgeCount = component.node.state.schemaValues.length;
    assert
      .equal(
        badge.text(),
        badgeCount,
        `total expected taxonomies should be ${badgeCount}`
      );
  }

  it('checks expected taxonomy table', () => {
    checkTable(0, 0, 0, 0);
  });

  it('checks create new expected taxonomy', () => {
    let component = mountComponent();
    let dialog = component.find(EditTaxValueDialog);
    // select comapny, project, schema and taxonomy
    let company = database.data.companies[0];
    let project = database.data.projects[0];
    let schema = database.data.schemas[0];
    let taxonomy = database.data.taxonomies[0];
    component.node.handleCompanySelectChanged({}, company.id);
    component.node.handleProjectSelectChanged({}, project.id);
    component.node.handleSchemaSelectChanged({}, schema.id);
    component.node.handleTaxonomySelectChanged({}, taxonomy.id);
    assert.isFalse(component.node.state.showEditTaxonomyDialog, `edit/create dialog should be closed`);

    // open edit/create dialog
    var createButton = component.find(RaisedButton).at(0);
    createButton.find('button').simulate('click');
    expect(dialog).to.exist;
    assert.isTrue(dialog.node.props.open, `edit/create dialog should be open`);

    // fill in expected taxonomy form properties and save
    var newExpTax = 'new_exp_tax';
    dialog.node.handleTaxValueChange({ target: { value: newExpTax } });
    dialog.node.handleTaxValueSubmit({});
    assert.isFalse(dialog.node.props.open, `dialog should be closed after submit`);

    // check new expected taxonomy
    let createdExpTax = database.data.taxFields.filter(function (c) {
      return (c.fieldValue === newExpTax);
    });
    assert
      .include(
        component.text(),
        createdExpTax[0].fieldValue,
        `new expected taxonomy should be displayed after creation`
      );
  });

  it('check individual expected taxonomy deletion', () => {
    var component = mountComponent();
    let deleteDialog = component.find(DeleteExpTaxonomyDialog);
    // select comapny, project, schema and taxonomy
    let company = database.data.companies[0];
    let project = database.data.projects[0];
    let schema = database.data.schemas[0];
    let taxonomy = database.data.taxonomies[0];
    let expectedTaxonomy = database.data.taxFields[0];
    component.node.handleCompanySelectChanged({}, company.id);
    component.node.handleProjectSelectChanged({}, project.id);
    component.node.handleSchemaSelectChanged({}, schema.id);
    component.node.handleTaxonomySelectChanged({}, taxonomy.id);
    assert.isFalse(component.node.state.showEditTaxonomyDialog, `edit/create dialog should be closed`);

    // open delete dialog
    component.node.setState({
      taxValueSelected: expectedTaxonomy
    });
    component.node.handleDeleteTaxVal();
    expect(deleteDialog).to.exist;
    assert.isTrue(deleteDialog.node.props.open, `delete dialog should be open`);

    // Delete expected taxonomy
    deleteDialog.node.handleDelete();
    assert.isFalse(deleteDialog.node.props.open, `dialog should be closed after config deleted`);

    // Confirm deleted expected taxonomy
    var found = database.data.taxFields.filter(function(c) {
      return c.id === expectedTaxonomy.id;
    });
    assert.lengthOf(found, 0, `expectd taxonomy should be deleted from database`);
    let text = component.text();
    assert
      .isFalse(
        text.includes(expectedTaxonomy.fieldValue),
        `${expectedTaxonomy.fieldValue} should not be displayed in the table`
      );
  });

  it('checks expected taxonomy by schema and taxonomy', () => {
    var component = mountComponent();
    // select comapny, project, schema and taxonomy
    let company = database.data.companies[0];
    let project = database.data.projects[0];
    let schema = database.data.schemas[0];
    let taxonomy = database.data.taxonomies[0];
    let expectedTaxonomy = database.data.taxFields[0];
    component.node.handleCompanySelectChanged({}, company.id);
    component.node.handleProjectSelectChanged({}, project.id);
    component.node.handleSchemaSelectChanged({}, schema.id);
    component.node.handleTaxonomySelectChanged({}, taxonomy.id);
    // switch views
    var viewButton = component.find(RaisedButton).at(1);
    viewButton.find('button').simulate('click');

    // check table view by schema
    let text = component.text();
    var expTaxonomiesBySchema = database.data.taxFields.filter(function (c) {
      return c.qowSchemaId === schema.id;
    });
    expTaxonomiesBySchema.forEach((c) => {
      assert.isTrue(text.includes(c.fieldValue), `${c.fieldValue} should be displayed in the table`);
    });

    // switch view back to by taxonomy and check table
    viewButton.find('button').simulate('click');
    var expTaxonomiesByTaxonomy = database.data.taxFields.filter(function (c) {
      return c.fieldName === taxonomy.fieldName;
    });
    expTaxonomiesByTaxonomy.forEach((c) => {
      assert.isTrue(text.includes(c.fieldValue), `${c.fieldValue} should be displayed in the table`);
    });
  });

  it('checks expected taxonomy deletion by schema', () => {
    var component = mountComponent();
    // select comapny, project, schema and taxonomy
    let company = database.data.companies[0];
    let project = database.data.projects[0];
    let schema = database.data.schemas[0];
    let taxonomy = database.data.taxonomies[0];
    let expectedTaxonomies = database.data.taxFields;
    component.node.handleCompanySelectChanged({}, company.id);
    component.node.handleProjectSelectChanged({}, project.id);
    component.node.handleSchemaSelectChanged({}, schema.id);
    component.node.handleTaxonomySelectChanged({}, taxonomy.id);
    let text = component.text();
    assert
      .isTrue(
        text.includes(expectedTaxonomies[2].fieldValue),
        `${expectedTaxonomies[2].fieldValue} should be displayed in the table`
      );

    // open delete by schema dialog
    component.node.handleRemoveValues();
    var dialog = component.find(DeleteBySchemaExpTaxDialog);
    expect(dialog).to.exist;
    assert.isTrue(dialog.node.props.open, `delete expected taxonomy delete dialog should be open`);

    // delete expected taxonomies by schema
    dialog.node.handleDelete();
    assert.isFalse(dialog.node.props.open, `dialog should be closed after delete`);

    // Check expected taxonomies have been deleted
    assert.lengthOf(database.data.taxFields, 0, `there should be no expected taxonomies in the database`);
    let newText = component.text();
    assert
      .isFalse(
        newText.includes(expectedTaxonomies[2].fieldValue),
        `${expectedTaxonomies[2].fieldValue} should not be displayed in the table`
      );
  });
});
