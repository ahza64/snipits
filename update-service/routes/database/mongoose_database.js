var mongoose = require('mongoose');
var database = process.env.MONGO_DB || 'dev_local';
// Database connect options
var options = { replset: { socketOptions: { connectTimeoutMS : 30000 }}};


//TODO change to config
function buildMongoURI () {
  var loginInfo = '';
  if(process.env.MONGO_USER && process.env.MONGO_PASSWORD) {
   loginInfo = process.env.MONGO_USER + ':' + process.env.MONGO_PASSWORD + '@';
  }

  var uri = [
    'mongodb://',
    loginInfo,
    process.env.MONGO_SERVER || 'localhost',
    '/',
    database,
    process.env.MONGO_OPTIONS || ''
  ];
console.log(uri.join(''))
  return uri.join('');
}

// Initialize database.
mongoose.connect(buildMongoURI(), options);

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
  console.log('Mongoose connected to database ' + database + '.');
});

// If the connection throws an error
mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected.');
});

