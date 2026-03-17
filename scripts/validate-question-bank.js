#!/usr/bin/env node
/**
 * Validate question bank: unique ids, no duplicate questionText, valid metadata,
 * valid pack references, mock packs reference existing question ids.
 * CI-friendly output: use ::error format when GITHUB_ACTIONS is set.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = process.env.VALIDATE_QB_ROOT || join(__dirname, '..');
const QB = join(ROOT, 'public', 'question-bank');
const CI = process.env.GITHUB_ACTIONS === 'true';

const EXAMS = ['nso', 'imo', 'ieo', 'ics', 'igko', 'isso'];
const VALID_DIFFICULTY = ['easy', 'medium', 'hard'];
const VALID_MODES = ['practice', 'mock'];

const errors = [];

function emit(path, message) {
  const rel = path.replace(ROOT + '/', '');
  const full = `${rel}: ${message}`;
  errors.push({ path: rel, message, full });
}

function loadJson(dir, file, reportPath) {
  const path = join(dir, file);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch (e) {
    emit(reportPath || path, `malformed JSON: ${e.message}`);
    return null;
  }
}

function loadAllQuestions(exam, grade) {
  const questionsDir = join(QB, exam, `grade${grade}`, 'questions');
  if (!existsSync(questionsDir)) return [];
  const files = readdirSync(questionsDir).filter((f) => f.endsWith('.json') && f !== 'manifest.json');
  const all = [];
  for (const f of files) {
    const arr = loadJson(questionsDir, f, `public/question-bank/${exam}/grade${grade}/questions/${f}`);
    if (Array.isArray(arr)) all.push(...arr);
    else if (arr === null) { /* error already emitted */ }
    else emit(`public/question-bank/${exam}/grade${grade}/questions/${f}`, 'file must be a JSON array of questions');
  }
  return all;
}

function validateManifest(exam, grade) {
  const manifestPath = join(QB, exam, `grade${grade}`, 'questions', 'manifest.json');
  const questionsDir = join(QB, exam, `grade${grade}`, 'questions');
  if (!existsSync(manifestPath)) return;
  const manifest = loadJson(questionsDir, 'manifest.json', `public/question-bank/${exam}/grade${grade}/questions/manifest.json`);
  if (!manifest) return;
  if (!Array.isArray(manifest.files)) {
    emit(`public/question-bank/${exam}/grade${grade}/questions/manifest.json`, 'manifest.files must be an array');
    return;
  }
  for (const f of manifest.files) {
    const filePath = join(questionsDir, f);
    if (!existsSync(filePath)) {
      emit(`public/question-bank/${exam}/grade${grade}/questions/manifest.json`, `manifest references non-existent file: ${f}`);
    }
  }
}

function validateQuestionCorrectAnswer(q, optsLen, prefix, qId) {
  if (typeof q.correctAnswer !== 'number') {
    emit(prefix, `question ${qId}: correctAnswer must be number (0-${optsLen - 1}), got ${typeof q.correctAnswer}`);
    return;
  }
  if (Number.isNaN(q.correctAnswer)) {
    emit(prefix, `question ${qId}: correctAnswer is NaN`);
    return;
  }
  const idx = Math.floor(q.correctAnswer);
  if (idx < 0 || idx >= optsLen) {
    emit(prefix, `question ${qId}: correctAnswer ${q.correctAnswer} out of range (0-${optsLen - 1}) for ${optsLen} options`);
  }
}

function validateQuestions(exam, grade) {
  const prefix = `public/question-bank/${exam}/grade${grade}`;
  const questions = loadAllQuestions(exam, grade);
  const ids = new Set();
  const texts = new Set();

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qPrefix = `${prefix}/questions`;
    const qId = q.id || `#${i + 1}`;

    if (!q || typeof q !== 'object') {
      emit(qPrefix, `question ${i + 1}: invalid (not an object)`);
      continue;
    }

    if (!q.id) {
      emit(qPrefix, `question ${i + 1}: missing required field "id"`);
    } else if (ids.has(String(q.id))) {
      emit(qPrefix, `duplicate id "${q.id}"`);
    } else {
      ids.add(String(q.id));
    }

    const text = (q.questionText || '').trim().toLowerCase();
    if (!text) {
      emit(qPrefix, `question ${qId}: missing required field "questionText"`);
    } else if (texts.has(text)) {
      emit(qPrefix, `duplicate questionText (id ${q.id}): "${String(q.questionText).slice(0, 50)}..."`);
    } else {
      texts.add(text);
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      emit(qPrefix, `question ${qId}: options must be array with at least 2 items`);
    } else {
      validateQuestionCorrectAnswer(q, q.options.length, qPrefix, qId);
    }
    if (!q.explanation) {
      emit(qPrefix, `question ${qId}: missing required field "explanation"`);
    }
    if (q.difficulty && !VALID_DIFFICULTY.includes(q.difficulty)) {
      emit(qPrefix, `question ${qId}: invalid difficulty "${q.difficulty}" (must be easy/medium/hard)`);
    }
  }

  return { questions, ids };
}

function validatePacks(exam, grade, questionIds) {
  const packsDir = join(QB, exam, `grade${grade}`, 'packs');
  if (!existsSync(packsDir)) return;
  const files = readdirSync(packsDir).filter((f) => f.endsWith('.json'));

  for (const f of files) {
    const packPath = `public/question-bank/${exam}/grade${grade}/packs/${f}`;
    const pack = loadJson(packsDir, f, packPath);
    if (!pack) continue;

    const missing = [];
    if (!pack.packId) missing.push('packId');
    if (!pack.exam) missing.push('exam');
    if (!pack.grade) missing.push('grade');
    if (!pack.mode) missing.push('mode');
    if (!pack.title) missing.push('title');
    if (missing.length > 0) {
      emit(packPath, `missing required fields: ${missing.join(', ')}`);
    }

    if (String(pack.exam || '').toLowerCase() !== exam) {
      emit(packPath, `pack.exam "${pack.exam}" does not match folder "${exam}"`);
    }
    const packGrade = String(pack.grade ?? '');
    if (packGrade !== grade) {
      emit(packPath, `pack.grade "${pack.grade}" does not match folder "grade${grade}"`);
    }

    if (!VALID_MODES.includes(String(pack.mode || '').toLowerCase())) {
      emit(packPath, `invalid mode "${pack.mode}" (must be practice or mock)`);
    }

    if (pack.mode === 'mock') {
      if (!Array.isArray(pack.questionIds)) {
        emit(packPath, 'mock pack missing questionIds array');
      } else if (pack.questionIds.length === 0) {
        emit(packPath, 'mock pack questionIds array is empty');
      } else {
        for (const id of pack.questionIds) {
          if (!questionIds.has(id)) {
            emit(packPath, `questionId "${id}" not found in question bank`);
          }
        }
      }
    }

    if (pack.mode === 'practice') {
      if (!pack.selectionRules) {
        emit(packPath, 'practice pack missing selectionRules');
      } else if (pack.selectionRules.topics !== undefined && !Array.isArray(pack.selectionRules.topics)) {
        emit(packPath, 'selectionRules.topics must be array');
      }
    }
  }
}

function validateTopicFileNotEmpty(exam, grade, filename) {
  const path = join(QB, exam, `grade${grade}`, 'questions', filename);
  if (!existsSync(path)) return;
  const data = loadJson(join(QB, exam, `grade${grade}`, 'questions'), filename, path);
  if (Array.isArray(data) && data.length === 0) {
    emit(path, 'question file is empty');
  }
}

function main() {
  console.log('Validating question bank...\n');

  for (const exam of EXAMS) {
    const examDir = join(QB, exam);
    if (!existsSync(examDir)) continue;
    const grades = readdirSync(examDir).filter((d) => d.startsWith('grade'));
    for (const gd of grades) {
      const grade = gd.replace('grade', '');
      validateManifest(exam, grade);
      const { ids } = validateQuestions(exam, grade);
      validatePacks(exam, grade, ids);
      const manifestPath = join(QB, exam, `grade${grade}`, 'questions', 'manifest.json');
      if (existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
          for (const f of manifest.files || []) {
            validateTopicFileNotEmpty(exam, grade, f);
          }
        } catch {
          /* already reported */
        }
      }
    }
  }

  if (errors.length > 0) {
    console.log('--- ERRORS ---');
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

  console.log('All question bank validations passed.');
}

main();
