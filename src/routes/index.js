'use strict';

const express = require('express');
const { ensureAuthenticated } = require('../auth');
const questions = require('../questions');

const router = express.Router();

router.get('/', ensureAuthenticated, (req, res) => {
  const user = req.user;
  const displayName = user.displayName || user._json?.name || user.emails?.[0]?.value || 'Player';
  res.render('index', { user: { displayName } });
});

router.get('/quiz', ensureAuthenticated, (req, res) => {
  req.session.quizAnswers = {};
  res.render('quiz', { questions, currentIndex: 0, totalQuestions: questions.length });
});

router.post('/quiz/answer', ensureAuthenticated, (req, res) => {
  const { questionId, answer, currentIndex } = req.body;
  const idx = parseInt(currentIndex, 10);

  if (!req.session.quizAnswers) {
    req.session.quizAnswers = {};
  }
  req.session.quizAnswers[questionId] = answer;

  const nextIndex = idx + 1;
  if (nextIndex >= questions.length) {
    return res.redirect('/quiz/results');
  }
  res.render('quiz', { questions, currentIndex: nextIndex, totalQuestions: questions.length });
});

router.get('/quiz/results', ensureAuthenticated, (req, res) => {
  const userAnswers = req.session.quizAnswers || {};
  const results = questions.map((q) => ({
    text: q.text,
    userAnswer: userAnswers[q.id] || '(no answer)',
    correctAnswer: q.answer,
    correct: userAnswers[q.id] === q.answer,
  }));
  const score = results.filter((r) => r.correct).length;
  res.render('results', { results, score, total: questions.length });
});

module.exports = router;
