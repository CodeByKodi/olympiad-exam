/**
 * Syllabus Service - loads syllabus definitions for exam/grade.
 * Supports: question generation, chapter-wise practice, coverage tracking.
 */

import { resolveStaticPath } from '../config.js';

/**
 * Load syllabus for exam and grade.
 * @param {string} examId - nso, imo, ieo, ics, igko, isso
 * @param {string|number} gradeId - 1-12
 * @returns {Promise<Object|null>} Syllabus object or null
 */
export async function loadSyllabus(examId, gradeId) {
  const grade = String(gradeId);
  const url = resolveStaticPath(`syllabus/${examId}/grade${grade}.json`);
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Load exam index (list of grades).
 * @param {string} examId
 * @returns {Promise<Object|null>}
 */
export async function loadSyllabusIndex(examId) {
  const url = resolveStaticPath(`syllabus/${examId}/index.json`);
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * List all topics for exam/grade.
 * @param {string} examId
 * @param {string|number} gradeId
 * @returns {Promise<Array>} Topics with subtopics
 */
export async function listTopics(examId, gradeId) {
  const syllabus = await loadSyllabus(examId, gradeId);
  return syllabus?.topics || [];
}

/**
 * List all subtopics for exam/grade (flattened).
 * @param {string} examId
 * @param {string|number} gradeId
 * @returns {Promise<Array>} Subtopic objects with parent topic info
 */
export async function listSubtopics(examId, gradeId) {
  const topics = await listTopics(examId, gradeId);
  const result = [];
  for (const t of topics) {
    for (const s of t.subtopics || []) {
      result.push({ ...s, topicCode: t.code, topicName: t.name });
    }
  }
  return result;
}

/**
 * Compute total recommended question count for exam/grade.
 * @param {string} examId
 * @param {string|number} gradeId
 * @returns {Promise<{ total: number, byTopic: Object }>}
 */
export async function computeRecommendedQuestionCount(examId, gradeId) {
  const syllabus = await loadSyllabus(examId, gradeId);
  if (!syllabus?.topics) return { total: 0, byTopic: {} };

  let total = 0;
  const byTopic = {};
  for (const t of syllabus.topics) {
    const topicTotal = t.subtopics?.reduce((s, st) => s + (st.recommendedQuestionCount || 0), 0) || t.recommendedQuestionCount || 0;
    byTopic[t.code] = { name: t.name, count: topicTotal };
    total += topicTotal;
  }
  return { total, byTopic };
}

/**
 * Get subtopic by code.
 * @param {string} examId
 * @param {string|number} gradeId
 * @param {string} subtopicCode - e.g. NSO-G3-T1-S1
 * @returns {Promise<Object|null>}
 */
export async function getSubtopicByCode(examId, gradeId, subtopicCode) {
  const topics = await listTopics(examId, gradeId);
  for (const t of topics) {
    const s = (t.subtopics || []).find((st) => st.code === subtopicCode);
    if (s) return { ...s, topicCode: t.code, topicName: t.name };
  }
  return null;
}
