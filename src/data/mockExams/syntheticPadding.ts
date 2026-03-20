/**
 * Deterministic supplemental / full-set MCQs so every mock can ship with exactly 25 questions.
 * Content is syllabus-appropriate (no lorem); varied by grade, set, and index.
 * Facts are drawn without replacement within each batch to avoid duplicate stems on the same paper.
 */

import type { OlympiadCode, Question } from '../olympiadContent.js';
import { mcq } from './mockExamFactories.js';

/** Mix index with grade/set for pseudo-random but stable values */
function seed(grade: number, set: number, i: number): number {
  return (grade * 97 + set * 17 + i * 31) % 1000;
}

/** Deterministic distinct indices in [0, poolSize) for one padding/synthetic batch. */
/** Unique addend pairs (a ≠ b); 25 consecutive picks stay prompt-unique within one exam. */
const IMO_ADD_PAIRS: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let a = 2; a <= 12; a++)
    for (let b = 2; b <= 12; b++) if (a !== b) out.push([a, b]);
  return out;
})();

const IMO_RECT_PAIRS: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let l = 3; l <= 12; l++)
    for (let w = 3; w <= 12; w++) out.push([l, w]);
  return out;
})();

function pickDistinctIndices(
  poolSize: number,
  count: number,
  grade: number,
  set: number,
  baseIndex: number,
): number[] {
  if (poolSize <= 0 || count <= 0) return [];
  const used = new Set<number>();
  const out: number[] = [];
  let h = (grade * 1009 + set * 503 + baseIndex * 997) % 1000003;
  for (let k = 0; k < count; k++) {
    let idx = h % poolSize;
    let hops = 0;
    while (used.has(idx) && hops < poolSize) {
      idx = (idx + 1) % poolSize;
      hops++;
    }
    if (used.has(idx)) {
      idx = (baseIndex * 17 + k * 23 + grade + set) % poolSize;
      while (used.has(idx)) idx = (idx + 1) % poolSize;
    }
    used.add(idx);
    out.push(idx);
    h = (h * 31 + k * 13 + grade * 7 + set) % 1000003;
  }
  return out;
}

const IGKO_FACTS: Array<{
  prompt: string;
  options: [string, string, string, string];
  correct: string;
  explanation: string;
  topic: string;
}> = [
  {
    prompt: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correct: 'Mars',
    explanation: 'Iron oxide on the surface gives Mars a reddish appearance.',
    topic: 'Science and Technology',
  },
  {
    prompt: 'The national animal of India is most commonly cited as:',
    options: ['Lion', 'Bengal Tiger', 'Elephant', 'Peacock'],
    correct: 'Bengal Tiger',
    explanation: 'The Bengal Tiger is a national symbol of India’s wildlife heritage.',
    topic: 'India and the World',
  },
  {
    prompt: 'Water boils at 100°C at standard atmospheric pressure on which scale?',
    options: ['Fahrenheit only', 'Celsius', 'Kelvin only', 'Rankine'],
    correct: 'Celsius',
    explanation: 'On the Celsius scale, pure water boils near 100 °C at 1 atm.',
    topic: 'Science and Technology',
  },
  {
    prompt: 'Which gas do animals take in for respiration?',
    options: ['Carbon dioxide', 'Oxygen', 'Helium', 'Neon'],
    correct: 'Oxygen',
    explanation: 'Cellular respiration uses oxygen to release energy.',
    topic: 'Plants and Animals',
  },
  {
    prompt: 'The smallest continent by land area is:',
    options: ['Europe', 'Australia', 'Antarctica', 'South America'],
    correct: 'Australia',
    explanation: 'Australia is the smallest continent in typical geography syllabi.',
    topic: 'India and the World',
  },
  {
    prompt: 'Photosynthesis mainly occurs in which part of a plant?',
    options: ['Roots', 'Leaves', 'Stem only', 'Flowers only'],
    correct: 'Leaves',
    explanation: 'Chloroplast-rich leaf cells host most photosynthesis.',
    topic: 'Plants and Animals',
  },
  {
    prompt: 'Which festival is widely known as the “Festival of Lights” in India?',
    options: ['Holi', 'Diwali', 'Onam', 'Pongal'],
    correct: 'Diwali',
    explanation: 'Diwali celebrates light over darkness across many traditions.',
    topic: 'India and the World',
  },
  {
    prompt: 'Indian Railways passenger branding often highlights:',
    options: ['Blue coach imagery', 'Only red text', 'Green triangles', 'Purple stripes'],
    correct: 'Blue coach imagery',
    explanation: 'Indian Railways marketing frequently uses blue coach motifs.',
    topic: 'Transport and Communication',
  },
  {
    prompt: 'UNESCO primarily works to protect:',
    options: ['Only trade routes', 'World heritage and education', 'Military bases', 'Stock markets'],
    correct: 'World heritage and education',
    explanation: 'UNESCO promotes education, science, culture, and heritage sites.',
    topic: 'India and the World',
  },
  {
    prompt: 'Recycling paper mainly helps to:',
    options: ['Increase logging', 'Reduce landfill waste', 'Remove oxygen', 'Stop rain'],
    correct: 'Reduce landfill waste',
    explanation: 'Recycling reduces virgin pulp demand and landfill burden.',
    topic: 'Environment and its Conservation',
  },
  {
    prompt: 'The capital of France is:',
    options: ['Berlin', 'Paris', 'Madrid', 'Rome'],
    correct: 'Paris',
    explanation: 'Paris is the capital and largest city of France.',
    topic: 'India and the World',
  },
  {
    prompt: 'Which is a renewable energy source?',
    options: ['Coal', 'Solar', 'Petroleum', 'Natural gas'],
    correct: 'Solar',
    explanation: 'Sunlight is replenished naturally and is treated as renewable.',
    topic: 'Environment and its Conservation',
  },
  {
    prompt: 'The largest ocean on Earth is:',
    options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'],
    correct: 'Pacific',
    explanation: 'The Pacific Ocean covers the greatest area.',
    topic: 'India and the World',
  },
  {
    prompt: 'Which instrument measures earthquakes?',
    options: ['Barometer', 'Seismograph', 'Thermometer', 'Hygrometer'],
    correct: 'Seismograph',
    explanation: 'Seismographs record ground vibrations from seismic waves.',
    topic: 'Science and Technology',
  },
  {
    prompt: 'The study of heredity and variation is called:',
    options: ['Ecology', 'Genetics', 'Geology', 'Astronomy'],
    correct: 'Genetics',
    explanation: 'Genetics deals with inheritance of traits.',
    topic: 'Science and Technology',
  },
  {
    prompt: 'Which planet has the most moons among the listed options (popular science context)?',
    options: ['Mercury', 'Jupiter', 'Venus', 'Mars'],
    correct: 'Jupiter',
    explanation: 'Jupiter hosts a very large number of known moons.',
    topic: 'Science and Technology',
  },
  {
    prompt: 'Greenhouse gases contribute mainly to:',
    options: ['Tidal locking', 'Global warming', 'Lunar phases', 'Thunder only'],
    correct: 'Global warming',
    explanation: 'They trap infrared heat and strengthen the greenhouse effect.',
    topic: 'Environment and its Conservation',
  },
  {
    prompt: 'The national flower of India is:',
    options: ['Rose', 'Lotus', 'Sunflower', 'Marigold'],
    correct: 'Lotus',
    explanation: 'The lotus is widely recognised as India’s national flower.',
    topic: 'India and the World',
  },
  {
    prompt: 'Which organ helps digest food using enzymes and acid?',
    options: ['Heart', 'Stomach', 'Lungs', 'Brain'],
    correct: 'Stomach',
    explanation: 'The stomach secretes acid and enzymes to begin digestion.',
    topic: 'Our Body and Health',
  },
  {
    prompt: 'Voting in a democracy is primarily a:',
    options: ['Hobby', 'Right and duty', 'Crime', 'Entertainment licence'],
    correct: 'Right and duty',
    explanation: 'Citizens participate in governance through elections.',
    topic: 'Current Affairs',
  },
  {
    prompt: 'A compass needle points roughly toward:',
    options: ['Geographic east', 'Magnetic north', 'West only', 'Zenith'],
    correct: 'Magnetic north',
    explanation: 'Earth’s magnetic field aligns the needle along field lines.',
    topic: 'Science and Technology',
  },
  {
    prompt: 'Which gas makes up most of clean dry air by volume?',
    options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Argon'],
    correct: 'Nitrogen',
    explanation: 'Roughly four-fifths of the atmosphere is nitrogen.',
    topic: 'Science and Technology',
  },
  {
    prompt: 'The “Ship of the Desert” usually refers to:',
    options: ['Elephant', 'Camel', 'Horse', 'Ox'],
    correct: 'Camel',
    explanation: 'Camels are adapted for arid travel with fat stores and water-saving traits.',
    topic: 'Plants and Animals',
  },
  {
    prompt: 'Red-data conservation lists highlight:',
    options: ['Sports scores', 'Threatened species', 'Movie ratings', 'Stock prices'],
    correct: 'Threatened species',
    explanation: 'The IUCN Red List classifies extinction risk for species.',
    topic: 'Environment and its Conservation',
  },
  {
    prompt: 'The hardest natural mineral on Mohs scale is:',
    options: ['Quartz', 'Diamond', 'Talc', 'Gypsum'],
    correct: 'Diamond',
    explanation: 'Diamond ranks 10 on the Mohs hardness scale.',
    topic: 'Science and Technology',
  },
  {
    prompt: 'Which latitude is called the Tropic of Cancer?',
    options: ['0°', '23.5° N', '23.5° S', '66.5° N'],
    correct: '23.5° N',
    explanation: 'The Tropic of Cancer lies near 23.5° north.',
    topic: 'India and the World',
  },
  {
    prompt: 'First aid for a small cut often starts with:',
    options: ['Ignore it', 'Clean and cover', 'Pour hot oil', 'Rub dirt'],
    correct: 'Clean and cover',
    explanation: 'Cleaning reduces infection risk; covering protects healing.',
    topic: 'Life Skills',
  },
  {
    prompt: 'Email phishing tries to steal:',
    options: ['Physical coins only', 'Passwords or data', 'Cloud colour', 'Gravity'],
    correct: 'Passwords or data',
    explanation: 'Phishers impersonate trusted senders to harvest credentials.',
    topic: 'Life Skills',
  },
  {
    prompt: 'The Parliament of India meets in:',
    options: ['Mumbai only', 'New Delhi', 'Kolkata only', 'Chennai only'],
    correct: 'New Delhi',
    explanation: 'Central legislative buildings are in New Delhi.',
    topic: 'India and the World',
  },
  {
    prompt: 'A cyclist wearing a helmet mainly reduces risk of:',
    options: ['Leg cramps', 'Head injury', 'Sunburn on tyres', 'None'],
    correct: 'Head injury',
    explanation: 'Helmets absorb impact energy in falls or collisions.',
    topic: 'Life Skills',
  },
  {
    prompt: 'Deforestation can lead to:',
    options: ['More stable soil always', 'Habitat loss and erosion', 'Automatic reforestation overnight', 'No change'],
    correct: 'Habitat loss and erosion',
    explanation: 'Removing trees exposes soil and removes wildlife homes.',
    topic: 'Environment and its Conservation',
  },
  {
    prompt: 'The speed of sound is generally fastest in:',
    options: ['Vacuum', 'Air', 'Steel (solid)', 'Outer space void'],
    correct: 'Steel (solid)',
    explanation: 'Sound travels faster in denser elastic solids than in air.',
    topic: 'Science and Technology',
  },
  {
    prompt: 'Which Indian monument is an ivory-white marble mausoleum at Agra?',
    options: ['Red Fort', 'Taj Mahal', 'Gateway of India', 'Charminar'],
    correct: 'Taj Mahal',
    explanation: 'The Taj Mahal is a UNESCO World Heritage marble mausoleum.',
    topic: 'India and the World',
  },
  {
    prompt: 'Braille helps people with:',
    options: ['Hearing impairment primarily', 'Visual impairment', 'Only taste loss', 'Only smell loss'],
    correct: 'Visual impairment',
    explanation: 'Raised dots encode letters and numbers for tactile reading.',
    topic: 'Science and Technology',
  },
  {
    prompt: 'Crop rotation mainly helps farmers by:',
    options: ['Stopping rain', 'Maintaining soil health', 'Removing gravity', 'Eliminating seeds'],
    correct: 'Maintaining soil health',
    explanation: 'Different crops use and replenish nutrients differently.',
    topic: 'Current Affairs',
  },
  {
    prompt: 'The longest river in the world by common textbook listings is:',
    options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
    correct: 'Nile',
    explanation: 'The Nile is traditionally cited as the longest river.',
    topic: 'India and the World',
  },
  {
    prompt: 'A healthy balanced plate emphasises:',
    options: ['Only sugar', 'Variety of food groups', 'Only fried snacks', 'Skipping water'],
    correct: 'Variety of food groups',
    explanation: 'Diverse grains, pulses, vegetables, and fruits support nutrition.',
    topic: 'Our Body and Health',
  },
];

const NSO_FACTS: Array<{
  prompt: string;
  options: [string, string, string, string];
  correct: string;
  explanation: string;
  topic: string;
}> = [
  {
    prompt: 'The basic unit of life is:',
    options: ['Tissue', 'Cell', 'Organ', 'Atom'],
    correct: 'Cell',
    explanation: 'Cells are the smallest structural and functional units of living organisms.',
    topic: 'The World of Living (Parts of Plants, Grouping of Plants and Animals, Adaptations in Plants and Animals, Characteristics of Living Beings, Life Cycle of Plants and Animals)',
  },
  {
    prompt: 'Which state of matter has definite volume but takes the shape of its container?',
    options: ['Solid', 'Liquid', 'Gas', 'Plasma'],
    correct: 'Liquid',
    explanation: 'Liquids flow to fill container shape while keeping nearly constant volume.',
    topic: 'Matter and Materials',
  },
  {
    prompt: 'During photosynthesis plants mainly release:',
    options: ['Nitrogen', 'Oxygen', 'Methane', 'Helium'],
    correct: 'Oxygen',
    explanation: 'Light-driven water splitting liberates oxygen as a by-product.',
    topic: 'Plants',
  },
  {
    prompt: 'Frictional force generally acts:',
    options: ['Only upward', 'Opposite to the direction of motion', 'Always forward', 'Perpendicular only'],
    correct: 'Opposite to the direction of motion',
    explanation: 'Kinetic friction opposes relative sliding motion.',
    topic: 'Force and Energy',
  },
  {
    prompt: 'The human digestive system breaks down food mainly to absorb:',
    options: ['Only fibre', 'Nutrients', 'Only air', 'Plastic'],
    correct: 'Nutrients',
    explanation: 'Digestion releases absorbable nutrients into the bloodstream.',
    topic: 'Human Body and Health',
  },
  {
    prompt: 'Which blood cells fight infection?',
    options: ['Red blood cells', 'White blood cells', 'Platelets only', 'Plasma only'],
    correct: 'White blood cells',
    explanation: 'Leukocytes are key players in the immune response.',
    topic: 'Human Body and Health',
  },
  {
    prompt: 'Sound cannot travel through:',
    options: ['Water', 'Steel', 'Vacuum', 'Air'],
    correct: 'Vacuum',
    explanation: 'Mechanical waves need a material medium.',
    topic: 'Force and Energy',
  },
  {
    prompt: 'Mirrors form images mainly by:',
    options: ['Absorption only', 'Reflection', 'Radioactive decay', 'Boiling'],
    correct: 'Reflection',
    explanation: 'Smooth surfaces reflect light rays in predictable ways.',
    topic: 'Natural Resources and Indian Heritage',
  },
  {
    prompt: 'Antibiotics are generally ineffective against:',
    options: ['Bacteria', 'Viruses', 'Fungi only when prescribed wrong', 'Protozoa always'],
    correct: 'Viruses',
    explanation: 'Common antibiotics target bacterial cell walls, not viral replication.',
    topic: 'Human Body and Health',
  },
  {
    prompt: 'The centre of an atom is called the:',
    options: ['Electron shell', 'Nucleus', 'Ion only', 'Bond'],
    correct: 'Nucleus',
    explanation: 'Protons and neutrons reside in the dense central nucleus.',
    topic: 'Matter and Materials',
  },
  {
    prompt: 'Which process changes liquid to gas at the surface without boiling?',
    options: ['Condensation', 'Evaporation', 'Freezing', 'Deposition'],
    correct: 'Evaporation',
    explanation: 'Molecules escape the liquid surface into vapour phase.',
    topic: 'Matter and Materials',
  },
  {
    prompt: 'The SI unit of electric current is:',
    options: ['Volt', 'Ampere', 'Ohm', 'Coulomb'],
    correct: 'Ampere',
    explanation: 'Current is measured in amperes (A).',
    topic: 'Force and Energy',
  },
  {
    prompt: 'Which organ removes urea from blood?',
    options: ['Liver', 'Kidney', 'Lungs', 'Skin only'],
    correct: 'Kidney',
    explanation: 'Nephrons filter wastes forming urine.',
    topic: 'Human Body and Health',
  },
  {
    prompt: 'A simple machine that reduces effort over distance is a:',
    options: ['Lever', 'Battery', 'Magnet pole', 'Lens eyelid'],
    correct: 'Lever',
    explanation: 'Levers trade force for distance using a fulcrum.',
    topic: 'Force and Energy',
  },
  {
    prompt: 'Which gas is most responsible for the fizzy sensation in soft drinks?',
    options: ['Nitrogen', 'Carbon dioxide', 'Helium', 'Argon'],
    correct: 'Carbon dioxide',
    explanation: 'Dissolved CO₂ forms weak carbonic acid and bubbles.',
    topic: 'Matter and Materials',
  },
  {
    prompt: 'The process by which plants lose water vapour through stomata is:',
    options: ['Respiration', 'Transpiration', 'Fermentation', 'Digestion'],
    correct: 'Transpiration',
    explanation: 'Stomata open for gas exchange and release water vapour.',
    topic: 'Plants',
  },
  {
    prompt: 'Which part of the eye adjusts the amount of light entering?',
    options: ['Retina', 'Iris', 'Optic nerve', 'Sclera'],
    correct: 'Iris',
    explanation: 'The iris changes pupil aperture size.',
    topic: 'Human Body and Health',
  },
  {
    prompt: 'A food chain always starts with:',
    options: ['Carnivore', 'Producer', 'Decomposer only', 'Omnivore always'],
    correct: 'Producer',
    explanation: 'Autotrophs capture energy for the rest of the chain.',
    topic: 'Animals',
  },
  {
    prompt: 'Which planet is known as the morning star when seen before sunrise?',
    options: ['Mars', 'Venus', 'Saturn', 'Neptune'],
    correct: 'Venus',
    explanation: 'Venus is often bright near sunrise or sunset.',
    topic: 'Earth and Universe',
  },
  {
    prompt: 'Combustion is a chemical reaction that needs:',
    options: ['Only ice', 'Fuel and oxygen', 'Only shadows', 'Only magnets'],
    correct: 'Fuel and oxygen',
    explanation: 'Oxidation releases heat and light when fuel burns.',
    topic: 'Matter and Materials',
  },
  {
    prompt: 'Which process makes food for plants using sunlight?',
    options: ['Respiration', 'Photosynthesis', 'Erosion', 'Condensation'],
    correct: 'Photosynthesis',
    explanation: 'Chlorophyll captures light to synthesise glucose.',
    topic: 'Plants',
  },
  {
    prompt: 'The boiling point of pure water at sea level is about:',
    options: ['0 °C', '50 °C', '100 °C', '212 °F only with no °C'],
    correct: '100 °C',
    explanation: 'At 1 atm, water boils near 100 °C.',
    topic: 'Matter and Materials',
  },
  {
    prompt: 'Which organism is a producer in a pond ecosystem?',
    options: ['Fish', 'Algae', 'Heron', 'Frog'],
    correct: 'Algae',
    explanation: 'Algae perform photosynthesis to fix energy.',
    topic: 'Natural Resources and Indian Heritage',
  },
  {
    prompt: 'Human body temperature is regulated mainly by:',
    options: ['Only shoes', 'Thermoregulation in the hypothalamus', 'Hair colour', 'Nail polish'],
    correct: 'Thermoregulation in the hypothalamus',
    explanation: 'The brain coordinates sweating, shivering, and blood flow.',
    topic: 'Human Body and Health',
  },
  {
    prompt: 'Rust forming on iron is an example of:',
    options: ['Photosynthesis', 'Chemical change', 'Only physical mixing', 'Melting ice only'],
    correct: 'Chemical change',
    explanation: 'Iron reacts with oxygen and moisture to form new compounds.',
    topic: 'Matter and Materials',
  },
  {
    prompt: 'The normal pH of human blood is slightly:',
    options: ['Strongly acidic', 'Basic', 'Exactly 14', 'Zero'],
    correct: 'Basic',
    explanation: 'Blood pH is tightly regulated around 7.35–7.45, mildly basic.',
    topic: 'Human Body and Health',
  },
  {
    prompt: 'Which organelle is the site of protein synthesis in cells?',
    options: ['Mitochondria', 'Ribosome', 'Chloroplast', 'Lysosome'],
    correct: 'Ribosome',
    explanation: 'Ribosomes translate mRNA into polypeptide chains.',
    topic: 'The World of Living (Parts of Plants, Grouping of Plants and Animals, Adaptations in Plants and Animals, Characteristics of Living Beings, Life Cycle of Plants and Animals)',
  },
];

const IEO_FACTS: Array<{
  prompt: string;
  options: [string, string, string, string];
  correct: string;
  explanation: string;
  topic: string;
}> = [
  {
    prompt: 'Choose the correct plural: “child” →',
    options: ['childs', 'children', 'childrens', 'childes'],
    correct: 'children',
    explanation: '“Children” is the irregular plural of “child”.',
    topic: 'Nouns',
  },
  {
    prompt: 'Which word is a synonym of “happy”?',
    options: ['miserable', 'joyful', 'angry', 'sleepy'],
    correct: 'joyful',
    explanation: 'Joyful conveys a similar positive mood to happy.',
    topic: 'Synonyms',
  },
  {
    prompt: 'The past tense of “go” is:',
    options: ['goed', 'went', 'gone only', 'going'],
    correct: 'went',
    explanation: '“Went” is the simple past of “go”.',
    topic: 'Tenses',
  },
  {
    prompt: 'Which is a complete sentence?',
    options: ['Running fast.', 'She reads daily.', 'Under the table.', 'Because rain.'],
    correct: 'She reads daily.',
    explanation: 'It has a subject and a finite verb expressing a full thought.',
    topic: 'Basic Language',
  },
  {
    prompt: 'Choose the correct article: “____ honest mistake”',
    options: ['A', 'An', 'The', 'No article'],
    correct: 'An',
    explanation: '“Honest” begins with a vowel sound; use “an”.',
    topic: 'Articles',
  },
  {
    prompt: 'Opposite of “generous” is closest to:',
    options: ['kind', 'stingy', 'brave', 'calm'],
    correct: 'stingy',
    explanation: 'Stingy or mean contrasts with generous.',
    topic: 'Antonyms',
  },
  {
    prompt: '“Neither … nor” takes verb agreement usually with:',
    options: ['First subject only', 'The nearer subject', 'Always plural', 'Always “is”'],
    correct: 'The nearer subject',
    explanation: 'Proximity rule: verb often agrees with the subject closer to it.',
    topic: 'Conjunctions',
  },
  {
    prompt: 'Passive voice of “She wrote the letter.” →',
    options: ['The letter was written by her', 'The letter wrote her', 'She was written', 'Letter writing she'],
    correct: 'The letter was written by her',
    explanation: 'Object becomes subject with appropriate auxiliary “was”.',
    topic: 'Active-Passive Voice',
  },
  {
    prompt: 'Which is correctly spelled?',
    options: ['occured', 'occurred', 'occurrred', 'ocured'],
    correct: 'occurred',
    explanation: 'Double the final r before -ed.',
    topic: 'Spellings',
  },
  {
    prompt: 'Choose the adjective: “The ____ puppy slept.”',
    options: ['quickly', 'tiny', 'run', 'because'],
    correct: 'tiny',
    explanation: 'Tiny describes the noun puppy.',
    topic: 'Adjectives',
  },
  {
    prompt: 'Reported: He said, “I am tired.” →',
    options: ['He said he is tired', 'He said that he was tired', 'He said I am tired', 'He told tired'],
    correct: 'He said that he was tired',
    explanation: 'Backshift tense and adjust pronoun in reported speech.',
    topic: 'Narration',
  },
  {
    prompt: 'Which word is an adverb?',
    options: ['slow', 'slowly', 'slowness', 'slowishness'],
    correct: 'slowly',
    explanation: 'Adverbs often end in -ly and modify verbs.',
    topic: 'Adverbs',
  },
  {
    prompt: 'Pick the preposition: “She is good ____ mathematics.”',
    options: ['in', 'at', 'on', 'with'],
    correct: 'at',
    explanation: '“Good at” + skill is a common collocation.',
    topic: 'Prepositions',
  },
  {
    prompt: 'Which sentence uses a metaphor?',
    options: ['He runs fast', 'Time is money', 'She is tall', 'They ate rice'],
    correct: 'Time is money',
    explanation: 'Equating two unlike things without “like/as” is metaphor.',
    topic: 'Figure of Speech',
  },
  {
    prompt: 'Choose correct pair: synonym of “begin”',
    options: ['end', 'commence', 'finish', 'halt'],
    correct: 'commence',
    explanation: 'Commence means to start formally.',
    topic: 'Synonyms',
  },
  {
    prompt: 'Which is a compound word?',
    options: ['happy', 'sunflower', 'quickly', 'because'],
    correct: 'sunflower',
    explanation: 'Sun + flower forms one lexical unit.',
    topic: 'Word formation',
  },
  {
    prompt: 'The comparative of “good” is:',
    options: ['gooder', 'better', 'more good', 'best'],
    correct: 'better',
    explanation: 'Good → better → best is irregular.',
    topic: 'Degrees of Comparison',
  },
  {
    prompt: 'Which sentence is interrogative?',
    options: ['Close the door.', 'Where is the key?', 'What a mess!', 'Run.'],
    correct: 'Where is the key?',
    explanation: 'Interrogatives ask questions, often with inversion.',
    topic: 'Kinds of Sentences',
  },
  {
    prompt: 'Choose the correct spelling:',
    options: ['recieve', 'receive', 'receeve', 'receve'],
    correct: 'receive',
    explanation: '“I before e except after c” applies here.',
    topic: 'Spellings',
  },
  {
    prompt: 'Select the collective noun:',
    options: ['team', 'swiftly', 'blue', 'jump'],
    correct: 'team',
    explanation: 'Team names a group acting as one unit.',
    topic: 'Nouns',
  },
  {
    prompt: 'Which uses the present perfect?',
    options: ['I eat now', 'I have finished', 'I will go', 'I went'],
    correct: 'I have finished',
    explanation: 'Have/has + past participle marks present perfect.',
    topic: 'Tenses',
  },
  {
    prompt: 'Pick the conjunction showing contrast:',
    options: ['and', 'but', 'because', 'so'],
    correct: 'but',
    explanation: 'But introduces contrast between clauses.',
    topic: 'Conjunctions',
  },
  {
    prompt: 'Formal invitation closing might be:',
    options: ['LOL', 'Yours sincerely', 'TTYL', 'BRB'],
    correct: 'Yours sincerely',
    explanation: 'Formal letters end with a polite subscription.',
    topic: 'Functional English',
  },
  {
    prompt: 'Which word is a pronoun?',
    options: ['they', 'run', 'happy', 'quickly'],
    correct: 'they',
    explanation: 'Pronouns replace nouns (they replaces people/things).',
    topic: 'Pronouns',
  },
  {
    prompt: 'Choose the correct tag question: “You are ready, ____?”',
    options: ["isn't you", "aren't you", "don't you", 'won’t it'],
    correct: "aren't you",
    explanation: 'Tag mirrors auxiliary and reverses polarity.',
    topic: 'Question Tags',
  },
];

function imoMcq(grade: number, set: number, idx: number, id: string): Question {
  const s = seed(grade, set, idx);
  const tier = grade <= 4 ? 1 : grade <= 8 ? 2 : 3;

  if (tier === 1) {
    const maxStart = Math.max(0, IMO_ADD_PAIRS.length - 25);
    const start = maxStart > 0 ? ((grade * 37 + set * 41) % (maxStart + 1)) : 0;
    const [a, b] = IMO_ADD_PAIRS[start + idx]!;
    const ans = a + b;
    const nums = new Set<number>([ans]);
    const candidates = [ans + 3, Math.max(0, ans - 3), ans + 7, ans + 1, ans - 1, ans + 9];
    for (const c of candidates) {
      if (nums.size >= 4) break;
      if (!nums.has(c)) nums.add(c);
    }
    let bump = 1;
    while (nums.size < 4) {
      nums.add(ans + 10 + bump);
      bump++;
    }
    const u = [...nums].slice(0, 4).sort((x, y) => x - y);
    const finalOpts = u.map(String) as [string, string, string, string];
    const correct = String(ans);
    return mcq(
      id,
      `What is ${a} + ${b}?`,
      finalOpts,
      correct,
      'Add the two numbers carefully.',
      'Computation Operations',
      'easy',
      'apply',
    );
  }

  if (tier === 2) {
    const x = 2 + ((idx * 7 + grade * 5 + set * 3) % 11);
    const ans = x * x;
    const wrongNums = new Set<number>([ans]);
    const pool = [ans + x + 1, ans - 2, ans + 2 * x + 1, x + 1, ans + 5, ans - 5];
    for (const w of pool) {
      if (wrongNums.size >= 4) break;
      if (!wrongNums.has(w) && w >= 0) wrongNums.add(w);
    }
    let add = 1;
    while (wrongNums.size < 4) {
      wrongNums.add(ans + 20 + add);
      add++;
    }
    const opts = [...wrongNums].slice(0, 4).map(String) as [string, string, string, string];
    const correct = String(ans);
    const stems = [
      `What is ${x} squared?`,
      `Compute the value of ${x}².`,
      `Find ${x} × ${x}.`,
      `Evaluate ${x} to the power of two.`,
    ];
    const prompt = stems[(idx + grade + set) % stems.length]!;
    return mcq(
      id,
      prompt,
      opts,
      correct,
      'Squaring means multiplying a number by itself.',
      'Exponents and Powers',
      'medium',
      'apply',
    );
  }

  const maxStartR = Math.max(0, IMO_RECT_PAIRS.length - 25);
  const startR = maxStartR > 0 ? ((grade * 19 + set * 23 + s) % (maxStartR + 1)) : 0;
  const [l, wv] = IMO_RECT_PAIRS[startR + idx]!;
  const ans = l * wv;
  const optsRaw = [ans, ans + wv, ans - 1, l + wv];
  const uniq = [...new Set(optsRaw)].slice(0, 4);
  while (uniq.length < 4) uniq.push(uniq[uniq.length - 1]! + 1);
  const opts = uniq.map(String) as [string, string, string, string];
  const correct = String(ans);
  const areaStems = [
    `A rectangle has length ${l} units and width ${wv} units. What is its area in square units?`,
    `Find the area of a rectangle with length ${l} units and breadth ${wv} units.`,
    `The length and width of a rectangle are ${l} units and ${wv} units respectively. Area = ?`,
  ];
  const prompt = areaStems[(idx + grade) % areaStems.length]!;
  return mcq(
    id,
    prompt,
    opts,
    correct,
    'Area of a rectangle = length × width.',
    'Mensuration',
    'hard',
    'apply',
  );
}

export function buildPaddingMcqs(
  examCode: OlympiadCode,
  grade: number,
  set: number,
  idPrefix: string,
  fromIndex: number,
  count: number,
): Question[] {
  const out: Question[] = [];
  if (examCode === 'IMO') {
    for (let k = 0; k < count; k++) {
      const i = fromIndex + k;
      const id = `${idPrefix}-q${String(i + 1).padStart(2, '0')}`;
      out.push(imoMcq(grade, set, i, id));
    }
    return out;
  }

  const pool =
    examCode === 'IGKO' ? IGKO_FACTS : examCode === 'NSO' ? NSO_FACTS : IEO_FACTS;
  const indices = pickDistinctIndices(pool.length, count, grade, set, fromIndex);
  for (let k = 0; k < count; k++) {
    const i = fromIndex + k;
    const id = `${idPrefix}-q${String(i + 1).padStart(2, '0')}`;
    const f = pool[indices[k]!]!;
    out.push(
      mcq(
        id,
        `[Supplement] ${f.prompt}`,
        f.options,
        f.correct,
        f.explanation,
        f.topic,
        'medium',
        examCode === 'IGKO' ? 'remember' : examCode === 'NSO' ? 'understand' : 'apply',
      ),
    );
  }
  return out;
}

const SECTION_LAYOUT: Record<
  OlympiadCode,
  Array<{ section_name: string; section_title: string; count: number }>
> = {
  IGKO: [
    { section_name: 'Section-1', section_title: 'General Awareness', count: 7 },
    { section_name: 'Section-2', section_title: 'Current Affairs', count: 6 },
    { section_name: 'Section-3', section_title: 'Life Skills', count: 6 },
    { section_name: 'Section-4', section_title: "Achiever's Section (HOTS)", count: 6 },
  ],
  IMO: [
    { section_name: 'Section-1', section_title: 'Logical Reasoning', count: 6 },
    { section_name: 'Section-2', section_title: 'Mathematics', count: 8 },
    { section_name: 'Section-3', section_title: 'Applied', count: 6 },
    { section_name: 'Section-4', section_title: 'Achievers (HOTS)', count: 5 },
  ],
  NSO: [
    { section_name: 'Section-1', section_title: 'Logical Reasoning', count: 6 },
    { section_name: 'Section-2', section_title: 'Science', count: 13 },
    { section_name: 'Section-3', section_title: "Achiever's Section", count: 6 },
  ],
  IEO: [
    { section_name: 'Section-1', section_title: 'Basic Language', count: 6 },
    { section_name: 'Section-2', section_title: 'Search and Retrieve Information', count: 6 },
    { section_name: 'Section-3', section_title: 'Situation-based Functional English', count: 6 },
    { section_name: 'Section-4', section_title: 'Higher Order Thinking Questions', count: 7 },
  ],
};

export function buildFullSyntheticMockSections(
  examCode: OlympiadCode,
  grade: number,
  set: number,
  idPrefix: string,
) {
  const qs = buildPaddingMcqs(examCode, grade, set, idPrefix, 0, 25);
  const layout = SECTION_LAYOUT[examCode];
  let off = 0;
  return layout.map((row) => ({
    section_name: row.section_name,
    section_title: row.section_title,
    questions: qs.slice(off, (off += row.count)),
  }));
}
