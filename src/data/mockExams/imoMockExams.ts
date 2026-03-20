/**
 * IMO-style mock exams: Logical Reasoning, Mathematics, Applied/Carry-forward, Achievers (HOTS).
 */

import type { ExamSection, MockExam } from '../olympiadContent.js';
import { fib, finalizeMockExam, mcq, sa, tf } from './mockExamFactories.js';
import { normalizeMockSectionsToTarget } from './mockExam25.js';
import { buildFullSyntheticMockSections } from './syntheticPadding.js';

/** Class 3–8: hand-crafted sets; 1–2 and 9–12: full synthetic (25 Q each). */
const IMO_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

function imoInstructions(set: 1 | 2 | 3): string[] {
  const tip =
    set === 1
      ? 'Use rough space; show steps for Section 2 even when multiple choice.'
      : set === 2
        ? 'Watch units in mensuration and time problems; convert before calculating.'
        : 'Achievers items may chain two ideas—read all options before marking.';
  return [
    'Calculators are not allowed unless your institution permits them for practice.',
    'Each question is worth one mark in this sample paper. No negative marking.',
    'Attempt in order: Section 1 (Logical Reasoning), Section 2 (Mathematics), Section 3 (Applied), Section 4 (Achievers).',
    tip,
    'Darken/bubble the single best choice unless otherwise stated.',
  ];
}

function imoSections(grade: (typeof IMO_GRADES)[number], set: 1 | 2 | 3): ExamSection[] {
  const b = `imo-mock-g${grade}-s0${set}`;
  if (grade < 3 || grade > 8) {
    return buildFullSyntheticMockSections('IMO', grade, set, b);
  }
  if (grade === 3) {
    const n = set;
    return [
      {
        section_name: 'Section-1',
        section_title: 'Logical Reasoning',
        questions: [
          mcq(
            `${b}-q01`,
            'Which is the odd one out: red, blue, colour, green?',
            ['red', 'blue', 'colour', 'green'],
            'colour',
            '“Colour” names a category; the others are specific colours.',
            'Analogy and Classification',
            'medium',
            'analyze',
          ),
          mcq(
            `${b}-q02`,
            'Complete the pattern: 5, 10, 15, 20, ____.',
            ['25', '22', '30', '18'],
            '25',
            'Each term adds 5.',
            'Patterns',
            'easy',
            'apply',
          ),
          tf(
            `${b}-q03`,
            'A cube has 6 flat faces.',
            true,
            'A standard die-shaped cube has six square faces.',
            'Geometrical Shapes and Solids',
            'easy',
            'remember',
          ),
        ],
      },
      {
        section_name: 'Section-2',
        section_title: 'Mathematical Reasoning',
        questions: [
          mcq(
            `${b}-q04`,
            'Which number is greater?',
            ['4288', '4390', 'They are equal', '4199'],
            '4390',
            'Compare thousands, then hundreds: 4390 > 4288.',
            'Number Sense (4-digit numbers)',
            'medium',
            'apply',
          ),
          fib(
            `${b}-q05`,
            `Half of ${20 + n * 2} is ____.`,
            `${10 + n}`,
            'Halving means dividing by two.',
            'Fractions',
            'easy',
            'apply',
          ),
          mcq(
            `${b}-q06`,
            'Ravi buys a pen for ₹15 and a book for ₹48. He pays with a ₹100 note. Change is:',
            ['₹37', '₹47', '₹27', '₹63'],
            '₹37',
            '100 − (15 + 48) = 100 − 63 = 37.',
            'Money',
            'medium',
            'apply',
          ),
          mcq(
            `${b}-q07`,
            'Perimeter of a square of side 7 cm is:',
            ['14 cm', '28 cm', '49 cm', '21 cm'],
            '28 cm',
            'Perimeter = 4 × side = 28 cm.',
            'Length, Weight, Capacity',
            'easy',
            'apply',
          ),
          mcq(
            `${b}-q08`,
            '10 minutes before 11:55 a.m. is:',
            ['11:45 a.m.', '12:05 p.m.', '10:55 a.m.', '12:45 p.m.'],
            '11:45 a.m.',
            'Move back ten minutes on the clock.',
            'Time',
            'easy',
            'apply',
          ),
        ],
      },
      {
        section_name: 'Section-3',
        section_title: 'Everyday Mathematics',
        questions: [
          mcq(
            `${b}-q09`,
            'A bar graph shows Monday sales 20, Tuesday 35. Tuesday sold how many more?',
            ['10', '15', '20', '25'],
            '15',
            '35 − 20 = 15.',
            'Data Handling',
            'easy',
            'apply',
          ),
          mcq(
            `${b}-q10`,
            '1 litre = 1000 millilitres. 2500 mL equals:',
            ['2 L', '2.5 L', '25 L', '0.25 L'],
            '2.5 L',
            '2500 ÷ 1000 = 2.5 litres.',
            'Length, Weight, Capacity',
            'medium',
            'apply',
          ),
        ],
      },
      {
        section_name: 'Section-4',
        section_title: 'Achievers (HOTS)',
        questions: [
          mcq(
            `${b}-q11`,
            'A two-digit number has tens digit 3 and units digit 7. Sum of its digits is:',
            ['10', '11', '9', '21'],
            '10',
            '3 + 7 = 10.',
            'Numerals',
            'hard',
            'analyze',
          ),
          sa(
            `${b}-q12`,
            `How many hours are there from 9 a.m. to 1 p.m. on the same day? (Answer as a number.)`,
            '4',
            'From 09:00 to 13:00 is four hours.',
            'Time',
            'medium',
            'apply',
          ),
        ],
      },
    ];
  }
  if (grade === 4) {
    const n = set;
    return [
      {
        section_name: 'Section-1',
        section_title: 'Logical Reasoning',
        questions: [
          mcq(
            `${b}-q01`,
            'Find the odd one out: circle, triangle, square, apple.',
            ['circle', 'triangle', 'square', 'apple'],
            'apple',
            'Apple is not a 2D geometric shape like the others.',
            'Analogy and Classification',
            'easy',
            'analyze',
          ),
          mcq(
            `${b}-q02`,
            `What comes next: 1000, 1100, 1200, 1300, ${1400 + (n - 1) * 100}?`,
            [`${1400 + (n - 1) * 100}`, '1350', '1500', '900'],
            `${1400 + (n - 1) * 100}`,
            'The pattern adds 100 each step for this paper version.',
            'Patterns',
            'medium',
            'apply',
          ),
          mcq(
            `${b}-q03`,
            'Facing north, you turn one right angle clockwise. You now face:',
            ['West', 'East', 'South', 'North'],
            'East',
            'One right turn from north points east.',
            'Direction Sense Test',
            'medium',
            'apply',
          ),
        ],
      },
      {
        section_name: 'Section-2',
        section_title: 'Mathematics',
        questions: [
          mcq(
            `${b}-q04`,
            'Which fraction is greater: 1/2 or 3/4?',
            ['1/2', '3/4', 'They are equal', 'Cannot tell'],
            '3/4',
            'As decimals, 1/2 = 0.5 and 3/4 = 0.75.',
            'Fractions',
            'medium',
            'analyze',
          ),
          fib(
            `${b}-q05`,
            `(${8 + n}) × 5 = ____.`,
            `${(8 + n) * 5}`,
            'Multiply and verify with distributive thinking if needed.',
            'Computation Operations',
            'easy',
            'apply',
          ),
          mcq(
            `${b}-q06`,
            'Perimeter of a rectangle 9 m by 6 m is:',
            ['54 m', '30 m', '15 m', '36 m'],
            '30 m',
            '2(9 + 6) = 30 m.',
            'Perimeter of Various Shapes',
            'easy',
            'apply',
          ),
          mcq(
            `${b}-q07`,
            '0.6 written as a fraction in lowest terms is:',
            ['6/10', '3/5', '60/100', '2/3'],
            '3/5',
            'Divide numerator and denominator by 2.',
            'Fractions',
            'medium',
            'apply',
          ),
          mcq(
            `${b}-q08`,
            'A show starts at 4:15 p.m. and lasts 1 hour 40 minutes. It ends at:',
            ['5:55 p.m.', '6:05 p.m.', '5:45 p.m.', '5:25 p.m.'],
            '5:55 p.m.',
            '4:15 + 1h = 5:15; +40 min = 5:55 p.m.',
            'Time',
            'medium',
            'apply',
          ),
        ],
      },
      {
        section_name: 'Section-3',
        section_title: 'Applied',
        questions: [
          mcq(
            `${b}-q09`,
            'The mean (average) of 10, 16, and 22 is:',
            ['14', '15', '16', '48'],
            '16',
            '(10 + 16 + 22) ÷ 3 = 48 ÷ 3 = 16.',
            'Data Handling',
            'medium',
            'apply',
          ),
          tf(
            `${b}-q10`,
            'A figure with exactly one line of symmetry can be an isosceles triangle.',
            true,
            'Many isosceles triangles have a single vertical line of symmetry.',
            'Symmetry',
            'medium',
            'understand',
          ),
        ],
      },
      {
        section_name: 'Section-4',
        section_title: 'Achievers (HOTS)',
        questions: [
          mcq(
            `${b}-q11`,
            'How many whole numbers lie strictly between 18 and 25?',
            ['5', '6', '7', '8'],
            '6',
            'They are 19,20,21,22,23,24 → six numbers.',
            'Number Sense (more than 4-digit numbers)',
            'hard',
            'analyze',
          ),
          mcq(
            `${b}-q12`,
            'A rectangular floor 8 m by 5 m is tiled with 1 m × 1 m tiles. Tiles needed:',
            ['13', '26', '40', '35'],
            '40',
            'Area = 8×5 = 40 square metres, so 40 tiles.',
            'Geometry',
            'hard',
            'analyze',
          ),
        ],
      },
    ];
  }
  if (grade === 5) {
    const n = set; // vary numerics across parallel papers
    const intruder = 10 + n; // not a power of two
    const p2a = 2;
    const p2b = 4;
    const p2c = 8;
    const p2d = 16;
    return [
      {
        section_name: 'Section-1',
        section_title: 'Logical Reasoning',
        questions: [
          mcq(
            `${b}-q01`,
            `Find the odd one out: ${p2a}, ${p2b}, ${p2c}, ${p2d}, ${intruder}`,
            [`${p2a}`, `${p2b}`, `${intruder}`, `${p2d}`],
            `${intruder}`,
            `${intruder} is not an integer power of two; the others are successive powers ${p2a}=2^1, ${p2b}=2^2, ${p2c}=2^3, ${p2d}=2^4.`,
            'Verbal and Non-Verbal Reasoning',
            'medium',
            'analyze',
            'Classification',
          ),
          mcq(
            `${b}-q02`,
            'If TREE is coded by +1 shift as USFF, how is GOLD coded?',
            ['HPME', 'HPMD', 'FNKC', 'IPNF'],
            'HPME',
            'Each letter shifts +1 in order.',
            'Coding-Decoding',
            'medium',
            'apply',
          ),
          mcq(
            `${b}-q03`,
            'Facing east, you turn right, right, left. You now face:',
            ['North', 'South', 'East', 'West'],
            'South',
            'E→S→W→S after third turn.',
            'Direction Sense Test',
            'hard',
            'apply',
          ),
        ],
      },
      {
        section_name: 'Section-2',
        section_title: 'Mathematics',
        questions: [
          mcq(
            `${b}-q04`,
            `Which fraction is greater: 3/5 or ${2 + n}/${10 + n}?`,
            ['3/5', `${2 + n}/${10 + n}`, 'Equal', 'Cannot tell'],
            '3/5',
            `For n=${n}, second fraction is ${(2 + n) / (10 + n)} which is less than 0.6.`,
            'Fractions and Decimals',
            'medium',
            'analyze',
          ),
          mcq(
            `${b}-q05`,
            `A rectangle has length ${6 + n} cm and breadth 5 cm. Its perimeter is:`,
            [`${22 + 2 * n} cm`, `${30 + n} cm`, `${11 + n} cm`, `${35 + n} cm`],
            `${22 + 2 * n} cm`,
            'Perimeter = 2(l+b).',
            'Perimeter of Various Shapes & Area of Rectangle and Square',
            'easy',
            'apply',
          ),
          fib(
            `${b}-q06`,
            `10% of ${150 + 10 * n} is ____.`,
            `${15 + n}`,
            'Move decimal one place left for 10%.',
            'Fractions and Decimals',
            'easy',
            'apply',
          ),
          mcq(
            `${b}-q07`,
            'A train leaves at 9:40 a.m. and the journey lasts 3 hours 25 minutes. Arrival time on the same day is:',
            ['12:55 p.m.', '1:05 p.m.', '1:15 p.m.', '2:05 p.m.'],
            '1:05 p.m.',
            '9:40 + 3h = 12:40; +25 min = 1:05 p.m.',
            'Time, Temperature and Money',
            'medium',
            'apply',
          ),
        ],
      },
      {
        section_name: 'Section-3',
        section_title: 'Applied / Quantitative Aptitude',
        questions: [
          mcq(
            `${b}-q08`,
            `A pictograph shows ${3 + n} symbols for class A and ${4 + n} for class B. If each symbol = 4 students, difference in students is:`,
            [`${4}`, `${4 + 4 * n}`, `${8 + 4 * n}`, `${16}`],
            `${4}`,
            `Difference in symbols is 1, times 4 students = 4 (for any n the symbol difference remains 1 in this template).`,
            'Data Handling',
            'medium',
            'apply',
          ),
          mcq(
            `${b}-q09`,
            `A square of side ${n + 4} cm is split into unit grid squares. How many unit squares along one edge?`,
            [`${n + 4}`, `${(n + 4) ** 2}`, `${n + 2}`, `${2 * n + 4}`],
            `${n + 4}`,
            'Edge count equals side length in centimetres for 1 cm units.',
            'Symmetry',
            'easy',
            'understand',
          ),
        ],
      },
      {
        section_name: 'Section-4',
        section_title: 'Achievers (HOTS)',
        questions: [
          mcq(
            `${b}-q10`,
            'In a leap February, how many complete weeks and extra days occur?',
            ['4 weeks 0 days', '4 weeks 1 day', '4 weeks 2 days', '5 weeks'],
            '4 weeks 1 day',
            '29 days = 4×7 + 1.',
            'Clock and Calendar',
            'hard',
            'analyze',
          ),
          mcq(
            `${b}-q11`,
            `Two taps fill a tank in ${6 + n} h and ${3 + n} h alone. Together (conceptual) rate relation is found using:`,
            ['Subtraction of times only', 'Reciprocal sum of rates', 'Product of times', 'Average only'],
            'Reciprocal sum of rates',
            'Work rate problems add reciprocals of individual completion times.',
            'Computation Operations',
            'hard',
            'analyze',
          ),
          sa(
            `${b}-q12`,
            `A rectangular garden is ${8 + n} m long and 5 m wide. State its area in m².`,
            `${(8 + n) * 5}`,
            'Area = length × breadth.',
            'Perimeter of Various Shapes & Area of Rectangle and Square',
            'medium',
            'apply',
          ),
        ],
      },
    ];
  }
  if (grade === 6) {
    return [
      {
        section_name: 'Section-1',
        section_title: 'Logical Reasoning',
        questions: [
          mcq(
            `${b}-q01`,
            'Venn: All squares are rectangles. Some rectangles are rhombuses. Which must be true?',
            ['Every square is a rhombus', 'Some squares may be rhombuses', 'No square is a rectangle', 'All rhombuses are squares'],
            'Some squares may be rhombuses',
            'Square∩rhombus is possible but not forced for all squares.',
            'Verbal and Non-Verbal Reasoning',
            'hard',
            'analyze',
          ),
          mcq(
            `${b}-q02`,
            'Series: 2, 6, 12, 20, 30, ?',
            ['40', '42', '44', '48'],
            '42',
            'Differences: 4,6,8,10,12 → +42.',
            'Patterns in Mathematics',
            'medium',
            'apply',
          ),
          tf(
            `${b}-q03`,
            'If two lines are perpendicular, they meet at 90°.',
            true,
            'Perpendicular definition.',
            'Lines and Angles',
            'easy',
            'remember',
          ),
        ],
      },
      {
        section_name: 'Section-2',
        section_title: 'Mathematics',
        questions: [
          mcq(
            `${b}-q04`,
            'Prime factorisation of 84 is:',
            ['2²×3×7', '2×3×7', '2³×7', '2²×21'],
            '2²×3×7',
            '84 = 4×21 = 2²×3×7.',
            'Prime Time',
            'medium',
            'apply',
          ),
          mcq(
            `${b}-q05`,
            'Area of a triangle with base 12 cm and height 7 cm is:',
            ['42 cm²', '84 cm²', '19 cm²', '72 cm²'],
            '42 cm²',
            '½×12×7 = 42.',
            'Perimeter and Area',
            'easy',
            'apply',
          ),
          fib(
            `${b}-q06`,
            '(-3) × 4 + (+5) = ____.',
            '-7',
            'Use integer operation order.',
            'The Other Side of Zero',
            'easy',
            'apply',
          ),
          mcq(
            `${b}-q07`,
            'A bar chart shows daily sales Mon–Fri. Mode of the five values cannot be found if:',
            ['All five values are distinct', 'There is a tie for highest frequency', 'Values are decimals', 'Values are positive'],
            'All five values are distinct',
            'Mode requires repetition; distinct entries means no mode or all modes—Olympiad style: "no unique mode".',
            'Data Handling and Presentation',
            'medium',
            'analyze',
          ),
        ],
      },
      {
        section_name: 'Section-3',
        section_title: 'Applied',
        questions: [
          mcq(
            `${b}-q08`,
            'A right triangle with legs 6 cm and 8 cm has hypotenuse:',
            ['9 cm', '10 cm', '12 cm', '14 cm'],
            '10 cm',
            '6-8-10 Pythagorean triple.',
            'Playing with Constructions',
            'medium',
            'apply',
          ),
          mcq(
            `${b}-q09`,
            'A figure has rotational symmetry order 4 (like a square). Smallest angle of rotation mapping it onto itself is:',
            ['45°', '90°', '120°', '180°'],
            '90°',
            '360°/4 = 90°.',
            'Symmetry',
            'medium',
            'understand',
          ),
        ],
      },
      {
        section_name: 'Section-4',
        section_title: 'Achievers (HOTS)',
        questions: [
          mcq(
            `${b}-q10`,
            'A milk merchant mixes 40 L of milk costing ₹48/L with 60 L costing ₹36/L. Mean cost per litre is:',
            ['₹40.80', '₹41.20', '₹42.00', '₹43.50'],
            '₹40.80',
            '(40×48+60×36)/100 = (1920+2160)/100 = 40.8.',
            'Fractions',
            'hard',
            'analyze',
          ),
          mcq(
            `${b}-q11`,
            'How many multiples of 3 lie strictly between 50 and 80?',
            ['9', '10', '11', '12'],
            '10',
            'First multiple after 50 is 51; last before 80 is 78. The sequence 51, 54, …, 78 has step 3, so the count is (78 − 51)/3 + 1 = 10.',
            'Number Play',
            'hard',
            'apply',
          ),
          fib(
            `${b}-q12`,
            'In a sale, a shirt marked ₹600 is sold at 15% discount. The sale price is ₹____.',
            '510',
            '600 − 15% of 600 = 600 − 90 = 510.',
            'Fractions',
            'medium',
            'apply',
          ),
        ],
      },
    ];
  }
  if (grade === 7) {
    const x = 2 + set;
    return [
      {
        section_name: 'Section-1',
        section_title: 'Logical Reasoning',
        questions: [
          mcq(
            `${b}-q01`,
            'If P means +, Q means ×, and R means −, evaluate: 6 P 4 Q 2 R 4 (standard order of operations).',
            ['10', '18', '8', '16'],
            '10',
            'Substitute: 6 + 4 × 2 − 4 = 6 + 8 − 4 = 10.',
            'Verbal and Non-Verbal Reasoning',
            'medium',
            'apply',
          ),
          mcq(
            `${b}-q02`,
            'In a code, each letter is replaced by the next letter in the alphabet. How is SAFE written?',
            ['TBDF', 'TBGF', 'RZED', 'SBGF'],
            'TBGF',
            'S→T, A→B, F→G, E→F gives TBGF.',
            'Coding-Decoding',
            'medium',
            'apply',
          ),
          tf(
            `${b}-q03`,
            'Supplementary angles always sum to 180°.',
            true,
            'Definition of supplementary pair.',
            'Lines and Angles',
            'easy',
            'remember',
          ),
        ],
      },
      {
        section_name: 'Section-2',
        section_title: 'Mathematics',
        questions: [
          mcq(
            `${b}-q04`,
            'Solve for x: 2x − 5 = 11.',
            ['x = 8', 'x = 6', 'x = 7', 'x = 5'],
            'x = 8',
            'Add 5: 2x = 16; divide by 2: x = 8.',
            'Simple Equations',
            'easy',
            'apply',
          ),
          mcq(
            `${b}-q05`,
            'Simple interest on ₹8000 at 6% p.a. for 2 years is:',
            ['₹860', '₹960', '₹1060', '₹1200'],
            '₹960',
            'SI = PRT/100 = 8000×6×2/100 = 960.',
            'Comparing Quantities',
            'medium',
            'apply',
          ),
          fib(
            `${b}-q06`,
            `(${x})² = ____. (Evaluate for your paper’s x.)`,
            `${x * x}`,
            'Square the integer shown in the blank stem.',
            'Exponents and Powers',
            'easy',
            'apply',
          ),
          mcq(
            `${b}-q07`,
            'In ΔABC, ∠A=50°, ∠B=60°. Exterior angle at C equals:',
            ['70°', '110°', '130°', '120°'],
            '110°',
            'Interior ∠C = 70°; exterior = 180−70 = 110°.',
            'The Triangle and its Properties',
            'medium',
            'apply',
          ),
        ],
      },
      {
        section_name: 'Section-3',
        section_title: 'Applied',
        questions: [
          mcq(
            `${b}-q08`,
            'Mean of 12, 15, 18, x is 16. Then x equals:',
            ['17', '18', '19', '20'],
            '19',
            '(45+x)/4=16 → 45+x=64 → x=19.',
            'Data Handling',
            'medium',
            'apply',
          ),
          mcq(
            `${b}-q09`,
            'Net of a cube cannot have:',
            ['6 squares', '5 squares', '7 squares', 'Squares arranged with shared edges correctly'],
            '7 squares',
            'A cube net has exactly 6 faces.',
            'Visualising Solid Shapes',
            'easy',
            'understand',
          ),
        ],
      },
      {
        section_name: 'Section-4',
        section_title: 'Achievers (HOTS)',
        questions: [
          mcq(
            `${b}-q10`,
            'If a : b = 2 : 3 and b : c = 4 : 5, then a : c =',
            ['6 : 15', '8 : 15', '5 : 6', '10 : 9'],
            '8 : 15',
            'Unify b: a:b=8:12, b:c=12:15 → a:c=8:15.',
            'Comparing Quantities',
            'hard',
            'analyze',
          ),
          mcq(
            `${b}-q11`,
            'Smallest positive integer leaving remainder 2 when divided by 3 and 4 is:',
            ['10', '11', '12', '14'],
            '14',
            'LCM(3,4)=12; 12+2=14.',
            'Integers',
            'hard',
            'analyze',
          ),
          sa(
            `${b}-q12`,
            `Evaluate (${x})³ for the integer x printed on your paper cover (${x}).`,
            `${x * x * x}`,
            'Cube the given integer.',
            'Exponents and Powers',
            'easy',
            'apply',
          ),
        ],
      },
    ];
  }
  return [
    {
      section_name: 'Section-1',
      section_title: 'Logical Reasoning',
      questions: [
        mcq(
          `${b}-q01`,
          'Analogies: 3 : 27 :: 5 : ?',
          ['15', '125', '25', '3125'],
          '125',
          'Cube pattern: n : n³.',
          'Verbal and Non-Verbal Reasoning',
          'medium',
          'analyze',
        ),
        mcq(
          `${b}-q02`,
          'In a row, A is 7th from left and B is 9th from right; they swap and A becomes 11th from left. Total students?',
          ['18', '19', '20', '21'],
          '19',
          'Position reasoning yields 19 (classic swap puzzle).',
          'Verbal and Non-Verbal Reasoning',
          'hard',
          'analyze',
        ),
        tf(
          `${b}-q03`,
          'Contrapositive of a true conditional is always true.',
          true,
          'Logical equivalence with the original statement.',
          'Verbal and Non-Verbal Reasoning',
          'hard',
          'understand',
        ),
      ],
    },
    {
      section_name: 'Section-2',
      section_title: 'Mathematics',
      questions: [
        mcq(
          `${b}-q04`,
          'Value of (−2)⁴ + (−3)² is:',
          ['−2', '2', '19', '25'],
          '25',
          '16 + 9 = 25.',
          'Exponents and Powers',
          'easy',
          'apply',
        ),
        mcq(
          `${b}-q05`,
          'If 3x + 2y = 12 and x = 2, then y equals:',
          ['2', '3', '4', '5'],
          '3',
          '6 + 2y =12 → y=3.',
          'Linear Equations in One Variable',
          'easy',
          'apply',
        ),
        fib(
          `${b}-q06`,
          'Square root of 1764 is ____.',
          '42',
          '42² = 1764.',
          'Squares and Square Roots',
          'medium',
          'remember',
        ),
        mcq(
          `${b}-q07`,
          'Surface area of a cube of edge 5 cm is:',
          ['125 cm²', '150 cm²', '25 cm²', '100 cm²'],
          '150 cm²',
          '6×5² = 150.',
          'Mensuration',
          'medium',
          'apply',
        ),
      ],
    },
    {
      section_name: 'Section-3',
      section_title: 'Applied',
      questions: [
        mcq(
          `${b}-q08`,
          'If y ∝ x and y=12 when x=4, then y when x=7 is:',
          ['18', '19', '20', '21'],
          '21',
          'Direct variation: y = kx with k = 12÷4 = 3, so y = 3x and when x = 7, y = 21.',
          'Direct and Inverse Proportions',
          'medium',
          'apply',
        ),
        mcq(
          `${b}-q09`,
          'Factorise: x² − 9.',
          ['(x−9)²', '(x−3)(x+3)', '(x+9)(x−9)', '(x−3)²'],
          '(x−3)(x+3)',
          'Difference of squares a²−b².',
          'Factorisation',
          'easy',
          'apply',
        ),
      ],
    },
    {
      section_name: 'Section-4',
      section_title: 'Achievers (HOTS)',
      questions: [
        mcq(
          `${b}-q10`,
          'Two pipes fill a tank in 12 h and 18 h. Together they fill in:',
          ['7.2 h', '8.4 h', '9 h', '10 h'],
          '7.2 h',
          '1/(1/12+1/18)=1/(5/36)=7.2.',
          'Rational Numbers',
          'hard',
          'analyze',
        ),
        mcq(
          `${b}-q11`,
          'Point (−3, 4) lies in which quadrant?',
          ['I', 'II', 'III', 'IV'],
          'II',
          'Negative x, positive y → second quadrant.',
          'Introduction to Graphs',
          'medium',
          'understand',
        ),
        fib(
          `${b}-q12`,
          'If 2y = 3x − 5 and x = 3, then y = ____.',
          '2',
          '2y = 9 − 5 = 4 → y = 2.',
          'Algebraic Expressions',
          'medium',
          'apply',
        ),
      ],
    },
  ];
}

function buildImo(grade: (typeof IMO_GRADES)[number], set: 1 | 2 | 3): MockExam {
  const packId = `imo-mock-g${grade}-s0${set}`;
  const sections = normalizeMockSectionsToTarget(imoSections(grade, set), 'IMO', grade, set, packId);
  return finalizeMockExam({
    id: packId,
    title: `IMO Class ${grade} Mock Paper ${set}`,
    exam_type: 'mock',
    exam_code: 'IMO',
    class_name: `Class ${grade}`,
    subject_name: 'Mathematics',
    pattern_type: set === 3 ? 'full-length' : 'olympiad-standard',
    difficulty_level: set === 1 ? 'easy' : set === 2 ? 'medium' : 'hard',
    duration_minutes: set === 1 ? 50 : set === 2 ? 55 : 60,
    sections,
    instructions: imoInstructions(set),
    tags: ['imo', `class${grade}`, 'mock', `set-${set}`, 'hots'],
    source: 'IMO-style internal mock bank aligned to syllabus topics',
  });
}

export const imoMockExams: MockExam[] = IMO_GRADES.flatMap((g) =>
  ([1, 2, 3] as const).map((s) => buildImo(g, s)),
);
