var config = require('dsp_shared/config/config').get();
var request_log = config.getLogger('request');
const isPromise = require('is-promise');

module.exports = {
  headerAccept: function *(next){
    var url = this.request.url;
    var header = this.request.header;
    console.log('accept header:', header.accept);
    if (url.endsWith('.jpeg') || url.endsWith('.jpg')) {
      header.accept= "image/jpeg";
      var sufix_len = url.endsWith('.jpeg') ? 5 : 4;
      this.request.url = url.substring(0, url.length-sufix_len);
    }
    if(header.accept === '*/*' || !header.accept) {
      header.accept = "application/json";
    }
    yield next;
  },

  envelope: function *(next){
    this.dsp_env = {
      request_id: this.id,
      request_url: this.request.url,
      host: this.request.header.host,
      method: this.request.method
    };
    yield next;
    if(this.request.header.accept === 'application/json') {
      this.body = {
        envelope: this.dsp_env,
        data: this.body
      };
    }
  },

  auth: function*(next) {
    if(this.isAuthenticated()) {
      this.user = this.passport.user;
      if(isPromise(this.passport.user)) {
        this.user = yield this.passport.user;
      }
      yield next;
    } else {
      if(this.request.header.accept === 'application/json'){
        this.dsp_env.status = 401;
      }
      this.setError(this.errors.LOGIN_ERROR);
    }
  },

  requestLog: function*(next){
    var ip;
    if(this.request.connection) {
      ip = this.request.connection.remoteAddress;
    }
    var log_me = {
      method: this.method,
      id: this.id,
      host: this.request.host,
      url: this.originalUrl,
      body: this.request.body,
      user: yield Promise.resolve(this.user),
      user_ip: ip,
      "user-agent": this.request.header['user-agent']
    };
    request_log.info(log_me);

    yield next;
  }
};
