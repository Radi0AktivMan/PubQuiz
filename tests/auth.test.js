'use strict';

process.env.OKTA_DOMAIN = 'test.okta.example.com';
process.env.OKTA_CLIENT_ID = 'test-client-id';
process.env.OKTA_CLIENT_SECRET = 'test-client-secret';
process.env.APP_BASE_URL = 'http://localhost:3000';
process.env.SESSION_SECRET = 'test-secret';

jest.mock('passport-openidconnect', () => {
  const { Strategy } = require('passport-strategy');
  class MockStrategy extends Strategy {
    constructor(_opts, _verify) {
      super();
      this.name = 'oidc';
    }
    authenticate() {
      this.fail({ message: 'Okta not available in test environment' });
    }
  }
  return MockStrategy;
});

const { ensureAuthenticated } = require('../src/auth');

describe('ensureAuthenticated middleware', () => {
  test('calls next() when user is authenticated', () => {
    const req = { isAuthenticated: () => true };
    const res = {};
    const next = jest.fn();
    ensureAuthenticated(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('redirects to /login when user is not authenticated', () => {
    const req = { isAuthenticated: () => false };
    const redirectMock = jest.fn();
    const res = { redirect: redirectMock };
    const next = jest.fn();
    ensureAuthenticated(req, res, next);
    expect(redirectMock).toHaveBeenCalledWith('/login');
    expect(next).not.toHaveBeenCalled();
  });
});
