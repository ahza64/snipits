const koa = require('koa');
const router = require('koa-router')();
const request = require('request-promise');

const app = koa();

const authUrlPrefix = 'https://www.arcgis.com/sharing/rest/oauth2/';
let userName;

// ESRI regestered Application authorization credintials
let clientId = '49rbdJiYdiMd2mDu';
let clientSecret = 'edc61206023547709cf932b146830718';

// internal redirect
let internalRedirectUri = 'http://localhost:3337/code/';
// redirect after successful token response from ESRI
let externalRedirectUri = '/success';

// setting url params
let client_id = `client_id=${clientId}`;
let client_secret = `client_secret=${clientSecret}`;
let redirect_uri = `redirect_uri=${internalRedirectUri}`;
let response_type = `response_type=code`;
let esriAuthUrl = `${authUrlPrefix}authorize`;
let esriTokenUrl = `${authUrlPrefix}token`;
let grant_type = "grant_type=authorization_code"

// url for Oauth login form
let oauthUrl = `${esriAuthUrl}?${client_id}&${response_type}&${redirect_uri}`;
// url for ESRI token generation by user
let codeUrl = `${esriTokenUrl}?${grant_type}&${client_secret}&${client_id}&${response_type}&${redirect_uri}&code=`;

// redirect to ESRI's Oauth login form
router.all('/oauth', function *() {
  console.log("arcgis redirect login");
  this.redirect(oauthUrl);
});

// get ESRI's login token by user, and final redirect
router.all('/code', function *(next) {
  console.log("arcgis redirect code");
  let oauthCode = this.query.code;
  let tokenUrl = codeUrl + oauthCode;
  let response = yield request({
    method: 'POST',
    url: tokenUrl
  });
  let jsonRes = JSON.parse(response);
  userName = jsonRes.username;
  // username will be needed to login the unique user into the dispatchr app
  console.log("unique identifer user name <<>>", jsonRes.username);
  // tokens will be needed to keep the ESRI user logged into ESRI
  console.log("unique access token <<>>", jsonRes.access_token);
  console.log("unique refresh token <<>>", jsonRes.refresh_token);
  // dispatchr app token generation will happen here
  // final redirect to send the user after successful ESRI login
  if(jsonRes.username){
    this.redirect(externalRedirectUri);
  }
});

router.get('/success', function (req, res) {
  this.body = `ESRI login success. Code, Token and User Name from ESRI generated. User Name from ESRI login success: "${userName}"`;
});

app.use(router.routes());

module.exports = app;
