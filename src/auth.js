'use strict';

const passport = require('passport');
const OpenIDConnectStrategy = require('passport-openidconnect');

function configureAuth(app) {
  const {
    OKTA_DOMAIN,
    OKTA_CLIENT_ID,
    OKTA_CLIENT_SECRET,
    APP_BASE_URL,
  } = process.env;

  passport.use(
    'oidc',
    new OpenIDConnectStrategy(
      {
        issuer: `https://${OKTA_DOMAIN}/oauth2/default`,
        authorizationURL: `https://${OKTA_DOMAIN}/oauth2/default/v1/authorize`,
        tokenURL: `https://${OKTA_DOMAIN}/oauth2/default/v1/token`,
        userInfoURL: `https://${OKTA_DOMAIN}/oauth2/default/v1/userinfo`,
        clientID: OKTA_CLIENT_ID,
        clientSecret: OKTA_CLIENT_SECRET,
        callbackURL: `${APP_BASE_URL}/auth/callback`,
        scope: ['openid', 'profile', 'email'],
      },
      (issuer, profile, done) => {
        return done(null, profile);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.session());
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = { configureAuth, ensureAuthenticated };
