const mongoose = require('mongoose');
const Promise = require('bluebird');
const mockgoose = require('mockgoose');
const assert = require('assert');
const sinon = require('sinon');
require('sinon-as-promised')(Promise);
mockgoose(mongoose);
const TreeModel = require('./../trees-resource');

var sandbox;

describe('Trees', function() {
  beforeEach(() => sanbox = sinon.sandbox.create() );

  afterEach(() => { sandbox.restore(); });

  describe('Editing trees', function() {
    it('updates a tree status', function(done) {
      TreeModel.fetch(1);
      done();
    });
  });
});
