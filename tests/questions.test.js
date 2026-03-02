'use strict';

const questions = require('../src/questions');

describe('Questions data', () => {
  test('should have exactly 10 questions', () => {
    expect(questions).toHaveLength(10);
  });

  test('each question should have required fields', () => {
    questions.forEach((q) => {
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('text');
      expect(q).toHaveProperty('options');
      expect(q).toHaveProperty('answer');
    });
  });

  test('each question should have exactly 4 options', () => {
    questions.forEach((q) => {
      expect(q.options).toHaveLength(4);
    });
  });

  test('each question answer should be one of its options', () => {
    questions.forEach((q) => {
      expect(q.options).toContain(q.answer);
    });
  });

  test('question ids should be unique', () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(questions.length);
  });
});
