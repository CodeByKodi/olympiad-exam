#!/usr/bin/env node
/**
 * Validate that all syllabus topics have corresponding question files.
 * NSO/IGKO: use slug from syllabus. IMO: infer slug from topic name.
 * Run: node scripts/validate-syllabus-coverage.js
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const QB = join(ROOT, 'public', 'question-bank');

/** Only validate exams with active question banks. Set VALIDATE_ALL=1 to include ieo,ics,isso */
const EXAMS = process.env.VALIDATE_ALL === '1' ? ['nso', 'imo', 'igko', 'ieo', 'ics', 'isso'] : ['nso', 'imo', 'igko'];

/** IMO topic name -> question file slug(s). First match wins. */
const IMO_TOPIC_TO_SLUG = {
  'algebra': ['algebra'],
  'number system': ['numbers'],
  'numbers': ['numbers'],
  'numbers and operations': ['numbers'],
  'percentages and ratios': ['percentages-and-ratios'],
  'comparing quantities': ['algebra'],
  'geometry': ['geometry'],
  'shapes': ['geometry'],
  'coordinate geometry': ['geometry'],
  'advanced geometry': ['geometry'],
  'mensuration': ['measurement'],
  'data and probability': ['data-handling'],
  'data handling': ['data-handling'],
  'probability': ['data-handling'],
  'reasoning': ['logical-reasoning'],
  'logical reasoning': ['logical-reasoning'],
  'olympiad reasoning': ['logical-reasoning'],
  'addition and subtraction': ['addition-and-subtraction'],
  'patterns': ['patterns'],
  'fractions and decimals': ['fractions-and-decimals', 'fractions'],
  'fractions': ['fractions'],
  'measurement': ['measurement'],
  'money': ['money'],
  'time and money': ['measurement'],
  'simple reasoning': ['logical-reasoning'],
  'advanced math': ['advanced-math'],
  'calculus basics': ['advanced-math'],
  'trigonometry': ['trigonometry'],
};

function loadJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

function getTopicSlugsFromSyllabus(syllabus, exam) {
  const result = [];
  const topics = syllabus?.topics || [];
  for (const t of topics) {
    const name = t.name || t.code || '';
    if (exam === 'imo') {
      const key = name.toLowerCase().trim();
      const slugs = IMO_TOPIC_TO_SLUG[key] || [key.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')];
      result.push({ name, slugs: Array.isArray(slugs) ? slugs : [slugs] });
    } else {
      const slug = t.slug || name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      result.push({ name, slugs: slug ? [slug] : [] });
    }
  }
  return result;
}

function main() {
  console.log('Validating syllabus coverage...\n');

  const gaps = [];
  let totalBanks = 0;
  let totalTopics = 0;

  for (const exam of EXAMS) {
    const examDir = join(QB, exam);
    if (!existsSync(examDir)) continue;

    const grades = readdirSync(examDir).filter((d) => d.startsWith('grade'));
    for (const gd of grades) {
      const grade = gd.replace('grade', '');
      const syllabusPath = join(examDir, gd, 'syllabus.json');
      const questionsDir = join(examDir, gd, 'questions');

      if (!existsSync(syllabusPath)) continue;
      const syllabus = loadJson(syllabusPath);
      if (!syllabus) continue;

      totalBanks++;
      const topics = getTopicSlugsFromSyllabus(syllabus, exam);
      const questionFiles = existsSync(questionsDir)
        ? readdirSync(questionsDir).filter((f) => f.endsWith('.json') && f !== 'manifest.json')
        : [];
      const fileSlugs = new Set(questionFiles.map((f) => f.replace(/\.json$/, '')));

      for (const { name, slugs } of topics) {
        totalTopics++;
        const covered = slugs.length > 0 && slugs.some((s) => fileSlugs.has(s));
        if (!covered && slugs.length > 0) {
          gaps.push({ exam, grade, topic: name, expectedFiles: slugs.map((s) => `${s}.json`).join(' or ') });
        }
      }
    }
  }

  if (gaps.length > 0) {
    console.log('--- SYLLABUS TOPICS WITHOUT QUESTION FILES ---\n');
    for (const g of gaps) {
      console.log(`  ${g.exam}/grade${g.grade}: "${g.topic}"`);
      console.log(`    Expected: questions/${g.expectedFiles}`);
    }
    console.log(`\n${gaps.length} topic(s) without question files.`);
    process.exit(1);
  }

  console.log(`All ${totalTopics} syllabus topics across ${totalBanks} banks have question files.`);
}

main();
