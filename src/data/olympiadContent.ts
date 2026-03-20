import { normalizeClassLabel } from './classLabel.js';
import { ieoSyllabus } from './ieoSyllabus.js';
import { igkoLifeSkillsSubtopics, igkoSyllabus } from './igkoSyllabus.js';
import { imoSyllabus } from './imoSyllabus.js';
import { nsoSyllabus } from './nsoSyllabus.js';
import { ieoMockExams, igkoMockExams, imoMockExams, nsoMockExams } from './mockExams/mockExamBank.js';

export { normalizeClassLabel } from './classLabel.js';
export {
  allMockExams,
  getMockExamById,
  getMockExamsByClass,
  getMockExamsByDifficulty,
  ieoMockExams,
  igkoMockExams,
  imoMockExams,
  nsoMockExams,
} from './mockExams/mockExamBank.js';

export type OlympiadCode = 'IGKO' | 'IMO' | 'NSO' | 'IEO';
export type ExamType = 'practice' | 'mock';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type QuestionType =
  | 'mcq'
  | 'true_false'
  | 'fill_in_the_blank'
  | 'match_the_following'
  | 'short_answer';
export type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface Metadata {
  version: string;
  last_updated: string;
  board_or_source: string;
  language: string;
  is_active: boolean;
}

export interface SectionOverview {
  code: string;
  name: string;
  description: string;
}

export interface SubsectionGroup {
  subject: string;
  topics: string[];
  notes?: string;
}

export interface SectionOption {
  option_name: string;
  topics: string[];
  notes?: string;
}

export interface SyllabusSection {
  section_name: string;
  section_title?: string;
  purpose?: string;
  topics: string[];
  notes?: string;
  subsection_groups?: SubsectionGroup[];
  section_options?: SectionOption[];
}

export interface OlympiadClassSyllabus {
  class_name: string;
  sections: SyllabusSection[];
  achievers_section_note?: string;
  special_notes?: string[];
}

interface BaseQuestion {
  question_id: string;
  prompt: string;
  explanation: string;
  topic: string;
  subtopic?: string;
  difficulty_level: DifficultyLevel;
  bloom_level: BloomLevel;
}

export interface McqQuestion extends BaseQuestion {
  question_type: 'mcq';
  options: string[];
  correct_answer: string;
}

export interface TrueFalseQuestion extends BaseQuestion {
  question_type: 'true_false';
  correct_answer: boolean;
}

export interface FillInBlankQuestion extends BaseQuestion {
  question_type: 'fill_in_the_blank';
  correct_answer: string;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface MatchTheFollowingQuestion extends BaseQuestion {
  question_type: 'match_the_following';
  options: MatchPair[];
  correct_answer: MatchPair[];
}

export interface ShortAnswerQuestion extends BaseQuestion {
  question_type: 'short_answer';
  correct_answer: string;
}

export type Question =
  | McqQuestion
  | TrueFalseQuestion
  | FillInBlankQuestion
  | MatchTheFollowingQuestion
  | ShortAnswerQuestion;

export interface ExamSection {
  section_name: string;
  section_title?: string;
  questions: Question[];
}

export interface BaseExam {
  id: string;
  title: string;
  exam_code: OlympiadCode;
  class_name: string;
  subject_name: string;
  difficulty_level: DifficultyLevel;
  total_questions: number;
  total_marks: number;
  duration_minutes: number;
  sections: ExamSection[];
  instructions: string[];
  answer_key: Record<string, Question['correct_answer']>;
  explanations: Record<string, string>;
  tags: string[];
  source: string;
}

export interface PracticeExam extends BaseExam {
  exam_type: 'practice';
}

export interface MockExam extends Omit<BaseExam, 'difficulty_level'> {
  exam_type: 'mock';
  pattern_type: 'olympiad-standard' | 'sectional-timed' | 'full-length';
  difficulty_level: DifficultyLevel;
}

export interface OlympiadContent {
  exam_name: string;
  exam_code: OlympiadCode;
  overview: string[];
  sections_overview: SectionOverview[];
  exam_pattern_notes: string[];
  classes: OlympiadClassSyllabus[];
  practice_exams: PracticeExam[];
  mock_exams: MockExam[];
  metadata: Metadata;
}

const DEFAULT_METADATA: Metadata = {
  version: '1.0.0',
  last_updated: new Date().toISOString().slice(0, 10),
  board_or_source: 'SOF Olympiad syllabus and internal content model',
  language: 'en',
  is_active: true,
};

const normalizeTopics = (topics: string[] = []): string[] => {
  const seen = new Set<string>();
  return topics
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => {
      const key = t.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const buildAnswerKey = (sections: ExamSection[]): Record<string, Question['correct_answer']> =>
  sections.flatMap((s) => s.questions).reduce<Record<string, Question['correct_answer']>>((acc, q) => {
    acc[q.question_id] = q.correct_answer;
    return acc;
  }, {});

const buildExplanations = (sections: ExamSection[]): Record<string, string> =>
  sections.flatMap((s) => s.questions).reduce<Record<string, string>>((acc, q) => {
    acc[q.question_id] = q.explanation;
    return acc;
  }, {});

function toUnifiedClassesFromIgko(): OlympiadClassSyllabus[] {
  return igkoSyllabus.classes.map((cls) => {
    const lifeSkillsDetails = igkoLifeSkillsSubtopics[cls.grade];
    return {
      class_name: cls.class_name,
      achievers_section_note: cls.achievers_section,
      special_notes: lifeSkillsDetails?.length
        ? [`Life Skills focus areas: ${lifeSkillsDetails.join(', ')}`]
        : undefined,
      sections: [
        {
          section_name: 'Section-1',
          section_title: 'Syllabus Topics',
          purpose: 'General Awareness and class-wise GK coverage',
          topics: normalizeTopics(cls.topics),
        },
        {
          section_name: 'Section-4',
          section_title: "Achiever's Section",
          purpose: 'Higher Order Thinking Skills',
          notes: cls.achievers_section,
          topics: [],
        },
      ],
    };
  });
}

function toUnifiedClassesFromImo(): OlympiadClassSyllabus[] {
  return imoSyllabus.classes.map((cls) => ({
    class_name: cls.class_name,
    sections: cls.sections.map((section) => {
      const base: SyllabusSection = {
        section_name: section.section_name,
        section_title: section.section_title,
        purpose:
          section.section_name === 'Section-1'
            ? 'Logical/analytical reasoning'
            : section.section_name === 'Section-2'
              ? 'Mathematics syllabus coverage'
              : section.section_name === 'Section-3'
                ? 'Applied or carry-forward section'
                : 'Higher Order Thinking Questions',
        topics: 'topics' in section ? normalizeTopics(section.topics) : [],
        notes: section.notes,
      };

      if ('section_2_options' in section) {
        base.section_options = section.section_2_options.map((opt) => ({
          option_name: opt.option_name,
          topics: normalizeTopics(opt.topics),
        }));
      }

      return base;
    }),
  }));
}

function toUnifiedClassesFromNso(): OlympiadClassSyllabus[] {
  return nsoSyllabus.classes.map((cls) => ({
    class_name: cls.class_name,
    sections: cls.sections.map((section) => {
      const base: SyllabusSection = {
        section_name: section.section_name,
        section_title: section.section_title,
        purpose:
          section.section_name === 'Section-1'
            ? 'Logical Reasoning'
            : section.section_name === 'Section-2'
              ? 'Science syllabus'
              : "Achiever's/HOT section",
        topics: 'topics' in section ? normalizeTopics(section.topics) : [],
        notes: section.notes,
      };

      if ('subsections' in section) {
        base.subsection_groups = section.subsections.map((sub) => ({
          subject: sub.subject,
          topics: normalizeTopics(sub.topics),
        }));
      }

      if ('section_3_options' in section) {
        base.section_options = section.section_3_options.map((opt) => ({
          option_name: opt.option_name,
          topics: normalizeTopics(opt.topics),
        }));
      }

      return base;
    }),
  }));
}

function toUnifiedClassesFromIeo(): OlympiadClassSyllabus[] {
  const moveNarrativeTopicsToNotes = (sectionName: string, topics: string[], notes?: string) => {
    if (sectionName !== 'Section-2' && sectionName !== 'Section-3') {
      return { topics: normalizeTopics(topics), notes };
    }

    const conciseTopics: string[] = [];
    const narrativeLines: string[] = [];
    for (const topic of topics) {
      if (topic.length > 70 || topic.includes('.') || topic.includes(',')) {
        narrativeLines.push(topic);
      } else {
        conciseTopics.push(topic);
      }
    }

    const mergedNotes = [notes, ...narrativeLines].filter(Boolean).join(' ');
    return { topics: normalizeTopics(conciseTopics), notes: mergedNotes || undefined };
  };

  return ieoSyllabus.classes.map((cls) => ({
    class_name: cls.class_name,
    achievers_section_note: cls.achievers_section_note,
    sections: cls.sections.map((section) => {
      const normalized = moveNarrativeTopicsToNotes(section.section_name, section.topics, section.notes);
      return {
        section_name: section.section_name,
        section_title: section.section_title,
        purpose:
          section.section_name === 'Section-1'
            ? 'Basic language skills'
            : section.section_name === 'Section-2'
              ? 'Search and retrieve information'
              : section.section_name === 'Section-3'
                ? 'Situation-based functional English'
                : 'Higher Order Thinking Questions',
        topics: normalized.topics,
        notes: normalized.notes,
      };
    }),
  }));
}

const igkoPracticeSections: ExamSection[] = [
  {
    section_name: 'Section-1',
    section_title: 'General Awareness',
    questions: [
      {
        question_id: 'igko-p-g4-q1',
        question_type: 'mcq',
        prompt: 'Which organ pumps blood in the human body?',
        options: ['Lungs', 'Heart', 'Liver', 'Kidney'],
        correct_answer: 'Heart',
        explanation: 'The heart pumps blood through the body.',
        topic: 'Our Body and Health',
        subtopic: 'Body Organs',
        difficulty_level: 'easy',
        bloom_level: 'remember',
      },
      {
        question_id: 'igko-p-g4-q2',
        question_type: 'true_false',
        prompt: 'The peacock is the national bird of India.',
        correct_answer: true,
        explanation: 'Peacock is India’s national bird.',
        topic: 'India and the World',
        difficulty_level: 'easy',
        bloom_level: 'understand',
      },
      {
        question_id: 'igko-p-g4-q3',
        question_type: 'fill_in_the_blank',
        prompt: 'The process by which green plants make food is called ____.',
        correct_answer: 'photosynthesis',
        explanation: 'Plants prepare food through photosynthesis.',
        topic: 'Plants and Animals',
        difficulty_level: 'medium',
        bloom_level: 'remember',
      },
      {
        question_id: 'igko-p-g4-q4',
        question_type: 'match_the_following',
        prompt: 'Match the country with its capital.',
        options: [
          { left: 'India', right: 'New Delhi' },
          { left: 'Japan', right: 'Tokyo' },
          { left: 'France', right: 'Paris' },
        ],
        correct_answer: [
          { left: 'India', right: 'New Delhi' },
          { left: 'Japan', right: 'Tokyo' },
          { left: 'France', right: 'Paris' },
        ],
        explanation: 'These are correct country-capital pairs.',
        topic: 'India and the World',
        difficulty_level: 'medium',
        bloom_level: 'apply',
      },
      {
        question_id: 'igko-p-g4-q5',
        question_type: 'short_answer',
        prompt: 'Name one way to conserve the environment at school.',
        correct_answer: 'plant trees',
        explanation: 'Any valid conservation action is acceptable.',
        topic: 'Environment and its Conservation',
        difficulty_level: 'easy',
        bloom_level: 'apply',
      },
    ],
  },
];

const imoPracticeSections: ExamSection[] = [
  {
    section_name: 'Section-2',
    section_title: 'Mathematics',
    questions: [
      {
        question_id: 'imo-p-g7-q1',
        question_type: 'mcq',
        prompt: 'Simplify: (-3) + 8',
        options: ['-11', '5', '-5', '11'],
        correct_answer: '5',
        explanation: 'Adding 8 to -3 gives 5.',
        topic: 'Integers',
        difficulty_level: 'easy',
        bloom_level: 'apply',
      },
      {
        question_id: 'imo-p-g7-q2',
        question_type: 'fill_in_the_blank',
        prompt: '3/4 of 20 is ____.',
        correct_answer: '15',
        explanation: '(3/4) x 20 = 15.',
        topic: 'Fractions and Decimals',
        difficulty_level: 'easy',
        bloom_level: 'apply',
      },
      {
        question_id: 'imo-p-g7-q3',
        question_type: 'mcq',
        prompt: 'If 5x = 35, x = ?',
        options: ['5', '6', '7', '8'],
        correct_answer: '7',
        explanation: 'Divide both sides by 5.',
        topic: 'Simple Equations',
        difficulty_level: 'easy',
        bloom_level: 'apply',
      },
      {
        question_id: 'imo-p-g7-q4',
        question_type: 'true_false',
        prompt: 'The sum of interior angles of a triangle is 180 degrees.',
        correct_answer: true,
        explanation: 'Triangle angle-sum property is 180 degrees.',
        topic: 'The Triangle and its Properties',
        difficulty_level: 'easy',
        bloom_level: 'remember',
      },
      {
        question_id: 'imo-p-g7-q5',
        question_type: 'short_answer',
        prompt: 'Find 20% of 150.',
        correct_answer: '30',
        explanation: '20% = 0.2, and 0.2 x 150 = 30.',
        topic: 'Comparing Quantities',
        difficulty_level: 'medium',
        bloom_level: 'apply',
      },
    ],
  },
];

const nsoPracticeSections: ExamSection[] = [
  {
    section_name: 'Section-2',
    section_title: 'Science',
    questions: [
      {
        question_id: 'nso-p-g8-q1',
        question_type: 'mcq',
        prompt: 'Which microorganism is used in curd formation?',
        options: ['Virus', 'Bacteria', 'Fungi', 'Algae'],
        correct_answer: 'Bacteria',
        explanation: 'Lactobacillus bacteria helps convert milk to curd.',
        topic: 'Microorganisms',
        difficulty_level: 'easy',
        bloom_level: 'remember',
      },
      {
        question_id: 'nso-p-g8-q2',
        question_type: 'true_false',
        prompt: 'Friction always helps motion.',
        correct_answer: false,
        explanation: 'Friction can oppose motion in many situations.',
        topic: 'Friction',
        difficulty_level: 'easy',
        bloom_level: 'understand',
      },
      {
        question_id: 'nso-p-g8-q3',
        question_type: 'fill_in_the_blank',
        prompt: 'The SI unit of pressure is ____.',
        correct_answer: 'pascal',
        explanation: 'Pressure is measured in pascal (Pa).',
        topic: 'Force and Pressure',
        difficulty_level: 'medium',
        bloom_level: 'remember',
      },
      {
        question_id: 'nso-p-g8-q4',
        question_type: 'mcq',
        prompt: 'Combustion requires:',
        options: ['Only fuel', 'Only oxygen', 'Fuel, oxygen and heat', 'Sunlight only'],
        correct_answer: 'Fuel, oxygen and heat',
        explanation: 'Fire triangle: fuel, oxygen, ignition temperature.',
        topic: 'Combustion and Flame',
        difficulty_level: 'medium',
        bloom_level: 'understand',
      },
      {
        question_id: 'nso-p-g8-q5',
        question_type: 'short_answer',
        prompt: 'Name one measure to conserve plants and animals.',
        correct_answer: 'wildlife sanctuary',
        explanation: 'Protected areas conserve biodiversity.',
        topic: 'Conservation of Plants and Animals',
        difficulty_level: 'easy',
        bloom_level: 'apply',
      },
    ],
  },
];

const ieoPracticeSections: ExamSection[] = [
  {
    section_name: 'Section-1',
    section_title: 'Language Skills',
    questions: [
      {
        question_id: 'ieo-p-g6-q1',
        question_type: 'mcq',
        prompt: 'Choose the correct synonym of "rapid".',
        options: ['slow', 'quick', 'weak', 'bright'],
        correct_answer: 'quick',
        explanation: 'Rapid means quick.',
        topic: 'Synonyms',
        difficulty_level: 'easy',
        bloom_level: 'remember',
      },
      {
        question_id: 'ieo-p-g6-q2',
        question_type: 'fill_in_the_blank',
        prompt: 'She ____ to school every day.',
        correct_answer: 'goes',
        explanation: 'Simple present singular subject takes verb with -es.',
        topic: 'Tenses',
        difficulty_level: 'easy',
        bloom_level: 'apply',
      },
      {
        question_id: 'ieo-p-g6-q3',
        question_type: 'true_false',
        prompt: 'In reported speech, pronouns may change.',
        correct_answer: true,
        explanation: 'Pronoun changes depend on context and reporting verb.',
        topic: 'Narration',
        difficulty_level: 'medium',
        bloom_level: 'understand',
      },
      {
        question_id: 'ieo-p-g6-q4',
        question_type: 'match_the_following',
        prompt: 'Match idiom to meaning.',
        options: [
          { left: 'Break the ice', right: 'Start a conversation' },
          { left: 'Hit the sack', right: 'Go to sleep' },
        ],
        correct_answer: [
          { left: 'Break the ice', right: 'Start a conversation' },
          { left: 'Hit the sack', right: 'Go to sleep' },
        ],
        explanation: 'Both idioms are matched with common meanings.',
        topic: 'Idioms',
        difficulty_level: 'medium',
        bloom_level: 'understand',
      },
      {
        question_id: 'ieo-p-g6-q5',
        question_type: 'short_answer',
        prompt: 'Write one polite expression used for making a request.',
        correct_answer: 'Could you please',
        explanation: 'Polite request starters include "Could you please...".',
        topic: 'Functional English',
        difficulty_level: 'easy',
        bloom_level: 'create',
      },
    ],
  },
];

function createPracticeExam(input: Omit<PracticeExam, 'answer_key' | 'explanations'>): PracticeExam {
  const flat = input.sections.flatMap((s) => s.questions);
  const n = flat.length;
  if (input.total_questions !== n) {
    throw new Error(
      `${input.id}: total_questions (${input.total_questions}) must match section count (${n})`,
    );
  }
  if (input.total_marks !== n) {
    throw new Error(`${input.id}: total_marks (${input.total_marks}) must match section count (${n})`);
  }
  return {
    ...input,
    answer_key: buildAnswerKey(input.sections),
    explanations: buildExplanations(input.sections),
  };
}

export const igkoData: OlympiadContent = {
  exam_name: 'International General Knowledge Olympiad',
  exam_code: 'IGKO',
  overview: [
    'Four sections: General Awareness, Current Affairs, Life Skills, and Achievers.',
    'Class-wise topic coverage with Higher Order Thinking in Achievers section.',
  ],
  sections_overview: [
    { code: 'S1', name: 'General Awareness', description: 'Important world and subject-specific awareness topics.' },
    { code: 'S2', name: 'Current Affairs', description: 'Recent events and developments.' },
    { code: 'S3', name: 'Life Skills', description: 'Skills for effective living and better decision making.' },
    { code: 'S4', name: 'Achievers Section', description: 'Higher Order Thinking Skills questions.' },
  ],
  exam_pattern_notes: ['Achievers section uses topics from class syllabus sections.'],
  classes: toUnifiedClassesFromIgko(),
  practice_exams: [
    createPracticeExam({
      id: 'igko-practice-g4-001',
      title: 'IGKO Class 4 Practice Set 1',
      exam_type: 'practice',
      exam_code: 'IGKO',
      class_name: 'Class 4',
      subject_name: 'General Knowledge',
      difficulty_level: 'easy',
      total_questions: 5,
      total_marks: 5,
      duration_minutes: 20,
      sections: igkoPracticeSections,
      instructions: ['Read each question carefully.', 'Attempt all questions.', 'No negative marking.'],
      tags: ['igko', 'class4', 'practice', 'foundational'],
      source: 'Structured sample generated for unified schema',
    }),
  ],
  mock_exams: igkoMockExams,
  metadata: DEFAULT_METADATA,
};

export const imoData: OlympiadContent = {
  exam_name: 'International Mathematics Olympiad',
  exam_code: 'IMO',
  overview: [
    'Four sections with logical reasoning, mathematics, section carry-forward, and Achievers/HOT.',
    'Higher classes include alternate Section-2 options and advanced mathematics.',
  ],
  sections_overview: [
    { code: 'S1', name: 'Logical Reasoning', description: 'Verbal and non-verbal reasoning.' },
    { code: 'S2', name: 'Mathematics', description: 'Class-wise mathematics topics.' },
    { code: 'S3', name: 'Applied/Carry-forward', description: 'Syllabus as per Section-2 or quantitative aptitude notes.' },
    { code: 'S4', name: 'Achievers Section', description: 'Higher Order Thinking Questions.' },
  ],
  exam_pattern_notes: [
    'For many classes, Section-3 follows Section-2 syllabus.',
    'Sections in higher classes can include option-based topic groups.',
  ],
  classes: toUnifiedClassesFromImo(),
  practice_exams: [
    createPracticeExam({
      id: 'imo-practice-g7-001',
      title: 'IMO Class 7 Practice Set 1',
      exam_type: 'practice',
      exam_code: 'IMO',
      class_name: 'Class 7',
      subject_name: 'Mathematics',
      difficulty_level: 'easy',
      total_questions: 5,
      total_marks: 5,
      duration_minutes: 20,
      sections: imoPracticeSections,
      instructions: ['Solve without calculator.', 'Keep rough work neat.', 'Check final answers.'],
      tags: ['imo', 'class7', 'practice'],
      source: 'Structured sample generated for unified schema',
    }),
  ],
  mock_exams: imoMockExams,
  metadata: DEFAULT_METADATA,
};

export const nsoData: OlympiadContent = {
  exam_name: 'National Science Olympiad',
  exam_code: 'NSO',
  overview: [
    'Three major sections: Logical Reasoning, Science, and Achievers.',
    'For Level-1, 60% current class and 40% previous class coverage.',
    'Higher classes include grouped subject blocks and option-based sections.',
  ],
  sections_overview: nsoSyllabus.sections_overview.map((s) => ({ code: s.code, name: s.name, description: s.description })),
  exam_pattern_notes: [...nsoSyllabus.exam_pattern_notes],
  classes: toUnifiedClassesFromNso(),
  practice_exams: [
    createPracticeExam({
      id: 'nso-practice-g8-001',
      title: 'NSO Class 8 Practice Set 1',
      exam_type: 'practice',
      exam_code: 'NSO',
      class_name: 'Class 8',
      subject_name: 'Science',
      difficulty_level: 'easy',
      total_questions: 5,
      total_marks: 5,
      duration_minutes: 20,
      sections: nsoPracticeSections,
      instructions: ['Focus on concept clarity.', 'Use elimination for MCQs.', 'Write concise short answers.'],
      tags: ['nso', 'class8', 'practice', 'science'],
      source: 'Structured sample generated for unified schema',
    }),
  ],
  mock_exams: nsoMockExams,
  metadata: DEFAULT_METADATA,
};

export const ieoData: OlympiadContent = {
  exam_name: 'International English Olympiad',
  exam_code: 'IEO',
  overview: [...ieoSyllabus.overview],
  sections_overview: ieoSyllabus.sections_overview.map((s) => ({
    code: s.code,
    name: s.name,
    description: s.description,
  })),
  exam_pattern_notes: [
    'Class 1 has a special compact format with achievers note.',
    'Sections 2 and 3 focus on information retrieval and functional language usage.',
  ],
  classes: toUnifiedClassesFromIeo(),
  practice_exams: [
    createPracticeExam({
      id: 'ieo-practice-g6-001',
      title: 'IEO Class 6 Practice Set 1',
      exam_type: 'practice',
      exam_code: 'IEO',
      class_name: 'Class 6',
      subject_name: 'English',
      difficulty_level: 'easy',
      total_questions: 5,
      total_marks: 5,
      duration_minutes: 20,
      sections: ieoPracticeSections,
      instructions: ['Check grammar carefully.', 'Read prompts fully.', 'Use best-fit expression choices.'],
      tags: ['ieo', 'class6', 'practice'],
      source: 'Structured sample generated for unified schema',
    }),
  ],
  mock_exams: ieoMockExams,
  metadata: DEFAULT_METADATA,
};

export const olympiadContentByCode: Record<OlympiadCode, OlympiadContent> = {
  IGKO: igkoData,
  IMO: imoData,
  NSO: nsoData,
  IEO: ieoData,
};

const resolveExamData = (exam: OlympiadCode | OlympiadContent): OlympiadContent =>
  typeof exam === 'string' ? olympiadContentByCode[exam] : exam;

export function getClassSyllabus(
  exam: OlympiadCode | OlympiadContent,
  className: string,
): OlympiadClassSyllabus | undefined {
  const want = normalizeClassLabel(className);
  return resolveExamData(exam).classes.find((c) => normalizeClassLabel(c.class_name) === want);
}

export function getPracticeExams(exam: OlympiadCode | OlympiadContent, className: string): PracticeExam[] {
  const data = resolveExamData(exam);
  const want = normalizeClassLabel(className);
  return data.practice_exams.filter((e) => normalizeClassLabel(e.class_name) === want);
}

export function getMockExams(exam: OlympiadCode | OlympiadContent, className: string): MockExam[] {
  const data = resolveExamData(exam);
  const want = normalizeClassLabel(className);
  return data.mock_exams.filter((e) => normalizeClassLabel(e.class_name) === want);
}

export function getTopicsBySection(
  exam: OlympiadCode | OlympiadContent,
  className: string,
  sectionName: string,
): string[] {
  const cls = getClassSyllabus(exam, className);
  if (!cls) return [];
  const section = cls.sections.find((s) => s.section_name.toLowerCase() === sectionName.toLowerCase());
  if (!section) return [];

  const topicsFromOptions = (section.section_options || []).flatMap((opt) => opt.topics);
  const topicsFromGroups = (section.subsection_groups || []).flatMap((grp) => grp.topics);
  return normalizeTopics([...section.topics, ...topicsFromOptions, ...topicsFromGroups]);
}

const toJson = <T,>(value: T): JsonValue => JSON.parse(JSON.stringify(value)) as JsonValue;

export const igkoDataJson = toJson(igkoData);
export const imoDataJson = toJson(imoData);
export const nsoDataJson = toJson(nsoData);
export const ieoDataJson = toJson(ieoData);

