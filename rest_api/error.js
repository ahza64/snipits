const deepFreeze = require('deep-freeze-strict');

const STATUS_RESOURCE = deepFreeze({  
  LOGIN_ERROR: { status: 401, message: 'NOT AUTHENTICATED!!'},
  DUPLICATE_TREE: { status: 409, message: 'Tree already exists at this location'},
  GEOCODE_ERROR: { status: 201, message: 'No Address found at location'},
  NOT_ADDED: {status: 400, message: 'not added'},
  NOT_FOUND: {status: 404, message: 'not found'},
  INTERNAL_SERVER_ERROR: {status: 500, message: 'Internal Server Error'},
  HISTORIES_ERROR: {status: 200, message: 'Histories Error'}
});

function handleError(context, error, message) {
  console.log('EXCEPTION: ', error, context);
  if(typeof error  === 'string') {
    error = STATUS_RESOURCE[error];
  }
  context.dsp_env.error_msg = message || error.message;
  context.dsp_env.status = error.status;
  context.status = error.status;
}

function *middleware(next) {
  try {
    this.errors = STATUS_RESOURCE;
    this.setError = function(error, message){
      handleError(this, error, message);
    };
    yield next;
  } catch (e) {
    handleError(this, 'INTERNAL_SERVER_ERROR');
  }
}

module.exports = middleware;
