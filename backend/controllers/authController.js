const authService = require('../services/authService');
const { sendError, sendSuccess } = require('../utils/response');

const SESSION_COOKIE_NAME = 'interior.sid';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sanitizeUser = authService.sanitizeUser;

const authHealth = (req, res) => {
  return sendSuccess(
    res,
    'Auth controller is ready. Google OAuth and local authentication are available.'
  );
};

const saveSession = (req) => {
  return new Promise((resolve, reject) => {
    if (!req.session) {
      resolve();
      return;
    }

    req.session.save((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
};

const validateRegisterRequest = ({ username, email, name, password }) => {
  if (!username) {
    return 'Username is required.';
  }

  if (String(username).trim().length < 3) {
    return 'Username must be at least 3 characters.';
  }

  if (!email) {
    return 'Email is required.';
  }

  if (!EMAIL_REGEX.test(String(email).trim())) {
    return 'Email format is invalid.';
  }

  if (!name) {
    return 'Name is required.';
  }

  if (!password) {
    return 'Password is required.';
  }

  if (String(password).length < 8) {
    return 'Password must be at least 8 characters.';
  }

  return null;
};

const registerLocalUser = async (req, res, next) => {
  try {
    const validationMessage = validateRegisterRequest(req.body || {});

    if (validationMessage) {
      return sendError(res, validationMessage, 400);
    }

    const user = await authService.createLocalUser({
      username: req.body.username,
      email: req.body.email,
      name: req.body.name,
      password: req.body.password
    });

    req.session.user = user;
    await saveSession(req);

    return sendSuccess(
      res,
      'Registration successful',
      {
        authenticated: true,
        user
      },
      201
    );
  } catch (error) {
    return next(error);
  }
};

const loginLocalUser = async (req, res, next) => {
  try {
    const { identifier, password } = req.body || {};

    if (!identifier) {
      return sendError(res, 'Username or email is required.', 400);
    }

    if (!password) {
      return sendError(res, 'Password is required.', 400);
    }

    const user = await authService.validateLocalLogin(identifier, password);

    req.session.user = user;
    await saveSession(req);

    return sendSuccess(res, 'Login successful', {
      authenticated: true,
      user
    });
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = (req, res) => {
  const user = req.user || (req.session ? req.session.user : null);

  if (!user) {
    return sendSuccess(res, 'User is not authenticated', {
      authenticated: false,
      user: null
    });
  }

  return sendSuccess(res, 'Authenticated user retrieved', {
    authenticated: true,
    user: sanitizeUser(user)
  });
};

const destroySession = (req) => {
  return new Promise((resolve, reject) => {
    if (!req.session) {
      resolve();
      return;
    }

    req.session.destroy((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
};

const logoutPassport = (req) => {
  return new Promise((resolve, reject) => {
    if (typeof req.logout !== 'function') {
      resolve();
      return;
    }

    req.logout((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
};

const logoutUser = async (req, res, next) => {
  try {
    await logoutPassport(req);
    await destroySession(req);

    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    return sendSuccess(res, 'User logged out successfully');
  } catch (err) {
    return next(err);
  }
};

const authFailure = (req, res) => {
  return sendError(res, 'Authentication failed.', 401);
};

module.exports = {
  authHealth,
  registerLocalUser,
  loginLocalUser,
  getCurrentUser,
  logoutUser,
  authFailure,
  sanitizeUser
};
