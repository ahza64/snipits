/* eslint-env mocha */
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Projects from '../../../src/components/projects/projects';
import CreateProjectDialog from '../../../src/components/projects/dialogs/create';
import { mount } from 'enzyme';
import { assert } from 'chai';
import { expect } from 'chai';

// Mocks
const components = require('../mocks/components');
const database = require('../mocks/database');
const projectsAPI = require('../mocks/api/projects');

describe('<Projects />', () => {

  before(function() {
    components.init();
    database.init();
  });

  function mountComponent() {
    const wrapper = mount(
      <MuiThemeProvider>
        <Projects />
      </MuiThemeProvider>
    );
    var component = wrapper.find(Projects);
    expect(component).to.exist;
    return component;
  }

  it('check projects table', () => {
    var component = mountComponent();
    let company = database.data.companies[0];
    component.node.handleCompanySelectChanged(null, company.id);
    let text = component.text();

    let projects = projectsAPI.getProjects(company.id);
    projects.forEach(function(p) {
      let displayed = text.indexOf(p.name) >= 0;
      assert.isTrue(displayed, `${p.name} should be displayed in the table`);
    });
  });

  it('check company select', () => {
    var component = mountComponent();
    let company = database.data.companies[1];
    component.node.handleCompanySelectChanged(null, company.id);
    let text = component.text();

    let projects = projectsAPI.getProjects(company.id);
    projects.forEach(function(p) {
      let displayed = text.indexOf(p.name) >= 0;
      assert.isTrue(displayed, `${p.name} should be displayed in the table`);
    });
  });

  it('check project filter', () => {
    var component = mountComponent();
    let company = database.data.companies[0];
    component.node.handleCompanySelectChanged(null, company.id);

    let projects = projectsAPI.getProjects(company.id);
    var search = '2';
    component.node.setState({ search: search });
    let text = component.text();

    var regexp = new RegExp(search, 'i');
    projects.forEach(function(p) {
      let shouldBeDisplayed = p.name.match(regexp) ? true : false;
      let displayed = text.indexOf(p.name) >= 0;
      assert.strictEqual(displayed, shouldBeDisplayed,
        `${p.name} should ${shouldBeDisplayed ? '' : 'not'} be displayed in the table`);
    });
  });

  it('check create new project', () => {
    var component = mountComponent();
    var dialog = component.find(CreateProjectDialog);
    expect(dialog).to.exist;

    let newProject = 'new_Project';
    let company = database.data.companies[1];
    component.node.handleCompanySelectChanged(null, company.id);
    var text = component.text();
    assert.isTrue(text.indexOf(newProject) === -1, `${newProject} should not be displayed before created`);

    // Create new project
    dialog.node.handleProjectNameChanged({ target: { value: newProject } });
    var buttonDisabled = dialog.node.isConfirmButtonDisabled();
    assert.strictEqual(buttonDisabled, false, 'confirm button should be enabled');
    dialog.node.handleSubmit();

    text = component.text();
    assert.isTrue(text.indexOf(newProject) >= 0, `${newProject} should be displayed after created`);
  });
});