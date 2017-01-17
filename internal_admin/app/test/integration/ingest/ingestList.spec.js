/* eslint-env mocha */
import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import IngestList from '../../../src/components/ingest/ingestList';
import ActionMenu from '../../../src/components/ingest/actionMenu';
import TextField from 'material-ui/TextField';
import { mount } from 'enzyme';
import { assert } from 'chai';
import { expect } from 'chai';

// Mocks
const components = require('../mocks/components');
const database = require('../mocks/database');
const ingestionsAPI = require('../mocks/api/ingestions');

import authRedux from '../../../src/reduxes/auth';

describe('<IngestList />', () => {

  before(function() {
    components.init();
    database.init();
  });

  function initRedux(companyId) {
    authRedux.dispatch({
      type: 'LOGIN',
      user: {
        companyId: companyId
      }
    });
  }

  function mountComponent() {
    const wrapper = mount(
      <MuiThemeProvider>
        <IngestList />
      </MuiThemeProvider>
    );
    return wrapper.find(IngestList);
  }

  function checkTotalInfo(text, found, ingested) {
    var re = /(\d+)\s*found\s*\/\s*(\d+)\s*ingested/i;
    var total = text.match(re);
    assert.isOk(total, `total information should be displayed on the component`);
    assert.equal(total[1], found, `total ingestions should be ${found}`);
    assert.equal(total[2], ingested, `total ingested files should be ${ingested}`);
  }

  function chechIngestionTable(text, ingestions) {
    ingestions.forEach(function(ingestion) {
      assert.isTrue(text.includes(ingestion.customerFileName), `${ingestion.customerFileName} should be displayed in the table`);
      assert.isTrue(text.includes(ingestion.s3FileName), `${ingestion.s3FileName} should be displayed in the table`);
      assert.isTrue(text.includes(ingestion.description), `${ingestion.description} should be displayed in the table`);
    });
  }

  function getIngestedTotal(ingestions) {
    let ingested = 0;
    ingestions.forEach(function(ingestion) {
      if (ingestion.ingested === true) {
        ingested++;
      }
    });
    return ingested;
  }

  it('check ingestions table', () => {
    var companyId = 1;
    initRedux(companyId);
    var component = mountComponent();

    var ingestions = ingestionsAPI.getIngestions(companyId);
    var text = component.text();
    var found = ingestions.length;
    var ingested = getIngestedTotal(ingestions);

    checkTotalInfo(text, found, ingested);
    chechIngestionTable(text, ingestions);
  });

  it('check ingestion filter', () => {
    var companyId = 1;
    initRedux(companyId);
    var component = mountComponent();

    var search = '2';
    var re = new RegExp(search, 'i');
    var ingestions = ingestionsAPI.getIngestions(companyId).filter(function(i) {
      return i.customerFileName.match(re);
    });

    var found = ingestions.length;
    var ingested = getIngestedTotal(ingestions);

    var searchField = component.find(TextField);
    searchField.find('input').simulate('change', { target: { value: search } });

    var text = component.text();
    checkTotalInfo(text, found, ingested);
    chechIngestionTable(text, ingestions);
  });

  function changeIngested(ingested) {
    var companyId = 1;
    initRedux(companyId);
    var component = mountComponent();
    var ingestions = ingestionsAPI.getIngestions(companyId);

    var index = -1;
    var found = ingestions.length;
    var ingestedTotal = getIngestedTotal(ingestions);
    for (let i = 0; i < ingestions.length; i++) {
      if (ingestions[i].ingested === !ingested) {
        index = i;
      }
    }

    assert.notEqual(index, -1,
      `ingestions should contain at least one ${ingested ? 'not' : ''} ingested file`);
    var menu = component.find(ActionMenu).at(index);
    if (ingested) {
      menu.node.handleSetIngested();
    } else {
      menu.node.handleUnSetIngested();
    }

    checkTotalInfo(component.text(), found, ingestedTotal + (ingested === true ? 1 : -1));
  }

  it('check set file ingested', () => {
    changeIngested(true);
  });

  it('check unset file ingested', () => {
    changeIngested(false);
  });

});