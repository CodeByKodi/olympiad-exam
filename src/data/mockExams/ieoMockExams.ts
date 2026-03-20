/**
 * IEO-style mock exams: language, information retrieval, functional English, Achievers (HOTS).
 */

import type { MockExam } from '../olympiadContent.js';
import { fib, finalizeMockExam, match, mcq, sa, tf } from './mockExamFactories.js';
import { normalizeMockSectionsToTarget } from './mockExam25.js';
import { buildFullSyntheticMockSections } from './syntheticPadding.js';

/** IEO syllabi typically to Class 10; 4–7 hand-crafted, 1–3 & 8–10 synthetic (25 Q). */
const IEO_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function ieoInstructions(set: 1 | 2 | 3): string[] {
  return [
    'Four sections mirror IEO: Basic Language; Search and Retrieve Information; Situation-based Functional English; Achievers (HOTS).',
    'Choose the most accurate option. One mark per question unless noted. No negative marking.',
    'Read timetables, notices, and dialogues carefully—small details change answers.',
    set === 3 ? 'Achievers may combine grammar and inference across sections.' : 'Manage time so Section 4 receives at least 8 minutes on first attempt.',
  ];
}

function ieoSections(grade: (typeof IEO_GRADES)[number], set: 1 | 2 | 3) {
  const b = `ieo-mock-g${grade}-s0${set}`;
  if (grade < 4 || grade > 7) {
    return buildFullSyntheticMockSections('IEO', grade, set, b);
  }
  if (grade === 4) {
    return [
      {
        section_name: 'Section-1',
        section_title: 'Basic Language',
        questions: [
          mcq(
            `${b}-q01`,
            'Choose the synonym of “swift”.',
            ['slow', 'quick', 'heavy', 'dull'],
            'quick',
            'Swift means fast or quick.',
            'Synonyms',
            'easy',
            'remember',
          ),
          fib(
            `${b}-q02`,
            'The plural of “child” is ____.',
            'children',
            'Irregular plural in English.',
            'Singular-Plural',
            'easy',
            'remember',
          ),
          mcq(
            `${b}-q03`,
            'Which article fits: “____ honest witness spoke up.”',
            ['A', 'An', 'The', 'No article'],
            'An',
            '“Honest” begins with a vowel sound; use “an”.',
            'Articles',
            'medium',
            'apply',
          ),
        ],
      },
      {
        section_name: 'Section-2',
        section_title: 'Search and Retrieve Information',
        questions: [
          mcq(
            `${b}-q04`,
            'Timetable excerpt: Period 2 ends at 10:20; 10-minute break; Period 3 starts at:',
            ['10:25', '10:30', '10:35', '10:40'],
            '10:30',
            '10:20 + 10 minutes = 10:30.',
            'Understand information through pictures, Time-table format, etc.',
            'medium',
            'apply',
          ),
          mcq(
            `${b}-q05`,
            'Invitation line: “RSVP by Friday.” RSVP most nearly asks you to:',
            ['Ignore the invite', 'Reply whether you will attend', 'Bring food only', 'Wear uniform'],
            'Reply whether you will attend',
            'RSVP (répondez s’il vous plaît) requests a response.',
            'Acquire broad understanding of and look for specific information in short texts like messages, Invitations, etc.',
            'easy',
            'understand',
          ),
          tf(
            `${b}-q06`,
            'A caption “Admission free for children under 5” means a 4-year-old pays no fee.',
            true,
            'Under five includes age four.',
            'Understand information through pictures, Time-table format, etc.',
            'easy',
            'analyze',
          ),
        ],
      },
      {
        section_name: 'Section-3',
        section_title: 'Situation-based Functional English',
        questions: [
          mcq(
            `${b}-q07`,
            'You spill juice on a friend’s book. Best first line:',
            ['Not my problem', 'I am sorry, I will help clean it', 'You should move', 'Laugh loudly'],
            'I am sorry, I will help clean it',
            'Apology + repair fits the situation.',
            'Apology',
            'easy',
            'apply',
          ),
          mcq(
            `${b}-q08`,
            'Stranger at bus stop: “Which bus goes to City Library?” Polite reply opener:',
            ['Hush', 'Excuse me, Bus 12 usually does', 'Wrong person', 'Go away'],
            'Excuse me, Bus 12 usually does',
            'Greeting/excuse me softens information giving.',
            'Greeting',
            'medium',
            'apply',
          ),
          mcq(
            `${b}-q09`,
            'Teacher: “Introduce yourself briefly.” Student begins:',
            ['Good morning, I am…', 'Whatever', 'No thanks', 'Bye'],
            'Good morning, I am…',
            'Structured self-introduction is expected.',
            'Introduction',
            'easy',
            'apply',
          ),
        ],
      },
      {
        section_name: 'Section-4',
        section_title: 'Higher Order Thinking Questions',
        questions: [
          mcq(
            `${b}-q10`,
            'Idiom: “Pull your socks up” suggests:',
            ['Dress fashion only', 'Improve effort or behaviour', 'Remove shoes', 'Sleep'],
            'Improve effort or behaviour',
            'Idiom calls for better diligence.',
            'Idioms',
            'hard',
            'analyze',
          ),
          match(
            `${b}-q11`,
            'Match word to proverb meaning.',
            [
              { left: 'Early bird', right: 'Punctual start brings advantage' },
              { left: 'Actions speak louder than words', right: 'Behaviour shows true intent' },
              { left: 'Don’t count your chickens', right: 'Do not assume outcomes too soon' },
            ],
            'Proverbs encode practical wisdom.',
            'Proverbs',
            'hard',
            'understand',
          ),
          sa(
            `${b}-q12`,
            'Write one polite request to borrow a pencil.',
            'Could I please borrow',
            'Modal + please marks politeness.',
            'Request',
            'medium',
            'create',
          ),
        ],
      },
    ];
  }
  if (grade === 5) {
    return [
      {
        section_name: 'Section-1',
        section_title: 'Basic Language',
        questions: [
          mcq(
            `${b}-q01`,
            'Homophone pair: “sea” and “see” are:',
            ['Synonyms', 'Homophones', 'Antonyms', 'Homographs only'],
            'Homophones',
            'Same pronunciation, different meaning/spelling.',
            'Homonyms and Homophones',
            'easy',
            'remember',
          ),
          mcq(
            `${b}-q02`,
            'Passive of “They are building a stadium.”',
            ['A stadium is being built', 'A stadium built', 'A stadium was build', 'Building a stadium'],
            'A stadium is being built',
            'Present continuous passive matches ongoing work.',
            'Active-Passive Voice',
            'medium',
            'apply',
          ),
          fib(
            `${b}-q03`,
            'Past tense of “choose” is ____.',
            'chose',
            'Irregular verb: choose → chose → chosen.',
            'Tenses',
            'easy',
            'remember',
          ),
        ],
      },
      {
        section_name: 'Section-2',
        section_title: 'Search and Retrieve Information',
        questions: [
          mcq(
            `${b}-q04`,
            `News headline: “Council adds ${set === 1 ? 'cycle' : set === 2 ? 'pedestrian' : 'bus'} lanes on Main Road.” Main idea:`,
            ['Sports arena', 'Changing how people move in the city', 'Movie release', 'Math contest'],
            'Changing how people move in the city',
            'Infrastructure changes affect transport.',
            'Understand information given in News reports, Time-tables, Messages, etc.',
            'medium',
            'analyze',
          ),
          mcq(
            `${b}-q05`,
            'Menu lists “Grilled sandwich – ₹80; taxes extra 5%”. Bill before rounding:',
            ['₹80', '₹84', '₹85', '₹90'],
            '₹84',
            '80 + 4 = 84.',
            'Acquire broad understanding of and look for specific information in short texts like messages, menu card dialogues, etc.',
            'medium',
            'apply',
          ),
          tf(
            `${b}-q06`,
            'A brochure “Do not feed zoo animals” protects animal diets and visitor safety.',
            true,
            'Human food disrupts nutrition and proximity risks bites.',
            'Search for and retrieve information from various text types like News headlines, Messages, Letters, etc.',
            'medium',
            'evaluate',
          ),
        ],
      },
      {
        section_name: 'Section-3',
        section_title: 'Situation-based Functional English',
        questions: [
          mcq(
            `${b}-q07`,
            'Classmate asks to copy your homework. Ethical refusal:',
            ['Never study', 'I can explain concepts but won’t let you copy', 'Here, take my notebook unseen', 'Rude silence'],
            'I can explain concepts but won’t let you copy',
            'Supports learning without enabling plagiarism.',
            'Refusals',
            'medium',
            'apply',
          ),
          mcq(
            `${b}-q08`,
            'You stepped on someone’s foot in a queue. Best line:',
            ['Move faster', 'I am sorry, are you okay?', 'Not looking', 'Ignore'],
            'I am sorry, are you okay?',
            'Brief apology checks wellbeing.',
            'Apologies',
            'easy',
            'apply',
          ),
          mcq(
            `${b}-q09`,
            'Formal note to teacher requesting leave for fever:',
            ['Yo teacher skip me', 'Dear Sir/Madam, I request leave…', 'See ya', 'Whatever'],
            'Dear Sir/Madam, I request leave…',
            'Formal register with reason.',
            'Requests',
            'medium',
            'apply',
          ),
        ],
      },
      {
        section_name: 'Section-4',
        section_title: 'Higher Order Thinking Questions',
        questions: [
          mcq(
            `${b}-q10`,
            'Which line uses a simile?',
            ['He runs fast', 'He runs like the wind', 'He runs!', 'Running running'],
            'He runs like the wind',
            'Explicit comparison with “like”.',
            'Idioms',
            'hard',
            'analyze',
          ),
          mcq(
            `${b}-q11`,
            'Paragraph: club recycles paper; funds go to library books. Inference:',
            ['Paper harms libraries', 'Recycling supports reading resources', 'Books are banned', 'Libraries close'],
            'Recycling supports reading resources',
            'Purpose statement links proceeds to books.',
            'Search for and retrieve information from various text types like News headlines, Messages, Letters, etc.',
            'hard',
            'evaluate',
          ),
          tf(
            `${b}-q12`,
            'Changing tense improperly can confuse timeline in a narrative.',
            true,
            'Consistent tense aids clarity unless flashback structure is marked.',
            'Reported Speech',
            'medium',
            'evaluate',
          ),
        ],
      },
    ];
  }
  if (grade === 6) {
    return [
      {
        section_name: 'Section-1',
        section_title: 'Basic Language',
        questions: [
          mcq(
            `${b}-q01`,
            'Collocation: “heavy ____” for rain.',
            ['breeze', 'rain', 'whisper', 'pin'],
            'rain',
            '“Heavy rain” is a fixed pairing.',
            'Collocations',
            'easy',
            'remember',
          ),
          mcq(
            `${b}-q02`,
            'Indirect speech: He said, “I am tired.” → He said that he ____ tired.',
            ['is', 'was', 'has been', 'will be'],
            'was',
            'Backshift with past reporting verb common in syllabi.',
            'Narration',
            'medium',
            'apply',
          ),
          tf(
            `${b}-q03`,
            '“Fewer” often pairs with count nouns; “less” with mass nouns in prescribed usage.',
            true,
            'Prescriptive grammar rule commonly taught.',
            'Adjectives',
            'medium',
            'understand',
          ),
        ],
      },
      {
        section_name: 'Section-2',
        section_title: 'Search and Retrieve Information',
        questions: [
          mcq(
            `${b}-q04`,
            'Poster: “Workshop 14 July, 10 a.m.–1 p.m.; hall closes 1:15 p.m.” Duration is:',
            ['2 hours', '3 hours', '4 hours', '30 minutes'],
            '3 hours',
            '10:00 to 13:00 spans three hours.',
            'Acquire broad understanding of and look for specific information in Short narratives, Time-tables, News stories, Diary entry, Poster Making, Messages, etc.',
            'medium',
            'apply',
          ),
          mcq(
            `${b}-q05`,
            'Brochure compares two phones: Phone A battery 5000 mAh; Phone B 4000 mAh. Same usage claims—longer battery likely:',
            ['Phone B', 'Phone A', 'Equal always', 'Cannot compare'],
            'Phone A',
            'Higher mAh suggests more charge capacity (simplified textbook framing).',
            'Search for and retrieve information from various text types like News headlines, Brochures, Formal and Informal letters, Itinerary, etc.',
            'medium',
            'analyze',
          ),
          fib(
            `${b}-q06`,
            'The noun form of “decide” is ____.',
            'decision',
            '-sion noun from decide.',
            'Nouns',
            'easy',
            'remember',
          ),
        ],
      },
      {
        section_name: 'Section-3',
        section_title: 'Situation-based Functional English',
        questions: [
          mcq(
            `${b}-q07`,
            'Friend claims impossible story during debate. Polite disagree:',
            ['You always lie', 'I see it differently; here is my evidence', 'Walk off', 'Shout over'],
            'I see it differently; here is my evidence',
            'Constructive disagreement.',
            'Agreement and Disagreement',
            'medium',
            'apply',
          ),
          mcq(
            `${b}-q08`,
            'Shopkeeper short-changes you. Assertive polite line:',
            ['Thief!', 'Excuse me, I think this change is incorrect', 'Never mind', 'Yell only'],
            'Excuse me, I think this change is incorrect',
            'Clear, respectful correction.',
            'Requests',
            'medium',
            'apply',
          ),
          mcq(
            `${b}-q09`,
            'Declining extra sugar politely:',
            ['Sugar is stupid', 'No thanks, I prefer it without extra sugar', 'Pour it anyway', 'Ignore host'],
            'No thanks, I prefer it without extra sugar',
            'Refusal can be courteous.',
            'Refusals',
            'easy',
            'apply',
          ),
        ],
      },
      {
        section_name: 'Section-4',
        section_title: 'Higher Order Thinking Questions',
        questions: [
          mcq(
            `${b}-q10`,
            'Poem line: “The moon, a silver coin…” mainly uses:',
            ['Literal only', 'Metaphor', 'Onomatopoeia', 'Anaphora'],
            'Metaphor',
            'Moon compared to coin without “like/as” (metaphor).',
            'Idioms',
            'hard',
            'analyze',
          ),
          mcq(
            `${b}-q11`,
            'Editorial warns: “Verify before sharing breaking news.” Author values:',
            ['Speed only', 'Accuracy and responsibility', 'Gossip', 'Spam'],
            'Accuracy and responsibility',
            'Ethical information behaviour.',
            'Search for and retrieve information from various text types like News headlines, Brochures, Formal and Informal letters, Itinerary, etc.',
            'hard',
            'evaluate',
          ),
          sa(
            `${b}-q12`,
            'Give one discourse marker that signals contrast in an essay.',
            'however',
            'However, although, on the other hand mark contrast.',
            'Conjunctions',
            'medium',
            'create',
          ),
        ],
      },
    ];
  }
  return [
    {
      section_name: 'Section-1',
      section_title: 'Basic Language',
      questions: [
        mcq(
          `${b}-q01`,
          'Choose the word that best matches: “stubborn refusal to change one’s view.”',
          ['Flexible', 'Obstinate', 'Timid', 'Mute'],
          'Obstinate',
          'Obstinate means unreasonably stubborn.',
          'Synonyms',
          'medium',
          'remember',
        ),
        mcq(
          `${b}-q02`,
          'Modal nuance: “You ___ see a doctor if the pain persists.” (strong advice)',
          ['might', 'should', 'may', 'could'],
          'should',
          'Should conveys recommended obligation.',
          'Modals',
          'medium',
          'apply',
        ),
        fib(
          `${b}-q03`,
          'Third conditional (past unreal): If I had studied, I ____ the exam. (typical main clause verb)',
          'would have passed',
          'Had + PP in if-clause pairs with would have + PP.',
          'Tenses',
          'hard',
          'apply',
        ),
      ],
    },
    {
      section_name: 'Section-2',
      section_title: 'Search and Retrieve Information',
      questions: [
        mcq(
          `${b}-q04`,
          `Itinerary Day ${set}: arrival city 08:00; city tour 10:00–13:00; flight departs 18:00. Longest continuous block is:`,
          ['Morning tour', 'Flight only', 'Arrival only', 'Night sleep'],
          'Morning tour',
          'Three-hour city tour exceeds other listed contiguous slots.',
          'Understand information given in News reports, Brochures, Itinerary, etc.',
          'medium',
          'analyze',
        ),
        mcq(
          `${b}-q05`,
          'Biography excerpt highlights charity work after retirement. Central trait emphasised:',
          ['Selfishness', 'Philanthropy', 'Shyness', 'Rudeness'],
          'Philanthropy',
          'Giving to community dominates the description.',
          'Acquire broad understanding of and look for specific information in short narratives, Biographies, Notices and Messages, etc.',
          'medium',
          'understand',
        ),
        tf(
          `${b}-q06`,
          'A biased headline can prime readers before they read the article body.',
          true,
          'Framing effects influence interpretation.',
          'Search for and retrieve information from various text types like News stories, Brochures, Formal and informal letters and advertisements',
          'hard',
          'evaluate',
        ),
      ],
    },
    {
      section_name: 'Section-3',
      section_title: 'Situation-based Functional English',
      questions: [
        mcq(
          `${b}-q07`,
          'You prefer hiking; friend prefers museums. Compromise phrase:',
          ['Only my plan', 'We could mix one museum morning and an afternoon hike', 'Cancel trip', 'Fight'],
          'We could mix one museum morning and an afternoon hike',
          'Negotiated preference.',
          'Stating Preferences',
          'medium',
          'apply',
        ),
        mcq(
          `${b}-q08`,
          'Formal email closing to principal:',
          ['Cheers, dude', 'Yours sincerely', 'LOL', 'TTYL'],
          'Yours sincerely',
          'Formal valediction.',
          'Requesting and Refusing',
          'easy',
          'apply',
        ),
        mcq(
          `${b}-q09`,
          'Expressing intent to reduce screen time:',
          ['Phones rule me', 'I intend to set app limits this month', 'Never sleep', 'Ignore homework'],
          'I intend to set app limits this month',
          'Clear future-oriented intent.',
          'Expression of Intent',
          'medium',
          'apply',
        ),
      ],
    },
    {
      section_name: 'Section-4',
      section_title: 'Higher Order Thinking Questions',
      questions: [
        mcq(
          `${b}-q10`,
          'Critical vocabulary: irony most often signals:',
          ['Literal praise only', 'A gap between appearance and reality', 'Rhyme only', 'A spelling error'],
          'A gap between appearance and reality',
          'Irony highlights mismatch between expectation and outcome or statement and fact.',
          'Analogies and Spellings',
          'hard',
          'analyze',
        ),
        mcq(
          `${b}-q11`,
          'Two reviews: Review A uses only glowing adjectives without evidence; Review B cites scenes. More reliable for decision:',
          ['A only', 'B', 'Neither', 'Whichever is shorter'],
          'B',
          'Evidence-based critique beats pure evaluative language.',
          'Acquire broad understanding of and look for specific information in short narratives, Biographies, Notices and Messages, etc.',
          'hard',
          'evaluate',
        ),
        sa(
          `${b}-q12`,
          'Give one complex sentence using a subordinate clause of reason (because/since).',
          'I stayed home because I was ill',
          'Subordinator introduces dependent clause of reason.',
          'Conjunctions',
          'medium',
          'create',
        ),
      ],
    },
  ];
}

function buildIeo(grade: (typeof IEO_GRADES)[number], set: 1 | 2 | 3): MockExam {
  const packId = `ieo-mock-g${grade}-s0${set}`;
  const sections = normalizeMockSectionsToTarget(ieoSections(grade, set), 'IEO', grade, set, packId);
  return finalizeMockExam({
    id: packId,
    title: `IEO Class ${grade} Mock Paper ${set}`,
    exam_type: 'mock',
    exam_code: 'IEO',
    class_name: `Class ${grade}`,
    subject_name: 'English',
    pattern_type: set === 3 ? 'full-length' : 'olympiad-standard',
    difficulty_level: set === 1 ? 'easy' : set === 2 ? 'medium' : 'hard',
    duration_minutes: set === 1 ? 40 : set === 2 ? 45 : 50,
    sections,
    instructions: ieoInstructions(set),
    tags: ['ieo', `class${grade}`, 'mock', `set-${set}`, 'hots'],
    source: 'IEO-style internal mock bank aligned to syllabus section topics',
  });
}

export const ieoMockExams: MockExam[] = IEO_GRADES.flatMap((g) =>
  ([1, 2, 3] as const).map((s) => buildIeo(g, s)),
);
