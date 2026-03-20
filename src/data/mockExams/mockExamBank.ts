/**
 * Unified mock exam bank and lookup helpers (IGKO, IMO, NSO, IEO).
 *
 * UI tip: load mocks with `getMockExams(examCode, className)` or `getMockExamsByClass(...)`
 * and render **every** returned exam (e.g. `.map(...)`). Using only `[0]` or a single
 * hardcoded “Mock Test 1” will ignore the rest of the bank.
 */

import { normalizeClassLabel } from '../classLabel.js';
import type { DifficultyLevel, MockExam, OlympiadCode } from '../olympiadContent.js';
import { ieoMockExams } from './ieoMockExams.js';
import { igkoMockExams } from './igkoMockExams.js';
import { imoMockExams } from './imoMockExams.js';
import { nsoMockExams } from './nsoMockExams.js';

export { igkoMockExams } from './igkoMockExams.js';
export { imoMockExams } from './imoMockExams.js';
export { nsoMockExams } from './nsoMockExams.js';
export { ieoMockExams } from './ieoMockExams.js';

/** All mock exams in one list for global lookup */
export const allMockExams: MockExam[] = [
  ...igkoMockExams,
  ...imoMockExams,
  ...nsoMockExams,
  ...ieoMockExams,
];

/** Mock exams for one olympiad code and class (e.g. "Class 7" or "Grade 7"). */
export function getMockExamsByClass(examCode: OlympiadCode, className: string): MockExam[] {
  const want = normalizeClassLabel(className);
  return allMockExams.filter(
    (e) => e.exam_code === examCode && normalizeClassLabel(e.class_name) === want,
  );
}

/** Find a mock exam by its unique id across all olympiads. */
export function getMockExamById(id: string): MockExam | undefined {
  return allMockExams.find((e) => e.id === id);
}

/**
 * Filter mocks for an olympiad by declared paper difficulty.
 * (Individual questions may still span easy/medium/hard.)
 */
export function getMockExamsByDifficulty(
  examCode: OlympiadCode,
  difficultyLevel: DifficultyLevel,
): MockExam[] {
  return allMockExams.filter(
    (e) => e.exam_code === examCode && e.difficulty_level === difficultyLevel,
  );
}

function assertUniqueMockExamIds(): void {
  const seen = new Set<string>();
  for (const exam of allMockExams) {
    if (seen.has(exam.id)) {
      throw new Error(`Duplicate mock exam id: ${exam.id}`);
    }
    seen.add(exam.id);
    const qSeen = new Set<string>();
    for (const section of exam.sections) {
      for (const q of section.questions) {
        if (qSeen.has(q.question_id)) {
          throw new Error(`Duplicate question_id ${q.question_id} in exam ${exam.id}`);
        }
        qSeen.add(q.question_id);
      }
    }
  }
}

assertUniqueMockExamIds();
