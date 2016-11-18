var fs = require('fs');
var path = require('path');
var readline = require('readline');
var googleAuth = require('google-auth-library');
var BPromise = require('bluebird');
// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/drive-nodejs-quickstart.json

var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs-quickstart.json';

BPromise.promisifyAll(require("fs"));



// var SCOPES = ['https://www.googleapis.com/auth/drive'];
var SCOPES = ['https://www.googleapis.com/auth/gmail.send'];



function *authorizeUser(secret_file_path, token_path) {
  var credentials = yield loadSecretFile(secret_file_path);
  var token = yield fs.readFileAsync(token_path);    
  token = JSON.parse(token);
  return authorize(credentials, token);    
}

function *loadSecretFile(file_path) {
  file_path = file_path || 'client_secret.json';
  // Load client secrets from a local file.
  var content = yield fs.readFileAsync(file_path);  
  return JSON.parse(content);
}


function getOAuthClient(credentials) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
  return oauth2Client;
}


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, token) {
  var oauth2Client = getOAuthClient(credentials);
  oauth2Client.credentials = token;
  return oauth2Client;  
}


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function *createNewToken(secret_file_path, tokenPath, scopes) {
  var credentials = yield loadSecretFile(secret_file_path);
  var oauth2Client = getOAuthClient(credentials);
  var authUrl = oauth2Client.generateAuthUrl({
                                                access_type: 'offline',
                                                scope: scopes
                                              });
  console.log('Authorize this app by visiting this url: ', authUrl);
  return yield new BPromise(function(resolve, reject) {
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
      rl.close();
      oauth2Client.getToken(code, function(err, token) {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          reject(err);
        }
        oauth2Client.credentials = token;
        try {
          storeToken(token, tokenPath);
        } catch(err) {
          console.log('Error storing token stored ', err);
          reject(err);
        }
        resolve(oauth2Client);
      });
    });    
  });
}


/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token, tokenPath) {
  try {
    fs.mkdirSync(path.dirname(tokenPath));
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(tokenPath, JSON.stringify(token));
  console.log('Token stored to ' + tokenPath);
}

module.exports = {authorize: authorize};

if (require.main === module) {
  var baker = require('dsp_shared/lib/baker');
  
  baker.command(function*(secret_file_path, token_path) {
    token_path = token_path || TOKEN_PATH;
    return yield authorizeUser(secret_file_path, token_path);
  }, {command: "authorizeUser"});
  
  
  baker.command(function*(secret_file_path, token_path, scopes){
    token_path = token_path || TOKEN_PATH;
    scopes = scopes || SCOPES;
    
    if(typeof(scopes) === "string") {
      scopes = [scopes];
    }
    
    return yield createNewToken(secret_file_path, token_path, scopes);
  }, {command: "createToken"});
  
  baker.run();
}
