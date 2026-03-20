/**
 * IGKO mock exams: full-length style sections (General Awareness, Current Affairs, Life Skills, Achievers).
 */

import type { ExamSection, MockExam } from '../olympiadContent.js';
import { fib, finalizeMockExam, match, mcq, sa, tf } from './mockExamFactories.js';
import {
  buildIgkoGrade5Sections,
  buildIgkoGrade6Sections,
  buildIgkoGrade7Sections,
} from './igkoMockUpper.js';
import { normalizeMockSectionsToTarget } from './mockExam25.js';
import { buildFullSyntheticMockSections } from './syntheticPadding.js';

/** Full IGKO class range; Grades 4–7 use hand-crafted sets, others use syllabus-style synthetic papers. */
const IGKO_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

function baseInstructions(set: 1 | 2 | 3): string[] {
  const pace =
    set === 1
      ? 'Aim for accuracy first; skip and return if a question takes too long.'
      : set === 2
        ? 'Balance speed across sections; do not over-focus on Section 4 early.'
        : 'Expect tighter reasoning in Achievers; read distractors carefully.';
  return [
    'Read all instructions before starting. Each question carries one mark unless stated.',
    'Use a dark pencil or pen as per your exam instructions. No negative marking in this sample paper.',
    'Sections follow IGKO structure: General Awareness, Current Affairs, Life Skills, Achievers (HOTS).',
    pace,
    'For matching items, choose the best pair; ignore case when the answer is a single word.',
  ];
}

function igkoSections(grade: (typeof IGKO_GRADES)[number], set: 1 | 2 | 3): ExamSection[] {
  const b = `igko-mock-g${grade}-s0${set}`;
  if (grade < 4 || grade > 7) {
    return buildFullSyntheticMockSections('IGKO', grade, set, b);
  }
  if (grade === 4) {
    if (set === 1) {
      return [
        {
          section_name: 'Section-1',
          section_title: 'General Awareness',
          questions: [
            mcq(
              `${b}-q01`,
              'Which organ pumps blood through the human body?',
              ['Lungs', 'Heart', 'Stomach', 'Brain'],
              'Heart',
              'The heart is a muscular organ that circulates blood.',
              'Our Body and Health',
              'easy',
              'remember',
            ),
            tf(
              `${b}-q02`,
              'Roots usually absorb water and minerals from the soil.',
              true,
              'Root hairs increase surface area for absorption.',
              'Plants and Animals',
              'easy',
              'understand',
            ),
            mcq(
              `${b}-q03`,
              'The national emblem of India is adapted from which historic pillar?',
              ['Qutub Minar', 'Ashoka Pillar at Sarnath', 'Iron Pillar of Delhi', 'Konark Wheel'],
              'Ashoka Pillar at Sarnath',
              'The Lion Capital of Ashoka from Sarnath is the source motif.',
              'India and the World',
              'medium',
              'remember',
            ),
            fib(
              `${b}-q04`,
              'The nearest star to Earth is the ____.',
              'Sun',
              'The Sun is our closest star and source of energy for photosynthesis.',
              'Science and Technology',
              'easy',
              'remember',
            ),
          ],
        },
        {
          section_name: 'Section-2',
          section_title: 'Current Affairs',
          questions: [
            mcq(
              `${b}-q05`,
              'If newspapers report “city plants 10,000 saplings this monsoon,” the theme is closest to:',
              ['Entertainment', 'Environment and its Conservation', 'Maths Fun', 'Winter sports'],
              'Environment and its Conservation',
              'Large-scale planting relates to environmental action.',
              'Current Affairs',
              'medium',
              'analyze',
              'Environment',
            ),
            mcq(
              `${b}-q06`,
              'A headline “ISRO launches education satellite” mainly connects to:',
              ['Language and Literature', 'Science and Technology', 'Sports', 'Maths Fun'],
              'Science and Technology',
              'Space missions relate to science, technology, and national progress.',
              'Current Affairs',
              'easy',
              'understand',
            ),
            tf(
              `${b}-q07`,
              'A report on “Digital literacy camps in villages” is primarily about using technology responsibly in society.',
              true,
              'Digital literacy bridges information access and skills for daily life.',
              'Current Affairs',
              'medium',
              'evaluate',
            ),
          ],
        },
        {
          section_name: 'Section-3',
          section_title: 'Life Skills',
          questions: [
            mcq(
              `${b}-q08`,
              'You forgot homework and the truth would upset your teacher. The most responsible first step is:',
              [
                'Blame a classmate',
                'Tell the truth and ask how to make up responsibly',
                'Hide the notebook',
                'Skip school',
              ],
              'Tell the truth and ask how to make up responsibly',
              'Integrity and proactive repair build trust.',
              'Life Skills',
              'easy',
              'apply',
              'Integrity',
            ),
            match(
              `${b}-q09`,
              'Match the life-skill idea with the best example.',
              [
                { left: 'Teamwork', right: 'Sharing tasks in a group project' },
                { left: 'Time management', right: 'Making a simple study timetable' },
                { left: 'Empathy', right: 'Listening when a friend feels upset' },
              ],
              'Each pair links an abstract skill with a concrete behaviour.',
              'Life Skills',
              'medium',
              'apply',
            ),
            sa(
              `${b}-q10`,
              'Give one polite phrase you can use before asking someone to lower their voice in a library.',
            'Excuse me, could you please',
            'Polite requests reduce conflict; examiners accept close variants like “Could you please speak softly?”',
              'Life Skills',
              'easy',
              'create',
            ),
          ],
        },
        {
          section_name: 'Section-4',
          section_title: "Achiever's Section (HOTS)",
          questions: [
            mcq(
              `${b}-q11`,
              'A map shows Delhi north-east of Mumbai. If a train route is shorter toward the north-west coast, the direction from Mumbai is roughly:',
              ['North-East', 'North-West', 'South-East', 'Due South'],
              'North-West',
              'North-west of Mumbai points toward the western/north-western coastline of India.',
              'India and the World',
              'hard',
              'analyze',
              'Map reasoning',
            ),
            mcq(
              `${b}-q12`,
              'A healthy lunch has grains, pulses, vegetables, and curd. Removing vegetables for a month most likely reduces intake of:',
              ['Protein only', 'Fibre and several vitamins', 'Water only', 'Starch only'],
              'Fibre and several vitamins',
              'Vegetables are key for micronutrients and fibre even when grains/pulses provide protein.',
              'Our Body and Health',
              'hard',
              'analyze',
              'Balanced diet',
            ),
            tf(
              `${b}-q13`,
              'If every household in a street burns dry leaves daily, local air quality is likely to improve.',
              false,
              'Open burning adds smoke and particulates; composting or municipal collection is safer.',
              'Environment and its Conservation',
              'medium',
              'evaluate',
            ),
            mcq(
              `${b}-q14`,
              'Two clues: (i) It is played with a shuttlecock. (ii) It became an Olympic sport. The game is:',
              ['Cricket', 'Badminton', 'Chess', 'Kabaddi'],
              'Badminton',
              'Shuttlecock play identifies badminton; it is an Olympic discipline.',
              'Sports',
              'medium',
              'analyze',
            ),
          ],
        },
      ];
    }
    if (set === 2) {
      return [
        {
          section_name: 'Section-1',
          section_title: 'General Awareness',
          questions: [
            mcq(
              `${b}-q01`,
              'Which gas do green plants mainly take in for photosynthesis?',
              ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
              'Carbon dioxide',
              'Stomata absorb CO₂ which is fixed into sugars using sunlight.',
              'Plants and Animals',
              'easy',
              'remember',
            ),
            mcq(
              `${b}-q02`,
              'Red Fort in Delhi is made chiefly of:',
              ['Wood', 'Red sandstone', 'Glass', 'Ice'],
              'Red sandstone',
              'Mughal-era fort architecture prominently uses red sandstone.',
              'India and the World',
              'medium',
              'remember',
            ),
            tf(
              `${b}-q03`,
              'A thermometer measures temperature.',
              true,
              'Liquids or sensors expand/change with heat, showing temperature.',
              'Science and Technology',
              'easy',
              'understand',
            ),
            fib(
              `${b}-q04`,
              'We should wash hands with ____ to reduce germs before meals.',
              'soap and water',
              'Mechanical washing with soap removes microbes effectively.',
              'Our Body and Health',
              'easy',
              'apply',
            ),
          ],
        },
        {
          section_name: 'Section-2',
          section_title: 'Current Affairs',
          questions: [
            mcq(
              `${b}-q05`,
              'News: “Metro introduces smart cards for cashless travel.” This mainly relates to:',
              ['Entertainment only', 'Transport and Communication', 'Ancient history', 'Space science'],
              'Transport and Communication',
              'Metro and smart cards concern urban transport systems.',
              'Current Affairs',
              'medium',
              'analyze',
            ),
            mcq(
              `${b}-q06`,
              'Caption: “Coastal town drills students on cyclone preparedness.” The learning focus is:',
              ['Sports rules', 'Safety during natural hazards', 'Poetry', 'Trading stocks'],
              'Safety during natural hazards',
              'Preparedness drills link to disaster awareness and life skills.',
              'Current Affairs',
              'medium',
              'understand',
            ),
            tf(
              `${b}-q07`,
              'A brief report on “women’s cricket World Cup” sits best under entertainment news only.',
              false,
              'It is primarily sports news; may overlap with social relevance but not “entertainment only”.',
              'Sports',
              'medium',
              'evaluate',
            ),
          ],
        },
        {
          section_name: 'Section-3',
          section_title: 'Life Skills',
          questions: [
            mcq(
              `${b}-q08`,
              'Online, a stranger asks for your home address to send “free gifts.” You should:',
              ['Share politely', 'Refuse and tell a trusted adult', 'Post it publicly', 'Accept blindly'],
              'Refuse and tell a trusted adult',
              'Protecting personal data is a core digital safety skill.',
              'Life Skills',
              'medium',
              'apply',
              'Digital safety',
            ),
            mcq(
              `${b}-q09`,
              'During a group presentation, one member is nervous. Helpful behaviour is:',
              [
                'Ignore them',
                'Offer a cue card and calm rehearsal',
                'Laugh at mistakes',
                'Take all speaking turns',
              ],
              'Offer a cue card and calm rehearsal',
              'Supporting peers shows cooperation and empathy.',
              'Life Skills',
              'easy',
              'apply',
            ),
            sa(
              `${b}-q10`,
              'Name one habit that protects eyes while reading.',
              'good lighting',
              'Proper lighting, breaks, and distance reduce eye strain.',
              'Life Skills',
              'easy',
              'apply',
            ),
          ],
        },
        {
          section_name: 'Section-4',
          section_title: "Achiever's Section (HOTS)",
          questions: [
            mcq(
              `${b}-q11`,
              'River water is polluted upstream. A town downstream closes its intake for a day. The town is managing:',
              ['Sports scheduling', 'Public communication about water safety', 'Music theory', 'Stock prices'],
              'Public communication about water safety',
              'Water quality incidents require risk communication and alternate supply planning.',
              'Environment and its Conservation',
              'hard',
              'analyze',
            ),
            mcq(
              `${b}-q12`,
              'Pattern: Rose, Sunflower, Marigold, ? — pick the best fit:',
              ['Elephant', 'Tulip', 'Car', 'Cloud'],
              'Tulip',
              'The list names flowering plants; tulip fits the botanical category.',
              'Plants and Animals',
              'hard',
              'analyze',
            ),
            fib(
              `${b}-q13`,
              'The largest democracy in the world by population is ____.',
              'India',
              'India holds the largest electorate among democracies as of common textbook facts.',
              'India and the World',
              'medium',
              'remember',
            ),
            mcq(
              `${b}-q14`,
              'A poster says “Switch off fans when leaving class.” The underlying value is:',
              ['Wasting electricity', 'Conserving energy', 'Breaking rules', 'Avoiding friends'],
              'Conserving energy',
              'Small habits reduce waste and environmental footprint.',
              'Environment and its Conservation',
              'easy',
              'evaluate',
            ),
          ],
        },
      ];
    }
    return [
      {
        section_name: 'Section-1',
        section_title: 'General Awareness',
        questions: [
          mcq(
            `${b}-q01`,
            'Which blood component carries oxygen to cells?',
            ['Plasma', 'Red blood cells', 'Platelets', 'Nerve cells'],
            'Red blood cells',
            'Haemoglobin in RBC binds oxygen for transport.',
            'Our Body and Health',
            'medium',
            'remember',
          ),
          tf(
            `${b}-q02`,
            'All snakes are venomous.',
            false,
            'Many snakes are non-venomous; identification needs expert knowledge.',
            'Plants and Animals',
            'easy',
            'understand',
          ),
          mcq(
            `${b}-q03`,
            'The largest mangrove forest delta familiar in Indian geography syllabi is:',
            ['Thar', 'Sundarbans', 'Deccan Plateau', 'Ladakh cold desert'],
            'Sundarbans',
            'Sundarbans hosts rich mangroves and biodiversity.',
            'India and the World',
            'medium',
            'remember',
          ),
          match(
            `${b}-q04`,
            'Match classical learning pairs.',
            [
              { left: 'National Anthem composer', right: 'Rabindranath Tagore' },
              { left: 'Father of the Nation (honourary title)', right: 'Mahatma Gandhi' },
              { left: 'Missile technologist honoured', right: 'A. P. J. Abdul Kalam' },
            ],
            'These pair prominent contributions with well-known figures in Indian studies.',
            'Language and Literature',
            'hard',
            'remember',
          ),
        ],
      },
      {
        section_name: 'Section-2',
        section_title: 'Current Affairs',
        questions: [
          mcq(
            `${b}-q05`,
            'Headline: “City bans single-use plastic bags.” The policy targets:',
            ['Space debris', 'Soil and marine pollution from plastics', 'Piano lessons', 'Ice cream flavours'],
            'Soil and marine pollution from plastics',
            'Single-use plastics often become persistent pollutants.',
            'Current Affairs',
            'medium',
            'analyze',
          ),
          mcq(
            `${b}-q06`,
            'A science fair showcases student models of rainwater harvesting. This promotes:',
            ['Obesity research', 'Water conservation thinking', 'Movie making', 'Retail discounts'],
            'Water conservation thinking',
            'Rainwater harvesting supports sustainable water use.',
            'Science and Technology',
            'medium',
            'apply',
          ),
          tf(
            `${b}-q07`,
            '“Open data dashboard on school attendance” mainly improves transparency for parents and officials.',
            true,
            'Dashboards turn attendance records into accountable insights.',
            'Current Affairs',
            'medium',
            'evaluate',
          ),
        ],
      },
      {
        section_name: 'Section-3',
        section_title: 'Life Skills',
        questions: [
          mcq(
            `${b}-q08`,
            'You disagree in a debate but your opponent makes a strong fair point. A good move is:',
            ['Shout louder', 'Acknowledge strength and respond calmly with evidence', 'Walk out silently', 'Mock personally'],
            'Acknowledge strength and respond calmly with evidence',
            'Civil discourse models respect and critical thinking.',
            'Life Skills',
            'medium',
            'apply',
          ),
          fib(
            `${b}-q09`,
            'Deep breathing for a minute can help manage sudden ____ before speaking.',
            'anxiety',
            'Regulation techniques reduce fight-or-flight arousal.',
            'Life Skills',
            'easy',
            'understand',
          ),
          sa(
            `${b}-q10`,
            'Give one example of “active listening.”',
            'nod and paraphrase',
            'Paraphrasing or summarising shows comprehension, not just hearing.',
            'Life Skills',
            'medium',
            'apply',
          ),
        ],
      },
      {
        section_name: 'Section-4',
        section_title: "Achiever's Section (HOTS)",
        questions: [
          mcq(
            `${b}-q11`,
            'A family shifts from car-only commute to school bus pooling. The combined effect most directly reduces:',
            ['Plant photosynthesis', 'Per-person fuel use and congestion', 'Ocean salinity', 'Moon phases'],
            'Per-person fuel use and congestion',
            'Pooling cuts trips per student and lowers emissions intensity.',
            'Environment and its Conservation',
            'hard',
            'analyze',
          ),
          mcq(
            `${b}-q12`,
            'Which inference is strongest? Data: Hospital poster says “Wash hands; it cut infections by 30% in pilot wards.”',
            [
              'Hygiene is irrelevant',
              'Hand hygiene likely reduced infection spread',
              'Infections only happen outdoors',
              'Poster colours caused the drop',
            ],
            'Hand hygiene likely reduced infection spread',
            'Controlled pilots attributing gains to handwashing support causal inference at basic level.',
            'Our Body and Health',
            'hard',
            'evaluate',
          ),
          mcq(
            `${b}-q13`,
            'If Earth’s tilt vanished but orbit stayed, seasons would:',
            ['Strengthen', 'Weaken or nearly disappear', 'Flip daily', 'Double yearly'],
            'Weaken or nearly disappear',
            'Axial tilt drives seasonal solar intensity variations.',
            'Science and Technology',
            'hard',
            'analyze',
            'Earth and Its Environment',
          ),
          tf(
            `${b}-q14`,
            'Listening to diverse news sources before forming an opinion shows critical thinking.',
            true,
            'Cross-checking reduces single-source bias.',
            'Life Skills',
            'medium',
            'evaluate',
          ),
        ],
      },
    ];
  }
  if (grade === 5) return buildIgkoGrade5Sections(b, set);
  if (grade === 6) return buildIgkoGrade6Sections(b, set);
  return buildIgkoGrade7Sections(b, set);
}

function igkoTitle(grade: number, set: number): string {
  return `IGKO Class ${grade} Mock Paper ${set}`;
}

function igkoDifficulty(set: 1 | 2 | 3): 'easy' | 'medium' | 'hard' {
  return set === 1 ? 'easy' : set === 2 ? 'medium' : 'hard';
}

function igkoDuration(set: 1 | 2 | 3): number {
  return set === 1 ? 40 : set === 2 ? 45 : 50;
}

function buildIgko(grade: (typeof IGKO_GRADES)[number], set: 1 | 2 | 3): MockExam {
  const pattern: MockExam['pattern_type'] = set === 3 ? 'full-length' : 'olympiad-standard';
  const packId = `igko-mock-g${grade}-s0${set}`;
  const sections = normalizeMockSectionsToTarget(
    igkoSections(grade, set),
    'IGKO',
    grade,
    set,
    packId,
  );
  return finalizeMockExam({
    id: packId,
    title: igkoTitle(grade, set),
    exam_type: 'mock',
    exam_code: 'IGKO',
    class_name: `Class ${grade}`,
    subject_name: 'General Knowledge',
    pattern_type: pattern,
    difficulty_level: igkoDifficulty(set),
    duration_minutes: igkoDuration(set),
    sections,
    instructions: baseInstructions(set),
    tags: ['igko', `class${grade}`, 'mock', `set-${set}`, 'hots'],
    source: 'IGKO-style internal mock bank aligned to syllabus topics',
  });
}

export const igkoMockExams: MockExam[] = IGKO_GRADES.flatMap((g) =>
  ([1, 2, 3] as const).map((s) => buildIgko(g, s)),
);
