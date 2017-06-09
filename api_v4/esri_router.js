const koa = require('koa');
const rp = require('request-promise');
const router = require('koa-router')();
const config = require('dsp_shared/conf.d/config');
const esriConfig = require('dsp_shared/conf.d/config.json').esri;

const app = koa();

if (process.env.NODE_ENV === 'production') {
  esriConfig.token.params.referer = `https://${config.api_host}`;
} else {
  esriConfig.token.params.referer = `http://${config.api_host}:${config.api_port}`;
}


router.get('/esri/token', function *esri(next) {
  const address = esriConfig.token.address;
  const params = esriConfig.token.params;

  const postOptions = {
    method: 'POST',
    uri: address,
    form: params,
    json: true
  };
  const token = yield rp(postOptions);
  this.body = token;
  yield next;
});

app.use(router.routes());

module.exports = app;
