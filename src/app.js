'use strict';

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { doubleCsrf } = require('csrf-csrf');
const path = require('path');
const { configureAuth } = require('./auth');
const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-me-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Rate limiting – protect all routes from abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Stricter rate limit for the login / auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/login', authLimiter);
app.use('/auth', authLimiter);

configureAuth(app);

// CSRF protection for state-mutating routes
const csrfCookieName = process.env.NODE_ENV === 'production'
  ? '__Host-psifi.x-csrf-token'
  : 'x-csrf-token';

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET || 'change-me-in-production',
  getSessionIdentifier: (req) => req.session.id,
  cookieName: csrfCookieName,
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true,
  },
  getCsrfTokenFromRequest: (req) => req.body && req.body._csrf,
});

// Expose CSRF token to all views
app.use((req, res, next) => {
  res.locals.csrfToken = generateCsrfToken(req, res);
  next();
});

app.use(doubleCsrfProtection);

app.use('/', authRouter);
app.use('/', indexRouter);

module.exports = app;

