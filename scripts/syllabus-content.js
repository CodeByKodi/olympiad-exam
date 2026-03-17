/**
 * Syllabus content for all exams and grades.
 * Returns { title, description, topics } for each exam/grade.
 */

const content = {
  nso: {
    1: {
      title: 'NSO Grade 1 Syllabus',
      description: 'Grade 1 science: living/non-living, plants, animals, food, body basics, air, water, environment.',
      topics: [
        { name: 'Living and Non-living', desc: 'Basic distinction.', weightage: 'high', count: 30, subtopics: [
          { name: 'Living Things', desc: 'Things that grow and need food.', objectives: ['Identify living things', 'Name examples'], count: 15, tags: ['living'] },
          { name: 'Non-living Things', desc: 'Things that do not grow.', objectives: ['Identify non-living', 'Compare with living'], count: 15, tags: ['non-living'] },
        ]},
        { name: 'Plants', desc: 'Basic plant concepts.', weightage: 'high', count: 35, subtopics: [
          { name: 'Parts of Plants', desc: 'Roots, stems, leaves.', objectives: ['Identify plant parts', 'Match parts with names'], count: 20, tags: ['plants'] },
          { name: 'What Plants Need', desc: 'Water, sunlight, air.', objectives: ['List what plants need', 'Describe growth'], count: 15, tags: ['plants'] },
        ]},
        { name: 'Animals', desc: 'Basic animal concepts.', weightage: 'high', count: 35, subtopics: [
          { name: 'Types of Animals', desc: 'Birds, fish, land animals.', objectives: ['Identify animals', 'Group by type'], count: 20, tags: ['animals'] },
          { name: 'Where Animals Live', desc: 'Homes and habitats.', objectives: ['Match animals to homes', 'Identify habitats'], count: 15, tags: ['animals'] },
        ]},
        { name: 'Food', desc: 'Food and eating.', weightage: 'medium', count: 25, subtopics: [
          { name: 'Types of Food', desc: 'Fruits, vegetables, grains.', objectives: ['Identify food types', 'Name healthy foods'], count: 15, tags: ['food'] },
          { name: 'Healthy Eating', desc: 'Balanced meals.', objectives: ['Identify healthy choices', 'Understand meal times'], count: 10, tags: ['food'] },
        ]},
        { name: 'Human Body Basics', desc: 'Body parts and senses.', weightage: 'medium', count: 25, subtopics: [
          { name: 'Body Parts', desc: 'Head, hands, legs.', objectives: ['Name body parts', 'Identify parts'], count: 15, tags: ['body'] },
          { name: 'Five Senses', desc: 'See, hear, smell, taste, touch.', objectives: ['Name five senses', 'Match sense to use'], count: 10, tags: ['senses'] },
        ]},
        { name: 'Air and Water', desc: 'Basics of air and water.', weightage: 'medium', count: 20, subtopics: [
          { name: 'Air', desc: 'Air is everywhere.', objectives: ['Understand we need air', 'Identify air uses'], count: 10, tags: ['air'] },
          { name: 'Water', desc: 'Uses of water.', objectives: ['List water uses', 'Understand importance'], count: 10, tags: ['water'] },
        ]},
        { name: 'Environment and Weather', desc: 'Simple environment.', weightage: 'low', count: 15, subtopics: [
          { name: 'Weather', desc: 'Sunny, rainy, cloudy.', objectives: ['Identify weather types', 'Describe weather'], count: 10, tags: ['weather'] },
          { name: 'Keeping Clean', desc: 'Clean surroundings.', objectives: ['Understand cleanliness', 'Identify clean habits'], count: 5, tags: ['environment'] },
        ]},
      ],
    },
    2: {
      title: 'NSO Grade 2 Syllabus',
      description: 'Grade 2 science: plants, animals, food, body, air, water, environment, weather.',
      topics: [
        { name: 'Living and Non-living', desc: 'Characteristics.', weightage: 'high', count: 30, subtopics: [
          { name: 'Living Things', desc: 'Grow, move, need food.', objectives: ['Describe living things', 'Compare with non-living'], count: 15, tags: ['living'] },
          { name: 'Non-living Things', desc: 'Do not grow.', objectives: ['Identify non-living', 'Give examples'], count: 15, tags: ['non-living'] },
        ]},
        { name: 'Plants', desc: 'Plant parts and functions.', weightage: 'high', count: 40, subtopics: [
          { name: 'Parts of Plants', desc: 'Roots, stems, leaves, flowers.', objectives: ['Identify parts', 'Describe functions'], count: 20, tags: ['plants'] },
          { name: 'How Plants Grow', desc: 'Seeds and germination.', objectives: ['Describe growth', 'Identify seeds'], count: 20, tags: ['plants'] },
        ]},
        { name: 'Animals', desc: 'Animal groups and habits.', weightage: 'high', count: 40, subtopics: [
          { name: 'Animal Groups', desc: 'Birds, mammals, fish.', objectives: ['Group animals', 'Identify features'], count: 20, tags: ['animals'] },
          { name: 'Animal Food', desc: 'Food habits.', objectives: ['Identify herbivores/carnivores', 'Match animal to food'], count: 20, tags: ['animals'] },
        ]},
        { name: 'Food and Human Body', desc: 'Food groups and body.', weightage: 'medium', count: 30, subtopics: [
          { name: 'Food Groups', desc: 'Fruits, vegetables, grains.', objectives: ['Classify foods', 'Identify balanced diet'], count: 15, tags: ['food'] },
          { name: 'Body and Senses', desc: 'Sense organs.', objectives: ['Describe sense organs', 'Relate to function'], count: 15, tags: ['body'] },
        ]},
        { name: 'Air, Water, and Weather', desc: 'Basics.', weightage: 'medium', count: 25, subtopics: [
          { name: 'Air and Water', desc: 'Importance and uses.', objectives: ['Explain importance', 'List uses'], count: 15, tags: ['air', 'water'] },
          { name: 'Weather and Seasons', desc: 'Types and seasons.', objectives: ['Describe weather', 'Identify seasons'], count: 10, tags: ['weather'] },
        ]},
        { name: 'Environment', desc: 'Clean environment.', weightage: 'low', count: 15, subtopics: [
          { name: 'Clean Environment', desc: 'Clean habits.', objectives: ['Describe clean habits', 'Understand waste'], count: 15, tags: ['environment'] },
        ]},
      ],
    },
    3: {
      title: 'NSO Grade 3 Syllabus',
      description: 'Grade 3 science: plants and animals, human body and food, matter/energy/force, earth/environment/space.',
      topics: [
        { name: 'Plants and Animals', desc: 'Plant and animal concepts.', weightage: 'high', count: 50, subtopics: [
          { name: 'Plants', desc: 'Parts, functions, growth.', objectives: ['Identify plant parts and functions', 'Describe growth', 'Explain photosynthesis basics'], count: 25, tags: ['plants'] },
          { name: 'Animals', desc: 'Groups, habitats, food.', objectives: ['Classify animals', 'Identify habitats', 'Compare herbivores and carnivores'], count: 25, tags: ['animals'] },
        ]},
        { name: 'Human Body and Food', desc: 'Body and nutrition.', weightage: 'high', count: 45, subtopics: [
          { name: 'Body Parts and Senses', desc: 'Organs and functions.', objectives: ['Describe body systems', 'Relate senses to organs'], count: 22, tags: ['body'] },
          { name: 'Food and Nutrition', desc: 'Food groups.', objectives: ['Classify food groups', 'Explain balanced diet'], count: 23, tags: ['food'] },
        ]},
        { name: 'Matter, Energy, and Force', desc: 'Basic matter, energy, force.', weightage: 'medium', count: 40, subtopics: [
          { name: 'Matter', desc: 'Solids, liquids, gases.', objectives: ['Identify states of matter', 'Give examples'], count: 15, tags: ['matter'] },
          { name: 'Energy', desc: 'Light, heat, sound.', objectives: ['Identify energy sources', 'Describe uses'], count: 12, tags: ['energy'] },
          { name: 'Force', desc: 'Push and pull.', objectives: ['Define push and pull', 'Identify force'], count: 13, tags: ['force'] },
        ]},
        { name: 'Earth, Environment, and Space', desc: 'Earth, environment, space.', weightage: 'medium', count: 35, subtopics: [
          { name: 'Earth', desc: 'Land, water, air.', objectives: ['Identify land and water', 'Describe Earth'], count: 12, tags: ['earth'] },
          { name: 'Environment', desc: 'Conservation and pollution.', objectives: ['Understand conservation', 'Identify pollution'], count: 12, tags: ['environment'] },
          { name: 'Space', desc: 'Sun, Moon, stars.', objectives: ['Identify Sun and Moon', 'Describe day and night'], count: 11, tags: ['space'] },
        ]},
      ],
    },
    4: {
      title: 'NSO Grade 4 Syllabus',
      description: 'Grade 4 science: matter, force, light, sound, energy, earth, space, plants, animals, body systems.',
      topics: [
        { name: 'Matter', desc: 'States and properties.', weightage: 'high', count: 45, subtopics: [
          { name: 'States of Matter', desc: 'Solid, liquid, gas.', objectives: ['Describe states', 'Explain changes'], count: 22, tags: ['matter'] },
          { name: 'Properties of Matter', desc: 'Mass, volume, shape.', objectives: ['Identify properties', 'Compare materials'], count: 23, tags: ['matter'] },
        ]},
        { name: 'Force and Motion', desc: 'Forces and simple motion.', weightage: 'medium', count: 35, subtopics: [
          { name: 'Types of Force', desc: 'Push, pull, friction.', objectives: ['Identify forces', 'Describe effects'], count: 18, tags: ['force'] },
          { name: 'Simple Motion', desc: 'Speed and direction.', objectives: ['Describe motion', 'Compare speeds'], count: 17, tags: ['motion'] },
        ]},
        { name: 'Light and Sound', desc: 'Light and sound basics.', weightage: 'medium', count: 40, subtopics: [
          { name: 'Light', desc: 'Sources, shadows, reflection.', objectives: ['Identify light sources', 'Explain shadows'], count: 20, tags: ['light'] },
          { name: 'Sound', desc: 'Sources and propagation.', objectives: ['Identify sound sources', 'Describe sound travel'], count: 20, tags: ['sound'] },
        ]},
        { name: 'Energy', desc: 'Forms of energy.', weightage: 'medium', count: 35, subtopics: [
          { name: 'Forms of Energy', desc: 'Heat, light, sound.', objectives: ['Identify energy forms', 'Describe conversion'], count: 18, tags: ['energy'] },
          { name: 'Sources of Energy', desc: 'Sun, fuel, food.', objectives: ['List energy sources', 'Compare renewable/non-renewable'], count: 17, tags: ['energy'] },
        ]},
        { name: 'Earth and Space', desc: 'Earth systems and space.', weightage: 'medium', count: 40, subtopics: [
          { name: 'Earth', desc: 'Rocks, soil, water cycle.', objectives: ['Describe Earth layers', 'Explain water cycle'], count: 20, tags: ['earth'] },
          { name: 'Space', desc: 'Solar system basics.', objectives: ['Identify planets', 'Describe Earth movement'], count: 20, tags: ['space'] },
        ]},
        { name: 'Plants, Animals, and Body', desc: 'Living world and body.', weightage: 'high', count: 50, subtopics: [
          { name: 'Plants and Animals', desc: 'Life processes.', objectives: ['Describe life processes', 'Compare plants and animals'], count: 25, tags: ['plants', 'animals'] },
          { name: 'Body Systems', desc: 'Digestive, respiratory basics.', objectives: ['Identify body systems', 'Describe functions'], count: 25, tags: ['body'] },
        ]},
        { name: 'Environment', desc: 'Ecosystem and conservation.', weightage: 'low', count: 25, subtopics: [
          { name: 'Ecosystem', desc: 'Food chains and webs.', objectives: ['Describe food chain', 'Identify producers/consumers'], count: 15, tags: ['environment'] },
          { name: 'Conservation', desc: 'Protecting environment.', objectives: ['Explain conservation', 'List ways to protect'], count: 10, tags: ['environment'] },
        ]},
      ],
    },
    5: {
      title: 'NSO Grade 5 Syllabus',
      description: 'Grade 5 science: matter, force, light, sound, energy, earth, space, environment.',
      topics: [
        { name: 'Matter', desc: 'Properties and changes.', weightage: 'high', count: 50, subtopics: [
          { name: 'Properties', desc: 'Mass, volume, density.', objectives: ['Measure properties', 'Compare materials'], count: 25, tags: ['matter'] },
          { name: 'Physical and Chemical Changes', desc: 'Types of changes.', objectives: ['Distinguish changes', 'Give examples'], count: 25, tags: ['matter'] },
        ]},
        { name: 'Force, Light, and Sound', desc: 'Physics basics.', weightage: 'medium', count: 45, subtopics: [
          { name: 'Force and Friction', desc: 'Forces in daily life.', objectives: ['Explain friction', 'Describe applications'], count: 22, tags: ['force'] },
          { name: 'Light and Sound', desc: 'Properties and uses.', objectives: ['Explain reflection', 'Describe sound properties'], count: 23, tags: ['light', 'sound'] },
        ]},
        { name: 'Energy', desc: 'Energy forms and sources.', weightage: 'medium', count: 40, subtopics: [
          { name: 'Energy Forms', desc: 'Kinetic, potential, heat.', objectives: ['Identify energy forms', 'Explain conversion'], count: 20, tags: ['energy'] },
          { name: 'Energy Sources', desc: 'Renewable and non-renewable.', objectives: ['Compare sources', 'Discuss sustainability'], count: 20, tags: ['energy'] },
        ]},
        { name: 'Earth and Space', desc: 'Earth systems.', weightage: 'medium', count: 45, subtopics: [
          { name: 'Earth Systems', desc: 'Geosphere, hydrosphere.', objectives: ['Describe Earth systems', 'Explain interactions'], count: 22, tags: ['earth'] },
          { name: 'Solar System', desc: 'Planets and motion.', objectives: ['Describe solar system', 'Explain seasons'], count: 23, tags: ['space'] },
        ]},
        { name: 'Living World', desc: 'Plants, animals, body.', weightage: 'high', count: 55, subtopics: [
          { name: 'Life Processes', desc: 'Nutrition, respiration.', objectives: ['Describe life processes', 'Compare organisms'], count: 28, tags: ['plants', 'animals'] },
          { name: 'Human Body Systems', desc: 'Major systems.', objectives: ['Identify systems', 'Describe functions'], count: 27, tags: ['body'] },
        ]},
        { name: 'Environment', desc: 'Ecosystem and conservation.', weightage: 'medium', count: 35, subtopics: [
          { name: 'Ecosystems', desc: 'Food chains and balance.', objectives: ['Describe ecosystems', 'Explain balance'], count: 18, tags: ['environment'] },
          { name: 'Conservation', desc: 'Protecting nature.', objectives: ['Explain conservation', 'Suggest actions'], count: 17, tags: ['environment'] },
        ]},
      ],
    },
    6: {
      title: 'NSO Grade 6 Syllabus',
      description: 'Grade 6 science: matter, force, light, sound, energy, earth, space, body systems.',
      topics: [
        { name: 'Matter', desc: 'Atoms and molecules intro.', weightage: 'high', count: 50, subtopics: [
          { name: 'Structure of Matter', desc: 'Elements and compounds.', objectives: ['Describe matter structure', 'Identify elements'], count: 25, tags: ['matter'] },
          { name: 'Changes in Matter', desc: 'Physical and chemical.', objectives: ['Distinguish changes', 'Balance equations basics'], count: 25, tags: ['matter'] },
        ]},
        { name: 'Force and Motion', desc: 'Laws of motion basics.', weightage: 'medium', count: 45, subtopics: [
          { name: 'Motion', desc: 'Speed, velocity, acceleration.', objectives: ['Calculate speed', 'Describe motion types'], count: 22, tags: ['motion'] },
          { name: 'Forces', desc: 'Newton laws intro.', objectives: ['State Newton laws', 'Apply to examples'], count: 23, tags: ['force'] },
        ]},
        { name: 'Light, Sound, and Energy', desc: 'Waves and energy.', weightage: 'medium', count: 45, subtopics: [
          { name: 'Light and Sound', desc: 'Wave properties.', objectives: ['Describe wave properties', 'Explain reflection/refraction'], count: 22, tags: ['light', 'sound'] },
          { name: 'Energy', desc: 'Forms and conservation.', objectives: ['Explain energy conservation', 'Describe conversions'], count: 23, tags: ['energy'] },
        ]},
        { name: 'Earth and Space', desc: 'Earth science.', weightage: 'medium', count: 45, subtopics: [
          { name: 'Earth', desc: 'Structure and processes.', objectives: ['Describe Earth structure', 'Explain plate tectonics basics'], count: 22, tags: ['earth'] },
          { name: 'Space', desc: 'Universe basics.', objectives: ['Describe solar system', 'Explain astronomical phenomena'], count: 23, tags: ['space'] },
        ]},
        { name: 'Living World', desc: 'Cells and organisms.', weightage: 'high', count: 55, subtopics: [
          { name: 'Cell Basics', desc: 'Cell structure and function.', objectives: ['Describe cell structure', 'Compare plant/animal cells'], count: 28, tags: ['cells'] },
          { name: 'Body Systems', desc: 'Organ systems.', objectives: ['Describe organ systems', 'Explain coordination'], count: 27, tags: ['body'] },
        ]},
        { name: 'Environment', desc: 'Ecology basics.', weightage: 'medium', count: 35, subtopics: [
          { name: 'Ecology', desc: 'Ecosystems and biodiversity.', objectives: ['Describe ecosystems', 'Explain biodiversity'], count: 18, tags: ['environment'] },
          { name: 'Conservation', desc: 'Environmental protection.', objectives: ['Explain conservation', 'Discuss sustainability'], count: 17, tags: ['environment'] },
        ]},
      ],
    },
  },
};

// Grades 7-12 for NSO - add structured content
for (let g = 7; g <= 12; g++) {
  if (!content.nso[g]) {
    content.nso[g] = getNSOGradeContent(g);
  }
}

function getNSOGradeContent(grade) {
  const level = grade <= 9 ? 'basics' : 'advanced';
  const depth = grade <= 6 ? 'intro' : grade <= 9 ? 'intermediate' : 'advanced';
  return {
    title: `NSO Grade ${grade} Syllabus`,
    description: `Grade ${grade} science: ${level} physics, chemistry, biology, ${depth} concepts.`,
    topics: [
      { name: 'Physics Basics', desc: 'Motion, force, energy.', weightage: 'high', count: 50, subtopics: [
        { name: grade <= 9 ? 'Motion and Force' : 'Mechanics', desc: 'Physics concepts.', objectives: ['Apply physics principles', 'Solve problems'], count: 25, tags: ['physics'] },
        { name: grade <= 9 ? 'Heat and Electricity' : 'Waves and Energy', desc: 'Energy forms.', objectives: ['Explain concepts', 'Apply to situations'], count: 25, tags: ['physics'] },
      ]},
      { name: 'Chemistry Basics', desc: 'Matter and reactions.', weightage: 'high', count: 50, subtopics: [
        { name: 'Matter and Changes', desc: 'Chemical concepts.', objectives: ['Describe reactions', 'Balance equations'], count: 25, tags: ['chemistry'] },
        { name: 'Acids, Bases, and Salts', desc: 'Chemical properties.', objectives: ['Identify types', 'Explain properties'], count: 25, tags: ['chemistry'] },
      ]},
      { name: 'Biology Basics', desc: 'Life sciences.', weightage: 'high', count: 55, subtopics: [
        { name: 'Cells and Organisms', desc: 'Life processes.', objectives: ['Describe cell biology', 'Explain life processes'], count: 28, tags: ['biology'] },
        { name: 'Human Body and Health', desc: 'Body systems.', objectives: ['Describe systems', 'Explain health'], count: 27, tags: ['biology'] },
      ]},
      { name: 'Earth and Environment', desc: 'Earth science.', weightage: 'medium', count: 40, subtopics: [
        { name: 'Earth Science', desc: 'Earth processes.', objectives: ['Describe Earth systems', 'Explain phenomena'], count: 20, tags: ['earth'] },
        { name: 'Environment', desc: 'Ecology and conservation.', objectives: ['Explain ecology', 'Discuss conservation'], count: 20, tags: ['environment'] },
      ]},
      ...(grade >= 10 ? [{ name: 'Scientific Reasoning', desc: 'Experimental thinking.', weightage: 'medium', count: 35, subtopics: [
        { name: 'Experimental Design', desc: 'Scientific method.', objectives: ['Design experiments', 'Analyze data'], count: 18, tags: ['reasoning'] },
        { name: 'Olympiad Application', desc: 'Advanced problem solving.', objectives: ['Apply concepts', 'Solve Olympiad-style problems'], count: 17, tags: ['olympiad'] },
      ]}] : []),
    ].filter(Boolean),
  };
}

// IMO content
content.imo = {};
for (let g = 1; g <= 12; g++) {
  content.imo[g] = getIMOGradeContent(g);
}

function getIMOGradeContent(grade) {
  const level = grade <= 3 ? 'basic' : grade <= 6 ? 'intermediate' : grade <= 9 ? 'advanced' : 'olympiad';
  const topics = [];
  if (grade <= 3) {
    topics.push(
      { name: 'Numbers', desc: 'Number sense and counting.', weightage: 'high', count: 45, subtopics: [
        { name: 'Counting and Numbers', desc: 'Number recognition.', objectives: ['Count objects', 'Read and write numbers'], count: 22, tags: ['numbers'] },
        { name: 'Number Operations', desc: 'Basic operations.', objectives: ['Add and subtract', 'Solve word problems'], count: 23, tags: ['numbers'] },
      ]},
      { name: 'Addition and Subtraction', desc: 'Basic operations.', weightage: 'high', count: 50, subtopics: [
        { name: 'Addition', desc: 'Adding numbers.', objectives: ['Add within 100', 'Solve addition problems'], count: 25, tags: ['addition'] },
        { name: 'Subtraction', desc: 'Subtracting numbers.', objectives: ['Subtract within 100', 'Solve subtraction problems'], count: 25, tags: ['subtraction'] },
      ]},
      { name: 'Patterns', desc: 'Number and shape patterns.', weightage: 'medium', count: 30, subtopics: [
        { name: 'Number Patterns', desc: 'Sequences.', objectives: ['Identify patterns', 'Extend sequences'], count: 15, tags: ['patterns'] },
        { name: 'Shape Patterns', desc: 'Visual patterns.', objectives: ['Identify shape patterns', 'Complete patterns'], count: 15, tags: ['patterns'] },
      ]},
      { name: 'Shapes', desc: 'Basic geometry.', weightage: 'medium', count: 35, subtopics: [
        { name: '2D Shapes', desc: 'Circles, squares, triangles.', objectives: ['Identify shapes', 'Count sides and corners'], count: 18, tags: ['shapes'] },
        { name: '3D Shapes', desc: 'Cubes, spheres.', objectives: ['Identify 3D shapes', 'Describe properties'], count: 17, tags: ['shapes'] },
      ]},
      { name: 'Time and Money', desc: 'Practical math.', weightage: 'medium', count: 35, subtopics: [
        { name: 'Time', desc: 'Hours and minutes.', objectives: ['Tell time', 'Describe daily schedule'], count: 18, tags: ['time'] },
        { name: 'Money', desc: 'Coins and notes.', objectives: ['Identify money', 'Count money'], count: 17, tags: ['money'] },
      ]},
      { name: 'Simple Reasoning', desc: 'Logical thinking.', weightage: 'low', count: 15, subtopics: [
        { name: 'Logical Reasoning', desc: 'Simple logic.', objectives: ['Solve simple puzzles', 'Identify relationships'], count: 15, tags: ['reasoning'] },
      ]}
    );
  } else if (grade <= 6) {
    topics.push(
      { name: 'Numbers and Operations', desc: 'Place value, operations.', weightage: 'high', count: 50, subtopics: [
        { name: 'Place Value', desc: 'Understanding place value.', objectives: ['Read large numbers', 'Compare numbers'], count: 25, tags: ['numbers'] },
        { name: 'Operations', desc: 'Multiplication and division.', objectives: ['Multiply and divide', 'Solve multi-step problems'], count: 25, tags: ['operations'] },
      ]},
      { name: 'Fractions and Decimals', desc: 'Rational numbers.', weightage: 'high', count: 50, subtopics: [
        { name: 'Fractions', desc: 'Understanding fractions.', objectives: ['Compare fractions', 'Add/subtract fractions'], count: 25, tags: ['fractions'] },
        { name: 'Decimals', desc: 'Decimal operations.', objectives: ['Convert fractions to decimals', 'Operate with decimals'], count: 25, tags: ['decimals'] },
      ]},
      { name: 'Measurement', desc: 'Length, weight, capacity.', weightage: 'medium', count: 40, subtopics: [
        { name: 'Units', desc: 'Metric units.', objectives: ['Convert units', 'Solve measurement problems'], count: 20, tags: ['measurement'] },
        { name: 'Perimeter and Area', desc: 'Basic geometry.', objectives: ['Calculate perimeter', 'Calculate area'], count: 20, tags: ['measurement'] },
      ]},
      { name: 'Geometry', desc: 'Shapes and properties.', weightage: 'medium', count: 45, subtopics: [
        { name: '2D and 3D Shapes', desc: 'Geometric properties.', objectives: ['Identify properties', 'Calculate angles basics'], count: 22, tags: ['geometry'] },
        { name: 'Symmetry', desc: 'Line symmetry.', objectives: ['Identify symmetry', 'Draw symmetric figures'], count: 23, tags: ['geometry'] },
      ]},
      { name: 'Data Handling', desc: 'Graphs and charts.', weightage: 'medium', count: 35, subtopics: [
        { name: 'Data Representation', desc: 'Bar graphs, charts.', objectives: ['Read graphs', 'Interpret data'], count: 18, tags: ['data'] },
        { name: 'Averages', desc: 'Mean, median.', objectives: ['Calculate average', 'Interpret data'], count: 17, tags: ['data'] },
      ]},
      { name: 'Logical Reasoning', desc: 'Problem solving.', weightage: 'medium', count: 40, subtopics: [
        { name: 'Patterns', desc: 'Number and shape patterns.', objectives: ['Identify patterns', 'Extend sequences'], count: 20, tags: ['reasoning'] },
        { name: 'Logical Problems', desc: 'Logic puzzles.', objectives: ['Solve logic problems', 'Apply reasoning'], count: 20, tags: ['reasoning'] },
      ]}
    );
  } else if (grade <= 9) {
    topics.push(
      { name: 'Algebra', desc: 'Algebraic expressions.', weightage: 'high', count: 55, subtopics: [
        { name: 'Expressions and Equations', desc: 'Basic algebra.', objectives: ['Simplify expressions', 'Solve equations'], count: 28, tags: ['algebra'] },
        { name: 'Linear Equations', desc: 'One variable.', objectives: ['Solve linear equations', 'Solve word problems'], count: 27, tags: ['algebra'] },
      ]},
      { name: 'Number System', desc: 'Integers, rationals.', weightage: 'high', count: 50, subtopics: [
        { name: 'Integers', desc: 'Integer operations.', objectives: ['Operate with integers', 'Apply properties'], count: 25, tags: ['numbers'] },
        { name: 'Rational Numbers', desc: 'Rational operations.', objectives: ['Operate with rationals', 'Convert forms'], count: 25, tags: ['numbers'] },
      ]},
      { name: 'Percentages and Ratios', desc: 'Proportional reasoning.', weightage: 'medium', count: 45, subtopics: [
        { name: 'Percentages', desc: 'Percentage calculations.', objectives: ['Calculate percentages', 'Solve problems'], count: 22, tags: ['percentages'] },
        { name: 'Ratios', desc: 'Ratio and proportion.', objectives: ['Simplify ratios', 'Solve proportion problems'], count: 23, tags: ['ratios'] },
      ]},
      { name: 'Geometry', desc: 'Angles, triangles, circles.', weightage: 'high', count: 55, subtopics: [
        { name: 'Angles and Lines', desc: 'Geometric properties.', objectives: ['Calculate angles', 'Apply properties'], count: 28, tags: ['geometry'] },
        { name: 'Triangles and Circles', desc: 'Shape properties.', objectives: ['Apply theorems', 'Solve problems'], count: 27, tags: ['geometry'] },
      ]},
      { name: 'Mensuration', desc: 'Area and volume.', weightage: 'medium', count: 40, subtopics: [
        { name: 'Area', desc: 'Area of shapes.', objectives: ['Calculate areas', 'Solve problems'], count: 20, tags: ['mensuration'] },
        { name: 'Volume', desc: 'Volume of solids.', objectives: ['Calculate volumes', 'Apply formulas'], count: 20, tags: ['mensuration'] },
      ]},
      { name: 'Data and Probability', desc: 'Statistics and probability.', weightage: 'medium', count: 40, subtopics: [
        { name: 'Data Interpretation', desc: 'Graphs and statistics.', objectives: ['Interpret data', 'Calculate statistics'], count: 20, tags: ['data'] },
        { name: 'Probability Basics', desc: 'Simple probability.', objectives: ['Calculate probability', 'Solve problems'], count: 20, tags: ['probability'] },
      ]},
      { name: 'Reasoning', desc: 'Mathematical reasoning.', weightage: 'medium', count: 35, subtopics: [
        { name: 'Logical Reasoning', desc: 'Logic and proof.', objectives: ['Apply logic', 'Construct arguments'], count: 18, tags: ['reasoning'] },
        { name: 'Problem Solving', desc: 'Multi-step problems.', objectives: ['Solve complex problems', 'Apply strategies'], count: 17, tags: ['reasoning'] },
      ]}
    );
  } else {
    topics.push(
      { name: 'Algebra', desc: 'Advanced algebra.', weightage: 'high', count: 55, subtopics: [
        { name: 'Polynomials', desc: 'Polynomial operations.', objectives: ['Factor polynomials', 'Solve equations'], count: 28, tags: ['algebra'] },
        { name: 'Quadratic Equations', desc: 'Solving quadratics.', objectives: ['Solve quadratics', 'Apply to problems'], count: 27, tags: ['algebra'] },
      ]},
      { name: 'Trigonometry', desc: 'Trigonometric functions.', weightage: 'high', count: 50, subtopics: [
        { name: 'Trig Ratios', desc: 'Sin, cos, tan.', objectives: ['Apply trig ratios', 'Solve triangles'], count: 25, tags: ['trigonometry'] },
        { name: 'Trig Identities', desc: 'Identities and equations.', objectives: ['Prove identities', 'Solve equations'], count: 25, tags: ['trigonometry'] },
      ]},
      { name: 'Coordinate Geometry', desc: 'Plane geometry.', weightage: 'high', count: 50, subtopics: [
        { name: 'Lines', desc: 'Line equations.', objectives: ['Find equation of line', 'Solve problems'], count: 25, tags: ['coordinate'] },
        { name: 'Circles', desc: 'Circle equations.', objectives: ['Find circle equation', 'Solve problems'], count: 25, tags: ['coordinate'] },
      ]},
      { name: 'Probability', desc: 'Advanced probability.', weightage: 'medium', count: 40, subtopics: [
        { name: 'Probability', desc: 'Advanced probability.', objectives: ['Calculate probability', 'Apply concepts'], count: 20, tags: ['probability'] },
        { name: 'Permutations', desc: 'Counting and arrangements.', objectives: ['Apply counting principles', 'Solve problems'], count: 20, tags: ['probability'] },
      ]},
      { name: 'Advanced Geometry', desc: 'Geometric properties.', weightage: 'high', count: 50, subtopics: [
        { name: 'Triangles', desc: 'Triangles and properties.', objectives: ['Apply theorems', 'Solve problems'], count: 25, tags: ['geometry'] },
        { name: 'Circles', desc: 'Circle theorems.', objectives: ['Apply circle theorems', 'Solve problems'], count: 25, tags: ['geometry'] },
      ]},
      { name: 'Calculus Basics', desc: 'Introduction to calculus.', weightage: 'medium', count: 40, subtopics: [
        { name: 'Limits', desc: 'Limit concepts.', objectives: ['Evaluate limits', 'Apply limit rules'], count: 20, tags: ['calculus'] },
        { name: 'Derivatives', desc: 'Basic differentiation.', objectives: ['Find derivatives', 'Apply to problems'], count: 20, tags: ['calculus'] },
      ]},
      { name: 'Olympiad Reasoning', desc: 'Olympiad-style problems.', weightage: 'high', count: 45, subtopics: [
        { name: 'Number Theory', desc: 'Number theory basics.', objectives: ['Apply number theory', 'Solve problems'], count: 22, tags: ['olympiad'] },
        { name: 'Combinatorics', desc: 'Counting and arrangements.', objectives: ['Apply combinatorics', 'Solve problems'], count: 23, tags: ['olympiad'] },
      ]}
    );
  }
  return { title: `IMO Grade ${grade} Syllabus`, description: `Grade ${grade} mathematics: ${level} topics.`, topics };
}

// IEO, ICS, IGKO, ISSO - add content for grades 1-12
['ieo', 'ics', 'igko', 'isso'].forEach((exam) => {
  content[exam] = content[exam] || {};
  for (let g = 1; g <= 12; g++) {
    if (!content[exam][g]) {
      content[exam][g] = getGenericExamContent(exam, g);
    }
  }
});

function getGenericExamContent(exam, grade) {
  const examNames = { ieo: 'English', ics: 'Computer Science', igko: 'General Knowledge', isso: 'Social Studies' };
  const examTopics = {
    ieo: { 1: ['Vocabulary', 'Simple Grammar', 'Sentence Formation', 'Spelling', 'Everyday English'], 4: ['Nouns', 'Pronouns', 'Verbs', 'Adjectives', 'Tenses', 'Comprehension'], 7: ['Grammar', 'Vocabulary', 'Comprehension', 'Idioms', 'Writing'], 10: ['Advanced Grammar', 'Comprehension', 'Critical Reading', 'Contextual Usage'] },
    ics: { 1: ['Parts of Computer', 'Uses', 'Input/Output', 'Keyboard/Mouse'], 4: ['Hardware', 'Software', 'Storage', 'Internet', 'Safety'], 7: ['OS', 'Applications', 'Internet', 'Digital Citizenship', 'Coding'], 10: ['Programming', 'Networks', 'Data', 'Cyber Safety'] },
    igko: { 1: ['India', 'World', 'Countries', 'Monuments', 'Environment', 'Sports', 'Personalities', 'Science', 'Important Days', 'Symbols'] },
    isso: { 1: ['Directions', 'Maps', 'Earth', 'Weather', 'Environment', 'Landforms', 'Family'], 4: ['Geography', 'Civics', 'History', 'Continents', 'India', 'Resources'], 7: ['Geography', 'History', 'Civics', 'Resources', 'Government', 'Climate'], 10: ['Advanced History', 'Civics', 'Geography', 'Economy', 'Society'] },
  };
  const tier = grade <= 3 ? 1 : grade <= 6 ? 4 : grade <= 9 ? 7 : 10;
  const topicList = examTopics[exam][tier] || examTopics[exam][1] || ['General'];
  const topics = topicList.map((name, i) => ({
    name,
    desc: `${name} for Grade ${grade}.`,
    weightage: i < 2 ? 'high' : i < 4 ? 'medium' : 'low',
    count: Math.max(15, 40 - i * 3),
    subtopics: [
      { name: `${name} Basics`, desc: 'Fundamental concepts.', objectives: ['Understand concepts', 'Apply knowledge'], count: 15, tags: [name.toLowerCase(), exam] },
      { name: `${name} Application`, desc: 'Applying concepts.', objectives: ['Apply concepts', 'Solve problems'], count: 15, tags: [name.toLowerCase(), exam] },
    ],
  }));
  return { title: `${examNames[exam]} Grade ${grade} Syllabus`, description: `Grade ${grade} ${examNames[exam].toLowerCase()}.`, topics };
}

export function getSyllabusContent(exam, grade) {
  return content[exam]?.[grade] || null;
}
