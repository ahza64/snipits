var expect = require('chai').expect,
    assert = require('chai').assert,
    debug = require('../../Debug')('test:pdf-resource'),
    _ = require('lodash'),
    mongoose = require('mongoose');

var PdfModel = require('./pdf-resource');


/**
 * Setup tests
 */
var monky = require('../../tests/resources')(mongoose);


/**
 * Tests
 */
describe('pdf-resource', function() {
  before(function(done) {
    mongoose.connect('mongodb://localhost/stage_meteor', done);
  });

  after(function(done) {
    PdfModel.remove({}, function() {
      monky.reset();
      mongoose.disconnect(done);
    });
  });

  it('should generate a unique id', function(done) {
    monky.build('Pdf', function(err, pdf) {
      pdf.save(function(err, resultPdf) {
        expect(resultPdf._id).not.to.equal(undefined);
        done();
      });
    });
  });

});

