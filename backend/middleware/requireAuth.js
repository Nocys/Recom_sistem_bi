const { sendError } = require('../utils/response');

function requireAuth(req, res, next) {
  if (req.user || (req.session && req.session.user)) {
    return next();
  }

  return sendError(res, 'Authentication required', 401);
}

module.exports = requireAuth;
