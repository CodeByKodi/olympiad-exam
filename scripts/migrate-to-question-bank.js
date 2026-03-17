#!/usr/bin/env node
/**
 * Migrate Grade 3 starter packs to question-bank architecture.
 * - Extracts questions to question bank with full metadata
 * - Creates pack definitions (fixed mock, dynamic practice)
 * - Deduplicates by questionText
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STARTER = join(ROOT, 'public', 'starter-packs');
const QB = join(ROOT, 'public', 'question-bank');

const EXAMS = ['nso', 'imo', 'ieo', 'ics', 'igko', 'isso'];
const GRADE = '3';

const PACK_TOPIC_TO_SYLLABUS = {
  nso: { 'Plants and Animals': 'plants-animals', 'Human Body and Food': 'human-body-food', 'Matter, Energy, and Force': 'matter-energy-force', 'Earth, Environment, and Space': 'earth-environment-space' },
  imo: { 'Numbers and Operations': 'numbers-operations', 'Multiplication, Division, and Fractions': 'multiplication-division-fractions', 'Time, Money, and Measurement': 'time-money-measurement', 'Shapes, Patterns, Data, and Reasoning': 'shapes-patterns-data-reasoning' },
  ieo: { 'Grammar Basics': 'grammar-basics', 'Vocabulary and Word Usage': 'vocabulary-word-usage', 'Sentence Skills and Writing': 'sentence-formation', 'Reading Comprehension and Everyday English': 'everyday-english' },
  ics: { 'Computer Parts and Devices': 'hardware-basics', 'Input, Output, Storage, and Uses': 'input-output-storage', 'Software, Tools, and Basic Operations': 'software-tools', 'Internet, Safety, and Digital Basics': 'digital-literacy' },
  igko: { 'Continents, Oceans, and Geography': 'general-knowledge', 'Symbols, Signs, and National Symbols': 'general-knowledge', 'Festivals, Important Days, and Culture': 'general-knowledge', 'Space, Science, and Current Affairs': 'general-knowledge' },
  isso: { 'History and Indian Leaders': 'history', 'Maps, Geography, and Landforms': 'geography', 'Earth, Seasons, and Solar System': 'earth-seasons-solar-system', 'Economy, Society, and Culture': 'civics' },
};

const SUBTOPIC_TO_TOPIC = {
  imo: {
    'Place Value': 'numbers-operations', 'Addition': 'numbers-operations', 'Subtraction': 'numbers-operations',
    'Comparison': 'numbers-operations', 'Numbers': 'numbers-operations', 'Word Problems': 'numbers-operations',
    'Multiplication': 'multiplication-division-fractions', 'Division': 'multiplication-division-fractions',
    'Fractions': 'multiplication-division-fractions',
    'Time': 'time-money-measurement', 'Money': 'time-money-measurement', 'Measurement': 'time-money-measurement',
    'Shapes': 'shapes-patterns-data-reasoning', 'Patterns': 'shapes-patterns-data-reasoning', 'Data': 'shapes-patterns-data-reasoning',
  },
  nso: {
    'Plants': 'plants-animals', 'Animals': 'plants-animals', 'Living and Non-living': 'plants-animals',
    'Human Body': 'human-body-food', 'Food': 'human-body-food', 'Body Parts': 'human-body-food',
    'Matter': 'matter-energy-force', 'Energy': 'matter-energy-force', 'Force': 'matter-energy-force',
    'Earth': 'earth-environment-space', 'Environment': 'earth-environment-space', 'Space': 'earth-environment-space',
  },
  ieo: {
    'Nouns': 'grammar-basics', 'Verbs': 'grammar-basics', 'Adjectives': 'grammar-basics', 'Pronouns': 'grammar-basics',
    'Articles': 'grammar-basics', 'Tenses': 'grammar-basics', 'Singular/Plural': 'grammar-basics', 'Prepositions': 'grammar-basics',
    'Synonyms': 'vocabulary-word-usage', 'Antonyms': 'vocabulary-word-usage', 'Spelling': 'vocabulary-word-usage',
    'Word Meaning': 'vocabulary-word-usage', 'Jumbled Words': 'vocabulary-word-usage',
    'Sentence Formation': 'sentence-formation', 'Punctuation': 'sentence-formation',
    'Everyday English': 'everyday-english', 'Reading Comprehension': 'everyday-english',
  },
  ics: { 'Hardware': 'hardware-basics', 'Software': 'software-tools', 'Internet': 'software-tools', 'Safety': 'digital-literacy' },
  igko: { 'India': 'general-knowledge', 'World': 'general-knowledge', 'Science': 'general-knowledge' },
  isso: { 'History': 'history', 'Geography': 'geography', 'Civics': 'civics' },
};

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'general';
}

function toBankQuestion(q, exam, grade, packTopic, _packMode) {
  const topicSlug = slugify(packTopic);
  const subtopic = q.topic || '';
  return {
    id: q.id,
    exam,
    grade,
    topic: packTopic,
    subtopic: subtopic || undefined,
    difficulty: q.difficulty || 'easy',
    modes: ['practice', 'mock'],
    questionText: q.questionText,
    image: q.image ?? '',
    options: q.options || [],
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    learningObjective: undefined,
    tags: [topicSlug, `grade${grade}`].filter(Boolean),
    sourceType: 'migrated',
    syllabusCode: undefined,
  };
}

function loadPack(exam, file) {
  const path = join(STARTER, exam, 'grade3', file);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

function main() {
  console.log('Migrating Grade 3 packs to question bank...\n');

  const allQuestionsByTopic = new Map();
  const questionTextToId = new Map();
  const mockPackQuestions = [];

  for (const exam of EXAMS) {
    const mockFiles = ['mock-1.json', 'mock-2.json'];
    const practiceFiles = ['practice-1.json', 'practice-2.json', 'practice-3.json', 'practice-4.json'];

    for (const file of [...practiceFiles, ...mockFiles]) {
      const pack = loadPack(exam, file);
      if (!pack || !pack.questions) continue;

      const isMock = file.startsWith('mock');
      let topicSlug;
      if (isMock) {
        topicSlug = 'mixed';
      } else {
        const packMap = PACK_TOPIC_TO_SYLLABUS[exam];
        topicSlug = (packMap && packMap[pack.topic]) || slugify(pack.topic || 'general');
      }

      if (!allQuestionsByTopic.has(exam)) {
        allQuestionsByTopic.set(exam, new Map());
      }
      const examTopics = allQuestionsByTopic.get(exam);
      if (!examTopics.has(topicSlug)) {
        examTopics.set(topicSlug, []);
      }
      const _topicList = examTopics.get(topicSlug);

      const packQuestionIds = [];

      for (const q of pack.questions) {
        const textKey = (q.questionText || '').trim().toLowerCase();
        if (!textKey) continue;

        let bankId = questionTextToId.get(`${exam}:${textKey}`);
        if (!bankId) {
          let targetTopicSlug = topicSlug;
          if (isMock && q.topic) {
            const mapping = SUBTOPIC_TO_TOPIC[exam];
            const mapped = mapping && mapping[q.topic];
            if (mapped) targetTopicSlug = mapped;
          }
          let targetList = examTopics.get(targetTopicSlug);
          if (!targetList) {
            targetList = [];
            examTopics.set(targetTopicSlug, targetList);
          }
          const count = targetList.length + 1;
          bankId = `${exam}-g${GRADE}-${targetTopicSlug}-${String(count).padStart(4, '0')}`;
          questionTextToId.set(`${exam}:${textKey}`, bankId);

          const packTopic = isMock ? (q.topic || 'Mixed') : (pack.topic || 'General');
          const bankQ = toBankQuestion(q, exam, GRADE, packTopic, pack.mode);
          bankQ.id = bankId;
          targetList.push(bankQ);
        }
        packQuestionIds.push(bankId);
      }

      if (isMock) {
        mockPackQuestions.push({
          exam,
          file,
          pack,
          questionIds: packQuestionIds,
        });
      }
    }
  }

  for (const exam of EXAMS) {
    const examTopics = allQuestionsByTopic.get(exam);
    if (!examTopics) continue;

    const gradeDir = join(QB, exam, `grade${GRADE}`);
    const questionsDir = join(gradeDir, 'questions');
    const packsDir = join(gradeDir, 'packs');

    mkdirSync(questionsDir, { recursive: true });
    mkdirSync(packsDir, { recursive: true });

    const topicFiles = [];
    for (const [topicSlug, questions] of examTopics) {
      const fileName = `${topicSlug}.json`;
      const outPath = join(questionsDir, fileName);
      writeFileSync(outPath, JSON.stringify(questions, null, 2), 'utf-8');
      topicFiles.push(fileName);
      console.log(`  ${exam}/grade3/questions/${fileName} (${questions.length} questions)`);
    }
    const manifestPath = join(questionsDir, 'manifest.json');
    writeFileSync(manifestPath, JSON.stringify({ files: topicFiles }, null, 2), 'utf-8');

    const mockPacks = mockPackQuestions.filter((m) => m.exam === exam);
    for (const { file, pack, questionIds } of mockPacks) {
      const packNum = file.replace(/\D/g, '');
      const packId = `${exam}-grade${GRADE}-mock-${packNum.padStart(2, '0')}`;
      const def = {
        packId,
        exam,
        grade: parseInt(GRADE, 10),
        mode: 'mock',
        title: pack.title || `Mock Test ${packNum}`,
        durationMinutes: pack.durationMinutes ?? 30,
        questionIds,
      };
      const defPath = join(packsDir, `mock-${packNum}.json`);
      writeFileSync(defPath, JSON.stringify(def, null, 2), 'utf-8');
      console.log(`  ${exam}/grade3/packs/mock-${packNum}.json (${questionIds.length} questions)`);
    }

    const practiceIndex = loadPack(exam, 'practice-1.json') ? loadPack(exam, 'index.json') : null;
    const indexArr = Array.isArray(practiceIndex) ? practiceIndex : [];
    const practiceEntries = indexArr.filter((e) => (e.mode || '').toLowerCase() === 'practice');

    for (const entry of practiceEntries) {
      const id = entry.id || '';
      if (!id.startsWith('practice-')) continue;

      const packNum = id.replace(/\D/g, '');
      const practicePack = loadPack(exam, `${id}.json`);
      if (!practicePack) continue;

      const topic = practicePack.topic || entry.topic || 'General';
      const topicSlug = slugify(topic);

      const packId = `${exam}-grade${GRADE}-${topicSlug}-practice-${packNum.padStart(2, '0')}`;
      const def = {
        packId,
        exam,
        grade: parseInt(GRADE, 10),
        mode: 'practice',
        title: practicePack.title || entry.title || `${topic} Practice`,
        topic,
        questionCount: 25,
        durationMinutes: 25,
        selectionRules: {
          topics: [topic],
          difficultyMix: { easy: 15, medium: 8, hard: 2 },
        },
      };
      const defPath = join(packsDir, `practice-${packNum}.json`);
      writeFileSync(defPath, JSON.stringify(def, null, 2), 'utf-8');
      console.log(`  ${exam}/grade3/packs/practice-${packNum}.json`);
    }
  }

  console.log('\nMigration complete.');
}

main();
