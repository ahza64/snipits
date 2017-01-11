/* eslint-env mocha */
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Configurations from '../../../src/components/configs/configs';
import EditConfigDialog from '../../../src/components/configs/dialogs/edit';
import DeleteConfigDialog from '../../../src/components/configs/dialogs/delete';
import Badge from 'material-ui/Badge';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import { mount } from 'enzyme';
import { assert } from 'chai';
import { expect } from 'chai';

// Mocks
const components = require('../mocks/components');
const database = require('../mocks/database');
const projectsAPI = require('../mocks/api/projects');
const configsAPI = require('../mocks/api/configs');
const watchersAPI = require('../mocks/api/watchers');

describe('<Configurations />', () => {

  before(function() {
    components.init();
    database.init();
  });

  function mountComponent() {
    const wrapper = mount(
      <MuiThemeProvider>
        <Configurations />
      </MuiThemeProvider>
    );
    var component = wrapper.find(Configurations);
    return component;
  }

  function checkTable(companyIndex, projectIndex) {
    var component = mountComponent();
    let company = database.data.companies[companyIndex];
    let project = database.data.projects[projectIndex];
    component.node.handleCompanySelectChanged({}, company.id);
    component.node.handleProjectSelectChanged({}, project.id);

    let text = component.text();

    let configs = configsAPI.getConfigs(project.id);
    configs.forEach(function(c) {
      assert.isTrue(text.includes(c.fileType), `${c.fileType} should be displayed in the table`);
    });

    let badge = component.find(Badge);
    assert.equal(badge.text(), configs.length, `tatal configs found should be ${configs.length}`);
  }

  it('check configurations table', () => {
    checkTable(0, 1);
  });

  it('check company and project select', () => {
    checkTable(1, 2);
  });

  var checkWatchers = function(configId, emails) {
    var watchers = watchersAPI.getWatchers(configId);
    emails.forEach(function(email) {
      let found = watchers.filter(function(w) {
        return w.email === email;
      });
      assert.lengthOf(found, 1, `${email} should be added into database`);
    });
    assert.lengthOf(watchers, emails.length, `tatal watchers found for config should be ${emails.length}`);
  };

  it('check create new config', () => {
    var component = mountComponent();
    // Select company and project
    let company = database.data.companies[0];
    let project = database.data.projects[1];
    let configs = configsAPI.getConfigs(project.id);
    component.node.handleCompanySelectChanged({}, company.id);
    component.node.handleProjectSelectChanged({}, project.id);

    // Open Dialog
    var createButton = component.find(RaisedButton).first();
    createButton.find('button').simulate('click');
    var dialog = component.find(EditConfigDialog);
    expect(dialog).to.exist;
    assert.isTrue(dialog.node.props.open, `dialog should be opened`);

    // Fill config properties
    assert.isTrue(dialog.node.isConfirmButtonDisabled(), `save button should be disabled`);
    var newConfig = {
        fileType: 'new_file_type',
        description: 'new_file_type_desc'
    };
    dialog.node.handleConfigTypeChanged({ target: { value: newConfig.fileType } });
    dialog.node.handleConfigDescriptionChanged({ target: { value: newConfig.description } });
    var watchers = ['a@aa.aa', 'b@bb.bb'];
    dialog.node.handleWathersListChanged(watchers);
    assert.isFalse(dialog.node.isConfirmButtonDisabled(), `save button should be enabled`);

    // Save new config
    dialog.node.handleSubmit({});
    assert.isFalse(dialog.node.props.open, `dialog should be closed after new config saved`);

    // Check new config
    let created = database.data.configs.filter(function(c) {
      return (c.fileType === newConfig.fileType)
        && (c.description === newConfig.description)
        && (c.companyId === company.id)
        && (c.workProjectId === project.id);
    });
    assert.lengthOf(created, 1, `new config should be added into database`);
    assert.include(component.text(), newConfig.fileType, `new config should be displayed after created`);
    checkWatchers(created[0].id, watchers);
  });

  it('check config settings', () => {
    var component = mountComponent();
    // Select company and project
    let company = database.data.companies[0];
    let project = database.data.projects[1];
    let configs = configsAPI.getConfigs(project.id);
    var config = configs[0];
    component.node.handleCompanySelectChanged({}, company.id);
    component.node.handleProjectSelectChanged({}, project.id);

    // Open edit dialog
    component.node.setState({
      configSelected: config
    });
    component.node.handleChangeConfig();

    const html = document.getElementsByTagName('body')[0].innerHTML;
    assert.isTrue(html.includes(config.description), `config description (${config.description}) should be displayed in the dialog content`);
    var watchers = watchersAPI.getWatchers(config.id);
    watchers.forEach(function(w) {
      assert.isTrue(html.includes(w.email), `${w.email} should be displayed in the dialog content`);
    });
  });

  it('check config deletion', () => {
    var component = mountComponent();
    // Select company and project
    let company = database.data.companies[0];
    let project = database.data.projects[1];
    let configs = configsAPI.getConfigs(project.id);
    var config = configs[0];
    component.node.handleCompanySelectChanged({}, company.id);
    component.node.handleProjectSelectChanged({}, project.id);

    // Open delete dialog
    component.node.setState({
      configSelected: config
    });
    component.node.handleDeleteConfig();

    var dialog = component.find(DeleteConfigDialog);
    expect(dialog).to.exist;
    assert.isTrue(dialog.node.props.open, `dialog should be opened`);

    // Delete config
    dialog.node.handleSubmit({});
    assert.isFalse(dialog.node.props.open, `dialog should be closed after config deleted`);

    // Check config
    var found = database.data.configs.filter(function(c) {
      return c.id === config.id;
    });
    assert.lengthOf(found, 0, `config should be deleted from database`);
    let text = component.text();
    assert.isFalse(text.includes(config.fileType), `${config.fileType} should not be displayed in the table`);
  });

});