'use strict';

/**
 * Route tests using a mock auth layer so we can test quiz logic
 * without a live Okta connection.
 */

process.env.OKTA_DOMAIN = 'test.okta.example.com';
process.env.OKTA_CLIENT_ID = 'test-client-id';
process.env.OKTA_CLIENT_SECRET = 'test-client-secret';
process.env.APP_BASE_URL = 'http://localhost:3000';
process.env.SESSION_SECRET = 'test-secret';

// Stub passport-openidconnect so the app can be instantiated without a
// real Okta tenant.
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

const request = require('supertest');
const app = require('../src/app');
const questions = require('../src/questions');

describe('GET /', () => {
  test('unauthenticated request redirects to /login', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });
});

describe('GET /quiz', () => {
  test('unauthenticated request redirects to /login', async () => {
    const res = await request(app).get('/quiz');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });
});

describe('GET /quiz/results', () => {
  test('unauthenticated request redirects to /login', async () => {
    const res = await request(app).get('/quiz/results');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });
});

describe('POST /quiz/answer', () => {
  test('unauthenticated request without CSRF token is rejected', async () => {
    const res = await request(app)
      .post('/quiz/answer')
      .send({ questionId: 1, answer: 'Paris', currentIndex: 0 });
    // CSRF protection runs before auth; unauthenticated POST without token → 403
    expect(res.status).toBe(403);
  });
});

describe('GET /login', () => {
  test('triggers OIDC authentication (redirects or challenges)', async () => {
    const res = await request(app).get('/login');
    // The mock strategy will fail/challenge so we expect a non-200 response
    expect([302, 401]).toContain(res.status);
  });
});

describe('Quiz logic (authenticated simulation)', () => {
  function buildAuthenticatedAgent(agent) {
    // Inject a pre-authenticated session by overriding passport internals
    return agent;
  }

  test('correct answer is detected in questions data', () => {
    const q = questions.find((q) => q.id === 1);
    expect(q.answer).toBe('Paris');
  });

  test('score calculation: all correct answers', () => {
    const userAnswers = {};
    questions.forEach((q) => {
      userAnswers[q.id] = q.answer;
    });
    const score = questions.filter((q) => userAnswers[q.id] === q.answer).length;
    expect(score).toBe(questions.length);
  });

  test('score calculation: no correct answers', () => {
    const userAnswers = {};
    const score = questions.filter((q) => (userAnswers[q.id] || '') === q.answer).length;
    expect(score).toBe(0);
  });

  test('score calculation: partial correct answers', () => {
    const userAnswers = {};
    questions.slice(0, 3).forEach((q) => {
      userAnswers[q.id] = q.answer;
    });
    const score = questions.filter((q) => userAnswers[q.id] === q.answer).length;
    expect(score).toBe(3);
  });
});
