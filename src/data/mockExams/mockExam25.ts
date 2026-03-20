/**
 * Ensures every mock exam has exactly MOCK_EXAM_QUESTION_TARGET items (trim then pad Achievers).
 */

import type { ExamSection, OlympiadCode } from '../olympiadContent.js';
import { buildPaddingMcqs } from './syntheticPadding.js';

export const MOCK_EXAM_QUESTION_TARGET = 25;

function countQuestions(sections: ExamSection[]): number {
  return sections.reduce((n, s) => n + s.questions.length, 0);
}

function deepCloneSections(sections: ExamSection[]): ExamSection[] {
  return sections.map((s) => ({
    ...s,
    questions: s.questions.map((q) => ({ ...q })),
  }));
}

/**
 * Trim from the tail (last section first), then append MCQ supplements to the last section.
 */
export function normalizeMockSectionsToTarget(
  sections: ExamSection[],
  examCode: OlympiadCode,
  grade: number,
  set: number,
  idPrefix: string,
  target: number = MOCK_EXAM_QUESTION_TARGET,
): ExamSection[] {
  const clone = deepCloneSections(sections);
  let total = countQuestions(clone);

  while (total > target && clone.length > 0) {
    const last = clone[clone.length - 1]!;
    if (last.questions.length === 0) {
      clone.pop();
      continue;
    }
    last.questions.pop();
    total--;
  }

  if (clone.length === 0) {
    throw new Error(`normalizeMockSectionsToTarget: empty sections for ${idPrefix}`);
  }

  const lastSec = clone[clone.length - 1]!;
  const need = target - countQuestions(clone);
  if (need > 0) {
    lastSec.questions.push(
      ...buildPaddingMcqs(examCode, grade, set, idPrefix, countQuestions(clone), need),
    );
  }

  return clone;
}
