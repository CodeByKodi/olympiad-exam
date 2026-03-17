/**
 * Question Manager utilities.
 * Load, save, reset, export, and validate question sets.
 */

import { STORAGE_KEYS, GRADE_CONFIG } from '../constants/exams.js';
import { TESTS_PER_EXAM } from '../constants/exams.js';
import { resolveStaticPath } from '../config.js';

function getStorageKey(examId, gradeId, testId) {
  return `${STORAGE_KEYS.QUESTION_SETS_PREFIX}${examId}_${gradeId}_${testId}`;
}

function getFromStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setInStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to save questions:', e);
  }
}

function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

/**
 * Load question set: edited localStorage first, else fetch from JSON.
 * @param {string} examId
 * @param {string} gradeId
 * @param {string} testId
 * @returns {Promise<Array>} Questions array
 */
export async function loadQuestionSet(examId, gradeId, testId) {
  const key = getStorageKey(examId, gradeId, testId);
  const edited = getFromStorage(key);
  if (edited && Array.isArray(edited)) {
    return edited;
  }
  const url = resolveStaticPath(`starter-packs/${examId}/grade${gradeId}/test${testId}.json`);
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return []; // Grade has no content yet; allow adding questions
    throw new Error(`Failed to load: ${url}`);
  }
  const data = await res.json();
  const questions = data.questions || data;
  const arr = Array.isArray(questions) ? questions : [];
  return arr.map((q) => ({ ...q, id: String(q.id ?? '') }));
}

/**
 * Save question set to localStorage.
 * @param {string} examId
 * @param {string} gradeId
 * @param {string} testId
 * @param {Array} questions
 */
export function saveQuestionSet(examId, gradeId, testId, questions) {
  const key = getStorageKey(examId, gradeId, testId);
  setInStorage(key, questions);
}

/**
 * Reset question set: remove edited localStorage.
 * @param {string} examId
 * @param {string} gradeId
 * @param {string} testId
 */
export function resetQuestionSet(examId, gradeId, testId) {
  const key = getStorageKey(examId, gradeId, testId);
  removeFromStorage(key);
}

/**
 * Check if edited questions exist for a test.
 * @param {string} examId
 * @param {string} gradeId
 * @param {string} testId
 * @returns {boolean}
 */
export function hasEditedQuestions(examId, gradeId, testId) {
  const key = getStorageKey(examId, gradeId, testId);
  return getFromStorage(key) !== null;
}

/**
 * Export question set as full test JSON (title, durationMinutes, questionCount, questions).
 * @param {Array} questions
 * @param {string} filename
 * @param {Object} meta - { examId, gradeId, testId, title }
 */
export function exportQuestionSet(questions, filename, meta = {}) {
  const data = {
    title: meta.title || `Test ${meta.testId || ''}`,
    durationMinutes: meta.durationMinutes ?? 15,
    questionCount: questions.length,
    questions,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `test-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate imported JSON. Accepts full test format or questions-only.
 * @param {string} jsonText
 * @param {string} [gradeId] - Grade for validation rules (e.g. options per question)
 * @returns {{ valid: boolean, questions?: Array, error?: string }}
 */
export function parseImportJson(jsonText, gradeId = '3') {
  try {
    const data = JSON.parse(jsonText);
    const questions = data.questions ?? (Array.isArray(data) ? data : null);
    if (!Array.isArray(questions)) {
      return { valid: false, error: 'JSON must contain a "questions" array or be an array of questions' };
    }
    for (let i = 0; i < questions.length; i++) {
      const err = validateQuestion(questions[i], gradeId);
      if (err) return { valid: false, error: `Question ${i + 1}: ${err}` };
    }
    return { valid: true, questions };
  } catch (e) {
    return { valid: false, error: e.message || 'Invalid JSON' };
  }
}

/**
 * Validate a single question.
 * @param {Object} q
 * @param {string} [gradeId] - Grade for options-per-question rule (default '3')
 * @returns {string|null} Error message or null if valid
 */
export function validateQuestion(q, gradeId = '3') {
  if (!q || typeof q !== 'object') return 'Invalid question object';
  if (!q.questionText || typeof q.questionText !== 'string') return 'questionText is required';
  const opts = q.options ?? q.opts;
  if (!Array.isArray(opts) || opts.length < 2) return 'options must be an array with at least 2 items';
  const cfg = GRADE_CONFIG[gradeId];
  const required = cfg?.optionsPerQuestion ?? 4;
  if (opts.length > required) return `options must have at most ${required} items`;
  if (opts.length !== required) return `Grade ${gradeId} requires exactly ${required} options per question`;
  const correct = q.correctAnswer;
  if (correct == null || correct < 0 || correct >= opts.length) {
    return 'correctAnswer must be a valid index (0–' + (opts.length - 1) + ')';
  }
  return null;
}

/**
 * Generate unique id for new question.
 * @param {Array} existingQuestions
 * @param {string} prefix - Optional prefix (e.g. examId-grade3-test1)
 * @returns {string}
 */
export function generateQuestionId(existingQuestions, prefix = '') {
  const ids = new Set(existingQuestions.map((q) => String(q.id)));
  let n = 1;
  const base = prefix ? `${prefix}-q` : 'q';
  while (ids.has(base + n)) n++;
  return String(prefix ? base + n : n);
}

/**
 * Load all question sets for an exam (all 5 tests). Used for duplicate check.
 * @param {string} examId
 * @param {string} gradeId
 * @returns {Promise<Map<string, Array>>} testId -> questions
 */
export async function loadAllQuestionSetsForExam(examId, gradeId) {
  const all = new Map();
  for (const t of TESTS_PER_EXAM) {
    const qs = await loadQuestionSet(examId, gradeId, t.id);
    all.set(t.id, qs);
  }
  return all;
}

/**
 * Check if questionText already exists in the same exam (across all tests).
 * @param {Map<string, Array>} allSets - Map of testId -> questions
 * @param {string} questionText - Normalized text to check
 * @param {string} excludeTestId - When editing, exclude this test
 * @param {number} excludeIndex - When editing, exclude this question index in excludeTestId
 * @returns {{ duplicate: boolean, inTest?: string }}
 */
export function checkDuplicateInExam(allSets, questionText, excludeTestId = null, excludeIndex = null) {
  const normalized = (questionText || '').trim().toLowerCase();
  if (!normalized) return { duplicate: false };
  for (const [testId, questions] of allSets) {
    for (let i = 0; i < questions.length; i++) {
      if (excludeTestId === testId && excludeIndex === i) continue;
      const t = (questions[i].questionText || '').trim().toLowerCase();
      if (t && t === normalized) return { duplicate: true, inTest: testId };
    }
  }
  return { duplicate: false };
}
