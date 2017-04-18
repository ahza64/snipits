/* eslint-env mocha */
// styles
import Badge from 'material-ui/Badge';
import RaisedButton from 'material-ui/RaisedButton';

// modules
import React from 'react';
import { mount } from 'enzyme';
import { assert, expect } from 'chai';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Taxonomy from '../../../src/components/taxonomy/taxonomy';
import EditTaxonomyDialog from '../../../src/components/taxonomy/dialogs/edit';
import DeleteTaxonomyDialog from '../../../src/components/taxonomy/dialogs/delete';
import NotificationDialog from '../../../src/components/taxonomy/dialogs/notification';
import ValidationDialog from '../../../src/components/taxonomy/dialogs/validation';

// Mocks
const components = require('../mocks/components');
const database = require('../mocks/database');
const taxonomiesAPI = require('../mocks/api/taxonomies');

describe('<Taxonomy />', () => {
  before(() => {
    components.init();
    database.init();
  });

  function mountComponent() {
    const wrapper = mount(
      <MuiThemeProvider>
        <Taxonomy />
      </MuiThemeProvider>
    );
    const taxonomy = wrapper.find(Taxonomy);
    expect(taxonomy).to.exist;
    return taxonomy;
  }

  function checkTable(companyIndex, projectIndex, schemaIndex) {
    let component = mountComponent();
    let company = database.data.companies[companyIndex];
    let project = database.data.projects[projectIndex];
    let schema = database.data.schemas[schemaIndex];
    component.node.handleCompanySelectChanged({}, company.id);
    component.node.handleProjectSelectChanged({}, project.id);
    component.node.handleSchemaSelectChanged({}, schema.id);

    let text = component.text();
    let taxonomies = taxonomiesAPI.getTaxonomies(schema.id);
    taxonomies.forEach((c) => {
      assert.isTrue(text.includes(c.fieldName), `${c.fieldName} should be displayed in the table`);
    });

    let badge = component.find(Badge);
    assert.equal(badge.text(), taxonomies.length, `total taxonomies found should be ${taxonomies.length}`);
  }

  it('checks taxonomy table', () => {
    checkTable(0, 0, 0);
  });

  it('checks create new taxonomy', () => {
    let component = mountComponent();
    // select company, project and schema
    let company = database.data.companies[0];
    let project = database.data.projects[0];
    let schema = database.data.schemas[0];
    let taxonomies = taxonomiesAPI.getTaxonomies(schema.id);
    component.node.handleCompanySelectChanged({}, company.id);
    component.node.handleProjectSelectChanged({}, project.id);
    component.node.handleSchemaSelectChanged({}, schema.id);
    assert.isTrue(component.node.state.dataSaved, `save button should be disabled`);

    // open edit dialog
    let createButton = component.find(RaisedButton).first();
    createButton.find('button').simulate('click');
    let dialog = component.find(EditTaxonomyDialog);
    expect(dialog).to.exist;
    assert.isTrue(dialog.node.props.open, `edit dialog should be opened`);

    // fill create form and save to client
    let newTaxonomy = {
      fieldName: "new_tax_name",
      nodeType: "new_tax_nodeType",
      keys: "new_tax_keys"
    };
    dialog.node.handleFieldNameChange({ target: { value: newTaxonomy.fieldName } });
    dialog.node.handleNodeTypeChange({ target: { value: newTaxonomy.nodeType } });
    dialog.node.handleKeysChange({ target: { value: newTaxonomy.keys } });
    dialog.node.handleTaxonomySubmit({});
    assert.isFalse(dialog.node.props.open, `dialog should be closed after new taxonomy saved to client`);
    assert.isFalse(component.node.state.dataSaved, `save button should be enabled`);

    // check new tax List
    assert.include(component.text(), newTaxonomy.fieldName, `new taxonomy should be displayed`);
    assert.include(component.text(), "No!!", `new taxonomy should not be saved to database`);

    // click save and open notification dialog
    let saveButton = component.find(RaisedButton).at(1);
    saveButton.find('button').simulate('click');
    let notificationDialog = component.find(NotificationDialog);
    expect(notificationDialog).to.exist;
    assert.isTrue(notificationDialog.node.props.open, 'notification dialog should be opened');

    // close notification and save updated client taxonomy list to database
    notificationDialog.node.props.fetchTaxValues();
    notificationDialog.node.props.onClose(false);
    assert.isFalse(notificationDialog.node.props.open, `notificaiton should be closed`);

    // check saved data is displayed
    assert.notInclude(component.text(), "No!!", `new taxonomy should be saved`);
    assert.isTrue(component.node.state.dataSaved, `save button should be disabled`);
  });

  it('checks entry data validation', () => {
    function mountDialog() {
      const wrapper = mount(
        <MuiThemeProvider>
          <EditTaxonomyDialog />
        </MuiThemeProvider>
      );
      const validation = wrapper.find(EditTaxonomyDialog);
      expect(validation).to.exist;
      return validation;
    }
    let componentDialog = mountDialog();
    let component = mountComponent();
    // select company, project, schema
    let company = database.data.companies[0];
    let project = database.data.projects[0];
    let schema = database.data.schemas[0];
    let taxonomies = taxonomiesAPI.getTaxonomies(schema.id);
    component.node.handleCompanySelectChanged({}, company.id);
    component.node.handleProjectSelectChanged({}, project.id);
    component.node.handleSchemaSelectChanged({}, schema.id);
    assert.isTrue(component.node.state.dataSaved, `save button should be disabled`);

    // open edit dialog
    let createButton = component.find(RaisedButton).first();
    createButton.find('button').simulate('click');
    let dialog = component.find(EditTaxonomyDialog);
    expect(dialog).to.exist;
    assert.isTrue(dialog.node.props.open, `edit dialog should be opened`);

    // fill create form and save to client
    let newTaxonomy = {
      fieldName: "first taxonomy",
      nodeType: "new_tax_nodeType",
      keys: "new_tax_keys"
    };
    dialog.node.handleFieldNameChange({ target: { value: newTaxonomy.fieldName } });
    dialog.node.handleNodeTypeChange({ target: { value: newTaxonomy.nodeType } });
    dialog.node.handleKeysChange({ target: { value: newTaxonomy.keys } });

    // submit invalid data and check state
    dialog.node.handleTaxonomySubmit({});
    assert.isTrue(dialog.node.props.open, `dialog should be open after invalid taxonomy save`);
    assert.isTrue(dialog.node.state.showValidationDialog, `validation should be open with invalid data entry`);
  });

  it('checks taxonomy deletion', () => {
    let component = mountComponent();
    let deleteDialog = component.find(DeleteTaxonomyDialog);
    // select company, project and schema
    let company = database.data.companies[0];
    let project = database.data.projects[0];
    let schema = database.data.schemas[0];
    let taxonomies = taxonomiesAPI.getTaxonomies(schema.id);
    let taxonomy = taxonomies[0];
    component.node.handleCompanySelectChanged({}, company.id);
    component.node.handleProjectSelectChanged({}, project.id);
    component.node.handleSchemaSelectChanged({}, schema.id);

    // open delete dialog
    component.node.setState({
      taxonomies: taxonomies,
      taxonomySelected: taxonomy
    });
    component.node.handleEditDeleteTax();
    expect(deleteDialog).to.exist;
    assert.isTrue(deleteDialog.node.props.open, `delete dialog should be open`);

    // delete taxonomy on client
    deleteDialog.node.handleDelete();
    assert.isFalse(deleteDialog.node.props.open, `delete dialog should be closed after delete on client`);
    assert.isFalse(component.text().includes(taxonomy.fieldName), `${taxonomy.fieldName} shouldn't be displayed`);
  });

});
