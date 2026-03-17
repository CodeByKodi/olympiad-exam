#!/usr/bin/env node
/**
 * Validate question bank: unique ids, no duplicate questionText, valid metadata,
 * valid pack references, mock packs reference existing question ids.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const QB = join(ROOT, 'public', 'question-bank');

const EXAMS = ['nso', 'imo', 'ieo', 'ics', 'igko', 'isso'];
const VALID_DIFFICULTY = ['easy', 'medium', 'hard'];

let errors = [];

function loadJson(dir, file) {
  const path = join(dir, file);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (e) {
    return null;
  }
}

function loadAllQuestions(exam, grade) {
  const questionsDir = join(QB, exam, `grade${grade}`, 'questions');
  if (!existsSync(questionsDir)) return [];
  const files = readdirSync(questionsDir).filter((f) => f.endsWith('.json'));
  const all = [];
  for (const f of files) {
    const arr = loadJson(questionsDir, f);
    if (Array.isArray(arr)) all.push(...arr);
  }
  return all;
}

function validateQuestions(exam, grade) {
  const questions = loadAllQuestions(exam, grade);
  const ids = new Set();
  const texts = new Set();

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const prefix = `${exam}/grade${grade}`;

    if (!q.id) {
      errors.push(`${prefix}: question ${i + 1} missing id`);
    } else if (ids.has(String(q.id))) {
      errors.push(`${prefix}: duplicate id "${q.id}"`);
    } else {
      ids.add(String(q.id));
    }

    const text = (q.questionText || '').trim().toLowerCase();
    if (!text) {
      errors.push(`${prefix}: question ${q.id || i + 1} missing questionText`);
    } else if (texts.has(text)) {
      errors.push(`${prefix}: duplicate questionText "${q.questionText?.slice(0, 50)}..."`);
    } else {
      texts.add(text);
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      errors.push(`${prefix}: question ${q.id} invalid options`);
    }
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= (q.options?.length || 0)) {
      errors.push(`${prefix}: question ${q.id} invalid correctAnswer`);
    }
    if (!q.explanation) {
      errors.push(`${prefix}: question ${q.id} missing explanation`);
    }
    if (q.difficulty && !VALID_DIFFICULTY.includes(q.difficulty)) {
      errors.push(`${prefix}: question ${q.id} invalid difficulty "${q.difficulty}"`);
    }
  }

  return { questions, ids };
}

function validatePacks(exam, grade, questionIds) {
  const packsDir = join(QB, exam, `grade${grade}`, 'packs');
  if (!existsSync(packsDir)) return;
  const files = readdirSync(packsDir).filter((f) => f.endsWith('.json'));

  for (const f of files) {
    const pack = loadJson(packsDir, f);
    if (!pack) return;
    const prefix = `${exam}/grade${grade}/packs/${f}`;

    if (!pack.packId || !pack.exam || !pack.grade || !pack.mode || !pack.title) {
      errors.push(`${prefix}: missing required fields`);
    }
    if (pack.mode !== 'practice' && pack.mode !== 'mock') {
      errors.push(`${prefix}: invalid mode "${pack.mode}"`);
    }

    if (pack.mode === 'mock') {
      if (!Array.isArray(pack.questionIds)) {
        errors.push(`${prefix}: mock pack missing questionIds`);
      } else {
        for (const id of pack.questionIds) {
          if (!questionIds.has(id)) {
            errors.push(`${prefix}: questionId "${id}" not found in bank`);
          }
        }
      }
    }

    if (pack.mode === 'practice') {
      if (!pack.selectionRules) {
        errors.push(`${prefix}: practice pack missing selectionRules`);
      } else if (pack.selectionRules.topics && !Array.isArray(pack.selectionRules.topics)) {
        errors.push(`${prefix}: selectionRules.topics must be array`);
      }
    }
  }
}

function main() {
  console.log('Validating question bank...\n');

  for (const exam of EXAMS) {
    const gradeDir = join(QB, exam, 'grade3');
    if (!existsSync(gradeDir)) continue;

    const { ids } = validateQuestions(exam, '3');
    validatePacks(exam, '3', ids);
  }

  if (errors.length > 0) {
    console.log('--- ERRORS ---');
    errors.forEach((e) => console.log(`  ${e}`));
    process.exit(1);
  }

  console.log('All question bank validations passed.');
}

main();
