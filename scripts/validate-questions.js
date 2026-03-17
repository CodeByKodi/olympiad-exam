#!/usr/bin/env node
/**
 * Validates all Grade 3 Olympiad question files.
 * Run: node scripts/validate-questions.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

const EXAMS = ['nso', 'imo', 'ieo', 'ics', 'igko', 'isso'];
const TESTS_PER_EXAM = 5;
const QUESTIONS_PER_TEST = 10;

let hasErrors = false;

function log(msg, isError = false) {
  if (isError) hasErrors = true;
  console.log(isError ? `❌ ${msg}` : `✓ ${msg}`);
}

function validateFile(examId, testNum) {
  const filePath = path.join(DATA_DIR, examId, 'grade3', `test${testNum}.json`);
  if (!fs.existsSync(filePath)) {
    log(`${examId}/grade3/test${testNum}.json: file not found`, true);
    return [];
  }
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    log(`${examId}/grade3/test${testNum}.json: invalid JSON - ${e.message}`, true);
    return [];
  }
  const questions = data.questions || [];
  if (questions.length !== QUESTIONS_PER_TEST) {
    log(`${examId}/grade3/test${testNum}.json: expected ${QUESTIONS_PER_TEST} questions, got ${questions.length}`, true);
  }
  const ids = new Set();
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const prefix = `${examId}/grade3/test${testNum}.json q${i + 1}`;
    if (!q.questionText) log(`${prefix}: missing questionText`, true);
    const opts = q.options || q.opts || [];
    if (opts.length !== 4) log(`${prefix}: expected 4 options, got ${opts.length}`, true);
    const ca = q.correctAnswer;
    if (typeof ca !== 'number' || ca < 0 || ca > 3) {
      log(`${prefix}: correctAnswer must be 0-3, got ${ca}`, true);
    }
    if (q.id) {
      if (ids.has(q.id)) log(`${prefix}: duplicate id ${q.id}`, true);
      ids.add(q.id);
    }
  }
  return questions;
}

// Collect all questions for duplicate check
const allQuestionTexts = new Map(); // text -> [file]

for (const examId of EXAMS) {
  for (let t = 1; t <= TESTS_PER_EXAM; t++) {
    const questions = validateFile(examId, t);
    for (const q of questions) {
      const text = (q.questionText || '').trim();
      if (!text) continue;
      if (!allQuestionTexts.has(text)) allQuestionTexts.set(text, []);
      allQuestionTexts.get(text).push(`${examId}/grade3/test${t}.json`);
    }
  }
}

// Check for duplicate questionText
for (const [text, files] of allQuestionTexts) {
  if (files.length > 1) {
    log(`Duplicate questionText in ${files.join(', ')}: "${text.slice(0, 50)}..."`, true);
  }
}

// Report topic variety per test
console.log('\n--- Topic variety per test (sample) ---');
for (const examId of EXAMS) {
  const filePath = path.join(DATA_DIR, examId, 'grade3', 'test1.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const topics = (data.questions || []).map((q) => q.topic || '—');
    const unique = [...new Set(topics)];
    console.log(`${examId} Test 1: ${unique.length} topics - ${unique.join(', ')}`);
  }
}

if (hasErrors) {
  console.log('\nValidation failed.');
  process.exit(1);
}
console.log('\nAll validations passed.');
process.exit(0);
