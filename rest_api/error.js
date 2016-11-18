const deepFreeze = require('deep-freeze-strict');

const STATUS_RESOURCE = deepFreeze({
  LOGIN_ERROR: { status: 401, message: 'Login Failure. Not Authenticated!'},
  DUPLICATE_TREE: { status: 409, message: 'Tree already exists at this location'},
  GEOCODE_ERROR: { status: 201, message: 'No Address found at location'},
  UPDATE_ERROR: { status: 500, message: 'Update Failed'},
  NOT_ADDED: {status: 400, message: 'not added'},
  NOT_FOUND: {status: 404, message: 'not found'},
  INTERNAL_SERVER_ERROR: {status: 500, message: 'Internal Server Error'},
  HISTORIES_ERROR: {status: 200, message: 'Histories Error'},
  VERSION_ERROR: { status: 400, message: 'Bad Request for Version'}
});

function handleError(context, error, message) {
  console.log('EXCEPTION: ', context.id, error, context);
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
    handleError(this, STATUS_RESOURCE.INTERNAL_SERVER_ERROR);
  }
}

module.exports = middleware;
