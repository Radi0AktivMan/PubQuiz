# PubQuiz

An online general knowledge quiz web application for teams. Players authenticate with their corporate email address via **Okta** (OpenID Connect), then answer 10 multiple-choice questions and see their score.

---

## Features

- 🔐 **Okta SSO login** – employees sign in with their corporate email
- 🎯 **10-question general knowledge quiz** – multiple-choice format
- 📊 **Results page** – per-question breakdown with score summary
- 🔄 **Play again** – start a fresh quiz after viewing results

---

## Tech Stack

| Layer        | Technology                              |
|--------------|-----------------------------------------|
| Runtime      | Node.js                                 |
| Web framework| Express 5                               |
| Auth         | Passport + passport-openidconnect (OIDC)|
| Templating   | EJS                                     |
| Sessions     | express-session                         |

---

## Prerequisites

- Node.js ≥ 18
- An [Okta](https://developer.okta.com/) tenant with an **OIDC Web Application** configured

### Okta Application Settings

In your Okta Admin Console:

1. Go to **Applications → Create App Integration**
2. Select **OIDC – OpenID Connect** → **Web Application**
3. Set **Sign-in redirect URI** to `http://localhost:3000/auth/callback`
4. Set **Sign-out redirect URI** to `http://localhost:3000`
5. Note your **Client ID** and **Client Secret**

---

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/Radi0AktivMan/PubQuiz.git
cd PubQuiz
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Okta credentials (see below)

# 3. Run
npm start
# → http://localhost:3000
```

### Environment Variables (`.env`)

| Variable            | Description                                      |
|---------------------|--------------------------------------------------|
| `OKTA_DOMAIN`       | Your Okta domain, e.g. `dev-12345.okta.com`      |
| `OKTA_CLIENT_ID`    | OIDC application Client ID                       |
| `OKTA_CLIENT_SECRET`| OIDC application Client Secret                   |
| `APP_BASE_URL`      | Base URL of this app, e.g. `http://localhost:3000`|
| `SESSION_SECRET`    | Long random string for signing the session cookie|
| `PORT`              | (optional) HTTP port, default `3000`             |
| `NODE_ENV`          | Set to `production` for secure cookies           |

---

## Running Tests

```bash
npm test
```

---

## Project Structure

```
PubQuiz/
├── server.js               # Entry point
├── src/
│   ├── app.js              # Express app setup
│   ├── auth.js             # Okta OIDC / Passport configuration
│   ├── questions.js        # Quiz question bank
│   └── routes/
│       ├── auth.js         # /login, /auth/callback, /logout
│       └── index.js        # /, /quiz, /quiz/answer, /quiz/results
├── views/                  # EJS templates
│   ├── index.ejs
│   ├── quiz.ejs
│   └── results.ejs
├── public/
│   └── css/style.css
├── tests/
│   ├── auth.test.js
│   ├── questions.test.js
│   └── routes.test.js
├── .env.example
└── package.json
```