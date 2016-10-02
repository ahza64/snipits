const isPromise = require('is-promise');

module.exports = {
  headerAccept: function*(next) {
    var url = this.request.url;
    var header = this.request.header;
    if (url.endsWith('.jpeg') || url.endsWith('.jpg')) {
      header.accept = 'image/jpeg';
      var sufix_len = url.endsWith('.jpeg') ? 5 : 4;
      url = url.substring(0, url.length-sufix_len);
    }
    if(header.accept === '*/*' || !header.accept) {
      header.accept = 'application/json';
    }
    yield next;
  },

  envelope: function*(next) {
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
      console.log('USER IS NOT AUTHENTICATED');
      this.status = 400;
    }
  }
};