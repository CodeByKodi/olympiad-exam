/**
 * Question Bank Service - loads from scalable question-bank structure.
 * Supports fixed mock packs (questionIds) and dynamic practice packs (selectionRules).
 */

import { resolveStaticPath } from '../config.js';
import { EXAMS, GRADES } from '../constants/exams.js';

/**
 * Load all questions for exam/grade from question bank.
 * Fetches topic files in parallel for faster load.
 * @param {string} examId
 * @param {string} gradeId
 * @returns {Promise<Map<string, Object>>} id -> question
 */
export async function loadQuestionBank(examId, gradeId) {
  const map = new Map();
  const base = `question-bank/${examId}/grade${gradeId}/questions`;

  try {
    const topicFiles = await getTopicFiles(examId, gradeId);
    const results = await Promise.all(
      topicFiles.map(async (file) => {
        const url = resolveStaticPath(`${base}/${file}`);
        const res = await fetch(url);
        if (!res.ok) return [];
        const text = await res.text();
        if (text.trimStart().startsWith('<')) return [];
        try {
          const arr = JSON.parse(text);
          return Array.isArray(arr) ? arr : [];
        } catch {
          return [];
        }
      })
    );
    for (const arr of results) {
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
      const text = await res.text();
      if (text.trimStart().startsWith('<')) {
        console.warn(`[QuestionBank] Got HTML instead of JSON at ${manifestUrl} (404?)`);
        return [];
      }
      const manifest = JSON.parse(text);
      return manifest.files || [];
    }
  } catch (e) {
    console.warn(`[QuestionBank] Failed to load manifest for ${examId} grade ${gradeId}:`, e?.message);
  }
  return [];
}

function normalizeQuestion(q, _examId, _gradeId) {
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
 * Fetches all pack files in parallel for faster load.
 * @param {string} examId
 * @param {string} gradeId
 * @returns {Promise<Array>}
 */
export async function loadPackDefinitions(examId, gradeId) {
  const base = `question-bank/${examId}/grade${gradeId}/packs`;
  const known = ['practice-1', 'practice-2', 'practice-3', 'practice-4', 'practice-5', 'practice-6', 'practice-7', 'practice-8', 'practice-9', 'practice-10', 'practice-11', 'practice-12', 'mock-1', 'mock-2'];

  const results = await Promise.all(
    known.map(async (id) => {
      try {
        const url = resolveStaticPath(`${base}/${id}.json`);
        const res = await fetch(url);
        if (!res.ok) return null;
        const text = await res.text();
        if (text.trimStart().startsWith('<')) return null;
        return JSON.parse(text);
      } catch {
        return null;
      }
    })
  );
  return results.filter(Boolean);
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
  const selectedSet = new Set(selected);
  while (selected.length < count) {
    const remaining = pool.filter((q) => !selectedSet.has(q));
    if (remaining.length === 0) break;
    const idx = Math.floor(rng() * remaining.length);
    const q = remaining[idx];
    selected.push(q);
    selectedSet.add(q);
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
