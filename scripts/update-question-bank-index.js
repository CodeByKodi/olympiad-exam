#!/usr/bin/env node
/**
 * Regenerate public/question-bank/index.json from folder structure.
 * Scans for syllabus.json in each exam/grade folder and builds the banks list.
 * Run from project root: node scripts/update-question-bank-index.js
 */

import { existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BANK_DIR = join(ROOT, 'public', 'question-bank');

const EXAMS = ['nso', 'imo', 'ieo', 'ics', 'igko', 'isso'];
const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

function main() {
  const banks = [];

  for (const exam of EXAMS) {
    const examDir = join(BANK_DIR, exam);
    if (!existsSync(examDir)) continue;

    for (const grade of GRADES) {
      const syllabusPath = join(examDir, `grade${grade}`, 'syllabus.json');
      if (existsSync(syllabusPath)) {
        banks.push({ exam, grade });
      }
    }
  }

  const indexPath = join(BANK_DIR, 'index.json');
  const content = JSON.stringify({ banks }, null, 2);
  writeFileSync(indexPath, content + '\n', 'utf8');

  console.log(`Updated ${indexPath} with ${banks.length} banks`);
}

main();
