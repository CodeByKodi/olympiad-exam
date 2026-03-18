/**
 * IMO (International Mathematics Olympiad) Syllabus
 * Structured data model for Classes 1–12
 */

/** Section with topics (standard case) */
export interface IMOSection {
  section_name: string;
  section_title?: string;
  topics: string[];
  notes?: string;
}

/** Section-2 option for Classes 11 and 12 (alternative syllabi) */
export interface IMOSection2Option {
  option_name: string;
  topics: string[];
}

/** Section with Section-2 options (Classes 11 and 12 only) */
export interface IMOSectionWithOptions extends Omit<IMOSection, 'topics'> {
  section_2_options: IMOSection2Option[];
}

/** Single class syllabus entry */
export interface IMOClass {
  class_name: string;
  grade: number;
  sections: (IMOSection | IMOSectionWithOptions)[];
}

/** Full IMO syllabus structure */
export interface IMOSyllabus {
  exam_name: string;
  classes: IMOClass[];
}

export const imoSyllabus: IMOSyllabus = {
  exam_name: 'International Mathematics Olympiad',
  classes: [
    {
      class_name: 'Class 1',
      grade: 1,
      sections: [
        {
          section_name: 'Section-1',
          topics: [
            'Patterns',
            'Odd One Out',
            'Measuring Units',
            'Geometrical Shapes',
            'Spatial Understanding',
            'Grouping of Figures',
            'Analogy',
            'Ranking Test',
            'Problems based on Figures',
          ],
        },
        {
          section_name: 'Section-2',
          topics: [
            'Numerals',
            'Number Names',
            'Number Sense (2-digit numbers)',
            'Addition',
            'Subtraction',
            'Lengths, Weights and Comparisons',
            'Time',
            'Money',
            'Geometrical Shapes and Solids',
          ],
        },
        {
          section_name: 'Section-3',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
        {
          section_name: 'Section-4',
          section_title: 'Higher Order Thinking Questions',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
      ],
    },
    {
      class_name: 'Class 2',
      grade: 2,
      sections: [
        {
          section_name: 'Section-1',
          topics: [
            'Patterns',
            'Odd One Out',
            'Measuring Units',
            'Geometrical Shapes',
            'Analogy',
            'Ranking Test',
            'Grouping of Figures',
            'Embedded Figures',
            'Coding-Decoding',
          ],
        },
        {
          section_name: 'Section-2',
          topics: [
            'Numerals',
            'Number Names',
            'Number Sense (3-digit numbers)',
            'Computation Operations',
            'Length, Weight, Capacity',
            'Time',
            'Temperature',
            'Money',
            'Lines, Shapes and Solids',
            'Pictographs',
            'Patterns',
          ],
        },
        {
          section_name: 'Section-3',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
        {
          section_name: 'Section-4',
          section_title: 'Higher Order Thinking Questions',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
      ],
    },
    {
      class_name: 'Class 3',
      grade: 3,
      sections: [
        {
          section_name: 'Section-1',
          section_title: 'Logical Reasoning',
          topics: [
            'Patterns',
            'Analogy and Classification',
            'Alphabet Test',
            'Coding-Decoding',
            'Ranking Test',
            'Grouping of Figures and Figure Matrix',
            'Mirror Images',
            'Geometrical Shapes',
            'Embedded Figures',
            'Possible Combinations',
            'Clock and Calendar',
          ],
        },
        {
          section_name: 'Section-2',
          section_title: 'Mathematical Reasoning',
          topics: [
            'Numerals',
            'Number Names',
            'Number Sense (4-digit numbers)',
            'Computation Operations',
            'Fractions',
            'Length, Weight, Capacity',
            'Temperature',
            'Time',
            'Money',
            'Geometry',
            'Data Handling',
          ],
        },
        {
          section_name: 'Section-3',
          section_title: 'Everyday Mathematics',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
        {
          section_name: 'Section-4',
          section_title: 'Achievers Section',
          notes: 'Higher Order Thinking Questions - Syllabus as per Section-2.',
          topics: [],
        },
      ],
    },
    {
      class_name: 'Class 4',
      grade: 4,
      sections: [
        {
          section_name: 'Section-1',
          topics: [
            'Patterns',
            'Alphabet Test',
            'Coding-Decoding',
            'Ranking Test',
            'Mirror Images',
            'Geometrical Shapes and Solids',
            'Embedded Figures',
            'Direction Sense Test',
            'Possible Combinations',
            'Analogy and Classification',
            'Clock and Calendar',
          ],
        },
        {
          section_name: 'Section-2',
          topics: [
            'Numerals',
            'Number Names',
            'Number Sense (more than 4-digit numbers)',
            'Computation Operations',
            'Fractions',
            'Length, Weight, Capacity',
            'Time',
            'Money',
            'Geometry',
            'Perimeter of Various Shapes',
            'Symmetry',
            'Conversions',
            'Data Handling',
          ],
        },
        {
          section_name: 'Section-3',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
        {
          section_name: 'Section-4',
          section_title: 'Higher Order Thinking Questions',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
      ],
    },
    {
      class_name: 'Class 5',
      grade: 5,
      sections: [
        {
          section_name: 'Section-1',
          topics: [
            'Patterns',
            'Analogy',
            'Classification',
            'Geometrical Shapes',
            'Mirror and Water Images',
            'Direction Sense Test',
            'Ranking Test',
            'Alphabet Test',
            'Logical Sequence of Words',
            'Puzzle Test',
            'Coding-Decoding',
            'Clock and Calendar',
          ],
        },
        {
          section_name: 'Section-2',
          topics: [
            'Numerals',
            'Number Names',
            'Number Sense (7 and 8 digit numbers)',
            'Computation Operations',
            'Fractions and Decimals',
            'Measurement of Length, Weight, Capacity',
            'Time, Temperature and Money',
            'Conversions',
            'Angles',
            'Perimeter of Various Shapes & Area of Rectangle and Square',
            'Symmetry',
            'Data Handling',
          ],
        },
        {
          section_name: 'Section-3',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
        {
          section_name: 'Section-4',
          section_title: 'Higher Order Thinking Questions',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
      ],
    },
    {
      class_name: 'Class 6',
      grade: 6,
      sections: [
        {
          section_name: 'Section-1',
          topics: ['Verbal and Non-Verbal Reasoning'],
        },
        {
          section_name: 'Section-2',
          topics: [
            'Patterns in Mathematics',
            'Lines and Angles',
            'Number Play',
            'Data Handling and Presentation',
            'Prime Time',
            'Perimeter and Area',
            'Fractions',
            'Playing with Constructions',
            'Symmetry',
            'The Other Side of Zero',
          ],
        },
        {
          section_name: 'Section-3',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
        {
          section_name: 'Section-4',
          section_title: 'Higher Order Thinking Questions',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
      ],
    },
    {
      class_name: 'Class 7',
      grade: 7,
      sections: [
        {
          section_name: 'Section-1',
          topics: ['Verbal and Non-Verbal Reasoning'],
        },
        {
          section_name: 'Section-2',
          topics: [
            'Integers',
            'Fractions and Decimals',
            'Exponents and Powers',
            'Algebraic Expressions',
            'Simple Equations',
            'Lines and Angles',
            'Comparing Quantities',
            'The Triangle and its Properties',
            'Symmetry',
            'Rational Numbers',
            'Perimeter and Area',
            'Data Handling',
            'Visualising Solid Shapes',
          ],
        },
        {
          section_name: 'Section-3',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
        {
          section_name: 'Section-4',
          section_title: 'Higher Order Thinking Questions',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
      ],
    },
    {
      class_name: 'Class 8',
      grade: 8,
      sections: [
        {
          section_name: 'Section-1',
          topics: ['Verbal and Non-Verbal Reasoning'],
        },
        {
          section_name: 'Section-2',
          topics: [
            'Rational Numbers',
            'Squares and Square Roots',
            'Cubes and Cube Roots',
            'Exponents and Powers',
            'Comparing Quantities',
            'Algebraic Expressions',
            'Linear Equations in One Variable',
            'Understanding Quadrilaterals',
            'Mensuration',
            'Data Handling',
            'Direct and Inverse Proportions',
            'Factorisation',
            'Introduction to Graphs',
          ],
        },
        {
          section_name: 'Section-3',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
        {
          section_name: 'Section-4',
          section_title: 'Higher Order Thinking Questions',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
      ],
    },
    {
      class_name: 'Class 9',
      grade: 9,
      sections: [
        {
          section_name: 'Section-1',
          topics: ['Verbal and Non-Verbal Reasoning'],
        },
        {
          section_name: 'Section-2',
          topics: [
            'Number Systems',
            'Polynomials',
            'Coordinate Geometry',
            'Linear Equations in Two Variables',
            "Introduction to Euclid's Geometry",
            'Lines and Angles',
            'Triangles',
            'Quadrilaterals',
            'Circles',
            "Heron's Formula",
            'Surface Areas and Volumes',
            'Statistics',
          ],
        },
        {
          section_name: 'Section-3',
          notes: "The syllabus of this section will be based on the syllabus of Mathematical Reasoning and Quantitative Aptitude.",
          topics: [],
        },
        {
          section_name: 'Section-4',
          section_title: 'Higher Order Thinking Questions',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
      ],
    },
    {
      class_name: 'Class 10',
      grade: 10,
      sections: [
        {
          section_name: 'Section-1',
          topics: ['Verbal and Non-Verbal Reasoning'],
        },
        {
          section_name: 'Section-2',
          topics: [
            'Real Numbers',
            'Polynomials',
            'Pair of Linear Equations in Two Variables',
            'Quadratic Equations',
            'Arithmetic Progressions',
            'Triangles',
            'Coordinate Geometry',
            'Introduction to Trigonometry',
            'Some Applications of Trigonometry',
            'Circles',
            'Areas Related to Circles',
            'Surface Areas and Volumes',
            'Statistics',
            'Probability',
          ],
        },
        {
          section_name: 'Section-3',
          notes: "The syllabus of this section will be based on the syllabus of Mathematical Reasoning and Quantitative Aptitude.",
          topics: [],
        },
        {
          section_name: 'Section-4',
          section_title: 'Higher Order Thinking Questions',
          notes: 'Syllabus as per Section-2.',
          topics: [],
        },
      ],
    },
    {
      class_name: 'Class 11',
      grade: 11,
      sections: [
        {
          section_name: 'Section-1',
          topics: ['Verbal and Non-Verbal Reasoning'],
        },
        {
          section_name: 'Section-2',
          section_2_options: [
            {
              option_name: 'Option 1',
              topics: [
                'Sets',
                'Relations and Functions',
                'Logarithms',
                'Complex Numbers',
                'Linear Inequalities',
                'Sequences and Series',
                'Trigonometry',
                'Straight Lines',
                'Conic Sections',
                'Permutations and Combinations',
                'Binomial Theorem',
                'Statistics',
                'Limits and Derivatives',
                'Probability',
                'Introduction to 3-D Geometry',
              ],
            },
            {
              option_name: 'Option 2',
              topics: [
                'Numbers',
                'Quantification',
                'Numerical Applications',
                'Sets',
                'Relations and Functions',
                'Sequences and Series',
                'Permutations and Combinations',
                'Mathematical Reasoning',
                'Limits, Continuity and Differentiability',
                'Probability',
                'Descriptive Statistics',
                'Basics of Financial Mathematics',
                'Straight Lines',
                'Circles',
                'Parabola',
              ],
            },
          ],
        },
        {
          section_name: 'Section-3',
          notes: 'The syllabus of this section will be based on the syllabus of Quantitative Aptitude.',
          topics: [],
        },
        {
          section_name: 'Section-4',
          section_title: 'Achievers / Higher Order Thinking',
          topics: [
            'Sets',
            'Relations and Functions',
            'Sequences and Series',
            'Permutations and Combinations',
            'Limits and Derivatives',
            'Straight Lines',
            'Circles',
            'Parabola',
            'Probability',
          ],
        },
      ],
    },
    {
      class_name: 'Class 12',
      grade: 12,
      sections: [
        {
          section_name: 'Section-1',
          topics: ['Verbal and Non-Verbal Reasoning'],
        },
        {
          section_name: 'Section-2',
          section_2_options: [
            {
              option_name: 'Option 1',
              topics: [
                'Relations and Functions',
                'Inverse Trigonometric Functions',
                'Matrices and Determinants',
                'Continuity and Differentiability',
                'Application of Derivatives',
                'Integrals',
                'Application of Integrals',
                'Differential Equations',
                'Vector Algebra',
                'Three Dimensional Geometry',
                'Probability',
                'Linear Programming',
              ],
            },
            {
              option_name: 'Option 2',
              topics: [
                'Numbers',
                'Quantification',
                'Numerical Applications',
                'Solutions of Simultaneous Linear Equations',
                'Matrices',
                'Determinants',
                'Application of Derivatives',
                'Integration',
                'Application of Integrations',
                'Differential Equations',
                'Probability',
                'Inferential Statistics',
                'Index numbers',
                'Time-based data',
                'Financial Mathematics',
                'Linear Programming',
              ],
            },
          ],
        },
        {
          section_name: 'Section-3',
          notes: 'The syllabus of this section will be based on the syllabus of Quantitative Aptitude.',
          topics: [],
        },
        {
          section_name: 'Section-4',
          section_title: 'Achievers / Higher Order Thinking',
          topics: [
            'Matrices',
            'Determinants',
            'Application of Derivatives',
            'Integration',
            'Application of Integrations',
            'Differential Equations',
            'Linear Programming',
            'Probability',
          ],
        },
      ],
    },
  ],
};
