#!/usr/bin/env node
/**
 * Generate NSO questions from syllabus-master.json for all grades 1-12.
 * Creates topic question files, manifest, pack definitions, and per-grade syllabus.
 * 25 questions per topic as per syllabus.
 * Run: node scripts/generate-nso-questions.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const NSO_BASE = join(ROOT, 'public', 'question-bank', 'nso');
const SYLLABUS_PATH = join(NSO_BASE, 'syllabus-master.json');
const TEMPLATES_PATH = join(__dirname, 'nso-templates-extract.json');

/** Map syllabus topic (lowercase) to slug */
function topicToSlug(topic) {
  const t = topic.toLowerCase();
  if (t.includes('pattern') || t.includes('odd one') || t.includes('analogy') || t.includes('classification') ||
      t.includes('ranking') || t.includes('grouping') || t.includes('embedded') || t.includes('coding') ||
      t.includes('alphabet') || t.includes('mirror') || t.includes('direction sense') || t.includes('possible combination') ||
      t.includes('clock') || t.includes('calendar') || t.includes('puzzle') || t.includes('logical sequence') ||
      t.includes('verbal') || t.includes('non-verbal') || t.includes('spatial') || t.includes('measuring') ||
      t.includes('geometrical') || t.includes('problems based on figures')) return 'logical-reasoning';
  if (t.includes('living') || t.includes('non-living')) return 'living-and-non-living';
  if (t.includes('plant') && t.includes('animal')) return 'plants-and-animals';
  if (t.includes('bird')) return 'plants-and-animals';
  if (t.includes('plant') && !t.includes('animal')) return 'plants';
  if (t.includes('animal') && !t.includes('plant')) return 'animals';
  if (t.includes('human') || t.includes('body') || t.includes('health')) return 'human-body';
  if (t.includes('food') || t.includes('digestion') || t.includes('nutrition')) return 'food';
  if (t.includes('habit') || t.includes('safety')) return 'living-and-non-living';
  if (t.includes('air') || t.includes('water') || t.includes('rock')) return 'air-and-water';
  if (t.includes('weather') || t.includes('sky')) return 'weather-and-sky';
  if (t.includes('housing') || t.includes('clothing') || t.includes('occupation') || t.includes('transport') ||
      t.includes('communication') || t.includes('family') || t.includes('festival')) return 'living-and-non-living';
  if (t.includes('earth') || t.includes('universe') || t.includes('magnet') || t.includes('natural resource') ||
      t.includes('fossil') || t.includes('renewable') || t.includes('solar') || t.includes('soil') ||
      t.includes('mineral') || t.includes('beyond earth')) return 'earth-and-universe';
  if (t.includes('matter') || t.includes('material') || t.includes('separation') || t.includes('state')) return 'matter-and-materials';
  if (t.includes('light') || t.includes('sound') || t.includes('force') || t.includes('energy') ||
      t.includes('heat') || t.includes('electric') || t.includes('acid') || t.includes('motion') ||
      t.includes('pressure') || t.includes('friction') || t.includes('combustion') || t.includes('flame')) return 'force-and-energy';
  if (t.includes('environment') || t.includes('pollution') || t.includes('conservation') || t.includes('calamit')) return 'our-environment';
  if (t.includes('crop') || t.includes('microorganism') || t.includes('coal') || t.includes('petroleum')) return 'our-environment';
  if (t.includes('reproduction') || t.includes('endocrine') || t.includes('cell') || t.includes('tissue') ||
      t.includes('respiration') || t.includes('transportation') || t.includes('heredity') ||
      t.includes('coordination') || t.includes('life process')) return 'human-body';
  if (t.includes('chemical') || t.includes('atom') || t.includes('molecule') || t.includes('metal') ||
      t.includes('carbon') || t.includes('equation') || t.includes('thermodynamics') ||
      t.includes('equilibrium') || t.includes('redox') || t.includes('organic') || t.includes('hydrocarbon') ||
      t.includes('solution') || t.includes('electrochem') || t.includes('kinetics') || t.includes('coordination') ||
      t.includes('haloalkane') || t.includes('alcohol') || t.includes('aldehyde') || t.includes('amine') ||
      t.includes('biomolecule') || t.includes('element') || t.includes('periodicity') || t.includes('bonding')) return 'matter-and-materials';
  if (t.includes('physics') || t.includes('unit') || t.includes('measurement') || t.includes('mechanics') ||
      t.includes('property') || t.includes('thermodynamics') || t.includes('oscillation') || t.includes('wave') ||
      t.includes('electricity') || t.includes('magnetism') || t.includes('induction') || t.includes('optics') ||
      t.includes('semiconductor') || t.includes('electromagnetic')) return 'force-and-energy';
  if (t.includes('diversity') || t.includes('structural organisation') || t.includes('physiology') ||
      t.includes('biotechnology') || t.includes('ecology') || t.includes('genetics') || t.includes('evolution') ||
      t.includes('reproduction')) return 'plants-and-animals';
  return 'plants-and-animals';
}

function getTopicsForGrade(syllabus, grade) {
  const cls = syllabus.classes.find((c) => c.grade === grade);
  if (!cls) return [];

  const slugs = new Set();
  const topicNames = new Map();

  for (const section of cls.sections) {
    if (section.section_name === 'Section-3' && section.section_3_options) {
      for (const opt of section.section_3_options) {
        for (const t of opt.topics || []) {
          const slug = topicToSlug(t);
          slugs.add(slug);
          if (!topicNames.has(slug)) topicNames.set(slug, t);
        }
      }
      continue;
    }
    if (section.notes && section.notes.includes('Syllabus as per')) continue;

    let topics = [];
    if (section.topics && section.topics.length > 0) {
      topics = section.topics;
    } else if (section.subsections) {
      for (const sub of section.subsections) {
        topics = topics.concat(sub.topics || []);
      }
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
  const id = `nso-g${grade}-${topicSlug}-${String(index).padStart(4, '0')}`;
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
    tags: [topicSlug, 'nso', `grade${grade}`],
    sourceType: 'generated',
  };
}

function buildSyllabusForGrade(syllabus, grade, topicSlugs) {
  const cls = syllabus.classes.find((c) => c.grade === grade);
  const topics = topicSlugs.map(({ slug, name }) => ({
    code: `NSO-G${grade}-${slug.toUpperCase().replace(/-/g, '_')}`,
    name,
    slug,
    description: `${name} for Grade ${grade}.`,
    weightage: 'medium',
    recommendedQuestionCount: 25,
    subtopics: [{ code: `${slug}-basics`, name: `${name} Basics`, tags: [slug, 'nso', `grade${grade}`] }],
  }));
  return {
    exam: 'nso',
    grade,
    sections_overview: syllabus.sections_overview,
    achievers_section: "Higher Order Thinking Questions - Syllabus as per Section 2.",
    topics,
  };
}

function main() {
  const syllabus = JSON.parse(readFileSync(SYLLABUS_PATH, 'utf-8'));
  const allTemplates = JSON.parse(readFileSync(TEMPLATES_PATH, 'utf-8'));

  const FALLBACK_SLUG = 'plants-and-animals';
  const SLUG_ALIASES = { geometry: 'logical-reasoning' };
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

    const questionsDir = join(NSO_BASE, `grade${grade}`, 'questions');
    const packsDir = join(NSO_BASE, `grade${grade}`, 'packs');
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
        const q = buildQuestion(template, 'nso', grade, topicName, slug, qIndex);
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
          const q = buildQuestion(template, 'nso', grade, topicName, slug, qIndex);
          questions.push(q);
          gradeQuestionIds.push(q.id);
          qIndex++;
        }
      }

      const filename = `${slug}.json`;
      writeFileSync(join(questionsDir, filename), JSON.stringify(questions, null, 2) + '\n', 'utf-8');
      manifestFiles.push(filename);

      practicePacks.push({
        packId: `nso-grade${grade}-${slug}-practice-01`,
        exam: 'nso',
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
        try { unlinkSync(join(questionsDir, f)); } catch { /* ignore */ }
      }
    }

    writeFileSync(join(questionsDir, 'manifest.json'), JSON.stringify({ files: manifestFiles }, null, 2) + '\n', 'utf-8');

    practicePacks.forEach((p, i) => {
      writeFileSync(join(packsDir, `practice-${i + 1}.json`), JSON.stringify(p, null, 2) + '\n', 'utf-8');
    });

    const mockQuestionIds = gradeQuestionIds.slice(0, 25);
    const mockPack = {
      packId: `nso-grade${grade}-mock-01`,
      exam: 'nso',
      grade,
      mode: 'mock',
      title: `NSO Grade ${grade} Mock Test 1`,
      durationMinutes: 30,
      questionIds: mockQuestionIds,
    };
    writeFileSync(join(packsDir, 'mock-1.json'), JSON.stringify(mockPack, null, 2) + '\n', 'utf-8');

    const expectedPacks = new Set([...practicePacks.map((_, i) => `practice-${i + 1}.json`), 'mock-1.json']);
    const existingPacks = existsSync(packsDir) ? readdirSync(packsDir).filter((f) => f.endsWith('.json')) : [];
    for (const f of existingPacks) {
      if (!expectedPacks.has(f)) {
        try { unlinkSync(join(packsDir, f)); } catch { /* ignore */ }
      }
    }

    const gradeSyllabus = buildSyllabusForGrade(syllabus, grade, topics);
    writeFileSync(join(NSO_BASE, `grade${grade}`, 'syllabus.json'), JSON.stringify(gradeSyllabus, null, 2) + '\n', 'utf-8');

    console.log(`Grade ${grade}: ${topics.length} topics, ${gradeQuestionIds.length} questions, ${practicePacks.length} practice packs, 1 mock pack`);
  }

  console.log('\nDone. Run npm run update:question-bank-index');
}

main();
