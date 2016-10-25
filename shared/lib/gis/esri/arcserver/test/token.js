/* globals describe, it, before, after */

// Module
require('dsp_config/config').get({log4js: false});
const Token = require("../token");
var fs = require('fs');
var BPromise = require("bluebird");
BPromise.promisifyAll(fs);
require("should");
// const co = require("co");
// Test Block
describe('ESRI ArcServer Tokens', function() {
  var token;
  before(function(done) {
    token = new Token("https://esri.dispatchr.co:6443/arcgis", "system", "465tenth");
    if(fs.existsSync(token.tokenFileName())) {
      fs.unlinkSync(token.tokenFileName());
    }
    done();
  });

  after(function(done) {
        done();
  });

  it('be able to get a token', function(done) {
    
    token.getTokenData().then(function(token_data) {
      token_data.should.have.property('token');
      token_data.should.have.property('expires');      
      token_data.token.should.be.a.String();
      token_data.expires.should.be.a.Number();
      fs.existsSync(token.tokenFileName()).should.eql(true);
      done();
    }).catch(function(err){
      console.error("ERROR", err.message, err.stack);
      throw err;
    });
  });
  

  it('should read token from file system', function(done) {
    fs.existsSync(token.tokenFileName()).should.eql(true);
    token.token_data.token = 'UPDATED';
    token.writeToken();
    
    //create new token from file system;
    var read_token = new Token("https://esri.dispatchr.co:6443/arcgis", "system", "465tenth");
    read_token.getTokenData().then(function(){
      read_token.token_data.token.should.be.eql("UPDATED");
      done();    
    });    
  });
  
  
  it('should re-request the token if it expired', function(done) {
    var cur_time = new Date().getTime();
    var read_token;
    fs.existsSync(token.tokenFileName()).should.eql(true);
    token.token_data.expires = cur_time-1;
    token.writeToken().then(function(){
      read_token = new Token("https://esri.dispatchr.co:6443/arcgis", "system", "465tenth");    
      return read_token.getTokenData()
    }).then(function(){
      read_token.token_data.expires.should.be.above(cur_time);
      done();    
    });    
  });

});