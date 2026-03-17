import { describe, it, expect } from 'vitest';
import {
  calculateScoreSummary,
  normalizeCorrectAnswer,
  getPerformanceLabel,
} from './scoreUtils.js';

describe('calculateScoreSummary', () => {
  const questions = [
    { id: 'q1', correctAnswer: 0, options: ['A', 'B', 'C', 'D'] },
    { id: 'q2', correctAnswer: 1, options: ['A', 'B', 'C', 'D'] },
    { id: 'q3', correctAnswer: 2, options: ['A', 'B', 'C', 'D'] },
    { id: 'q4', correctAnswer: 3, options: ['A', 'B', 'C', 'D'] },
  ];

  it('counts correct, wrong, and unanswered', () => {
    const userAnswers = { q1: 0, q2: 1, q3: 0, q4: 3 };
    const result = calculateScoreSummary(questions, userAnswers);
    expect(result).toEqual({
      total: 4,
      correct: 3,
      wrong: 1,
      unanswered: 0,
      percentage: 75,
    });
  });

  it('counts unanswered when answer is undefined', () => {
    const userAnswers = { q1: 0 };
    const result = calculateScoreSummary(questions, userAnswers);
    expect(result).toEqual({
      total: 4,
      correct: 1,
      wrong: 0,
      unanswered: 3,
      percentage: 25,
    });
  });

  it('counts unanswered when answer is null or negative', () => {
    const userAnswers = { q1: 0, q2: null, q3: -1 };
    const result = calculateScoreSummary(questions, userAnswers);
    // q1 answered, q2 null, q3 -1, q4 undefined => 3 unanswered
    expect(result.unanswered).toBe(3);
  });

  it('returns 0 percentage for empty questions', () => {
    const result = calculateScoreSummary([], {});
    expect(result).toEqual({
      total: 0,
      correct: 0,
      wrong: 0,
      unanswered: 0,
      percentage: 0,
    });
  });
});

describe('normalizeCorrectAnswer', () => {
  it('returns 0-based index when valid (0-3 for 4 options)', () => {
    expect(normalizeCorrectAnswer(0, 4)).toBe(0);
    expect(normalizeCorrectAnswer(1, 4)).toBe(1);
    expect(normalizeCorrectAnswer(2, 4)).toBe(2);
    expect(normalizeCorrectAnswer(3, 4)).toBe(3);
  });

  it('converts 1-based to 0-based', () => {
    expect(normalizeCorrectAnswer(1, 4)).toBe(1);
    expect(normalizeCorrectAnswer(4, 4)).toBe(3);
  });

  it('returns -1 for null/undefined', () => {
    expect(normalizeCorrectAnswer(null, 4)).toBe(-1);
    expect(normalizeCorrectAnswer(undefined, 4)).toBe(-1);
  });

  it('parses string numbers', () => {
    expect(normalizeCorrectAnswer('2', 4)).toBe(2);
  });

  it('returns 0 for invalid index', () => {
    expect(normalizeCorrectAnswer(5, 4)).toBe(0);
  });
});

describe('getPerformanceLabel', () => {
  it('returns Outstanding for 90+', () => {
    expect(getPerformanceLabel(90)).toEqual({ label: 'Outstanding!', variant: 'outstanding' });
    expect(getPerformanceLabel(100)).toEqual({ label: 'Outstanding!', variant: 'outstanding' });
  });

  it('returns Excellent for 75-89', () => {
    expect(getPerformanceLabel(75)).toEqual({ label: 'Excellent!', variant: 'excellent' });
    expect(getPerformanceLabel(89)).toEqual({ label: 'Excellent!', variant: 'excellent' });
  });

  it('returns Good Job for 60-74', () => {
    expect(getPerformanceLabel(60)).toEqual({ label: 'Good Job!', variant: 'good' });
  });

  it('returns Keep Practicing for 40-59', () => {
    expect(getPerformanceLabel(40)).toEqual({ label: 'Keep Practicing', variant: 'fair' });
  });

  it('returns Needs Practice for <40', () => {
    expect(getPerformanceLabel(39)).toEqual({ label: 'Needs Practice', variant: 'poor' });
  });
});
