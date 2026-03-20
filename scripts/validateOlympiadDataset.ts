/**
 * Validates practice_exams + mock_exams in olympiadContentByCode + schema checks.
 * Run: npx tsx scripts/validateOlympiadDataset.ts
 */

import { olympiadContentByCode } from '../src/data/olympiadContent.js';
import type { ExamSection, MockExam, PracticeExam, Question } from '../src/data/olympiadContent.js';

const DIFF = new Set(['easy', 'medium', 'hard']);
const BLOOM = new Set(['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']);
const Q_TYPES = new Set([
  'mcq',
  'true_false',
  'fill_in_the_blank',
  'match_the_following',
  'short_answer',
]);

const critical: string[] = [];
const warnings: string[] = [];

function flatQuestions(exam: PracticeExam | MockExam): Question[] {
  return exam.sections.flatMap((s) => s.questions);
}

function validateQuestion(q: Question, examId: string): void {
  if (!q.question_id || !q.prompt) critical.push(`${examId}: empty id/prompt`);
  if (!Q_TYPES.has(q.question_type)) critical.push(`${q.question_id}: invalid question_type`);
  if (!DIFF.has(q.difficulty_level)) critical.push(`${q.question_id}: invalid difficulty_level`);
  if (!BLOOM.has(q.bloom_level)) critical.push(`${q.question_id}: invalid bloom_level`);
  if (!q.explanation || q.explanation.trim().length < 8) {
    warnings.push(`${q.question_id}: explanation very short (<8 chars)`);
  }
  if (q.question_type === 'mcq') {
    const opts = q.options ?? [];
    if (opts.length < 2) critical.push(`${q.question_id}: MCQ needs ≥2 options`);
    if (!opts.some((o) => String(o).trim() === String(q.correct_answer).trim())) {
      critical.push(`${q.question_id}: correct_answer not among options`);
    }
  }
}

function validateExam(
  exam: PracticeExam | MockExam,
  kind: 'practice' | 'mock',
  code: string,
): void {
  const required = [
    'id',
    'title',
    'exam_code',
    'class_name',
    'subject_name',
    'duration_minutes',
    'sections',
    'instructions',
    'tags',
    'source',
  ] as const;
  for (const k of required) {
    if ((exam as unknown as Record<string, unknown>)[k] === undefined) {
      critical.push(`${exam.id}: missing field ${k}`);
    }
  }
  if (exam.exam_code !== code) critical.push(`${exam.id}: exam_code mismatch container ${code}`);
  if (kind === 'practice' && exam.exam_type !== 'practice') critical.push(`${exam.id}: not practice`);
  if (kind === 'mock') {
    const m = exam as MockExam;
    if (m.exam_type !== 'mock') critical.push(`${m.id}: not mock`);
    if (!['olympiad-standard', 'sectional-timed', 'full-length'].includes(m.pattern_type)) {
      critical.push(`${m.id}: invalid pattern_type`);
    }
  }

  const flat = flatQuestions(exam);
  const n = flat.length;
  if (exam.total_questions !== n) critical.push(`${exam.id}: total_questions ${exam.total_questions} != ${n}`);
  if (exam.total_marks !== n) critical.push(`${exam.id}: total_marks ${exam.total_marks} != ${n}`);

  const keyLen = Object.keys(exam.answer_key).length;
  if (keyLen !== n) critical.push(`${exam.id}: answer_key keys ${keyLen} != ${n}`);
  const expLen = Object.keys(exam.explanations).length;
  if (expLen !== n) critical.push(`${exam.id}: explanations keys ${expLen} != ${n}`);

  const seenQ = new Set<string>();
  for (const q of flat) {
    if (seenQ.has(q.question_id)) critical.push(`${exam.id}: duplicate question_id ${q.question_id}`);
    seenQ.add(q.question_id);
    validateQuestion(q, exam.id);
    const ak = exam.answer_key[q.question_id];
    if (ak === undefined) critical.push(`${exam.id}: missing answer_key ${q.question_id}`);
    else if (JSON.stringify(ak) !== JSON.stringify(q.correct_answer)) {
      critical.push(`${exam.id}: answer_key mismatch ${q.question_id}`);
    }
  }

  for (const sec of exam.sections) {
    validateSection(sec, exam.id);
  }

  // Within-exam duplicate prompts
  const prompts = new Map<string, string>();
  for (const q of flat) {
    const norm = q.prompt.replace(/\s+/g, ' ').trim().toLowerCase();
    if (prompts.has(norm)) {
      critical.push(`${exam.id}: duplicate prompt "${norm.slice(0, 48)}…" (${q.question_id} vs ${prompts.get(norm)})`);
    } else prompts.set(norm, q.question_id);
  }

  if (!exam.instructions?.length) warnings.push(`${exam.id}: no instructions`);
}

function validateSection(sec: ExamSection, examId: string): void {
  if (!sec.section_name) critical.push(`${examId}: section missing section_name`);
  if (!Array.isArray(sec.questions)) critical.push(`${examId}: section questions not array`);
  // Note: TS schema does not include question_count / marks_per_question on ExamSection.
}

export function runValidation(): { critical: string[]; warnings: string[]; stats: Record<string, number> } {
  const examIds = new Set<string>();
  const globalQids = new Map<string, string>();
  let questionCount = 0;

  for (const [code, data] of Object.entries(olympiadContentByCode)) {
    for (const e of data.practice_exams) {
      if (examIds.has(e.id)) critical.push(`Duplicate exam id: ${e.id}`);
      examIds.add(e.id);
      validateExam(e, 'practice', code);
      for (const q of flatQuestions(e)) {
        questionCount++;
        if (globalQids.has(q.question_id)) {
          warnings.push(
            `Global duplicate question_id ${q.question_id} in ${globalQids.get(q.question_id)} and ${e.id}`,
          );
        }
        globalQids.set(q.question_id, e.id);
      }
    }
    for (const e of data.mock_exams) {
      if (examIds.has(e.id)) critical.push(`Duplicate exam id: ${e.id}`);
      examIds.add(e.id);
      validateExam(e, 'mock', code);
      for (const q of flatQuestions(e)) {
        questionCount++;
        if (globalQids.has(q.question_id)) {
          warnings.push(
            `Global duplicate question_id ${q.question_id} in ${globalQids.get(q.question_id)} and ${e.id}`,
          );
        }
        globalQids.set(q.question_id, e.id);
      }
    }
  }

  return {
    critical,
    warnings,
    stats: {
      exams: examIds.size,
      questions: questionCount,
    },
  };
}

const isMain = process.argv[1]?.includes('validateOlympiadDataset');
if (isMain) {
  const r = runValidation();
  console.log(JSON.stringify({ stats: r.stats, criticalCount: r.critical.length, warningCount: r.warnings.length }, null, 2));
  if (r.critical.length) {
    console.error('CRITICAL:\n', r.critical.slice(0, 80).join('\n'));
    process.exit(1);
  }
  if (r.warnings.length) {
    console.warn('WARNINGS (first 40):\n', r.warnings.slice(0, 40).join('\n'));
  }
  console.log('OK: no critical issues');
}
