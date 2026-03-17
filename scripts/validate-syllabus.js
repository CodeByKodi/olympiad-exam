#!/usr/bin/env node
/**
 * Validate syllabus JSON files.
 * Checks: required fields, unique codes, valid weightage/difficultyRange, learningObjectives, tags.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SYLLABUS_DIR = join(ROOT, 'public', 'syllabus');

const EXAMS = ['nso', 'imo', 'ieo', 'ics', 'igko', 'isso'];
const VALID_WEIGHTAGE = ['low', 'medium', 'high'];
const VALID_DIFFICULTY = ['easy', 'medium', 'hard'];

let errors = [];

function validateFile(filePath, data) {
  const rel = filePath.replace(ROOT + '/', '');
  const errs = [];

  if (!data.exam || !data.grade) errs.push('missing exam or grade');
  if (!data.title || typeof data.title !== 'string') errs.push('title required');
  if (!data.description || typeof data.description !== 'string') errs.push('description required');
  if (!Array.isArray(data.topics) || data.topics.length === 0) errs.push('topics must be non-empty array');

  const topicCodes = new Set();
  const subtopicCodes = new Set();

  for (let ti = 0; ti < (data.topics || []).length; ti++) {
    const t = data.topics[ti];
    if (!t.code) errs.push(`topic ${ti + 1}: missing code`);
    else if (topicCodes.has(t.code)) errs.push(`topic ${ti + 1}: duplicate code ${t.code}`);
    else topicCodes.add(t.code);

    if (!t.name) errs.push(`topic ${ti + 1}: missing name`);
    if (t.description == null) errs.push(`topic ${ti + 1}: description required`);
    if (!VALID_WEIGHTAGE.includes(t.weightage || '')) errs.push(`topic ${ti + 1}: weightage must be low/medium/high`);
    if (typeof t.recommendedQuestionCount !== 'number' || t.recommendedQuestionCount < 0) errs.push(`topic ${ti + 1}: recommendedQuestionCount must be numeric`);

    if (!Array.isArray(t.subtopics)) errs.push(`topic ${ti + 1}: subtopics must be array`);
    else {
      for (let si = 0; si < t.subtopics.length; si++) {
        const s = t.subtopics[si];
        if (!s.code) errs.push(`topic ${ti + 1} subtopic ${si + 1}: missing code`);
        else if (subtopicCodes.has(s.code)) errs.push(`topic ${ti + 1} subtopic ${si + 1}: duplicate code ${s.code}`);
        else subtopicCodes.add(s.code);

        if (!s.name) errs.push(`topic ${ti + 1} subtopic ${si + 1}: missing name`);
        if (!Array.isArray(s.learningObjectives) || s.learningObjectives.length === 0) errs.push(`topic ${ti + 1} subtopic ${si + 1}: learningObjectives must be non-empty array`);
        if (!Array.isArray(s.difficultyRange) || s.difficultyRange.length === 0) errs.push(`topic ${ti + 1} subtopic ${si + 1}: difficultyRange required`);
        else for (const d of s.difficultyRange) if (!VALID_DIFFICULTY.includes(d)) errs.push(`topic ${ti + 1} subtopic ${si + 1}: invalid difficulty ${d}`);
        if (typeof s.recommendedQuestionCount !== 'number' || s.recommendedQuestionCount < 0) errs.push(`topic ${ti + 1} subtopic ${si + 1}: recommendedQuestionCount must be numeric`);
        if (!Array.isArray(s.tags)) errs.push(`topic ${ti + 1} subtopic ${si + 1}: tags must be array`);
      }
    }
  }

  return errs.map((e) => `${rel}: ${e}`);
}

function main() {
  console.log('Validating syllabus files...\n');

  for (const exam of EXAMS) {
    const examDir = join(SYLLABUS_DIR, exam);
    if (!existsSync(examDir)) continue;

    const files = readdirSync(examDir).filter((f) => f.endsWith('.json') && f.startsWith('grade'));
    for (const file of files) {
      const path = join(examDir, file);
      try {
        const data = JSON.parse(readFileSync(path, 'utf-8'));
        const errs = validateFile(path, data);
        if (errs.length > 0) errors.push(...errs);
        else console.log(`  ✓ ${exam}/${file}`);
      } catch (e) {
        errors.push(`${exam}/${file}: ${e.message}`);
      }
    }

    const indexPath = join(examDir, 'index.json');
    if (existsSync(indexPath)) {
      try {
        const idx = JSON.parse(readFileSync(indexPath, 'utf-8'));
        if (!idx.exam || !idx.grades) errors.push(`${exam}/index.json: missing exam or grades`);
        else console.log(`  ✓ ${exam}/index.json`);
      } catch (e) {
        errors.push(`${exam}/index.json: ${e.message}`);
      }
    }
  }

  if (errors.length > 0) {
    console.log('\n--- ERRORS ---');
    errors.forEach((e) => console.log(`  ${e}`));
    process.exit(1);
  }

  console.log('\nAll syllabus validations passed.');
}

main();
