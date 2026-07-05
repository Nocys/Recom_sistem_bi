const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const env = require('./env');
const authService = require('../services/authService');

if (env.GOOGLE_OAUTH_CONFIGURED) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleUser = {
            google_id: profile.id,
            email:
              profile.emails && profile.emails[0]
                ? profile.emails[0].value
                : null,
            name: profile.displayName,
            avatar_url:
              profile.photos && profile.photos[0]
                ? profile.photos[0].value
                : null
          };

          const user = await authService.findOrCreateGoogleUser(googleUser);

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await authService.findUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
