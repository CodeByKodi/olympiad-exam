/**
 * Shared builders for typed olympiad mock exams (answer keys + explanations derived from sections).
 */

import type {
  BloomLevel,
  DifficultyLevel,
  ExamSection,
  MatchPair,
  MockExam,
  Question,
} from '../olympiadContent.js';

export const buildAnswerKey = (
  sections: ExamSection[],
): Record<string, Question['correct_answer']> =>
  sections.flatMap((s) => s.questions).reduce<Record<string, Question['correct_answer']>>((acc, q) => {
    acc[q.question_id] = q.correct_answer;
    return acc;
  }, {});

export const buildExplanations = (sections: ExamSection[]): Record<string, string> =>
  sections.flatMap((s) => s.questions).reduce<Record<string, string>>((acc, q) => {
    acc[q.question_id] = q.explanation;
    return acc;
  }, {});

export function finalizeMockExam(
  input: Omit<MockExam, 'answer_key' | 'explanations' | 'total_questions' | 'total_marks'>,
): MockExam {
  const flat = input.sections.flatMap((s) => s.questions);
  return {
    ...input,
    total_questions: flat.length,
    total_marks: flat.length,
    answer_key: buildAnswerKey(input.sections),
    explanations: buildExplanations(input.sections),
  };
}

/** Small helpers for readable exam construction */
export function mcq(
  id: string,
  prompt: string,
  options: [string, string, string, string],
  correct: string,
  explanation: string,
  topic: string,
  difficulty_level: DifficultyLevel,
  bloom_level: BloomLevel,
  subtopic?: string,
): Question {
  return {
    question_id: id,
    question_type: 'mcq',
    prompt,
    options: [...options],
    correct_answer: correct,
    explanation,
    topic,
    subtopic,
    difficulty_level,
    bloom_level,
  };
}

export function tf(
  id: string,
  prompt: string,
  correct: boolean,
  explanation: string,
  topic: string,
  difficulty_level: DifficultyLevel,
  bloom_level: BloomLevel,
  subtopic?: string,
): Question {
  return {
    question_id: id,
    question_type: 'true_false',
    prompt,
    correct_answer: correct,
    explanation,
    topic,
    subtopic,
    difficulty_level,
    bloom_level,
  };
}

export function fib(
  id: string,
  prompt: string,
  correct: string,
  explanation: string,
  topic: string,
  difficulty_level: DifficultyLevel,
  bloom_level: BloomLevel,
  subtopic?: string,
): Question {
  return {
    question_id: id,
    question_type: 'fill_in_the_blank',
    prompt,
    correct_answer: correct,
    explanation,
    topic,
    subtopic,
    difficulty_level,
    bloom_level,
  };
}

export function match(
  id: string,
  prompt: string,
  pairs: MatchPair[],
  explanation: string,
  topic: string,
  difficulty_level: DifficultyLevel,
  bloom_level: BloomLevel,
  subtopic?: string,
): Question {
  return {
    question_id: id,
    question_type: 'match_the_following',
    prompt,
    options: pairs,
    correct_answer: pairs,
    explanation,
    topic,
    subtopic,
    difficulty_level,
    bloom_level,
  };
}

export function sa(
  id: string,
  prompt: string,
  correct: string,
  explanation: string,
  topic: string,
  difficulty_level: DifficultyLevel,
  bloom_level: BloomLevel,
  subtopic?: string,
): Question {
  return {
    question_id: id,
    question_type: 'short_answer',
    prompt,
    correct_answer: correct,
    explanation,
    topic,
    subtopic,
    difficulty_level,
    bloom_level,
  };
}
