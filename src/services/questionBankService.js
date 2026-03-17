/**
 * Question Bank Service - loads from scalable question-bank structure.
 * Supports fixed mock packs (questionIds) and dynamic practice packs (selectionRules).
 */

import { resolveStaticPath } from '../config.js';
import { EXAMS, GRADES } from '../constants/exams.js';

/**
 * Load all questions for exam/grade from question bank.
 * @param {string} examId
 * @param {string} gradeId
 * @returns {Promise<Map<string, Object>>} id -> question
 */
export async function loadQuestionBank(examId, gradeId) {
  const map = new Map();
  const base = `question-bank/${examId}/grade${gradeId}/questions`;
  const indexUrl = resolveStaticPath(`${base}/index.json`);

  try {
    const topicFiles = await getTopicFiles(examId, gradeId);
    for (const file of topicFiles) {
      const url = resolveStaticPath(`${base}/${file}`);
      const res = await fetch(url);
      if (!res.ok) continue;
      const arr = await res.json();
      if (!Array.isArray(arr)) continue;
      for (const q of arr) {
        if (q?.id) map.set(String(q.id), normalizeQuestion(q, examId, gradeId));
      }
    }
  } catch {
    // Question bank not available
  }
  return map;
}

async function getTopicFiles(examId, gradeId) {
  const manifestUrl = resolveStaticPath(`question-bank/${examId}/grade${gradeId}/questions/manifest.json`);
  try {
    const res = await fetch(manifestUrl);
    if (res.ok) {
      const manifest = await res.json();
      return manifest.files || [];
    }
  } catch {}
  return [];
}

function normalizeQuestion(q, examId, gradeId) {
  return {
    id: String(q.id),
    questionText: q.questionText,
    image: q.image ?? '',
    options: q.options || [],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    topic: q.topic,
    difficulty: q.difficulty || 'easy',
  };
}

/**
 * Load pack definitions for exam/grade.
 * @param {string} examId
 * @param {string} gradeId
 * @returns {Promise<Array>}
 */
export async function loadPackDefinitions(examId, gradeId) {
  const packs = [];
  const base = `question-bank/${examId}/grade${gradeId}/packs`;
  const known = ['practice-1', 'practice-2', 'practice-3', 'practice-4', 'mock-1', 'mock-2'];

  for (const id of known) {
    try {
      const res = await fetch(resolveStaticPath(`${base}/${id}.json`));
      if (res.ok) packs.push(await res.json());
    } catch {}
  }
  return packs;
}

/**
 * Resolve mock pack to questions (fixed order by questionIds).
 * @param {Object} packDef
 * @param {Map<string, Object>} bank
 * @returns {Array}
 */
export function resolveMockPack(packDef, bank) {
  const ids = packDef.questionIds || [];
  const questions = [];
  for (const id of ids) {
    const q = bank.get(String(id));
    if (q) questions.push(q);
  }
  return questions;
}

/**
 * Resolve practice pack by selecting questions from bank per selectionRules.
 * @param {Object} packDef
 * @param {Map<string, Object>} bank
 * @param {number} [seed]
 * @returns {Array}
 */
export function resolvePracticePack(packDef, bank, seed = Date.now()) {
  const rules = packDef.selectionRules || {};
  const topics = rules.topics || [];
  const difficultyMix = rules.difficultyMix || { easy: 15, medium: 8, hard: 2 };
  const count = packDef.questionCount || 25;

  let pool = Array.from(bank.values());
  if (topics.length > 0) {
    const topicSet = new Set(topics.map((t) => String(t).toLowerCase()));
    pool = pool.filter((q) => {
      const t = (q.topic || '').toLowerCase();
      return topicSet.has(t) || topics.some((top) => t.includes(top.toLowerCase()));
    });
  }

  const byDiff = { easy: [], medium: [], hard: [] };
  for (const q of pool) {
    const d = (q.difficulty || 'easy').toLowerCase();
    if (byDiff[d]) byDiff[d].push(q);
    else byDiff.easy.push(q);
  }

  const rng = seededRandom(seed);
  const selected = [];
  for (const [diff, target] of Object.entries(difficultyMix)) {
    const arr = byDiff[diff] || byDiff.easy;
    const shuffled = shuffle([...arr], rng);
    for (let i = 0; i < Math.min(target, shuffled.length) && selected.length < count; i++) {
      selected.push(shuffled[i]);
    }
  }
  while (selected.length < count && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    const q = pool[idx];
    if (!selected.includes(q)) selected.push(q);
    if (selected.length >= count) break;
  }
  return shuffle(selected, rng);
}

function shuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function seededRandom(seed) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/**
 * Check if question bank exists for exam/grade.
 */
export async function hasQuestionBank(examId, gradeId) {
  try {
    const url = resolveStaticPath(`question-bank/${examId}/grade${gradeId}/syllabus.json`);
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}
