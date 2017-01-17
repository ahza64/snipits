/* eslint-env mocha */
import CreateProjectDialog from '../../../../src/components/projects/dialogs/create';
import React from 'react';
import { mount } from 'enzyme';
import { assert } from 'chai';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

describe('<CreateProjectDialog />', () => {

  it('check init', () => {
    const wrapper = mount(
      <MuiThemeProvider>
        <CreateProjectDialog open={ true } />
      </MuiThemeProvider>
    );
    var dialog = wrapper.find(CreateProjectDialog);
    assert.strictEqual(dialog.node.state.projectName, '', 'project name should be empty');
    var buttonDisabled = dialog.node.isConfirmButtonDisabled();
    assert.strictEqual(buttonDisabled, true, 'confirm button should be disabled');
  });

  it('check validation', () => {
    const wrapper = mount(
      <MuiThemeProvider>
        <CreateProjectDialog open={ true } />
      </MuiThemeProvider>
    );

    let disabled = {
      'project': false,
      'Project': false,
      'project1': false,
      'project_1': false,
      'project1.1': false,
      'project#1': true,
    };

    let dialog = wrapper.find(CreateProjectDialog);

    for (var name in disabled) {
      dialog.node.handleProjectNameChanged({ target: { value: name } });
      let buttonDisabled = dialog.node.isConfirmButtonDisabled();
      assert.strictEqual(buttonDisabled, disabled[name],
        `confirm button should be ${disabled[name] ? 'disabled' : 'enabled'} for name: ${name}`);
    }
  });
});