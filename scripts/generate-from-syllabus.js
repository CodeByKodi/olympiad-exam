#!/usr/bin/env node
/**
 * Generate grade-appropriate questions from syllabus for all exams and grades.
 * Uses Grade 3 question bank as the source pool; maps syllabus topics to questions.
 * Run: node scripts/generate-from-syllabus.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SYLLABUS_DIR = path.join(ROOT, 'public', 'syllabus');
const QB_DIR = path.join(ROOT, 'public', 'question-bank');
const EXAMS = ['nso', 'imo', 'ieo', 'ics', 'igko', 'isso'];

/** Map syllabus topic names (lowercase keywords) to question pool topic keywords */
const TOPIC_MAP = {
  nso: {
    'living': ['living', 'non-living', 'plants', 'animals'],
    'plants': ['plants'],
    'animals': ['animals'],
    'food': ['food', 'nutrition'],
    'human body': ['human body', 'body', 'senses'],
    'air': ['air', 'water'],
    'water': ['air', 'water'],
    'environment': ['environment', 'weather', 'safety'],
    'weather': ['weather', 'seasons'],
    'matter': ['matter', 'states'],
    'energy': ['energy', 'light', 'sound'],
    'force': ['force', 'motion'],
    'earth': ['earth', 'space', 'solar'],
    'space': ['space', 'solar', 'earth'],
    'body': ['human body', 'body'],
    'physics': ['force', 'motion', 'energy', 'light', 'sound'],
    'chemistry': ['matter', 'states'],
    'biology': ['plants', 'animals', 'body', 'cells'],
  },
  imo: {
    'numbers': ['numbers', 'number', 'addition', 'subtraction', 'multiplication', 'division'],
    'addition': ['addition'],
    'subtraction': ['subtraction'],
    'multiplication': ['multiplication'],
    'division': ['division'],
    'shapes': ['shapes'],
    'patterns': ['patterns'],
    'time': ['time'],
    'money': ['money'],
    'fractions': ['fractions'],
    'measurement': ['measurement'],
    'geometry': ['shapes', 'geometry'],
    'algebra': ['algebra'],
    'data': ['data'],
    'reasoning': ['reasoning', 'word problems'],
  },
  ieo: {
    'vocabulary': ['vocabulary'],
    'grammar': ['grammar', 'verbs', 'nouns', 'adjectives'],
    'sentence': ['sentence'],
    'spelling': ['vocabulary'],
    'verbs': ['verbs'],
    'tenses': ['tenses'],
    'comprehension': ['comprehension'],
  },
  ics: {
    'parts': ['computer', 'keyboard', 'mouse', 'monitor'],
    'computer': ['computer', 'keyboard', 'mouse', 'monitor'],
    'uses': ['internet', 'software'],
    'input': ['input', 'output'],
    'output': ['input', 'output'],
    'keyboard': ['keyboard', 'mouse'],
    'mouse': ['keyboard', 'mouse'],
    'hardware': ['hardware', 'computer'],
    'software': ['software'],
    'internet': ['internet'],
    'storage': ['storage'],
  },
  igko: {
    'india': ['india', 'capital', 'symbols'],
    'world': ['continents', 'countries', 'capitals'],
    'space': ['space'],
    'festivals': ['festivals'],
    'transport': ['transport'],
    'general': ['general', 'current'],
  },
  isso: {
    'history': ['history'],
    'geography': ['geography', 'maps', 'earth'],
    'civics': ['government', 'constitution'],
    'family': ['family', 'society'],
    'maps': ['maps'],
    'earth': ['earth'],
    'environment': ['environment'],
  },
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function loadSyllabus(exam, grade) {
  const p = path.join(SYLLABUS_DIR, exam, `grade${grade}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function loadQuestionPool(exam) {
  const dir = path.join(QB_DIR, exam, 'grade3', 'questions');
  if (!fs.existsSync(dir)) return [];
  const manifestPath = path.join(dir, 'manifest.json');
  const files = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')).files || []
    : fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'manifest.json');

  const pool = [];
  for (const file of files) {
    const arr = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    if (Array.isArray(arr)) pool.push(...arr);
  }
  return pool;
}

function topicMatches(syllabusTopicName, questionTopic, exam) {
  const name = (syllabusTopicName || '').toLowerCase();
  const qTopic = (questionTopic || '').toLowerCase();
  const map = TOPIC_MAP[exam] || {};
  for (const [key, keywords] of Object.entries(map)) {
    if (name.includes(key)) {
      if (keywords.some((k) => qTopic.includes(k))) return true;
    }
  }
  return name.split(/\s+/).some((word) => word.length > 2 && qTopic.includes(word));
}

function selectQuestionsForTopic(pool, syllabusTopic, exam, grade, count, usedTexts) {
  const name = syllabusTopic.name || '';
  const matches = pool.filter((q) => topicMatches(name, q.topic, exam));
  const preferEasy = grade <= 4;
  const sorted = [...matches].sort((a, b) => {
    const da = (a.difficulty || 'easy').toLowerCase();
    const db = (b.difficulty || 'easy').toLowerCase();
    if (preferEasy) return (da === 'easy' ? 0 : 1) - (db === 'easy' ? 0 : 1);
    return 0;
  });
  const selected = [];
  for (const q of sorted) {
    if (selected.length >= count) break;
    const key = (q.questionText || '').trim().toLowerCase();
    if (!key || usedTexts.has(key)) continue;
    usedTexts.add(key);
    selected.push(q);
  }
  const available = pool.filter((q) => {
    const key = (q.questionText || '').trim().toLowerCase();
    return key && !usedTexts.has(key);
  });
  for (const q of available) {
    if (selected.length >= count) break;
    const key = (q.questionText || '').trim().toLowerCase();
    usedTexts.add(key);
    selected.push(q);
  }
  return selected;
}

function generateForExamGrade(exam, grade, pool) {
  const syllabus = loadSyllabus(exam, grade);
  if (!syllabus || !syllabus.topics?.length) {
    console.warn(`  No syllabus for ${exam} grade ${grade}`);
    return;
  }

  if (!pool || pool.length === 0) {
    console.warn(`  No question pool for ${exam}`);
    return;
  }
  const destDir = path.join(QB_DIR, exam, `grade${grade}`);
  const questionsDir = path.join(destDir, 'questions');
  const packsDir = path.join(destDir, 'packs');
  fs.mkdirSync(questionsDir, { recursive: true });
  fs.mkdirSync(packsDir, { recursive: true });
  // Clear old question files to avoid duplicates from previous runs
  if (fs.existsSync(questionsDir)) {
    for (const f of fs.readdirSync(questionsDir)) {
      if (f.endsWith('.json')) fs.unlinkSync(path.join(questionsDir, f));
    }
  }

  const topicFiles = [];
  const allQuestions = [];
  const usedTexts = new Set();
  let qCounter = 1;

  for (const topic of syllabus.topics) {
    const count = Math.min(topic.recommendedQuestionCount || 25, 40);
    const questions = selectQuestionsForTopic(pool, topic, exam, grade, count, usedTexts);
    if (questions.length === 0) continue;

    const fileSlug = slugify(topic.name);
    const topicQuestions = questions.map((q, _i) => ({
      ...q,
      id: `${exam}-g${grade}-${fileSlug}-${String(qCounter++).padStart(4, '0')}`,
      exam,
      grade: String(grade),
      topic: topic.name,
      subtopic: topic.subtopics?.[0]?.name || topic.name,
    }));

    topicFiles.push(`${fileSlug}.json`);
    allQuestions.push(...topicQuestions);
    fs.writeFileSync(
      path.join(questionsDir, `${fileSlug}.json`),
      JSON.stringify(topicQuestions, null, 2)
    );
  }

  if (topicFiles.length === 0) return;

  fs.writeFileSync(
    path.join(questionsDir, 'manifest.json'),
    JSON.stringify({ files: topicFiles }, null, 2)
  );

  const syllabusOut = { exam, grade, topics: syllabus.topics };
  fs.writeFileSync(
    path.join(destDir, 'syllabus.json'),
    JSON.stringify(syllabusOut, null, 2)
  );

  const practicePacks = syllabus.topics.slice(0, 4).map((t, _i) => {
    const slug = slugify(t.name);
    return {
      packId: `${exam}-grade${grade}-${slug}-practice-01`,
      exam,
      grade,
      mode: 'practice',
      title: `${t.name} Practice Test`,
      topic: t.name,
      questionCount: 25,
      durationMinutes: 25,
      selectionRules: {
        topics: [t.name],
        difficultyMix: { easy: 15, medium: 8, hard: 2 },
      },
    };
  });

  const mockPool = [...allQuestions];
  const mockPacks = [
    {
      packId: `${exam}-grade${grade}-mock-01`,
      exam,
      grade,
      mode: 'mock',
      title: `${exam.toUpperCase()} Mock Test 1`,
      durationMinutes: 30,
      questionIds: shuffle([...mockPool]).slice(0, 25).map((q) => q.id),
    },
    {
      packId: `${exam}-grade${grade}-mock-02`,
      exam,
      grade,
      mode: 'mock',
      title: `${exam.toUpperCase()} Mock Test 2`,
      durationMinutes: 30,
      questionIds: shuffle([...mockPool]).slice(0, 25).map((q) => q.id),
    },
  ];

  if (fs.existsSync(packsDir)) {
    for (const f of fs.readdirSync(packsDir)) {
      if (f.endsWith('.json')) fs.unlinkSync(path.join(packsDir, f));
    }
  }
  let pi = 0;
  for (const pack of practicePacks) {
    pi++;
    fs.writeFileSync(
      path.join(packsDir, `practice-${pi}.json`),
      JSON.stringify(pack, null, 2)
    );
  }
  for (let mi = 0; mi < mockPacks.length; mi++) {
    fs.writeFileSync(
      path.join(packsDir, `mock-${mi + 1}.json`),
      JSON.stringify(mockPacks[mi], null, 2)
    );
  }

  console.log(`  ${exam} grade ${grade}: ${topicFiles.length} topics, ${allQuestions.length} questions`);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function exportSamplePacks() {
  const sampleDir = path.join(ROOT, 'public', 'sample-packs');
  fs.mkdirSync(sampleDir, { recursive: true });
  const exam = 'nso';
  const grade = 3;
  const qDir = path.join(QB_DIR, exam, `grade${grade}`, 'questions');
  const pDir = path.join(QB_DIR, exam, `grade${grade}`, 'packs');
  if (!fs.existsSync(qDir) || !fs.existsSync(pDir)) return;
  const manifest = JSON.parse(fs.readFileSync(path.join(qDir, 'manifest.json'), 'utf8'));
  const bank = new Map();
  for (const f of manifest.files || []) {
    const arr = JSON.parse(fs.readFileSync(path.join(qDir, f), 'utf8'));
    if (Array.isArray(arr)) for (const q of arr) bank.set(String(q.id), q);
  }
  const resolveMock = (def) => {
    const ids = def.questionIds || [];
    return ids.map((id) => bank.get(String(id))).filter(Boolean);
  };
  const resolvePractice = (def) => {
    const rules = def.selectionRules || {};
    const topics = rules.topics || [];
    let pool = Array.from(bank.values());
    if (topics.length) {
      const set = new Set(topics.map((t) => String(t).toLowerCase()));
      pool = pool.filter((q) => set.has((q.topic || '').toLowerCase()));
    }
    return shuffle([...pool]).slice(0, def.questionCount || 25);
  };
  for (const f of ['practice-1.json', 'mock-1.json']) {
    const def = JSON.parse(fs.readFileSync(path.join(pDir, f), 'utf8'));
    const questions = def.mode === 'mock' ? resolveMock(def) : resolvePractice(def);
    const pack = {
      packId: def.packId,
      exam: def.exam,
      grade: def.grade,
      mode: def.mode,
      title: def.title,
      topic: def.topic,
      questions,
      durationMinutes: def.durationMinutes ?? 30,
    };
    const outName = f === 'practice-1.json' ? 'nso-grade3-practice.json' : 'nso-grade3-mock.json';
    fs.writeFileSync(path.join(sampleDir, outName), JSON.stringify(pack, null, 2));
  }
  console.log('  Exported sample packs to public/sample-packs/');
}

console.log('Generating questions from syllabus...\n');

for (const exam of EXAMS) {
  console.log(`Exam: ${exam}`);
  const pool = loadQuestionPool(exam);
  if (!pool.length) {
    console.warn(`  No pool for ${exam}, skipping`);
    continue;
  }
  for (let grade = 1; grade <= 12; grade++) {
    generateForExamGrade(exam, grade, pool);
  }
}

exportSamplePacks();
console.log('\nDone. Run npm run validate:question-bank to verify.');
