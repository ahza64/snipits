/**
* Change the envelope's status if error is received
* @param {Error} e error
* @param {Object} body response body
*/
function updateEnvelopeStatus(err, body) {
  if (!body.envelope) {
    body.envelope = {};
  }
  if (err.name === 'ValidationError') {
    const error_msgs = Object.keys(err.errors).map((key) => {
      return err.errors[key].message;
    });
    body.envelope.error = error_msgs.join('; ');
    body.envelope.status = 400;
  } else if (err.name === 'MongoError' && err.code === 16755) {
    body.envelope.error = 'Bad Geospaial Data';
    body.envelope.status = 400;
  } else if (err.name === 'MongoError' && err.code === 11000) {
    body.envelope.error = `ERROR: Duplicate key: ${err.toString()}`;
    body.envelope.status = 409;
  } else if (err.message === "Can not update host") {
    body.envelope.error = err.message;
    body.envelope.status = 400;
  } if (err.name === 'CastError' && err.path === '_id') {
    body.envelope.error = 'Bad Resource ID';
    body.envelope.status = 400;
  } else if (err.message.startsWith("Bad Query Parameter")) {
    body.envelope.error = err.message;
    body.envelope.status = 400;
  } else if (err.message === 'Resource Not Found') {
    body.envelope.error = err.message;
    body.envelope.status = 404;
  } else {
    console.warn('Unhandled Error', err.message);
    body.envelope.error = `Unhandled Error: ${err.message}`;
    body.envelope.status = 500;
  }
}

function envelope(ctx, err) {
  if (ctx) {
    ctx.body = {
      envelope: {
        request_id: ctx.id,
        request_url: ctx.originalUrl,
        host: null,
        status: 200
      },
      data: ctx.body
    };
    ctx.body.envelope = Object.assign({}, ctx.body.envelope, ctx.dsp_env);
    if (ctx.request && ctx.request.header) {
      ctx.body.envelope.host = ctx.request.header.host;
    }
    if (err) {
      updateEnvelopeStatus(err, ctx.body);
    }
  }
}

module.exports = {
  envelope: function *envelope_response_body(next) {
    this.dsp_env = {};
    let err = null;
    try {
      yield next;
    } catch (e) {
      console.error(e.message, e.stack);
      err = e;
    }
    envelope(this, err);
  }
};
