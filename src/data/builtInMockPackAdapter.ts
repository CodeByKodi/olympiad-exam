/**
 * Converts typed MockExam objects into Question Library pack format (MCQ-only, 4 options)
 * so TestSelectPage / loadMockPack / ExamPage can run them without JSON question-bank files.
 */

import type { MockExam, OlympiadCode, Question } from './olympiadContent.js';

type Qn = Question;
import { normalizeClassLabel } from './classLabel.js';
import { allMockExams } from './mockExams/mockExamBank.js';

type LibraryQuestion = {
  id: string;
  exam: string;
  grade: string;
  topic: string;
  subtopic?: string;
  difficulty: string;
  modes: string[];
  questionText: string;
  image: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  tags: string[];
  sourceType: string;
};

const DIST = ['None of the above', 'Cannot be determined from the stem', 'Not listed here', 'No correct choice'];

function padFourOptions(opts: string[], correctIdx: number): { options: string[]; correctAnswer: number } {
  const o = opts.map((x) => String(x).trim()).filter(Boolean);
  let ci = correctIdx;
  for (const d of DIST) {
    if (o.length >= 4) break;
    if (!o.some((x) => x.toLowerCase() === d.toLowerCase())) o.push(d);
  }
  while (o.length < 4) o.push(`Option ${o.length + 1}`);
  const four = o.slice(0, 4);
  ci = Math.min(Math.max(0, ci), 3);
  return { options: four, correctAnswer: ci };
}

function toLibraryQuestion(q: Qn, exam: string, grade: string): LibraryQuestion | null {
  const baseId = q.question_id;
  const base = {
    id: baseId,
    exam,
    grade,
    topic: q.topic,
    subtopic: q.subtopic ?? '',
    difficulty: q.difficulty_level,
    modes: ['mock'],
    image: '',
    tags: ['built-in-mock'],
    sourceType: 'built-in-mock',
    explanation: q.explanation,
  };

  if (q.question_type === 'mcq') {
    const raw = [...q.options];
    let idx = raw.findIndex((o) => String(o).trim() === String(q.correct_answer).trim());
    if (idx < 0) idx = raw.findIndex((o) => String(o).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase());
    const { options, correctAnswer } = padFourOptions(raw, idx >= 0 ? idx : 0);
    return {
      ...base,
      questionText: q.prompt,
      options,
      correctAnswer,
    };
  }

  if (q.question_type === 'true_false') {
    const options = ['True', 'False', 'Not given in the stem', 'Cannot tell from the stem'];
    return {
      ...base,
      questionText: q.prompt,
      options,
      correctAnswer: q.correct_answer ? 0 : 1,
    };
  }

  if (q.question_type === 'fill_in_the_blank') {
    const c = String(q.correct_answer).trim();
    const wrong = DIST.filter((d) => d.toLowerCase() !== c.toLowerCase()).slice(0, 3);
    const raw = [c, ...wrong];
    const { options, correctAnswer } = padFourOptions(raw, 0);
    return {
      ...base,
      questionText: q.prompt.replace(/____\.?$/, ' (choose the best completion)'),
      options,
      correctAnswer,
    };
  }

  if (q.question_type === 'short_answer') {
    const c = String(q.correct_answer).trim();
    const wrong = DIST.filter((d) => d.toLowerCase() !== c.toLowerCase()).slice(0, 3);
    const raw = [c, ...wrong];
    const { options, correctAnswer } = padFourOptions(raw, 0);
    return {
      ...base,
      questionText: `${q.prompt} (choose closest answer)`,
      options,
      correctAnswer,
    };
  }

  if (q.question_type === 'match_the_following') {
    const pairs = q.correct_answer;
    if (!pairs?.length) return null;
    const [first, ...rest] = pairs;
    const prompt = `${q.prompt} — Match: "${first.left}" → ?`;
    const rights = [first.right, ...rest.map((p) => p.right)].filter(Boolean);
    const raw = rights.length >= 4 ? rights.slice(0, 4) : [...rights, ...DIST].slice(0, 4);
    let idx = 0;
    const { options, correctAnswer } = padFourOptions(raw, idx);
    return {
      ...base,
      questionText: prompt,
      options,
      correctAnswer,
    };
  }

  return null;
}

function examTitleForUi(exam: MockExam): string {
  return exam.title.replace(/\bClass\s+/gi, 'Grade ');
}

/**
 * Library pack shape: same as IndexedDB-imported mock packs (full `questions` array).
 */
export function mockExamToBuiltInPack(exam: MockExam, examIdLower: string, gradeId: string) {
  const questions: LibraryQuestion[] = [];
  for (const sec of exam.sections) {
    for (const q of sec.questions) {
      const lib = toLibraryQuestion(q, examIdLower, gradeId);
      if (lib) questions.push(lib);
    }
  }

  return {
    packId: exam.id,
    exam: examIdLower,
    grade: gradeId,
    mode: 'mock' as const,
    title: examTitleForUi(exam),
    topic: exam.subject_name,
    questionCount: questions.length,
    durationMinutes: exam.duration_minutes,
    enabled: true,
    isStarter: true,
    isQuestionBank: false,
    isBuiltInOlympiadMock: true,
    questions,
  };
}

export function getBuiltInOlympiadMockPacks(examId: string, gradeId: string) {
  const code = examId.toUpperCase() as OlympiadCode;
  const want = normalizeClassLabel(`Class ${gradeId}`);
  const examLower = examId.toLowerCase();

  return allMockExams
    .filter(
      (e) => e.exam_code === code && normalizeClassLabel(e.class_name) === want,
    )
    .map((e) => mockExamToBuiltInPack(e, examLower, String(gradeId)));
}
