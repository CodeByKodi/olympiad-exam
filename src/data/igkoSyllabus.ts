/**
 * IGKO (International General Knowledge Olympiad) Syllabus
 * Structured data model for Classes 1–10
 */

/** Section overview for IGKO exam structure */
export interface IgkoSectionOverview {
  code: string;
  name: string;
  description: string;
}

/** Single class syllabus entry */
export interface IgkoClassSyllabus {
  class_name: string;
  grade: number;
  topics: string[];
  achievers_section: string;
}

/** Full IGKO syllabus structure */
export interface IgkoSyllabus {
  exam_name: string;
  sections_overview: IgkoSectionOverview[];
  classes: IgkoClassSyllabus[];
}

export const igkoSyllabus: IgkoSyllabus = {
  exam_name: 'International General Knowledge Olympiad',
  sections_overview: [
    {
      code: 'S1',
      name: 'General Awareness',
      description: 'Topics based on important events around the world',
    },
    {
      code: 'S2',
      name: 'Current Affairs',
      description: 'Contains questions from recent events',
    },
    {
      code: 'S3',
      name: 'Life Skills',
      description: 'Topics based on abilities for managing and living a better quality of life',
    },
    {
      code: 'S4',
      name: 'Achievers Section',
      description: 'Contains Higher Order Thinking Skills questions',
    },
  ],
  classes: [
    {
      class_name: 'Class 1',
      grade: 1,
      topics: [
        'Me and My Surroundings',
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Language and Literature',
        'Earth and Its Environment',
        'Sports',
        'Maths Fun',
        'Life Skills',
        'Current Affairs',
      ],
      achievers_section:
        'Higher Order Thinking Questions from the above given syllabus.',
    },
    {
      class_name: 'Class 2',
      grade: 2,
      topics: [
        'Me and My Surroundings',
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Language and Literature',
        'Earth and Its Environment',
        'Transport and Communication',
        'Sports',
        'Maths Fun',
        'Life Skills',
        'Current Affairs',
      ],
      achievers_section:
        'Higher Order Thinking Questions from the above given syllabus.',
    },
    {
      class_name: 'Class 3',
      grade: 3,
      topics: [
        'Me and My Surroundings',
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Language and Literature',
        'Earth and Its Environment',
        'Transport and Communication',
        'Sports',
        'Maths Fun',
        'Life Skills',
        'Current Affairs',
      ],
      achievers_section:
        'Higher Order Thinking Questions from the above given syllabus.',
    },
    {
      class_name: 'Class 4',
      grade: 4,
      topics: [
        'Our Body and Health',
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Environment and its Conservation',
        'Language and Literature',
        'Entertainment',
        'Sports',
        'Maths Fun',
        'Life Skills',
        'Current Affairs',
      ],
      achievers_section:
        'Higher Order Thinking Questions from the above given syllabus.',
    },
    {
      class_name: 'Class 5',
      grade: 5,
      topics: [
        'Our Body and Health',
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Environment and its Conservation',
        'Language and Literature',
        'Entertainment',
        'Sports',
        'Maths Fun',
        'Life Skills',
        'Current Affairs',
      ],
      achievers_section:
        'Higher Order Thinking Questions from the above given syllabus.',
    },
    {
      class_name: 'Class 6',
      grade: 6,
      topics: [
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Earth and Its Environment',
        'Universe',
        'Language and Literature',
        'Entertainment',
        'Social Studies',
        'Sports',
        'Quantitative Aptitude and Reasoning',
        'Current Affairs',
        'Life Skills',
      ],
      achievers_section:
        'Higher Order Thinking Questions from the above given syllabus.',
    },
    {
      class_name: 'Class 7',
      grade: 7,
      topics: [
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Earth and its Environment',
        'Universe',
        'Language and Literature',
        'Entertainment',
        'Social Studies',
        'Sports',
        'Quantitative Aptitude and Reasoning',
        'Current Affairs',
        'Life Skills',
      ],
      achievers_section:
        'Higher Order Thinking Questions from the above given syllabus.',
    },
    {
      class_name: 'Class 8',
      grade: 8,
      topics: [
        'Plants and Animals',
        'India and the World',
        'Science and Technology',
        'Earth and its Environment',
        'Universe',
        'Language and Literature',
        'Entertainment',
        'Social Studies',
        'Sports',
        'Quantitative Aptitude and Reasoning',
        'Current Affairs',
        'Life Skills',
      ],
      achievers_section:
        'Higher Order Thinking Questions from the above given syllabus.',
    },
    {
      class_name: 'Class 9',
      grade: 9,
      topics: [
        'Plants and Animals',
        'Our Environment',
        'Science and Technology',
        'India and the World',
        'Social Studies',
        'Language, Literature and Media',
        'Sports',
        'Quantitative Aptitude and Reasoning',
        'Current Affairs',
        'Life Skills',
      ],
      achievers_section:
        'Higher Order Thinking Questions from the above given syllabus.',
    },
    {
      class_name: 'Class 10',
      grade: 10,
      topics: [
        'Plants and Animals',
        'Our Environment',
        'Science and Technology',
        'India and the World',
        'Social Studies',
        'Language, Literature and Media',
        'Sports',
        'Quantitative Aptitude and Reasoning',
        'Current Affairs',
        'Life Skills',
      ],
      achievers_section:
        'Higher Order Thinking Questions from the above given syllabus.',
    },
  ],
};

/** Life skills sub-topics by grade (for reference when creating questions) */
export const igkoLifeSkillsSubtopics: Record<number, string[]> = {
  1: ['Kindness', 'Soft Skills', 'Social Skills', "Do's & Don'ts"],
  2: ['Social Skills', 'Moral Values', 'Team Work', 'Communication'],
  3: [
    'Moral Values',
    'Team Work',
    'Environmental Sensitivity',
    'Communication',
    'Leadership',
    'Time Management',
  ],
  4: [
    'Moral Values',
    'Flexibility',
    'Emotional Intelligence',
    'Decision Making',
    'Team Work',
    'Leadership',
    'Time Management',
  ],
  5: [
    'Moral Values',
    'Flexibility',
    'Emotional Intelligence',
    'Decision Making',
    'Team Work',
    'Leadership',
    'Time Management',
  ],
  6: [
    'Empathy',
    'Effective Communication',
    'Critical Thinking',
    'Creative Thinking',
    'Coping with Stress',
    'Decision Making',
    'Problem Solving',
    'Interpersonal Skills',
    'Managing Emotions',
    'Self-awareness',
  ],
  7: [
    'Empathy',
    'Effective Communication',
    'Critical Thinking',
    'Creative Thinking',
    'Coping with Stress',
    'Decision Making',
    'Problem Solving',
    'Interpersonal Skills',
    'Managing Emotions',
    'Self-awareness',
  ],
  8: [
    'Empathy',
    'Effective Communication',
    'Critical Thinking',
    'Creative Thinking',
    'Coping with Stress',
    'Decision Making',
    'Problem Solving',
    'Interpersonal Skills',
    'Managing Emotions',
    'Self-awareness',
  ],
  9: [
    'Empathy',
    'Effective Communication',
    'Critical Thinking',
    'Creative Thinking',
    'Coping with Stress',
    'Decision Making',
    'Problem Solving',
    'Interpersonal Skills',
    'Managing Emotions',
    'Self-awareness',
  ],
  10: [
    'Empathy',
    'Effective Communication',
    'Critical Thinking',
    'Creative Thinking',
    'Coping with Stress',
    'Decision Making',
    'Problem Solving',
    'Interpersonal Skills',
    'Managing Emotions',
    'Self-awareness',
  ],
};
