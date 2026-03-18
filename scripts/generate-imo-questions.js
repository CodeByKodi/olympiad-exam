#!/usr/bin/env node
/**
 * Generate IMO questions from syllabus-master.json for all grades 1-12.
 * Creates topic question files, manifest, and pack definitions.
 * 25 questions per topic as per syllabus.
 * Run: node scripts/generate-imo-questions.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const IMO_BASE = join(ROOT, 'public', 'question-bank', 'imo');
const SYLLABUS_PATH = join(IMO_BASE, 'syllabus-master.json');
const TEMPLATES_PATH = join(__dirname, 'imo-templates-extract.json');

/** Map syllabus topic (lowercase) to slug */
function topicToSlug(topic) {
  const t = topic.toLowerCase();
  if (t.includes('pattern') && !t.includes('logical')) return 'patterns';
  if (t.includes('odd one') || t.includes('analogy') || t.includes('classification') ||
      t.includes('ranking') || t.includes('grouping') || t.includes('embedded') ||
      t.includes('coding') || t.includes('alphabet') || t.includes('mirror') ||
      t.includes('direction sense') || t.includes('possible combination') ||
      t.includes('clock') || t.includes('calendar') || t.includes('puzzle') ||
      t.includes('logical sequence') || t.includes('verbal') || t.includes('non-verbal') ||
      t.includes('spatial') || t.includes('problems based on figures')) return 'logical-reasoning';
  if (t.includes('numeral') || t.includes('number name') || t.includes('number sense') ||
      t.includes('number play') || t.includes('number system') || t.includes('numbers') ||
      t.includes('rational number') || t.includes('integer') || t.includes('real number')) return 'numbers';
  if (t.includes('addition') || t.includes('subtraction') || t.includes('computation') ||
      t.includes('prime time') || t.includes('other side of zero')) return 'addition-and-subtraction';
  if (t.includes('fraction') && !t.includes('decimal')) return 'fractions';
  if (t.includes('decimal') || (t.includes('fraction') && t.includes('decimal'))) return 'fractions-and-decimals';
  if (t.includes('length') || t.includes('weight') || t.includes('capacity') ||
      t.includes('temperature') || t.includes('time') || t.includes('measuring') ||
      t.includes('conversion') || t.includes('perimeter') || t.includes('area') ||
      t.includes('mensuration')) return 'measurement';
  if (t.includes('money')) return 'money';
  if (t.includes('data') || t.includes('pictograph') || t.includes('statistics') ||
      t.includes('handling') || t.includes('probability')) return 'data-handling';
  if (t.includes('comparing quantities') || t.includes('direct and inverse proportion') ||
      (t.includes('percent') && !t.includes('algebra'))) return 'percentages-and-ratios';
  if (t.includes('algebra') || t.includes('polynomial') || t.includes('equation') ||
      t.includes('exponent') || t.includes('factorisation') || t.includes('expression') ||
      t.includes('proportion') || t.includes('graph') || t.includes('relations and functions')) return 'algebra';
  if (t.includes('trigonometry') || t.includes('trig')) return 'trigonometry';
  if (t.includes('set') || t.includes('relation') || t.includes('function') ||
      t.includes('sequence') || t.includes('series') || t.includes('permutation') ||
      t.includes('combination') || t.includes('binomial') || t.includes('limit') ||
      t.includes('logarithm') || t.includes('complex number') || t.includes('inequality') ||
      t.includes('quantification') || t.includes('numerical application') ||
      t.includes('financial') || t.includes('quantitative aptitude') ||
      t.includes('determinant') || t.includes('matrix') || t.includes('matrices') ||
      t.includes('differentiation') || t.includes('integration') || t.includes('derivative') ||
      t.includes('differential equation') || t.includes('linear programming') ||
      t.includes('vector') || t.includes('calculus') || t.includes('inverse trigonometric')) return 'advanced-math';
  if (t.includes('geometr') || t.includes('shape') || t.includes('solid') || t.includes('line') ||
      t.includes('angle') || t.includes('symmetry') || t.includes('triangle') ||
      t.includes('quadrilateral') || t.includes('circle') || t.includes('construction') ||
      t.includes('euclid') || t.includes('coordinate') || t.includes('polygon') ||
      t.includes('heron') || t.includes('surface') || t.includes('volume') ||
      t.includes('conic') || t.includes('parabola') || t.includes('straight line') ||
      t.includes('3-d') || t.includes('three dimension')) return 'geometry';
  return 'logical-reasoning';
}

function getTopicsForGrade(syllabus, grade) {
  const cls = syllabus.classes.find((c) => c.grade === grade);
  if (!cls) return [];

  const slugs = new Set();
  const topicNames = new Map(); // slug -> display name

  for (const section of cls.sections) {
    if (section.section_name === 'Section-3' || section.section_name === 'Section-4') continue;

    let topics = [];
    if (section.topics && section.topics.length > 0) {
      topics = section.topics;
    } else if (section.section_2_options && section.section_2_options.length > 0) {
      topics = section.section_2_options[0].topics || [];
    }

    for (const t of topics) {
      const slug = topicToSlug(t);
      slugs.add(slug);
      if (!topicNames.has(slug)) topicNames.set(slug, t);
    }
  }

  return Array.from(slugs).map((slug) => ({ slug, name: topicNames.get(slug) }));
}

function buildQuestion(template, exam, grade, topicName, topicSlug, index) {
  const id = `imo-g${grade}-${topicSlug}-${String(index).padStart(4, '0')}`;
  return {
    id,
    exam,
    grade: String(grade),
    topic: topicName,
    subtopic: topicName,
    difficulty: index % 3 === 0 ? 'medium' : 'easy',
    modes: ['practice', 'mock'],
    questionText: template.q,
    image: '',
    options: [...template.opts],
    correctAnswer: template.c,
    explanation: template.e,
    tags: [topicSlug, 'imo', `grade${grade}`],
    sourceType: 'generated',
  };
}

function main() {
  const syllabus = JSON.parse(readFileSync(SYLLABUS_PATH, 'utf-8'));
  const allTemplates = JSON.parse(readFileSync(TEMPLATES_PATH, 'utf-8'));

  const FALLBACK_SLUG = 'logical-reasoning';
  const SLUG_ALIASES = { geometry: 'shapes', 'fractions-and-decimals': 'fractions', 'percentages-and-ratios': 'percentages-and-ratios' };
  const getTemplates = (slug) => {
    const key = SLUG_ALIASES[slug] || slug;
    return allTemplates[key] || allTemplates[FALLBACK_SLUG] || [];
  };

  for (const cls of syllabus.classes) {
    const grade = cls.grade;
    const topics = getTopicsForGrade(syllabus, grade);
    if (topics.length === 0) {
      console.warn(`Skipping grade ${grade}: no topics`);
      continue;
    }

    const questionsDir = join(IMO_BASE, `grade${grade}`, 'questions');
    const packsDir = join(IMO_BASE, `grade${grade}`, 'packs');
    mkdirSync(questionsDir, { recursive: true });
    mkdirSync(packsDir, { recursive: true });

    const existingFiles = existsSync(questionsDir)
      ? readdirSync(questionsDir).filter((f) => f.endsWith('.json') && f !== 'manifest.json')
      : [];
    const manifestFiles = [];
    const practicePacks = [];
    const gradeQuestionIds = [];
    const usedQuestionTexts = new Set();

    for (const { slug, name } of topics) {
      const topicName = name || slug;
      const templates = getTemplates(slug);
      const questions = [];
      let qIndex = 1;

      for (const template of templates) {
        const textKey = template.q.trim().toLowerCase();
        if (usedQuestionTexts.has(textKey)) continue;
        usedQuestionTexts.add(textKey);
        const q = buildQuestion(template, 'imo', grade, topicName, slug, qIndex);
        questions.push(q);
        gradeQuestionIds.push(q.id);
        qIndex++;
        if (questions.length >= 25) break;
      }

      if (questions.length < 25) {
        const fallback = getTemplates(FALLBACK_SLUG);
        for (const template of fallback) {
          if (questions.length >= 25) break;
          const textKey = template.q.trim().toLowerCase();
          if (usedQuestionTexts.has(textKey)) continue;
          usedQuestionTexts.add(textKey);
          const q = buildQuestion(template, 'imo', grade, topicName, slug, qIndex);
          questions.push(q);
          gradeQuestionIds.push(q.id);
          qIndex++;
        }
      }

      const filename = `${slug}.json`;
      writeFileSync(join(questionsDir, filename), JSON.stringify(questions, null, 2) + '\n', 'utf-8');
      manifestFiles.push(filename);

      practicePacks.push({
        packId: `imo-grade${grade}-${slug}-practice-01`,
        exam: 'imo',
        grade,
        mode: 'practice',
        title: `${topicName} Practice`,
        topic: topicName,
        questionCount: 25,
        durationMinutes: 25,
        selectionRules: {
          topics: [topicName],
          difficultyMix: { easy: 15, medium: 8, hard: 2 },
        },
      });
    }

    const manifestSet = new Set(manifestFiles);
    for (const f of existingFiles) {
      if (!manifestSet.has(f)) {
        try {
          unlinkSync(join(questionsDir, f));
        } catch {
          /* ignore */
        }
      }
    }

    writeFileSync(join(questionsDir, 'manifest.json'), JSON.stringify({ files: manifestFiles }, null, 2) + '\n', 'utf-8');

    practicePacks.forEach((p, i) => {
      const filename = `practice-${i + 1}.json`;
      writeFileSync(join(packsDir, filename), JSON.stringify(p, null, 2) + '\n', 'utf-8');
    });

    const mockQuestionIds = gradeQuestionIds.slice(0, 25);
    const mockPack = {
      packId: `imo-grade${grade}-mock-01`,
      exam: 'imo',
      grade,
      mode: 'mock',
      title: `IMO Grade ${grade} Mock Test 1`,
      durationMinutes: 30,
      questionIds: mockQuestionIds,
    };
    writeFileSync(join(packsDir, 'mock-1.json'), JSON.stringify(mockPack, null, 2) + '\n', 'utf-8');

    const expectedPacks = new Set([
      ...practicePacks.map((_, i) => `practice-${i + 1}.json`),
      'mock-1.json',
    ]);
    const existingPacks = existsSync(packsDir) ? readdirSync(packsDir).filter((f) => f.endsWith('.json')) : [];
    for (const f of existingPacks) {
      if (!expectedPacks.has(f)) {
        try {
          unlinkSync(join(packsDir, f));
        } catch {
          /* ignore */
        }
      }
    }

    console.log(`Grade ${grade}: ${topics.length} topics, ${gradeQuestionIds.length} questions, ${practicePacks.length} practice packs, 1 mock pack`);
  }

  console.log('\nDone. Run npm run update:question-bank-index');
}

main();
