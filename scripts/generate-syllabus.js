#!/usr/bin/env node
/**
 * Generate syllabus JSON files for all exams (NSO, IMO, IEO, ICS, IGKO, ISSO) and grades 1-12.
 * Creates public/syllabus/{exam}/grade{N}.json and index files.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getSyllabusContent } from './syllabus-content.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SYLLABUS_DIR = join(ROOT, 'public', 'syllabus');

const EXAMS = ['nso', 'imo', 'ieo', 'ics', 'igko', 'isso'];
const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const EXAM_TITLES = {
  nso: 'National Science Olympiad',
  imo: 'International Mathematics Olympiad',
  ieo: 'International English Olympiad',
  ics: 'International Computer Science Olympiad',
  igko: 'International General Knowledge Olympiad',
  isso: 'International Social Studies Olympiad',
};

function buildSyllabus(exam, grade) {
  const content = getSyllabusContent(exam, grade);
  if (!content) return null;

  const topics = content.topics.map((t, ti) => {
    const topicCode = `${exam.toUpperCase()}-G${grade}-T${ti + 1}`;
    const subtopics = (t.subtopics || []).map((s, si) => ({
      code: `${topicCode}-S${si + 1}`,
      name: s.name,
      description: s.description || s.desc || '',
      learningObjectives: s.objectives || s.learningObjectives || [],
      difficultyRange: s.difficultyRange || (grade <= 3 ? ['easy', 'medium'] : ['easy', 'medium', 'hard']),
      recommendedQuestionCount: s.count ?? s.recommendedQuestionCount ?? 10,
      tags: [...(Array.isArray(s.tags) ? s.tags : []), exam, `grade${grade}`].filter(Boolean),
    }));
    return {
      code: topicCode,
      name: t.name,
      description: t.description || t.desc || '',
      weightage: t.weightage || 'medium',
      recommendedQuestionCount: t.count ?? t.recommendedQuestionCount ?? 30,
      subtopics,
    };
  });

  return {
    exam,
    grade,
    title: content.title || `${EXAM_TITLES[exam]} Grade ${grade} Syllabus`,
    description: content.description || '',
    topics,
  };
}

function main() {
  console.log('Generating syllabus files...\n');

  for (const exam of EXAMS) {
    const examDir = join(SYLLABUS_DIR, exam);
    mkdirSync(examDir, { recursive: true });
    const grades = [];

    for (const grade of GRADES) {
      const syllabus = buildSyllabus(exam, grade);
      if (!syllabus) {
        console.log(`  Skip ${exam}/grade${grade} (no content)`);
        continue;
      }
      const path = join(examDir, `grade${grade}.json`);
      writeFileSync(path, JSON.stringify(syllabus, null, 2), 'utf-8');
      grades.push({ grade, file: `grade${grade}.json` });
      const topicCount = syllabus.topics.reduce((s, t) => s + (t.subtopics?.length || 0) + 1, 0);
      console.log(`  ${exam}/grade${grade}.json (${syllabus.topics.length} topics)`);
    }

    const index = {
      exam,
      title: EXAM_TITLES[exam],
      grades,
    };
    writeFileSync(join(examDir, 'index.json'), JSON.stringify(index, null, 2), 'utf-8');
    console.log(`  ${exam}/index.json`);
  }

  console.log('\nSyllabus generation complete.');
}

main();
