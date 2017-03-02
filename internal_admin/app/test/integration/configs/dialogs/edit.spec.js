/* eslint-env mocha */
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import EditConfigDialog from '../../../../src/components/configs/dialogs/edit';
import { mount } from 'enzyme';
import { assert } from 'chai';

describe('<CreateProjectDialog />', () => {

  function mountComponent(props) {
    const wrapper = mount(
      (<MuiThemeProvider>
        <EditConfigDialog
          open={ props.open }
          companyId={ props.companyId }
          projectId={ props.projectId }
          projectName={ props.projectName }
          configId={ props.configId }
          fileType={ props.fileType }
          status={ props.status }
          description={ props.description }
          watchers={ props.watchers } />
      </MuiThemeProvider>));
    return wrapper.find(EditConfigDialog);
  }

  it('check init', () => {
    var component = mountComponent({ open: true });
    var buttonDisabled = component.node.isConfirmButtonDisabled();
    assert.strictEqual(buttonDisabled, true, 'confirm button should be disabled');
  });

  it('check validation', () => {
    var component = mountComponent({ open: true });

    let disabled = {
      'config': false,
      'Config': false,
      'config1': false,
      'config_1': false,
      'config1.1': false,
      'config#1': true,
    };

    for (var name in disabled) {
      component.node.handleConfigTypeChanged({ target: { value: name } });
      let buttonDisabled = component.node.isConfirmButtonDisabled();
      assert.strictEqual(buttonDisabled, disabled[name],
        `confirm button should be ${disabled[name] ? 'disabled' : 'enabled'} for name: ${name}`);
    }
  });

  it('check existed config info', () => {
    let props = {
      open: true,
      companyId: 1,
      projectId: 1,
      projectName: 'ProjectName1',
      configId: 1,
      fileType: 'FileType1',
      status: 'active',
      description: 'some description',
      watchers: [
        { email: 'a@aa.aa' },
        { email: 'b@bb.bb' },
        { email: 'c@cc.cc' }
      ]
    };
    var component = mountComponent(props);
    component.node.loadProps(props);

    const html = document.getElementsByTagName('body')[0].innerHTML;
    assert.isTrue(html.includes(props.projectName), `projectName should be displayed in the dialog content`);
    assert.isTrue(html.includes(props.fileType), `fileType should be displayed in the dialog content`);
    assert.isTrue(html.includes(props.description), `description should be displayed in the dialog content`);
    props.watchers.forEach(function(watcher) {
      assert.isTrue(html.includes(watcher.email), `${watcher.email} should be displayed in the dialog content`);
    });
  });

});