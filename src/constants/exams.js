/**
 * Exam and grade constants for the Olympiad platform.
 * Add new exams and grades here for easy expansion.
 */

export const EXAMS = {
  NSO: {
    id: 'nso',
    name: 'NSO',
    fullName: 'National Science Olympiad',
    color: '#4CAF50',
    icon: '🔬',
  },
  IMO: {
    id: 'imo',
    name: 'IMO',
    fullName: 'International Mathematics Olympiad',
    color: '#2196F3',
    icon: '📐',
  },
  IEO: {
    id: 'ieo',
    name: 'IEO',
    fullName: 'International English Olympiad',
    color: '#9C27B0',
    icon: '📚',
  },
  ICS: {
    id: 'ics',
    name: 'ICS',
    fullName: 'International Computer Science Olympiad',
    color: '#FF9800',
    icon: '💻',
  },
  IGKO: {
    id: 'igko',
    name: 'IGKO',
    fullName: 'International General Knowledge Olympiad',
    color: '#E91E63',
    icon: '🌍',
  },
  ISSO: {
    id: 'isso',
    name: 'ISSO',
    fullName: 'International Social Studies Olympiad',
    color: '#00BCD4',
    icon: '🏛️',
  },
};

export const GRADES = {
  '3': {
    id: '3',
    name: 'Grade 3',
    enabled: true,
  },
  '4': {
    id: '4',
    name: 'Grade 4',
    enabled: false,
  },
  '5': {
    id: '5',
    name: 'Grade 5',
    enabled: false,
  },
};

/** Grade-specific rules (options per question, etc.). Changes to one grade do not affect others. */
export const GRADE_CONFIG = {
  '3': { optionsPerQuestion: 4 },
  '4': { optionsPerQuestion: 4 },
  '5': { optionsPerQuestion: 5 },
};

export const TEST_MODES = {
  PRACTICE: 'practice',
  MOCK: 'mock',
};

export const MOCK_TEST_DURATION_MINUTES = 60;

export const TESTS_PER_EXAM = [
  { id: '1', title: 'Test 1' },
  { id: '2', title: 'Test 2' },
  { id: '3', title: 'Test 3' },
  { id: '4', title: 'Test 4' },
  { id: '5', title: 'Test 5' },
];

export const STORAGE_KEYS = {
  COMPLETED_TESTS: 'olympiad_completed_tests',
  BEST_SCORES: 'olympiad_best_scores',
  IN_PROGRESS: 'olympiad_in_progress',
  DARK_MODE: 'olympiad_dark_mode',
  SETTINGS: 'olympiad_settings',
  QUESTION_SETS_PREFIX: 'olympiad_questions_',
  LAST_RESULT: 'olympiad_last_result',
};
