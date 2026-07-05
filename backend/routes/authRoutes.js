const express = require('express');
const passport = require('../config/passport');
const env = require('../config/env');
const {
  authFailure,
  authHealth,
  getCurrentUser,
  loginLocalUser,
  logoutUser,
  registerLocalUser,
  sanitizeUser
} = require('../controllers/authController');
const { sendError } = require('../utils/response');

const router = express.Router();

const ensureGoogleOAuthConfigured = (req, res, next) => {
  if (!env.GOOGLE_OAUTH_CONFIGURED) {
    return sendError(res, 'Google OAuth credentials are not configured.', 500);
  }

  return next();
};

router.get('/health', authHealth);
router.post('/register', registerLocalUser);
router.post('/login', loginLocalUser);

router.get(
  '/google',
  ensureGoogleOAuthConfigured,
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

router.get(
  '/google/callback',
  ensureGoogleOAuthConfigured,
  passport.authenticate('google', {
    failureRedirect: '/auth/failure'
  }),
  (req, res, next) => {
    req.session.user = sanitizeUser(req.user);

    req.session.save((err) => {
      if (err) {
        return next(err);
      }

      return res.redirect(`${env.FRONTEND_URL}/index.html`);
    });
  }
);

router.get('/me', getCurrentUser);
router.post('/logout', logoutUser);
router.get('/failure', authFailure);

module.exports = router;
