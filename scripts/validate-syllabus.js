#!/usr/bin/env node
/**
 * Validate syllabus JSON files.
 * Checks: required fields, unique codes, valid weightage/difficultyRange,
 * learningObjectives, tags, index references existing grade files.
 * CI-friendly output: use ::error format when GITHUB_ACTIONS is set.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.VALIDATE_SYLLABUS_ROOT || join(__dirname, '..');
const SYLLABUS_DIR = join(ROOT, 'public', 'syllabus');
const CI = process.env.GITHUB_ACTIONS === 'true';

const EXAMS = ['nso', 'imo', 'ieo', 'ics', 'igko', 'isso'];
const VALID_WEIGHTAGE = ['low', 'medium', 'high'];
const VALID_DIFFICULTY = ['easy', 'medium', 'hard'];

const errors = [];

function emit(relPath, message) {
  errors.push({ path: relPath, message });
}

function validateFile(filePath, data) {
  const rel = filePath.replace(ROOT + '/', '');
  const errs = [];

  if (!data.exam || !data.grade) errs.push('missing exam or grade');
  if (!data.title || typeof data.title !== 'string') errs.push('title must be non-empty string');
  if (!data.description || typeof data.description !== 'string') errs.push('description must be non-empty string');
  if (!Array.isArray(data.topics) || data.topics.length === 0) errs.push('topics must be non-empty array');

  const topicCodes = new Set();
  const subtopicCodes = new Set();

  for (let ti = 0; ti < (data.topics || []).length; ti++) {
    const t = data.topics[ti];
    if (!t.code) errs.push(`topic ${ti + 1}: missing code`);
    else if (topicCodes.has(t.code)) errs.push(`topic ${ti + 1}: duplicate code "${t.code}"`);
    else topicCodes.add(t.code);

    if (!t.name) errs.push(`topic ${ti + 1}: missing name`);
    if (t.description == null) errs.push(`topic ${ti + 1}: description required`);
    if (!VALID_WEIGHTAGE.includes(t.weightage || '')) errs.push(`topic ${ti + 1}: weightage must be low/medium/high, got "${t.weightage || ''}"`);
    if (typeof t.recommendedQuestionCount !== 'number' || t.recommendedQuestionCount < 0) {
      errs.push(`topic ${ti + 1}: recommendedQuestionCount must be non-negative number, got ${JSON.stringify(t.recommendedQuestionCount)}`);
    }

    if (!Array.isArray(t.subtopics)) errs.push(`topic ${ti + 1}: subtopics must be array`);
    else {
      for (let si = 0; si < t.subtopics.length; si++) {
        const s = t.subtopics[si];
        if (!s.code) errs.push(`topic ${ti + 1} subtopic ${si + 1}: missing code`);
        else if (subtopicCodes.has(s.code)) errs.push(`topic ${ti + 1} subtopic ${si + 1}: duplicate code "${s.code}"`);
        else subtopicCodes.add(s.code);

        if (!s.name) errs.push(`topic ${ti + 1} subtopic ${si + 1}: missing name`);
        if (!Array.isArray(s.learningObjectives) || s.learningObjectives.length === 0) {
          errs.push(`topic ${ti + 1} subtopic ${si + 1}: learningObjectives must be non-empty array`);
        }
        if (!Array.isArray(s.difficultyRange) || s.difficultyRange.length === 0) {
          errs.push(`topic ${ti + 1} subtopic ${si + 1}: difficultyRange required`);
        } else {
          for (const d of s.difficultyRange) {
            if (!VALID_DIFFICULTY.includes(d)) errs.push(`topic ${ti + 1} subtopic ${si + 1}: invalid difficulty "${d}" (must be easy/medium/hard)`);
          }
        }
        if (typeof s.recommendedQuestionCount !== 'number' || s.recommendedQuestionCount < 0) {
          errs.push(`topic ${ti + 1} subtopic ${si + 1}: recommendedQuestionCount must be non-negative number`);
        }
        if (!Array.isArray(s.tags)) errs.push(`topic ${ti + 1} subtopic ${si + 1}: tags must be array`);
      }
    }
  }

  return errs.map((e) => ({ path: rel, message: e }));
}

function validateIndexReferences(exam) {
  const indexPath = join(SYLLABUS_DIR, exam, 'index.json');
  if (!existsSync(indexPath)) return;
  let idx;
  try {
    idx = JSON.parse(readFileSync(indexPath, 'utf-8'));
  } catch (e) {
    emit(`public/syllabus/${exam}/index.json`, `malformed JSON: ${e.message}`);
    return;
  }
  const rel = `public/syllabus/${exam}/index.json`;
  let ok = true;
  if (!idx.exam) { emit(rel, 'missing exam'); ok = false; }
  if (!Array.isArray(idx.grades)) { emit(rel, 'grades must be array'); ok = false; }
  if (ok && idx.grades) {
    for (const g of idx.grades) {
      if (!g.file) {
        emit(rel, `grade entry missing file (grade ${g.grade})`);
        ok = false;
        continue;
      }
      const gradePath = join(SYLLABUS_DIR, exam, g.file);
      if (!existsSync(gradePath)) {
        emit(rel, `index references non-existent file: ${g.file}`);
        ok = false;
      }
    }
  }
  if (ok) console.log(`  ✓ ${exam}/index.json`);
}

function main() {
  console.log('Validating syllabus files...\n');

  for (const exam of EXAMS) {
    const examDir = join(SYLLABUS_DIR, exam);
    if (!existsSync(examDir)) continue;

    validateIndexReferences(exam);

    const files = readdirSync(examDir).filter((f) => f.endsWith('.json') && f.startsWith('grade'));
    for (const file of files) {
      const path = join(examDir, file);
      try {
        const data = JSON.parse(readFileSync(path, 'utf-8'));
        const errs = validateFile(path, data);
        for (const { path: p, message } of errs) {
          errors.push({ path: p, message });
        }
        if (errs.length === 0) console.log(`  ✓ ${exam}/${file}`);
      } catch (e) {
        emit(`${exam}/${file}`, `malformed JSON: ${e.message}`);
      }
    }

  }

  if (errors.length > 0) {
    console.log('\n--- ERRORS ---');
    for (const { path: p, message } of errors) {
      const line = `  ${p}: ${message}`;
      if (CI) {
        console.log(`::error file=${p}::${message.replace(/\n/g, ' ')}`);
      }
      console.log(line);
    }
    console.log(`\n${errors.length} error(s) found.`);
    process.exit(1);
  }

  console.log('\nAll syllabus validations passed.');
}

main();
