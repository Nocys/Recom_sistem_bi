const { sendError } = require('../utils/response');

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const isDatabaseError = Boolean(err.code && err.severity);
  const message =
    isProduction && statusCode === 500
      ? 'Internal server error.'
      : err.message || 'Internal server error.';
  const errors =
    isProduction || !isDatabaseError
      ? null
      : {
          code: err.code,
          severity: err.severity
        };

  console.error('Request error:', err);

  return sendError(res, message, statusCode, errors);
}

module.exports = errorHandler;
