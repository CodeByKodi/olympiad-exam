/**
 * Question Library utilities - validation, duplicate detection, pack structure.
 * Safe to run in renderer (no Node APIs).
 */

import { normalizeCorrectAnswer } from './scoreUtils.js';

const EXAMS = ['nso', 'imo', 'ieo', 'ics', 'igko', 'isso'];
const MODES = ['practice', 'mock'];

/**
 * Validate pack structure.
 * @param {Object} pack - Parsed JSON pack
 * @returns {{ valid: boolean, errors?: string[] }}
 */
export function validatePack(pack) {
  const errors = [];

  if (!pack || typeof pack !== 'object') {
    return { valid: false, errors: ['Pack must be a valid JSON object'] };
  }

  if (pack.packId != null && typeof pack.packId !== 'string') {
    errors.push('packId must be a string if provided');
  }
  if (!pack.exam || !EXAMS.includes(String(pack.exam).toLowerCase())) {
    errors.push(`exam must be one of: ${EXAMS.join(', ')}`);
  }
  if (pack.grade == null || String(pack.grade) !== '3') {
    errors.push('grade must be 3 (only Grade 3 supported)');
  }
  if (!pack.mode || !MODES.includes(String(pack.mode).toLowerCase())) {
    errors.push('mode must be "practice" or "mock"');
  }
  if (!pack.title || typeof pack.title !== 'string') {
    errors.push('title is required');
  }

  const questions = pack.questions;
  if (!Array.isArray(questions)) {
    errors.push('questions must be an array');
    return { valid: false, errors };
  }

  if (questions.length === 0) {
    errors.push('questions array cannot be empty');
  }

  const ids = new Set();
  const texts = new Set();

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const err = validateQuestion(q);
    if (err) {
      errors.push(`Question ${i + 1}: ${err}`);
    }
    if (q?.id) {
      if (ids.has(String(q.id))) {
        errors.push(`Question ${i + 1}: duplicate id "${q.id}"`);
      }
      ids.add(String(q.id));
    }
    if (q?.questionText) {
      const norm = String(q.questionText).trim().toLowerCase();
      if (norm && texts.has(norm)) {
        errors.push(`Question ${i + 1}: duplicate question text`);
      }
      texts.add(norm);
    }
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

/**
 * Validate a single question.
 * @param {Object} q
 * @returns {string|null}
 */
function validateQuestion(q) {
  if (!q || typeof q !== 'object') return 'Invalid question object';
  if (!q.questionText || typeof q.questionText !== 'string') return 'questionText is required';
  const opts = q.options ?? q.opts;
  if (!Array.isArray(opts) || opts.length < 2) return 'options must be an array with at least 2 items';
  if (opts.length > 4) return 'options must have at most 4 items';
  if (opts.length !== 4) return 'Grade 3 requires exactly 4 options per question';
  const correct = q.correctAnswer;
  const optsLen = opts.length;
  const correctIdx = normalizeCorrectAnswer(correct, optsLen);
  if (correctIdx < 0 || correctIdx >= optsLen) {
    return `correctAnswer must be a valid index (0–${optsLen - 1})`;
  }
  return null;
}

/**
 * Detect duplicates against existing packs.
 * @param {Object} newPack - Pack being imported
 * @param {Array<Object>} existingPacks - Packs already in library (same exam/grade/mode)
 * @returns {{ duplicateIds: string[], duplicateTexts: string[], skippedIndices: number[] }}
 */
export function detectDuplicates(newPack, existingPacks) {
  const existingIds = new Set();
  const existingTexts = new Set();

  for (const p of existingPacks || []) {
    for (const q of p.questions || []) {
      if (q.id) existingIds.add(String(q.id));
      const t = (q.questionText || '').trim().toLowerCase();
      if (t) existingTexts.add(t);
    }
  }

  const duplicateIds = [];
  const duplicateTexts = [];
  const skippedIndices = [];

  for (let i = 0; i < (newPack.questions || []).length; i++) {
    const q = newPack.questions[i];
    let skip = false;
    if (q?.id && existingIds.has(String(q.id))) {
      duplicateIds.push(String(q.id));
      skip = true;
    }
    const t = (q?.questionText || '').trim().toLowerCase();
    if (t && existingTexts.has(t)) {
      duplicateTexts.push(q.questionText?.slice(0, 50) + '...');
      skip = true;
    }
    if (skip) skippedIndices.push(i);
  }

  return { duplicateIds, duplicateTexts, skippedIndices };
}

/**
 * Build practice pool: combine all enabled practice packs for exam/grade.
 * @param {Array<Object>} packs - Enabled practice packs
 * @returns {Array<Object>} Combined questions with unique ids
 */
export function buildPracticePool(packs) {
  const seenIds = new Set();
  const seenTexts = new Set();
  const result = [];

  for (const pack of packs || []) {
    for (const q of pack.questions || []) {
      const id = String(q.id || '');
      const text = (q.questionText || '').trim().toLowerCase();
      if (id && seenIds.has(id)) continue;
      if (text && seenTexts.has(text)) continue;
      if (id) seenIds.add(id);
      if (text) seenTexts.add(text);
      result.push({ ...q, id: id || `q-${result.length}-${Date.now()}` });
    }
  }

  return result;
}

/**
 * Build mock index: list of enabled mock packs as tests.
 * @param {Array<Object>} packs - Enabled mock packs
 * @returns {Array<{ id: string, title: string, questionCount: number, durationMinutes: number }>}
 */
export function buildMockIndex(packs) {
  return (packs || []).map((p) => ({
    id: p.packId,
    title: p.title || p.packId,
    questionCount: (p.questions || []).length,
    durationMinutes: p.durationMinutes ?? Math.ceil((p.questions?.length || 0) * 1.5),
  }));
}
