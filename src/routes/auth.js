'use strict';

const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/login', (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}, passport.authenticate('oidc'));

router.get(
  '/auth/callback',
  passport.authenticate('oidc', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      const logoutUrl = `https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/logout`
        + `?post_logout_redirect_uri=${encodeURIComponent(process.env.APP_BASE_URL)}`
        + `&client_id=${process.env.OKTA_CLIENT_ID}`;
      res.redirect(logoutUrl);
    });
  });
});

module.exports = router;
