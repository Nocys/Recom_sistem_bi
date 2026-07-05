const { USER_ROLES } = require('../utils/constants');
const { sendError } = require('../utils/response');

function requireAdmin(req, res, next) {
  const user = req.user || (req.session ? req.session.user : null);

  if (!user) {
    return sendError(res, 'Authentication required', 401);
  }

  if (user.role !== USER_ROLES.ADMIN) {
    return sendError(res, 'Admin access required', 403);
  }

  return next();
}

module.exports = requireAdmin;
