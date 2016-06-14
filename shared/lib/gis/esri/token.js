var fs = require('co-fs');
var util = require('./util');
var http_get = util.http_get;

var EsriToken = {
    url: 'https://www.arcgis.com/sharing/oauth2/token',
    params: {
           client_id: 'LjE6GH0661QwU7Ru',
           grant_type: 'client_credentials',
           client_secret: 'a455cfc74cc64d618d8406e494c23ebe',
           f: 'json'
    },    
    DEFAULT_EXPIRATION: 3600,
    
    token_file: '/tmp/esri_token_file.json',
    read_cache: function *() {
        try {
            var token = yield fs.readFile(this.token_file, {'encoding': 'utf8'});
            token = JSON.parse(token);
            token.expires_at = new Date(token.expires_at);
            // console.log("READ TOKEN", token)
            return token;
        } catch (e) {
            //no file...
            return undefined;
        }
    },
    write_cache: function *(token_data) {
        yield fs.writeFile(this.token_file, JSON.stringify(token_data), {'encoding': 'utf8'});
    },

    get: function*(){
        var token_data = yield this.read_cache();
        
        if(token_data !== undefined && token_data.expires_at !== null && token_data.expires_at > new Date()) {
            // console.log("READ TOKEN", token_data)
            return token_data.token;
        } else {
            var data = yield http_get(EsriToken.url, EsriToken.params);
            var token = data.access_token;
            var expires_in = EsriToken.DEFAULT_EXPIRATION * 1000;
            if( data.expires_in !== undefined ) {expires_in = data.expires_in * 1000;}
            var expires_at = new Date(new Date().getTime() + expires_in);
            yield EsriToken.write_cache({token: token, expires_at: expires_at});
            return token;
        }
    },
    
    expire_token: function *() {
      yield fs.unlink(this.token_file);
    }
    
};

module.exports = EsriToken;