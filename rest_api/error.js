const deepFreeze = require('deep-freeze-strict');

const ERROR_RESOURCE = deepFreeze({
  DUPLICATE_TREE: { status: 409, message: 'Tree already exists at this location'},
  GEOCODE_ERROR: { status: 201, message: 'No Address found at location'},
  NOT_ADDED: {status: 400, message: 'not added'},
  INTERNAL_SERVER_ERROR: {status: 500, message: 'Internal Server Error'}
});

function handleError(context, error, message) {
  console.log('EXCEPTION: ', error, context);
  if(typeof error  === 'string') {
    error = ERROR_RESOURCE[error];
  }
  context.dsp_env.msg = message || error.message;
  context.dsp_env.status = error.status;
  context.status = error.status;
}

function *middleware(next) {
  try {
    this.errors = ERROR_RESOURCE;
    this.setError = function(error, message){
      handleError(this, error, message);
    };
    yield next;
  } catch (e) {
    handleError(this, 'INTERNAL_SERVER_ERROR');
  }
}

module.exports = middleware;
