#!/usr/bin/env node
/**
 * Replicate Grade 3 question bank to all other grades (1, 2, 4-12).
 * Uses Grade 3 as the template; same questions for all grades as a starting point.
 * Run from project root: node scripts/replicate-grade3-to-all-grades.js
 */

import { cpSync, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public', 'question-bank');

const EXAMS = ['nso', 'imo', 'ieo', 'ics', 'igko', 'isso'];
const TARGET_GRADES = [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function replicateGrade(exam, targetGrade) {
  const srcDir = join(PUBLIC, exam, 'grade3');
  const destDir = join(PUBLIC, exam, `grade${targetGrade}`);

  if (!existsSync(srcDir)) {
    console.warn(`  Skip ${exam}: no grade3 source`);
    return;
  }

  if (existsSync(destDir)) {
    console.warn(`  Skip ${exam}/grade${targetGrade}: already exists`);
    return;
  }

  mkdirSync(destDir, { recursive: true });
  cpSync(srcDir, destDir, { recursive: true });

  // Update syllabus.json
  const syllabusPath = join(destDir, 'syllabus.json');
  if (existsSync(syllabusPath)) {
    const syllabus = JSON.parse(readFileSync(syllabusPath, 'utf8'));
    syllabus.grade = targetGrade;
    writeFileSync(syllabusPath, JSON.stringify(syllabus, null, 2));
  }

  // Update pack files
  const packsDir = join(destDir, 'packs');
  if (existsSync(packsDir)) {
    const files = readdirSync(packsDir).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const path = join(packsDir, file);
      const pack = JSON.parse(readFileSync(path, 'utf8'));
      pack.grade = targetGrade;
      if (pack.packId) {
        pack.packId = pack.packId.replace(/grade\d+/, `grade${targetGrade}`);
      }
      writeFileSync(path, JSON.stringify(pack, null, 2));
    }
  }

  // Update question files: grade in each question
  const questionsDir = join(destDir, 'questions');
  if (existsSync(questionsDir)) {
    const manifestPath = join(questionsDir, 'manifest.json');
    const files = existsSync(manifestPath)
      ? JSON.parse(readFileSync(manifestPath, 'utf8')).files || []
      : readdirSync(questionsDir).filter((f) => f.endsWith('.json') && f !== 'manifest.json');

    for (const file of files) {
      const path = join(questionsDir, file);
      if (!existsSync(path)) continue;
      const arr = JSON.parse(readFileSync(path, 'utf8'));
      if (!Array.isArray(arr)) continue;
      for (const q of arr) {
        if (q.grade) q.grade = String(targetGrade);
        if (q.id && typeof q.id === 'string') {
          q.id = q.id.replace(/-g(\d+)-/, `-g${targetGrade}-`);
        }
      }
      writeFileSync(path, JSON.stringify(arr, null, 2));
    }

    // Update questionIds in mock packs to use new grade IDs
    if (existsSync(packsDir)) {
      const packFiles = readdirSync(packsDir).filter((f) => f.endsWith('.json'));
      for (const file of packFiles) {
        const path = join(packsDir, file);
        const pack = JSON.parse(readFileSync(path, 'utf8'));
        if (pack.questionIds && Array.isArray(pack.questionIds)) {
          pack.questionIds = pack.questionIds.map((id) =>
            id.replace(/-g(\d+)-/, `-g${targetGrade}-`)
          );
          writeFileSync(path, JSON.stringify(pack, null, 2));
        }
      }
    }
  }

  console.log(`  Created ${exam}/grade${targetGrade}`);
}

console.log('Replicating Grade 3 question bank to all grades...\n');

for (const exam of EXAMS) {
  console.log(`Exam: ${exam}`);
  for (const grade of TARGET_GRADES) {
    replicateGrade(exam, grade);
  }
}

console.log('\nDone.');
