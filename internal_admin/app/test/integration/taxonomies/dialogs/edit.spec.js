/* eslint-env mocha */
import { mount } from 'enzyme';
import { assert } from 'chai';
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import EditTaxonomyDialog from '../../../../src/components/taxonomy/dialogs/edit';

describe("<EditTaxonomyDialog />", () => {
  function mountComponent(props) {
    const wrapper = mount(
      <MuiThemeProvider>
        <EditTaxonomyDialog
          open={ props.open }
          title={ props.title }
          companyId={ props.companyId }
          companyName={ props.companyName }
          projectId={ props.projectId }
          projectName={ props.projectName }
          schemaId={ props.schemaId }
          schemaName={ props.schemaName }
          fieldName={ props.fieldName }
          order={ props.order }
          nodeType={ props.nodeType }
          keys={ props.keys }
          taxId={ props.taxId }
          taxonomies={ props.taxonomies }
        />
      </MuiThemeProvider>
    );
    return wrapper.find(EditTaxonomyDialog);
  }

  it('check form data filled', () => {
    let props = {
      open: true,
      title: "test",
      companyId: 1,
      companyName: "test_company",
      projectId: 1,
      projectName: "test_project",
      schemaId: 1,
      schemaName: "test_schema",
      fieldName: "test_fieldName",
      order: 1,
      nodeType: "e",
      keys: "1",
      taxId: 1,
      taxonomies: []
    };

    var component = mountComponent(props);
    component.node.loadProps(props);

    const html = document.getElementsByTagName('body')[0].innerHTML;
    assert.isTrue(html.includes(props.companyName), `companyName should be displayed in the dialog content`);
    assert.isTrue(html.includes(props.projectName), `projectName should be displayed in the dialog content`);
    assert.isTrue(html.includes(props.schemaName), `schemaName should be displayed in the dialog content`);
    assert.isTrue(html.includes(props.fieldName), `fieldName should be displayed in the dialog content`);
    assert.isTrue(html.includes(props.nodeType), `nodeType should be displayed in the dialog content`);
    assert.isTrue(html.includes(props.keys), `keys should be displayed in the dialog content`);
  });
});
