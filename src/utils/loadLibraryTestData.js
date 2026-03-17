/**
 * Load test data from the Question Library.
 * Used when library packs are available for the exam/grade/mode.
 */

import * as libraryService from '../services/questionLibraryService';
import { buildPracticePool } from './questionLibraryUtils';

/**
 * Load practice pool: all enabled practice packs combined.
 * @param {string} examId
 * @param {string} gradeId
 * @param {Array} packs - From useQuestionLibrary().packs
 * @returns {Promise<{ questions: Array, durationMinutes: number }>}
 */
export async function loadPracticePool(examId, gradeId, packs) {
  if (!libraryService.isAvailable()) return null;

  const enabled = (packs || []).filter(
    (p) =>
      p.enabled !== false &&
      p.exam === examId &&
      String(p.grade) === String(gradeId) &&
      p.mode === 'practice'
  );

  if (enabled.length === 0) return null;

  const loadedPacks = [];
  for (const p of enabled) {
    const res = await libraryService.loadPackData(p);
    if (res.ok && res.pack) loadedPacks.push(res.pack);
  }

  const questions = buildPracticePool(loadedPacks);
  if (questions.length === 0) return null;

  const totalDuration = loadedPacks.reduce((s, p) => s + (p.durationMinutes || 0), 0);
  return {
    questions,
    durationMinutes: Math.ceil(totalDuration / loadedPacks.length) || Math.ceil(questions.length * 1.5),
  };
}

/**
 * Load a specific mock pack by packId.
 * @param {string} examId
 * @param {string} gradeId
 * @param {string} packId - testId in URL
 * @param {Array} packs - From useQuestionLibrary().packs
 * @returns {Promise<{ questions: Array, durationMinutes: number } | null>}
 */
export async function loadMockPack(examId, gradeId, packId, packs) {
  if (!libraryService.isAvailable()) return null;

  const pack = (packs || []).find(
    (p) =>
      p.enabled !== false &&
      p.exam === examId &&
      String(p.grade) === String(gradeId) &&
      p.mode === 'mock' &&
      p.packId === packId
  );

  if (!pack) return null;

  const res = await libraryService.loadPackData(pack);
  if (!res.ok || !res.pack) return null;

  const questions = res.pack.questions || [];
  return {
    questions,
    durationMinutes: res.pack.durationMinutes ?? Math.ceil(questions.length * 1.5),
    title: res.pack.title,
  };
}
