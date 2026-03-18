#!/usr/bin/env node
/**
 * Generate IGKO syllabus.json for each grade (1-10) from the canonical syllabus.
 * Run: node scripts/generate-igko-syllabus.js
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const IGKO_BASE = join(ROOT, 'public', 'question-bank', 'igko');

const igkoSyllabus = {
  classes: [
    {
      grade: 1,
      topics: [
        'Me and My Surroundings',
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Language and Literature',
        'Earth and Its Environment',
        'Sports',
        'Maths Fun',
        'Life Skills',
        'Current Affairs',
      ],
    },
    {
      grade: 2,
      topics: [
        'Me and My Surroundings',
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Language and Literature',
        'Earth and Its Environment',
        'Transport and Communication',
        'Sports',
        'Maths Fun',
        'Life Skills',
        'Current Affairs',
      ],
    },
    {
      grade: 3,
      topics: [
        'Me and My Surroundings',
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Language and Literature',
        'Earth and Its Environment',
        'Transport and Communication',
        'Sports',
        'Maths Fun',
        'Life Skills',
        'Current Affairs',
      ],
    },
    {
      grade: 4,
      topics: [
        'Our Body and Health',
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Environment and its Conservation',
        'Language and Literature',
        'Entertainment',
        'Sports',
        'Maths Fun',
        'Life Skills',
        'Current Affairs',
      ],
    },
    {
      grade: 5,
      topics: [
        'Our Body and Health',
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Environment and its Conservation',
        'Language and Literature',
        'Entertainment',
        'Sports',
        'Maths Fun',
        'Life Skills',
        'Current Affairs',
      ],
    },
    {
      grade: 6,
      topics: [
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Earth and Its Environment',
        'Universe',
        'Language and Literature',
        'Entertainment',
        'Social Studies',
        'Sports',
        'Quantitative Aptitude and Reasoning',
        'Current Affairs',
        'Life Skills',
      ],
    },
    {
      grade: 7,
      topics: [
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Earth and its Environment',
        'Universe',
        'Language and Literature',
        'Entertainment',
        'Social Studies',
        'Sports',
        'Quantitative Aptitude and Reasoning',
        'Current Affairs',
        'Life Skills',
      ],
    },
    {
      grade: 8,
      topics: [
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Earth and its Environment',
        'Universe',
        'Language and Literature',
        'Entertainment',
        'Social Studies',
        'Sports',
        'Quantitative Aptitude and Reasoning',
        'Current Affairs',
        'Life Skills',
      ],
    },
    {
      grade: 9,
      topics: [
        'Plants and Animals',
        'Our Environment',
        'Science and Technology',
        'India and the World',
        'Social Studies',
        'Language, Literature and Media',
        'Sports',
        'Quantitative Aptitude and Reasoning',
        'Current Affairs',
        'Life Skills',
      ],
    },
    {
      grade: 10,
      topics: [
        'Plants and Animals',
        'Our Environment',
        'Science and Technology',
        'India and the World',
        'Social Studies',
        'Language, Literature and Media',
        'Sports',
        'Quantitative Aptitude and Reasoning',
        'Current Affairs',
        'Life Skills',
      ],
    },
  ],
};

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildSyllabusForGrade(grade, topics) {
  const exam = 'igko';
  const g = String(grade);
  return {
    exam,
    grade: Number(grade),
    sections_overview: [
      { code: 'S1', name: 'General Awareness', description: 'Topics based on important events around the world' },
      { code: 'S2', name: 'Current Affairs', description: 'Contains questions from recent events' },
      { code: 'S3', name: 'Life Skills', description: 'Topics based on abilities for managing and living a better quality of life' },
      { code: 'S4', name: 'Achievers Section', description: 'Contains Higher Order Thinking Skills questions' },
    ],
    achievers_section: 'Higher Order Thinking Questions from the above given syllabus.',
    topics: topics.map((name, i) => {
      const code = `IGKO-G${g}-T${i + 1}`;
      const slug = toSlug(name);
      return {
        code,
        name,
        slug,
        description: `${name} for Grade ${grade}.`,
        weightage: 'medium',
        recommendedQuestionCount: 20,
        subtopics: [
          {
            code: `${code}-S1`,
            name: `${name} Basics`,
            description: 'Fundamental concepts.',
            learningObjectives: ['Understand concepts', 'Apply knowledge'],
            difficultyRange: ['easy', 'medium'],
            recommendedQuestionCount: 10,
            tags: [slug, exam, `grade${grade}`],
          },
          {
            code: `${code}-S2`,
            name: `${name} Application`,
            description: 'Applying concepts.',
            learningObjectives: ['Apply concepts', 'Solve problems'],
            difficultyRange: ['easy', 'medium'],
            recommendedQuestionCount: 10,
            tags: [slug, exam, `grade${grade}`],
          },
        ],
      };
    }),
  };
}

function main() {
  for (const cls of igkoSyllabus.classes) {
    const gradeDir = join(IGKO_BASE, `grade${cls.grade}`);
    if (!existsSync(gradeDir)) {
      mkdirSync(gradeDir, { recursive: true });
    }
    const syllabus = buildSyllabusForGrade(cls.grade, cls.topics);
    const path = join(gradeDir, 'syllabus.json');
    writeFileSync(path, JSON.stringify(syllabus, null, 2) + '\n', 'utf-8');
    console.log(`Wrote ${path}`);
  }
  console.log('\nDone. Run npm run update:question-bank-index to refresh the index.');
}

main();
