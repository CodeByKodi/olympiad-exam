/**
 * Utility to load JSON test data from static starter packs.
 * Uses edited localStorage questions when available (from Question Manager).
 */

import { resolveStaticPath } from '../config.js';
import { loadQuestionSet, hasEditedQuestions } from './questionManagerUtils.js';

/**
 * Load test data: edited localStorage first, else fetch from starter packs.
 * @param {string} examId - Exam ID (e.g. 'nso', 'imo')
 * @param {string} gradeId - Grade ID (e.g. '3')
 * @param {string} testId - Test ID (e.g. '1', '2')
 * @returns {Promise<Object>} Test data with questions array
 */
export async function loadTestData(examId, gradeId, testId) {
  if (hasEditedQuestions(examId, gradeId, testId)) {
    const questions = await loadQuestionSet(examId, gradeId, testId);
    const count = questions.length;
    return {
      questions,
      durationMinutes: Math.ceil(count * 1.5),
    };
  }
  const url = resolveStaticPath(`starter-packs/${examId}/grade${gradeId}/test${testId}.json`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load test data: ${url} (${res.status})`);
  }
  return res.json();
}

/**
 * Get test metadata (question count, estimated duration) without loading full data.
 * For now we load the file - could be optimized with a manifest.json later.
 * @param {string} examId
 * @param {string} gradeId
 * @param {string} testId
 * @returns {Promise<{ questionCount: number, durationMinutes: number }>}
 */
export async function getTestMetadata(examId, gradeId, testId) {
  const data = await loadTestData(examId, gradeId, testId);
  const questions = data.questions || data;
  const count = Array.isArray(questions) ? questions.length : 0;
  const durationMinutes = data.durationMinutes ?? Math.ceil(count * 1.5);
  return { questionCount: count, durationMinutes };
}
