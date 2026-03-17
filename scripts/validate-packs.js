#!/usr/bin/env node
/**
 * Validation script for Grade 3 Olympiad question packs.
 * Checks: 25 questions per pack, 4 options, correctAnswer 0-3, no duplicate ids, no duplicate questionText.
 * CI-friendly output: use ::error format when GITHUB_ACTIONS is set.
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PACKS_DIR = join(ROOT, 'public', 'starter-packs');
const CI = process.env.GITHUB_ACTIONS === 'true';

const EXAMS = ['nso', 'imo', 'ieo', 'ics', 'igko', 'isso'];
const REQUIRED_FIELDS = ['id', 'questionText', 'image', 'options', 'correctAnswer', 'explanation', 'topic', 'difficulty'];
const VALID_DIFFICULTY = ['easy', 'medium'];

let errors = [];
// Track questionText per exam. Duplicates allowed: mock may sample from practice (same exam).
// Duplicates NOT allowed: within practice packs, within mock packs, or across different exams.
const questionTextsByExam = new Map(); // examId -> Map(questionText -> { path, isMock })

function validatePack(filePath, pack, examId) {
  const relPath = filePath.replace(ROOT + '/', '');
  const packErrors = [];
  const isMock = /mock-\d\.json$/.test(relPath);

  if (!pack.questions || !Array.isArray(pack.questions)) {
    packErrors.push('questions must be an array');
    return packErrors;
  }

  if (pack.questions.length !== 25) {
    packErrors.push(`expected 25 questions, got ${pack.questions.length}`);
  }

  if (!questionTextsByExam.has(examId)) {
    questionTextsByExam.set(examId, new Map());
  }
  const examTexts = questionTextsByExam.get(examId);

  const ids = new Set();
  for (let i = 0; i < pack.questions.length; i++) {
    const q = pack.questions[i];
    for (const f of REQUIRED_FIELDS) {
      if (q[f] === undefined || q[f] === null) {
        packErrors.push(`Q${i + 1}: missing field "${f}"`);
      }
    }
    if (q.options && q.options.length !== 4) {
      packErrors.push(`Q${i + 1}: expected 4 options, got ${q.options.length}`);
    }
    if (typeof q.correctAnswer === 'number' && (q.correctAnswer < 0 || q.correctAnswer > 3)) {
      packErrors.push(`Q${i + 1}: correctAnswer must be 0-3, got ${q.correctAnswer}`);
    }
    if (q.difficulty && !VALID_DIFFICULTY.includes(q.difficulty)) {
      packErrors.push(`Q${i + 1}: difficulty must be easy or medium, got ${q.difficulty}`);
    }
    if (q.id) {
      if (ids.has(String(q.id))) {
        packErrors.push(`Q${i + 1}: duplicate id "${q.id}"`);
      }
      ids.add(String(q.id));
    }
    const text = (q.questionText || '').trim().toLowerCase();
    if (text) {
      const existing = examTexts.get(text);
      if (existing && existing.path !== relPath) {
        const existingIsMock = existing.isMock;
        if (isMock && existingIsMock) {
          packErrors.push(`Q${i + 1}: duplicate questionText (also in ${existing.path})`);
        } else if (!isMock && !existingIsMock) {
          packErrors.push(`Q${i + 1}: duplicate questionText (also in ${existing.path})`);
        }
      }
      if (!isMock || !examTexts.has(text)) {
        examTexts.set(text, { path: relPath, isMock });
      }
    }
  }

  return packErrors;
}

const NEW_PACK_PATTERN = /^(practice-\d|mock-\d)\.json$/;

function main() {
  console.log('Validating Grade 3 Olympiad packs...\n');

  for (const exam of EXAMS) {
    const gradeDir = join(PACKS_DIR, exam, 'grade3');
    let files = [];
    try {
      files = readdirSync(gradeDir).filter((f) => f.endsWith('.json') && NEW_PACK_PATTERN.test(f));
    } catch (e) {
      if (e.code !== 'ENOENT') {
        errors.push({ file: `${exam}/grade3`, errors: [e.message] });
      }
      continue;
    }
    for (const file of files) {
      const filePath = join(gradeDir, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        const pack = JSON.parse(content);
          const packErrors = validatePack(filePath, pack, exam);
        if (packErrors.length > 0) {
          errors.push({ file: `${exam}/grade3/${file}`, errors: packErrors });
        } else {
          console.log(`✓ ${exam}/grade3/${file}`);
        }
      } catch (e) {
        const msg = e instanceof SyntaxError ? `malformed JSON: ${e.message}` : e.message;
        errors.push({ file: `${exam}/grade3/${file}`, errors: [msg] });
      }
    }
  }

  if (errors.length > 0) {
    console.log('\n--- ERRORS ---');
    let count = 0;
    for (const { file, errors: errs } of errors) {
      const path = `public/starter-packs/${file}`;
      for (const msg of errs) {
        if (CI) console.log(`::error file=${path}::${msg.replace(/\n/g, ' ')}`);
        console.log(`  ${path}: ${msg}`);
        count++;
      }
    }
    console.log(`\n${count} error(s) found.`);
    process.exit(1);
  }

  console.log('\nAll packs validated successfully.');
}

main();
