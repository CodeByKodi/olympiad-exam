import { describe, it, expect } from 'vitest';
import {
  validatePack,
  detectDuplicates,
  buildPracticePool,
  buildMockIndex,
  buildPracticeIndex,
} from './questionLibraryUtils.js';

const validPack = {
  packId: 'nso-grade3-test1',
  exam: 'nso',
  grade: '3',
  mode: 'practice',
  title: 'Test Pack',
  questions: [
    {
      id: 'q1',
      questionText: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1,
      explanation: '4 is correct',
    },
    {
      id: 'q2',
      questionText: 'What is 3+3?',
      options: ['5', '6', '7', '8'],
      correctAnswer: 1,
      explanation: '6 is correct',
    },
  ],
};

describe('validatePack', () => {
  it('accepts valid pack', () => {
    const result = validatePack(validPack);
    expect(result.valid).toBe(true);
  });

  it('rejects null or non-object', () => {
    expect(validatePack(null).valid).toBe(false);
    expect(validatePack('string').valid).toBe(false);
  });

  it('rejects invalid exam', () => {
    const pack = { ...validPack, exam: 'invalid' };
    const result = validatePack(pack);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('exam must be one of'))).toBe(true);
  });

  it('rejects invalid grade', () => {
    const pack = { ...validPack, grade: '99' };
    expect(validatePack(pack).valid).toBe(false);
  });

  it('rejects invalid mode', () => {
    const pack = { ...validPack, mode: 'invalid' };
    const result = validatePack(pack);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('mode must be'))).toBe(true);
  });

  it('rejects missing title', () => {
    const pack = { ...validPack, title: '' };
    expect(validatePack(pack).valid).toBe(false);
  });

  it('rejects non-array questions', () => {
    const pack = { ...validPack, questions: 'not-array' };
    expect(validatePack(pack).valid).toBe(false);
  });

  it('rejects empty questions', () => {
    const pack = { ...validPack, questions: [] };
    expect(validatePack(pack).valid).toBe(false);
  });

  it('rejects duplicate question ids', () => {
    const pack = {
      ...validPack,
      questions: [
        { ...validPack.questions[0], id: 'q1' },
        { ...validPack.questions[1], id: 'q1' },
      ],
    };
    expect(validatePack(pack).valid).toBe(false);
    expect(validatePack(pack).errors.some((e) => e.includes('duplicate id'))).toBe(true);
  });

  it('rejects duplicate questionText', () => {
    const pack = {
      ...validPack,
      questions: [
        { ...validPack.questions[0] },
        { ...validPack.questions[1], questionText: validPack.questions[0].questionText },
      ],
    };
    expect(validatePack(pack).valid).toBe(false);
    expect(validatePack(pack).errors.some((e) => e.includes('duplicate question text'))).toBe(true);
  });

  it('rejects invalid correctAnswer', () => {
    const pack = {
      ...validPack,
      questions: [
        { ...validPack.questions[0], correctAnswer: 'invalid' },
      ],
    };
    expect(validatePack(pack).valid).toBe(false);
  });

  it('rejects fewer than 4 options for grade 3', () => {
    const pack = {
      ...validPack,
      questions: [
        { ...validPack.questions[0], options: ['A', 'B', 'C'] },
      ],
    };
    expect(validatePack(pack).valid).toBe(false);
  });

  it('rejects correctAnswer when unparseable', () => {
    const pack = {
      ...validPack,
      questions: [
        { ...validPack.questions[0], correctAnswer: 'x' },
      ],
    };
    expect(validatePack(pack).valid).toBe(false);
  });

  it('rejects correctAnswer when NaN', () => {
    const pack = {
      ...validPack,
      questions: [
        { ...validPack.questions[0], correctAnswer: NaN },
      ],
    };
    expect(validatePack(pack).valid).toBe(false);
  });

  it('rejects question with invalid object', () => {
    const pack = {
      ...validPack,
      questions: [
        { ...validPack.questions[0] },
        null,
        { ...validPack.questions[1] },
      ],
    };
    const result = validatePack(pack);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Invalid question') || e.includes('questionText'))).toBe(true);
  });

  it('rejects question with missing questionText', () => {
    const pack = {
      ...validPack,
      questions: [
        { ...validPack.questions[0], questionText: '' },
      ],
    };
    expect(validatePack(pack).valid).toBe(false);
  });

  it('rejects pack with non-string packId when provided', () => {
    const pack = { ...validPack, packId: 123 };
    const result = validatePack(pack);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('packId'))).toBe(true);
  });
});

describe('detectDuplicates', () => {
  it('returns empty when no duplicates', () => {
    const existing = [{ questions: [{ id: 'other', questionText: 'Different text' }] }];
    const result = detectDuplicates(validPack, existing);
    expect(result.duplicateIds).toEqual([]);
    expect(result.duplicateTexts).toEqual([]);
    expect(result.skippedIndices).toEqual([]);
  });

  it('detects duplicate ids', () => {
    const existing = [{ questions: [{ id: 'q1', questionText: 'Different text' }] }];
    const result = detectDuplicates(validPack, existing);
    expect(result.duplicateIds).toContain('q1');
    expect(result.skippedIndices).toContain(0);
  });

  it('detects duplicate questionText', () => {
    const existing = [{ questions: [{ id: 'other', questionText: 'What is 2+2?' }] }];
    const result = detectDuplicates(validPack, existing);
    expect(result.duplicateTexts.length).toBeGreaterThan(0);
    expect(result.skippedIndices).toContain(0);
  });

  it('handles empty existing packs', () => {
    const result = detectDuplicates(validPack, []);
    expect(result.skippedIndices).toEqual([]);
  });

  it('handles null/undefined existing packs', () => {
    const result = detectDuplicates(validPack, null);
    expect(result.duplicateIds).toEqual([]);
    expect(result.skippedIndices).toEqual([]);
    const result2 = detectDuplicates(validPack, undefined);
    expect(result2.skippedIndices).toEqual([]);
  });

  it('detects both id and text when same question matches both', () => {
    const existing = [{ questions: [{ id: 'q1', questionText: 'What is 2+2?' }] }];
    const result = detectDuplicates(validPack, existing);
    expect(result.duplicateIds).toContain('q1');
    expect(result.duplicateTexts.length).toBeGreaterThan(0);
    expect(result.skippedIndices).toContain(0);
  });

  it('handles newPack with null questions', () => {
    const result = detectDuplicates({ questions: null }, []);
    expect(result.duplicateIds).toEqual([]);
    expect(result.skippedIndices).toEqual([]);
  });

  it('handles newPack with empty questions', () => {
    const result = detectDuplicates({ questions: [] }, []);
    expect(result.skippedIndices).toEqual([]);
  });

  it('detects duplicate by text when ids differ', () => {
    const existing = [{ questions: [{ id: 'x', questionText: 'What is 2+2?' }] }];
    const pack = { ...validPack, questions: [{ ...validPack.questions[0], id: 'q1' }] };
    const result = detectDuplicates(pack, existing);
    expect(result.duplicateTexts.length).toBeGreaterThan(0);
    expect(result.skippedIndices).toContain(0);
  });

  it('ignores questions with empty id for duplicate detection', () => {
    const pack = { questions: [{ id: '', questionText: 'Unique' }] };
    const existing = [{ questions: [{ id: 'other', questionText: 'Different' }] }];
    const result = detectDuplicates(pack, existing);
    expect(result.duplicateIds).toEqual([]);
  });

  it('normalizes questionText for comparison (trim, lowercase)', () => {
    const existing = [{ questions: [{ id: 'x', questionText: '  WHAT IS 2+2?  ' }] }];
    const pack = { questions: [{ id: 'q1', questionText: 'what is 2+2?' }] };
    const result = detectDuplicates(pack, existing);
    expect(result.duplicateTexts.length).toBeGreaterThan(0);
  });
});

describe('buildPracticePool', () => {
  it('combines questions from multiple packs', () => {
    const packs = [
      { questions: [{ id: 'a1', questionText: 'Q1' }] },
      { questions: [{ id: 'a2', questionText: 'Q2' }] },
    ];
    const result = buildPracticePool(packs);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('a1');
    expect(result[1].id).toBe('a2');
  });

  it('deduplicates by id', () => {
    const packs = [
      { questions: [{ id: 'a1', questionText: 'Q1' }] },
      { questions: [{ id: 'a1', questionText: 'Q1 duplicate' }] },
    ];
    const result = buildPracticePool(packs);
    expect(result).toHaveLength(1);
  });

  it('deduplicates by questionText', () => {
    const packs = [
      { questions: [{ id: 'a1', questionText: 'Same question' }] },
      { questions: [{ id: 'a2', questionText: 'Same question' }] },
    ];
    const result = buildPracticePool(packs);
    expect(result).toHaveLength(1);
  });

  it('handles empty or null packs', () => {
    expect(buildPracticePool([])).toEqual([]);
    expect(buildPracticePool(null)).toEqual([]);
  });

  it('assigns id when missing', () => {
    const packs = [{ questions: [{ questionText: 'Q1' }] }];
    const result = buildPracticePool(packs);
    expect(result[0].id).toBeDefined();
    expect(result[0].id).toMatch(/^q-\d+-\d+$/);
  });
});

describe('buildMockIndex', () => {
  it('maps packs to index entries', () => {
    const packs = [
      { packId: 'p1', title: 'Mock 1', questionCount: 25, durationMinutes: 30 },
      { packId: 'p2', title: 'Mock 2', questionCount: 20, durationMinutes: 25 },
    ];
    const result = buildMockIndex(packs);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'p1',
      title: 'Mock 1',
      questionCount: 25,
      durationMinutes: 30,
    });
    expect(result[1].questionCount).toBe(20);
  });

  it('computes questionCount from questions when missing', () => {
    const packs = [{ packId: 'p1', title: 'T', questions: [{}, {}, {}] }];
    const result = buildMockIndex(packs);
    expect(result[0].questionCount).toBe(3);
  });

  it('handles empty packs', () => {
    expect(buildMockIndex([])).toEqual([]);
  });
});

describe('buildPracticeIndex', () => {
  it('maps packs with topic', () => {
    const packs = [
      { packId: 'p1', title: 'Plants', topic: 'Plants', questionCount: 25 },
    ];
    const result = buildPracticeIndex(packs);
    expect(result[0].topic).toBe('Plants');
    expect(result[0].id).toBe('p1');
  });

  it('handles empty packs', () => {
    expect(buildPracticeIndex([])).toEqual([]);
  });
});
