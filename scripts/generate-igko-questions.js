#!/usr/bin/env node
/**
 * Generate IGKO questions from syllabus for all grades 1-10.
 * Creates topic question files, manifest, and pack definitions.
 * Run: node scripts/generate-igko-questions.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const IGKO_BASE = join(ROOT, 'public', 'question-bank', 'igko');

/** Question templates by topic slug: [{ questionText, options, correctIndex, explanation }] */
const QUESTION_TEMPLATES = {
  'me-and-my-surroundings': [
    { q: 'What do we use to see things around us?', opts: ['Ears', 'Eyes', 'Nose', 'Mouth'], c: 1, e: 'Eyes help us see.' },
    { q: 'Which sense helps us hear sounds?', opts: ['Touch', 'Smell', 'Hearing', 'Taste'], c: 2, e: 'Our ears help us hear.' },
    { q: 'What do we call the place where we live?', opts: ['School', 'Home', 'Park', 'Shop'], c: 1, e: 'Home is where we live.' },
    { q: 'Which room do we use for cooking?', opts: ['Bedroom', 'Bathroom', 'Kitchen', 'Living room'], c: 2, e: 'Kitchen is for cooking.' },
    { q: 'What do we call people who live near us?', opts: ['Strangers', 'Neighbours', 'Teachers', 'Doctors'], c: 1, e: 'Neighbours live nearby.' },
    { q: 'Which day comes after Monday?', opts: ['Sunday', 'Tuesday', 'Wednesday', 'Friday'], c: 1, e: 'Tuesday comes after Monday.' },
    { q: 'How many days are in a week?', opts: ['Five', 'Six', 'Seven', 'Eight'], c: 2, e: 'There are seven days in a week.' },
    { q: 'What do we use to tell the time?', opts: ['Ruler', 'Clock', 'Scale', 'Compass'], c: 1, e: 'A clock shows time.' },
    { q: 'Which season comes after summer?', opts: ['Spring', 'Winter', 'Monsoon', 'Autumn'], c: 2, e: 'Monsoon comes after summer in India.' },
    { q: 'What do we call the people in our family?', opts: ['Friends', 'Relatives', 'Strangers', 'Neighbours'], c: 1, e: 'Family members are relatives.' },
    { q: 'Which sense helps us smell?', opts: ['Ears', 'Eyes', 'Nose', 'Tongue'], c: 2, e: 'Our nose helps us smell.' },
    { q: 'What do we call the place where we study?', opts: ['Home', 'School', 'Park', 'Market'], c: 1, e: 'School is for learning.' },
    { q: 'How many months are in a year?', opts: ['10', '11', '12', '13'], c: 2, e: 'There are 12 months in a year.' },
    { q: 'What do we use to write?', opts: ['Spoon', 'Pen', 'Plate', 'Cup'], c: 1, e: 'A pen is for writing.' },
    { q: 'Which is a part of our body?', opts: ['Chair', 'Hand', 'Table', 'Book'], c: 1, e: 'Hand is a body part.' },
    { q: 'What do we wear on our feet?', opts: ['Hat', 'Shirt', 'Shoes', 'Gloves'], c: 2, e: 'Shoes go on our feet.' },
    { q: 'Which animal says "meow"?', opts: ['Dog', 'Cat', 'Cow', 'Duck'], c: 1, e: 'Cats say meow.' },
    { q: 'What do we drink when we are thirsty?', opts: ['Food', 'Water', 'Sand', 'Stone'], c: 1, e: 'Water quenches thirst.' },
    { q: 'Which comes first: morning or night?', opts: ['Night', 'Morning', 'Both', 'Neither'], c: 1, e: 'Morning comes before night.' },
    { q: 'What do we sit on?', opts: ['Chair', 'Ceiling', 'Wall', 'Door'], c: 0, e: 'We sit on a chair.' },
    { q: 'How many legs does a person have?', opts: ['One', 'Two', 'Three', 'Four'], c: 1, e: 'Humans have two legs.' },
    { q: 'Which is a fruit?', opts: ['Carrot', 'Apple', 'Bread', 'Rice'], c: 1, e: 'Apple is a fruit.' },
    { q: 'What do we use to cut paper?', opts: ['Eraser', 'Scissors', 'Glue', 'Crayon'], c: 1, e: 'Scissors cut paper.' },
    { q: 'Which is a vegetable?', opts: ['Banana', 'Tomato', 'Mango', 'Orange'], c: 1, e: 'Tomato is a vegetable.' },
    { q: 'What do we use to read books?', opts: ['Ears', 'Eyes', 'Nose', 'Hands'], c: 1, e: 'We use our eyes to read.' },
    { q: 'Which day is the first day of the week?', opts: ['Monday', 'Tuesday', 'Sunday', 'Saturday'], c: 2, e: 'Sunday or Monday can be first.' },
  ],
  'plants-and-animals': [
    { q: 'Which part of a plant grows underground?', opts: ['Leaf', 'Flower', 'Root', 'Stem'], c: 2, e: 'Roots grow under the soil.' },
    { q: 'What do plants need to make food?', opts: ['Water only', 'Sunlight only', 'Sunlight and water', 'Soil only'], c: 2, e: 'Plants need sunlight and water.' },
    { q: 'Which animal gives us milk?', opts: ['Lion', 'Cow', 'Tiger', 'Deer'], c: 1, e: 'Cows give us milk.' },
    { q: 'What do we call the home of a bird?', opts: ['Den', 'Nest', 'Hive', 'Burrow'], c: 1, e: 'Birds live in nests.' },
    { q: 'Which animal has a long trunk?', opts: ['Lion', 'Elephant', 'Bear', 'Monkey'], c: 1, e: 'Elephants have trunks.' },
    { q: 'Which animal barks?', opts: ['Cat', 'Dog', 'Cow', 'Goat'], c: 1, e: 'Dogs bark.' },
    { q: 'What do we call a baby horse?', opts: ['Cub', 'Puppy', 'Foal', 'Calf'], c: 2, e: 'A baby horse is a foal.' },
    { q: 'Which animal can fly?', opts: ['Fish', 'Bird', 'Snake', 'Rabbit'], c: 1, e: 'Birds can fly.' },
    { q: 'What do bees collect from flowers?', opts: ['Water', 'Nectar', 'Leaves', 'Seeds'], c: 1, e: 'Bees collect nectar.' },
    { q: 'Which plant do we get rice from?', opts: ['Wheat plant', 'Rice plant', 'Corn plant', 'Barley plant'], c: 1, e: 'Rice comes from rice plants.' },
    { q: 'What do we call a baby dog?', opts: ['Kitten', 'Puppy', 'Calf', 'Cub'], c: 1, e: 'A baby dog is a puppy.' },
    { q: 'Which animal has a shell?', opts: ['Fish', 'Tortoise', 'Lion', 'Eagle'], c: 1, e: 'Tortoise has a shell.' },
    { q: 'What do caterpillars turn into?', opts: ['Birds', 'Butterflies', 'Fish', 'Frogs'], c: 1, e: 'Caterpillars become butterflies.' },
    { q: 'Which animal lives in water?', opts: ['Cat', 'Dog', 'Fish', 'Rabbit'], c: 2, e: 'Fish live in water.' },
    { q: 'What do plants need from the soil?', opts: ['Light', 'Water and nutrients', 'Wind', 'Sound'], c: 1, e: 'Plants get nutrients from soil.' },
    { q: 'Which bird cannot fly?', opts: ['Sparrow', 'Penguin', 'Eagle', 'Crow'], c: 1, e: 'Penguins cannot fly.' },
    { q: 'What do we call a group of fish?', opts: ['Herd', 'School', 'Flock', 'Pack'], c: 1, e: 'A group of fish is a school.' },
    { q: 'Which animal has stripes?', opts: ['Cow', 'Tiger', 'Dog', 'Cat'], c: 1, e: 'Tigers have stripes.' },
    { q: 'What part of a plant is usually green?', opts: ['Root', 'Leaf', 'Flower', 'Seed'], c: 1, e: 'Leaves are usually green.' },
    { q: 'Which animal hibernates in winter?', opts: ['Lion', 'Bear', 'Monkey', 'Deer'], c: 1, e: 'Bears hibernate.' },
    { q: 'What do frogs eat?', opts: ['Grass', 'Insects', 'Leaves', 'Fruits'], c: 1, e: 'Frogs eat insects.' },
    { q: 'Which animal has a hump?', opts: ['Horse', 'Camel', 'Elephant', 'Lion'], c: 1, e: 'Camels have humps.' },
    { q: 'What do we get from hens?', opts: ['Milk', 'Eggs', 'Wool', 'Honey'], c: 1, e: 'Hens lay eggs.' },
    { q: 'Which insect makes honey?', opts: ['Ant', 'Bee', 'Fly', 'Mosquito'], c: 1, e: 'Bees make honey.' },
    { q: 'What do we call a baby cat?', opts: ['Puppy', 'Kitten', 'Calf', 'Cub'], c: 1, e: 'A baby cat is a kitten.' },
    { q: 'Which animal has black and white stripes?', opts: ['Lion', 'Zebra', 'Bear', 'Deer'], c: 1, e: 'Zebras have black and white stripes.' },
  ],
  'india-and-the-world': [
    { q: 'What is the capital of India?', opts: ['Mumbai', 'Kolkata', 'New Delhi', 'Chennai'], c: 2, e: 'New Delhi is the capital.' },
    { q: 'How many colours are in the Indian flag?', opts: ['Two', 'Three', 'Four', 'Five'], c: 1, e: 'The flag has saffron, white, and green.' },
    { q: 'Which animal is our national animal?', opts: ['Lion', 'Tiger', 'Elephant', 'Peacock'], c: 1, e: 'The tiger is our national animal.' },
    { q: 'Which bird is our national bird?', opts: ['Crow', 'Sparrow', 'Peacock', 'Parrot'], c: 2, e: 'The peacock is our national bird.' },
    { q: 'Which flower is our national flower?', opts: ['Rose', 'Lotus', 'Sunflower', 'Jasmine'], c: 1, e: 'The lotus is our national flower.' },
    { q: 'How many continents are there in the world?', opts: ['Five', 'Six', 'Seven', 'Eight'], c: 2, e: 'There are seven continents.' },
    { q: 'Which is the largest ocean?', opts: ['Indian', 'Atlantic', 'Pacific', 'Arctic'], c: 2, e: 'The Pacific is the largest.' },
    { q: 'Which country is to the north of India?', opts: ['Sri Lanka', 'China', 'Bangladesh', 'Pakistan'], c: 1, e: 'China is to the north.' },
    { q: 'What is the capital of India\'s neighbour Pakistan?', opts: ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi'], c: 2, e: 'Islamabad is the capital.' },
    { q: 'Which river is considered holy in India?', opts: ['Yamuna', 'Ganga', 'Brahmaputra', 'Godavari'], c: 1, e: 'The Ganga is the holy river.' },
    { q: 'What is the national anthem of India?', opts: ['Vande Mataram', 'Jana Gana Mana', 'Sare Jahan Se', 'Saare Jahan Se Achha'], c: 1, e: 'Jana Gana Mana is the national anthem.' },
    { q: 'Which is the smallest continent?', opts: ['Asia', 'Australia', 'Europe', 'Africa'], c: 1, e: 'Australia is the smallest continent.' },
    { q: 'What is the capital of Japan?', opts: ['Beijing', 'Seoul', 'Tokyo', 'Bangkok'], c: 2, e: 'Tokyo is the capital of Japan.' },
    { q: 'Which ocean is to the west of India?', opts: ['Pacific', 'Atlantic', 'Indian', 'Arctic'], c: 2, e: 'The Arabian Sea is part of Indian Ocean.' },
    { q: 'What is the currency of Japan?', opts: ['Dollar', 'Yen', 'Pound', 'Euro'], c: 1, e: 'Yen is Japan\'s currency.' },
    { q: 'Which country has the Great Wall?', opts: ['India', 'China', 'Japan', 'Korea'], c: 1, e: 'The Great Wall is in China.' },
    { q: 'What is the capital of France?', opts: ['London', 'Berlin', 'Paris', 'Rome'], c: 2, e: 'Paris is the capital of France.' },
    { q: 'Which country is known as the Land of the Rising Sun?', opts: ['China', 'Japan', 'India', 'Korea'], c: 1, e: 'Japan is the Land of the Rising Sun.' },
    { q: 'What is the largest country in the world?', opts: ['China', 'USA', 'Russia', 'Canada'], c: 2, e: 'Russia is the largest by area.' },
    { q: 'Which festival is known as the festival of lights?', opts: ['Holi', 'Diwali', 'Eid', 'Christmas'], c: 1, e: 'Diwali is the festival of lights.' },
    { q: 'What is the capital of the USA?', opts: ['New York', 'Los Angeles', 'Washington D.C.', 'Chicago'], c: 2, e: 'Washington D.C. is the capital.' },
    { q: 'Which mountain is the highest in the world?', opts: ['K2', 'Mount Everest', 'Kilimanjaro', 'Alps'], c: 1, e: 'Mount Everest is the highest.' },
    { q: 'What is the national tree of India?', opts: ['Neem', 'Banyan', 'Peepal', 'Mango'], c: 1, e: 'Banyan is the national tree.' },
    { q: 'Which country has the Pyramids?', opts: ['India', 'Egypt', 'Greece', 'Italy'], c: 1, e: 'The Pyramids are in Egypt.' },
    { q: 'What is the national fruit of India?', opts: ['Apple', 'Mango', 'Banana', 'Orange'], c: 1, e: 'Mango is the national fruit.' },
    { q: 'Which sea is to the east of India?', opts: ['Arabian Sea', 'Bay of Bengal', 'Pacific', 'Atlantic'], c: 1, e: 'Bay of Bengal is to the east.' },
  ],
  'science-and-technology': [
    { q: 'What do we use to see things that are far away?', opts: ['Microscope', 'Telescope', 'Magnifying glass', 'Spectacles'], c: 1, e: 'A telescope helps see far.' },
    { q: 'Which device helps us talk to people far away?', opts: ['Radio', 'Phone', 'Television', 'Computer'], c: 1, e: 'Phones help us communicate.' },
    { q: 'What do we use to write on a computer?', opts: ['Pen', 'Keyboard', 'Eraser', 'Ruler'], c: 1, e: 'Keyboard is for typing.' },
    { q: 'Which machine helps us wash clothes?', opts: ['Mixer', 'Washing machine', 'Refrigerator', 'Oven'], c: 1, e: 'Washing machine washes clothes.' },
    { q: 'What do we use to take photos?', opts: ['Radio', 'Camera', 'Clock', 'Fan'], c: 1, e: 'A camera takes photos.' },
    { q: 'Which device keeps food cold?', opts: ['Oven', 'Refrigerator', 'Heater', 'Iron'], c: 1, e: 'Refrigerator keeps food cold.' },
    { q: 'What do we use to light up a dark room?', opts: ['Fan', 'Bulb', 'Radio', 'Clock'], c: 1, e: 'A bulb gives light.' },
    { q: 'Which machine helps us travel by air?', opts: ['Car', 'Ship', 'Aeroplane', 'Train'], c: 2, e: 'Aeroplanes fly in the air.' },
    { q: 'What do we use to measure temperature?', opts: ['Ruler', 'Thermometer', 'Clock', 'Scale'], c: 1, e: 'Thermometer measures temperature.' },
    { q: 'Which device shows moving pictures?', opts: ['Radio', 'Television', 'Telephone', 'Calculator'], c: 1, e: 'TV shows moving pictures.' },
    { q: 'What do we use to connect to the internet?', opts: ['Radio', 'Modem or WiFi', 'Clock', 'Fan'], c: 1, e: 'Modem or WiFi connects to internet.' },
    { q: 'Which device helps us print documents?', opts: ['Monitor', 'Printer', 'Keyboard', 'Speaker'], c: 1, e: 'Printer prints documents.' },
    { q: 'What do we use to listen to music?', opts: ['Microphone', 'Speaker', 'Camera', 'Scanner'], c: 1, e: 'Speakers play sound.' },
    { q: 'Which machine helps us cool the room?', opts: ['Heater', 'AC', 'Oven', 'Iron'], c: 1, e: 'AC cools the room.' },
    { q: 'What do we use to charge our phone?', opts: ['Battery', 'Charger', 'Bulb', 'Switch'], c: 1, e: 'Charger charges the phone.' },
    { q: 'Which device has a screen we can touch?', opts: ['Radio', 'Smartphone', 'Clock', 'Fan'], c: 1, e: 'Smartphones have touch screens.' },
    { q: 'What do we use to store data in a computer?', opts: ['Monitor', 'Hard disk', 'Keyboard', 'Mouse'], c: 1, e: 'Hard disk stores data.' },
    { q: 'Which tool helps us see very small things?', opts: ['Telescope', 'Microscope', 'Binoculars', 'Camera'], c: 1, e: 'Microscope magnifies small things.' },
    { q: 'What do we use to iron clothes?', opts: ['Oven', 'Iron', 'Mixer', 'Toaster'], c: 1, e: 'Iron smooths clothes.' },
    { q: 'Which device helps us navigate?', opts: ['Radio', 'GPS', 'Clock', 'Calculator'], c: 1, e: 'GPS helps with navigation.' },
    { q: 'What do we use to record our voice?', opts: ['Speaker', 'Microphone', 'Camera', 'Printer'], c: 1, e: 'Microphone records voice.' },
    { q: 'Which machine makes bread?', opts: ['Mixer', 'Toaster', 'Oven', 'Refrigerator'], c: 2, e: 'Oven bakes bread.' },
    { q: 'What do we use to measure our weight?', opts: ['Ruler', 'Weighing scale', 'Clock', 'Thermometer'], c: 1, e: 'Weighing scale measures weight.' },
    { q: 'Which device can work without electricity for a while?', opts: ['Desktop', 'Laptop', 'TV', 'AC'], c: 1, e: 'Laptops have batteries.' },
    { q: 'What do we use to click on a computer?', opts: ['Keyboard', 'Mouse', 'Monitor', 'Printer'], c: 1, e: 'Mouse is for clicking.' },
    { q: 'Which device helps us see in the dark?', opts: ['Torch', 'Radio', 'Clock', 'Fan'], c: 0, e: 'A torch helps us see in dark.' },
  ],
  'language-and-literature': [
    { q: 'What do we call a story that is not true?', opts: ['News', 'Fiction', 'History', 'Report'], c: 1, e: 'Fiction means made-up story.' },
    { q: 'Who writes books?', opts: ['Painter', 'Author', 'Singer', 'Dancer'], c: 1, e: 'An author writes books.' },
    { q: 'What do we call a book of poems?', opts: ['Novel', 'Dictionary', 'Encyclopedia', 'Poetry book'], c: 3, e: 'A poetry book has poems.' },
    { q: 'Which letter is a vowel?', opts: ['B', 'C', 'A', 'D'], c: 2, e: 'A is a vowel.' },
    { q: 'What do we call the person in a story?', opts: ['Author', 'Character', 'Reader', 'Publisher'], c: 1, e: 'Characters are people in stories.' },
    { q: 'Which word means the opposite of "big"?', opts: ['Large', 'Small', 'Huge', 'Giant'], c: 1, e: 'Small is the opposite of big.' },
    { q: 'What do we call a group of words that makes sense?', opts: ['Word', 'Letter', 'Sentence', 'Paragraph'], c: 2, e: 'A sentence has complete meaning.' },
    { q: 'Who wrote the Panchatantra?', opts: ['Shakespeare', 'Vishnu Sharma', 'Rabindranath Tagore', 'Premchand'], c: 1, e: 'Vishnu Sharma wrote Panchatantra.' },
    { q: 'What is the first letter of the English alphabet?', opts: ['Z', 'B', 'A', 'C'], c: 2, e: 'A is the first letter.' },
    { q: 'Which punctuation mark ends a question?', opts: ['.', ',', '?', '!'], c: 2, e: '? is used for questions.' },
    { q: 'What do we call a book that lists words and meanings?', opts: ['Novel', 'Dictionary', 'Magazine', 'Comic'], c: 1, e: 'Dictionary has word meanings.' },
    { q: 'Which word rhymes with "cat"?', opts: ['Dog', 'Bat', 'Bird', 'Fish'], c: 1, e: 'Bat rhymes with cat.' },
    { q: 'What do we call the person who draws pictures in a book?', opts: ['Author', 'Illustrator', 'Publisher', 'Reader'], c: 1, e: 'Illustrator draws pictures.' },
    { q: 'Which is a naming word?', opts: ['Run', 'Jump', 'Dog', 'Fast'], c: 2, e: 'Dog is a noun (naming word).' },
    { q: 'What do we call a story about someone\'s life?', opts: ['Fiction', 'Biography', 'Poetry', 'Essay'], c: 1, e: 'Biography tells someone\'s life.' },
    { q: 'Which letter is a consonant?', opts: ['A', 'E', 'B', 'I'], c: 2, e: 'B is a consonant.' },
    { q: 'What do we call the name of a book?', opts: ['Chapter', 'Title', 'Page', 'Index'], c: 1, e: 'Title is the book\'s name.' },
    { q: 'Which word describes an action?', opts: ['Beautiful', 'Quickly', 'Run', 'Big'], c: 2, e: 'Run is a verb (action word).' },
    { q: 'What do we call a short form of a word?', opts: ['Abbreviation', 'Sentence', 'Paragraph', 'Story'], c: 0, e: 'Abbreviation is short form.' },
    { q: 'Which is the last letter of the alphabet?', opts: ['A', 'X', 'Y', 'Z'], c: 3, e: 'Z is the last letter.' },
    { q: 'What do we call words that sound the same but mean different?', opts: ['Synonyms', 'Homophones', 'Antonyms', 'Rhymes'], c: 1, e: 'Homophones sound the same.' },
    { q: 'Which punctuation shows strong feeling?', opts: ['.', ',', '?', '!'], c: 3, e: '! shows excitement.' },
    { q: 'What do we call a story with a moral?', opts: ['Novel', 'Fable', 'Essay', 'Report'], c: 1, e: 'Fables teach lessons.' },
    { q: 'Which word means the same as "happy"?', opts: ['Sad', 'Joyful', 'Angry', 'Tired'], c: 1, e: 'Joyful means happy.' },
    { q: 'What do we call the beginning of a story?', opts: ['Ending', 'Introduction', 'Middle', 'Conclusion'], c: 1, e: 'Introduction starts the story.' },
    { q: 'Which type of book has true facts?', opts: ['Fiction', 'Non-fiction', 'Comic', 'Fairy tale'], c: 1, e: 'Non-fiction has real facts.' },
  ],
  'earth-and-its-environment': [
    { q: 'What covers most of the Earth\'s surface?', opts: ['Land', 'Water', 'Sand', 'Rocks'], c: 1, e: 'Water covers most of Earth.' },
    { q: 'Which gas do we breathe in?', opts: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'], c: 1, e: 'We breathe in oxygen.' },
    { q: 'What do we call the layer of air around Earth?', opts: ['Ocean', 'Atmosphere', 'Crust', 'Mantle'], c: 1, e: 'Atmosphere is the air layer.' },
    { q: 'Which is a natural resource?', opts: ['Plastic', 'Water', 'Glass', 'Steel'], c: 1, e: 'Water is a natural resource.' },
    { q: 'What do plants give out that we breathe?', opts: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Smoke'], c: 1, e: 'Plants give out oxygen.' },
    { q: 'Which is a way to save water?', opts: ['Leave tap open', 'Fix leaks', 'Waste water', 'Use more'], c: 1, e: 'Fixing leaks saves water.' },
    { q: 'What do we call throwing waste in the right place?', opts: ['Littering', 'Recycling', 'Disposal', 'Dumping'], c: 1, e: 'Proper disposal helps the environment.' },
    { q: 'Which is a renewable resource?', opts: ['Coal', 'Solar energy', 'Petrol', 'Natural gas'], c: 1, e: 'Solar energy is renewable.' },
    { q: 'What causes pollution?', opts: ['Planting trees', 'Clean air', 'Smoke from vehicles', 'Recycling'], c: 2, e: 'Vehicle smoke causes pollution.' },
    { q: 'Which animal is in danger of extinction?', opts: ['Dog', 'Tiger', 'Cow', 'Goat'], c: 1, e: 'Tigers are endangered.' },
    { q: 'What do we call rain that is very acidic?', opts: ['Acid rain', 'Snow', 'Hail', 'Dew'], c: 0, e: 'Acid rain harms the environment.' },
    { q: 'Which helps reduce global warming?', opts: ['More cars', 'Planting trees', 'Burning coal', 'Cutting forests'], c: 1, e: 'Trees absorb carbon dioxide.' },
    { q: 'What do we call the home of an animal?', opts: ['School', 'Habitat', 'Office', 'Market'], c: 1, e: 'Habitat is where animals live.' },
    { q: 'Which is biodegradable?', opts: ['Plastic bag', 'Banana peel', 'Glass', 'Metal'], c: 1, e: 'Banana peel decomposes naturally.' },
    { q: 'What causes soil erosion?', opts: ['Planting trees', 'Deforestation', 'Rain harvesting', 'Recycling'], c: 1, e: 'Deforestation causes erosion.' },
    { q: 'Which gas do we breathe out?', opts: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], c: 1, e: 'We breathe out carbon dioxide.' },
    { q: 'What do we call saving resources for the future?', opts: ['Wasting', 'Conservation', 'Pollution', 'Destruction'], c: 1, e: 'Conservation saves resources.' },
    { q: 'Which is a greenhouse gas?', opts: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], c: 1, e: 'CO2 is a greenhouse gas.' },
    { q: 'What do we call the variety of life on Earth?', opts: ['Pollution', 'Biodiversity', 'Erosion', 'Deforestation'], c: 1, e: 'Biodiversity means variety of life.' },
    { q: 'Which helps in composting?', opts: ['Plastic', 'Kitchen waste', 'Metal', 'Glass'], c: 1, e: 'Kitchen waste can be composted.' },
    { q: 'What do we call the layer that protects Earth from UV rays?', opts: ['Cloud layer', 'Ozone layer', 'Dust layer', 'Water layer'], c: 1, e: 'Ozone layer protects us.' },
    { q: 'Which activity is eco-friendly?', opts: ['Using plastic bags', 'Using cloth bags', 'Burning waste', 'Littering'], c: 1, e: 'Cloth bags are reusable.' },
    { q: 'What do we call the process of reusing materials?', opts: ['Recycling', 'Burning', 'Throwing', 'Wasting'], c: 0, e: 'Recycling reuses materials.' },
    { q: 'Which is a non-renewable resource?', opts: ['Solar energy', 'Wind', 'Coal', 'Water'], c: 2, e: 'Coal is non-renewable.' },
    { q: 'What do we call the layer where weather happens?', opts: ['Space', 'Troposphere', 'Stratosphere', 'Core'], c: 1, e: 'Troposphere has weather.' },
    { q: 'Which gas do trees absorb from the air?', opts: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], c: 1, e: 'Trees absorb carbon dioxide.' },
  ],
  'transport-and-communication': [
    { q: 'Which vehicle runs on rails?', opts: ['Bus', 'Car', 'Train', 'Bicycle'], c: 2, e: 'Trains run on railway tracks.' },
    { q: 'What do we use to send letters?', opts: ['Phone', 'Post office', 'Email', 'Radio'], c: 1, e: 'Post office sends letters.' },
    { q: 'Which vehicle travels on water?', opts: ['Aeroplane', 'Ship', 'Car', 'Train'], c: 1, e: 'Ships travel on water.' },
    { q: 'What do we use to talk to someone far away instantly?', opts: ['Letter', 'Telephone', 'Newspaper', 'Book'], c: 1, e: 'Telephone allows instant talk.' },
    { q: 'Which is the fastest way to travel?', opts: ['Car', 'Train', 'Aeroplane', 'Ship'], c: 2, e: 'Aeroplanes are fastest.' },
    { q: 'What do we call a road for trains?', opts: ['Highway', 'Railway', 'Path', 'Bridge'], c: 1, e: 'Railway is for trains.' },
    { q: 'Which vehicle has two wheels?', opts: ['Car', 'Bus', 'Bicycle', 'Truck'], c: 2, e: 'Bicycles have two wheels.' },
    { q: 'What do we use to send messages on a computer?', opts: ['Letter', 'Email', 'Newspaper', 'Radio'], c: 1, e: 'Email sends messages online.' },
    { q: 'Which transport does not need fuel?', opts: ['Car', 'Bicycle', 'Bus', 'Aeroplane'], c: 1, e: 'Bicycles use human power.' },
    { q: 'What do we call a place where buses stop?', opts: ['Station', 'Bus stop', 'Parking', 'Garage'], c: 1, e: 'Bus stop is where buses stop.' },
    { q: 'Which vehicle is used for emergencies?', opts: ['Bicycle', 'Ambulance', 'Scooter', 'Rickshaw'], c: 1, e: 'Ambulance is for emergencies.' },
    { q: 'What do we use to send a quick message?', opts: ['Letter', 'SMS', 'Newspaper', 'Book'], c: 1, e: 'SMS is a quick message.' },
    { q: 'Which transport uses a propeller?', opts: ['Car', 'Helicopter', 'Bicycle', 'Bus'], c: 1, e: 'Helicopters use propellers.' },
    { q: 'What do we call a road that connects cities?', opts: ['Street', 'Highway', 'Path', 'Lane'], c: 1, e: 'Highway connects cities.' },
    { q: 'Which vehicle carries heavy goods?', opts: ['Car', 'Truck', 'Bicycle', 'Scooter'], c: 1, e: 'Trucks carry heavy loads.' },
    { q: 'What do we use for video calls?', opts: ['Radio', 'Video call app', 'Newspaper', 'Letter'], c: 1, e: 'Video call apps allow face-to-face talk.' },
    { q: 'Which transport runs on electricity?', opts: ['Diesel bus', 'Electric train', 'Petrol car', 'Steam engine'], c: 1, e: 'Electric trains use electricity.' },
    { q: 'What do we call a place where trains stop?', opts: ['Bus stop', 'Railway station', 'Airport', 'Harbour'], c: 1, e: 'Railway station is for trains.' },
    { q: 'Which is the slowest way to travel?', opts: ['Aeroplane', 'Walking', 'Train', 'Car'], c: 1, e: 'Walking is the slowest.' },
    { q: 'What do we use to send a parcel?', opts: ['Email', 'Courier or post', 'Phone', 'Radio'], c: 1, e: 'Courier or post sends parcels.' },
    { q: 'Which vehicle needs a runway?', opts: ['Ship', 'Aeroplane', 'Car', 'Bicycle'], c: 1, e: 'Aeroplanes need runways.' },
    { q: 'What do we call communication without words?', opts: ['Speaking', 'Non-verbal', 'Writing', 'Reading'], c: 1, e: 'Non-verbal uses gestures.' },
    { q: 'Which transport goes underground?', opts: ['Bus', 'Metro', 'Ship', 'Bicycle'], c: 1, e: 'Metro runs underground.' },
    { q: 'What do we use to broadcast news?', opts: ['Letter', 'Radio or TV', 'Newspaper only', 'Book'], c: 1, e: 'Radio and TV broadcast news.' },
    { q: 'Which vehicle needs a driver?', opts: ['Bicycle', 'Car', 'Scooter', 'All of these'], c: 3, e: 'All need someone to operate.' },
    { q: 'What do we call a place where planes land?', opts: ['Station', 'Airport', 'Harbour', 'Bus stop'], c: 1, e: 'Airport is for planes.' },
  ],
  'sports': [
    { q: 'How many players are in a cricket team?', opts: ['Nine', 'Ten', 'Eleven', 'Twelve'], c: 2, e: 'Cricket has 11 players.' },
    { q: 'Which sport is called the "king of sports"?', opts: ['Cricket', 'Football', 'Hockey', 'Tennis'], c: 1, e: 'Football is popular worldwide.' },
    { q: 'What do we hit in badminton?', opts: ['Ball', 'Shuttlecock', 'Puck', 'Disc'], c: 1, e: 'Shuttlecock is used in badminton.' },
    { q: 'Which country won the first Cricket World Cup?', opts: ['India', 'Australia', 'West Indies', 'England'], c: 2, e: 'West Indies won in 1975.' },
    { q: 'How many Olympic rings are there?', opts: ['Three', 'Four', 'Five', 'Six'], c: 2, e: 'There are five Olympic rings.' },
    { q: 'Which sport uses a bat and ball?', opts: ['Football', 'Cricket', 'Hockey', 'Tennis'], c: 1, e: 'Cricket uses bat and ball.' },
    { q: 'What colour is the football used in games?', opts: ['Blue', 'Red', 'White', 'Orange'], c: 2, e: 'Football is usually white/black.' },
    { q: 'Which game is played on a chessboard?', opts: ['Ludo', 'Chess', 'Snakes and Ladders', 'Carrom'], c: 1, e: 'Chess uses a chessboard.' },
    { q: 'In which sport do we swim?', opts: ['Running', 'Swimming', 'Cycling', 'Jumping'], c: 1, e: 'Swimming is done in water.' },
    { q: 'What do we kick in football?', opts: ['Bat', 'Ball', 'Stick', 'Racket'], c: 1, e: 'Football uses a ball.' },
    { q: 'How many players are in a football team?', opts: ['9', '10', '11', '12'], c: 2, e: 'Football has 11 players.' },
    { q: 'Which sport uses a net?', opts: ['Cricket', 'Volleyball', 'Hockey', 'Football'], c: 1, e: 'Volleyball uses a net.' },
    { q: 'What do we hold in tennis?', opts: ['Bat', 'Racket', 'Stick', 'Club'], c: 1, e: 'Tennis uses a racket.' },
    { q: 'Which sport is played on ice?', opts: ['Cricket', 'Hockey', 'Football', 'Tennis'], c: 1, e: 'Ice hockey is on ice.' },
    { q: 'What colour card means "leave the game"?', opts: ['Yellow', 'Red', 'Green', 'Blue'], c: 1, e: 'Red card means send-off.' },
    { q: 'Which country invented cricket?', opts: ['India', 'Australia', 'England', 'West Indies'], c: 2, e: 'Cricket started in England.' },
    { q: 'What do we call the person who runs in a race?', opts: ['Swimmer', 'Runner', 'Cyclist', 'Jumper'], c: 1, e: 'Runner participates in races.' },
    { q: 'Which game has "checkmate"?', opts: ['Ludo', 'Chess', 'Snakes and Ladders', 'Carrom'], c: 1, e: 'Checkmate is in chess.' },
    { q: 'What do we hit in cricket?', opts: ['Shuttlecock', 'Ball', 'Puck', 'Disc'], c: 1, e: 'Cricket uses a ball.' },
    { q: 'Which sport has a "grand slam"?', opts: ['Cricket', 'Tennis', 'Football', 'Hockey'], c: 1, e: 'Tennis has Grand Slam.' },
    { q: 'What do we wear on our head while cycling?', opts: ['Cap', 'Helmet', 'Hat', 'Bandana'], c: 1, e: 'Helmet protects the head.' },
    { q: 'Which sport uses a bat?', opts: ['Football', 'Cricket', 'Hockey', 'Tennis'], c: 1, e: 'Cricket uses a bat.' },
    { q: 'What do we call the person who teaches sports?', opts: ['Doctor', 'Coach', 'Driver', 'Teacher'], c: 1, e: 'Coach trains athletes.' },
    { q: 'Which Olympic event involves running and jumping?', opts: ['Swimming', 'Athletics', 'Boxing', 'Wrestling'], c: 1, e: 'Athletics includes track and field.' },
    { q: 'What do we call the person who wins a race?', opts: ['Loser', 'Winner', 'Runner', 'Spectator'], c: 1, e: 'Winner comes first.' },
    { q: 'Which sport uses a stick and ball?', opts: ['Football', 'Hockey', 'Tennis', 'Badminton'], c: 1, e: 'Hockey uses stick and ball.' },
  ],
  'maths-fun': [
    { q: 'What is 2 + 3?', opts: ['4', '5', '6', '7'], c: 1, e: '2 + 3 = 5' },
    { q: 'How many sides does a triangle have?', opts: ['Two', 'Three', 'Four', 'Five'], c: 1, e: 'A triangle has 3 sides.' },
    { q: 'What is 10 - 4?', opts: ['5', '6', '7', '8'], c: 1, e: '10 - 4 = 6' },
    { q: 'How many zeros are in 100?', opts: ['One', 'Two', 'Three', 'Four'], c: 1, e: '100 has two zeros.' },
    { q: 'What shape is a ball?', opts: ['Square', 'Triangle', 'Circle', 'Sphere'], c: 3, e: 'A ball is sphere-shaped.' },
    { q: 'What is 5 + 5?', opts: ['9', '10', '11', '12'], c: 1, e: '5 + 5 = 10' },
    { q: 'How many days are in two weeks?', opts: ['7', '12', '14', '21'], c: 2, e: 'Two weeks = 14 days.' },
    { q: 'What comes after 99?', opts: ['98', '100', '101', '199'], c: 1, e: '100 comes after 99.' },
    { q: 'How many corners does a square have?', opts: ['Three', 'Four', 'Five', 'Six'], c: 1, e: 'A square has 4 corners.' },
    { q: 'What is half of 10?', opts: ['3', '4', '5', '6'], c: 2, e: 'Half of 10 is 5.' },
    { q: 'What is 4 × 2?', opts: ['6', '8', '10', '12'], c: 1, e: '4 × 2 = 8' },
    { q: 'How many corners does a rectangle have?', opts: ['Three', 'Four', 'Five', 'Six'], c: 1, e: 'Rectangle has 4 corners.' },
    { q: 'What is 20 ÷ 4?', opts: ['4', '5', '6', '7'], c: 1, e: '20 ÷ 4 = 5' },
    { q: 'How many minutes are in an hour?', opts: ['30', '45', '60', '90'], c: 2, e: 'One hour = 60 minutes.' },
    { q: 'What is 7 + 8?', opts: ['14', '15', '16', '17'], c: 1, e: '7 + 8 = 15' },
    { q: 'Which shape has no corners?', opts: ['Square', 'Triangle', 'Circle', 'Rectangle'], c: 2, e: 'Circle has no corners.' },
    { q: 'What is 100 - 25?', opts: ['65', '75', '85', '95'], c: 1, e: '100 - 25 = 75' },
    { q: 'How many sides does a pentagon have?', opts: ['4', '5', '6', '7'], c: 1, e: 'Pentagon has 5 sides.' },
    { q: 'What is double of 6?', opts: ['10', '12', '14', '16'], c: 1, e: 'Double of 6 is 12.' },
    { q: 'How many tens are in 50?', opts: ['3', '4', '5', '6'], c: 2, e: '50 has 5 tens.' },
    { q: 'What is 3 × 4?', opts: ['10', '12', '14', '16'], c: 1, e: '3 × 4 = 12' },
    { q: 'Which number comes before 100?', opts: ['98', '99', '101', '102'], c: 1, e: '99 comes before 100.' },
    { q: 'What is 15 + 15?', opts: ['25', '30', '35', '40'], c: 1, e: '15 + 15 = 30' },
    { q: 'How many days are in a month?', opts: ['28-31', '20', '40', '50'], c: 0, e: 'Months have 28-31 days.' },
    { q: 'What is 9 + 6?', opts: ['14', '15', '16', '17'], c: 1, e: '9 + 6 = 15' },
    { q: 'How many corners does a pentagon have?', opts: ['4', '5', '6', '7'], c: 1, e: 'Pentagon has 5 corners.' },
  ],
  'life-skills': [
    { q: 'What should we do when we meet someone?', opts: ['Ignore them', 'Greet them', 'Run away', 'Shout'], c: 1, e: 'Greeting is polite.' },
    { q: 'What should we say when we receive help?', opts: ['Nothing', 'Thank you', 'Go away', 'No'], c: 1, e: 'Thank you shows gratitude.' },
    { q: 'What should we do when we make a mistake?', opts: ['Hide it', 'Say sorry', 'Blame others', 'Cry'], c: 1, e: 'Saying sorry is right.' },
    { q: 'How should we treat our friends?', opts: ['Mean', 'Kind', 'Selfish', 'Rude'], c: 1, e: 'Kindness builds friendship.' },
    { q: 'What should we do before eating?', opts: ['Run', 'Wash hands', 'Sleep', 'Play'], c: 1, e: 'Washing hands keeps us healthy.' },
    { q: 'What is important in a team?', opts: ['Fighting', 'Cooperation', 'Being alone', 'Blaming'], c: 1, e: 'Cooperation helps teams.' },
    { q: 'What should we do when we feel angry?', opts: ['Shout', 'Take deep breaths', 'Hit someone', 'Cry'], c: 1, e: 'Deep breaths help calm down.' },
    { q: 'How should we talk to elders?', opts: ['Rudely', 'Respectfully', 'Loudly', 'Ignoring'], c: 1, e: 'Respect is important.' },
    { q: 'What should we do with our waste?', opts: ['Throw anywhere', 'Put in bin', 'Leave on road', 'Burn'], c: 1, e: 'Use bins for waste.' },
    { q: 'What helps us make good choices?', opts: ['Impulse', 'Thinking', 'Copying', 'Guessing'], c: 1, e: 'Thinking helps decide.' },
    { q: 'What should we do when we need help?', opts: ['Give up', 'Ask for help', 'Hide', 'Cry'], c: 1, e: 'Asking for help is okay.' },
    { q: 'How should we behave in a queue?', opts: ['Push others', 'Wait our turn', 'Skip the line', 'Shout'], c: 1, e: 'We wait our turn in a queue.' },
    { q: 'What should we do when we break something?', opts: ['Hide it', 'Own up and apologise', 'Blame others', 'Run away'], c: 1, e: 'Owning up is the right thing.' },
    { q: 'How can we show empathy?', opts: ['Ignore others', 'Understand their feelings', 'Laugh at them', 'Walk away'], c: 1, e: 'Empathy means understanding feelings.' },
    { q: 'What should we do before crossing the road?', opts: ['Run', 'Look both ways', 'Close eyes', 'Jump'], c: 1, e: 'Look both ways for safety.' },
    { q: 'How should we handle failure?', opts: ['Give up', 'Learn and try again', 'Blame others', 'Cry'], c: 1, e: 'Learning from failure helps us grow.' },
    { q: 'What is important in a friendship?', opts: ['Fighting', 'Trust and respect', 'Lying', 'Ignoring'], c: 1, e: 'Trust and respect build friendship.' },
    { q: 'How should we use our time wisely?', opts: ['Waste it', 'Plan and prioritise', 'Sleep all day', 'Watch only TV'], c: 1, e: 'Planning helps use time well.' },
    { q: 'What should we do when someone is sad?', opts: ['Ignore them', 'Comfort them', 'Laugh', 'Leave'], c: 1, e: 'Comforting shows care.' },
    { q: 'How can we manage stress?', opts: ['Worry more', 'Take breaks and relax', 'Work non-stop', 'Avoid sleep'], c: 1, e: 'Breaks and relaxation help.' },
    { q: 'What should we do with our belongings?', opts: ['Leave everywhere', 'Keep them organised', 'Throw away', 'Lose them'], c: 1, e: 'Organising keeps things safe.' },
    { q: 'How should we respond to criticism?', opts: ['Get angry', 'Listen and learn', 'Ignore', 'Cry'], c: 1, e: 'Listening helps us improve.' },
    { q: 'What is good communication?', opts: ['Shouting', 'Listening and speaking clearly', 'Interrupting', 'Ignoring'], c: 1, e: 'Good communication involves listening.' },
    { q: 'How should we treat people who are different?', opts: ['Bully them', 'Respect them', 'Ignore them', 'Laugh at them'], c: 1, e: 'Respect everyone equally.' },
    { q: 'What should we do when we see someone fall?', opts: ['Laugh', 'Help them up', 'Walk away', 'Ignore'], c: 1, e: 'Helping shows kindness.' },
    { q: 'How can we show we are listening?', opts: ['Look away', 'Make eye contact', 'Interrupt', 'Talk over'], c: 1, e: 'Eye contact shows we listen.' },
  ],
  'current-affairs': [
    { q: 'Who is the Prime Minister of India?', opts: ['President', 'Narendra Modi', 'Chief Minister', 'Governor'], c: 1, e: 'Narendra Modi is the PM.' },
    { q: 'Which day is celebrated as Republic Day?', opts: ['15 August', '26 January', '2 October', '25 December'], c: 1, e: '26 January is Republic Day.' },
    { q: 'Which day is Independence Day?', opts: ['26 January', '15 August', '2 October', '14 November'], c: 1, e: '15 August is Independence Day.' },
    { q: 'Who is known as the Father of the Nation?', opts: ['Nehru', 'Gandhi', 'Tagore', 'Patel'], c: 1, e: 'Mahatma Gandhi is Father of Nation.' },
    { q: 'Which city hosted the 2024 Olympics?', opts: ['London', 'Tokyo', 'Paris', 'Beijing'], c: 2, e: 'Paris hosted 2024 Olympics.' },
    { q: 'What is the currency of India?', opts: ['Dollar', 'Rupee', 'Pound', 'Euro'], c: 1, e: 'Indian Rupee is our currency.' },
    { q: 'Which planet is known as the Red Planet?', opts: ['Earth', 'Mars', 'Jupiter', 'Venus'], c: 1, e: 'Mars is the Red Planet.' },
    { q: 'How many states does India have?', opts: ['26', '27', '28', '29'], c: 2, e: 'India has 28 states.' },
    { q: 'Which is the national sport of India?', opts: ['Cricket', 'Hockey', 'Football', 'Tennis'], c: 1, e: 'Hockey is the national sport.' },
    { q: 'Who wrote the Indian national anthem?', opts: ['Gandhi', 'Tagore', 'Nehru', 'Patel'], c: 1, e: 'Rabindranath Tagore wrote it.' },
    { q: 'Which day is celebrated as Gandhi Jayanti?', opts: ['15 August', '26 January', '2 October', '25 December'], c: 2, e: '2 October is Gandhi Jayanti.' },
    { q: 'Who was the first Prime Minister of India?', opts: ['Gandhi', 'Nehru', 'Patel', 'Bose'], c: 1, e: 'Jawaharlal Nehru was the first PM.' },
    { q: 'Which organisation works for world peace?', opts: ['WTO', 'UN', 'IMF', 'WHO'], c: 1, e: 'UN works for peace.' },
    { q: 'What is the capital of China?', opts: ['Shanghai', 'Beijing', 'Hong Kong', 'Tokyo'], c: 1, e: 'Beijing is China\'s capital.' },
    { q: 'Which planet is closest to the Sun?', opts: ['Venus', 'Earth', 'Mercury', 'Mars'], c: 2, e: 'Mercury is closest to the Sun.' },
    { q: 'What is the largest mammal?', opts: ['Elephant', 'Blue whale', 'Giraffe', 'Rhino'], c: 1, e: 'Blue whale is the largest mammal.' },
    { q: 'Which year did India gain independence?', opts: ['1945', '1947', '1950', '1942'], c: 1, e: 'India became independent in 1947.' },
    { q: 'What is the full form of NASA?', opts: ['National Air Space Agency', 'National Aeronautics and Space Administration', 'North American Space Agency', 'New Aeronautics Space Association'], c: 1, e: 'NASA is National Aeronautics and Space Administration.' },
    { q: 'Which country has the most people?', opts: ['USA', 'India', 'China', 'Russia'], c: 2, e: 'China has the largest population.' },
    { q: 'What do we celebrate on 14 November?', opts: ['Republic Day', 'Children\'s Day', 'Independence Day', 'Gandhi Jayanti'], c: 1, e: '14 November is Children\'s Day.' },
    { q: 'Which is the longest river in India?', opts: ['Yamuna', 'Ganga', 'Brahmaputra', 'Godavari'], c: 1, e: 'Ganga is one of the longest.' },
    { q: 'What is the capital of UK?', opts: ['Manchester', 'London', 'Edinburgh', 'Birmingham'], c: 1, e: 'London is the capital.' },
    { q: 'Which festival marks the birth of Jesus?', opts: ['Diwali', 'Eid', 'Christmas', 'Holi'], c: 2, e: 'Christmas celebrates Jesus\' birth.' },
    { q: 'What is the study of stars called?', opts: ['Biology', 'Astronomy', 'Chemistry', 'Geography'], c: 1, e: 'Astronomy studies stars.' },
    { q: 'Which city is the financial capital of India?', opts: ['Delhi', 'Mumbai', 'Kolkata', 'Chennai'], c: 1, e: 'Mumbai is the financial capital.' },
    { q: 'What is the largest desert in India?', opts: ['Sahara', 'Thar', 'Gobi', 'Kalahari'], c: 1, e: 'Thar Desert is in India.' },
  ],
  'our-body-and-health': [
    { q: 'How many fingers do we have on one hand?', opts: ['Four', 'Five', 'Six', 'Seven'], c: 1, e: 'We have five fingers.' },
    { q: 'Which organ pumps blood?', opts: ['Lungs', 'Heart', 'Liver', 'Kidney'], c: 1, e: 'Heart pumps blood.' },
    { q: 'What should we eat for strong bones?', opts: ['Candy', 'Milk', 'Chips', 'Soda'], c: 1, e: 'Milk has calcium.' },
    { q: 'How many teeth do adults have?', opts: ['20', '28', '32', '36'], c: 2, e: 'Adults have 32 teeth.' },
    { q: 'Which vitamin do we get from sunlight?', opts: ['A', 'B', 'C', 'D'], c: 3, e: 'Vitamin D from sunlight.' },
    { q: 'What should we do to stay healthy?', opts: ['Eat junk', 'Exercise', 'Sleep all day', 'Skip meals'], c: 1, e: 'Exercise keeps us fit.' },
    { q: 'Which organ helps us breathe?', opts: ['Heart', 'Lungs', 'Stomach', 'Brain'], c: 1, e: 'Lungs help us breathe.' },
    { q: 'How many hours should children sleep?', opts: ['4-5', '6-7', '8-10', '12-14'], c: 2, e: '8-10 hours is recommended.' },
    { q: 'What helps us digest food?', opts: ['Heart', 'Stomach', 'Lungs', 'Brain'], c: 1, e: 'Stomach digests food.' },
    { q: 'Which is a healthy habit?', opts: ['Smoking', 'Brushing teeth', 'Skipping breakfast', 'Staying up late'], c: 1, e: 'Brushing teeth is healthy.' },
    { q: 'What organ controls our body?', opts: ['Heart', 'Liver', 'Brain', 'Stomach'], c: 2, e: 'Brain controls the body.' },
    { q: 'Which food gives us energy?', opts: ['Candy only', 'Balanced diet', 'Chips only', 'Soda only'], c: 1, e: 'Balanced diet gives energy.' },
    { q: 'How many bones do we have?', opts: ['150', '200', '206', '250'], c: 2, e: 'Adults have about 206 bones.' },
    { q: 'What should we do when we have a fever?', opts: ['Ignore it', 'Rest and see a doctor', 'Play outside', 'Eat junk'], c: 1, e: 'Rest and doctor visit help.' },
    { q: 'Which vitamin do we get from oranges?', opts: ['A', 'B', 'C', 'D'], c: 2, e: 'Oranges have Vitamin C.' },
    { q: 'What do we use to taste food?', opts: ['Ears', 'Eyes', 'Tongue', 'Nose'], c: 2, e: 'Tongue helps us taste.' },
    { q: 'Which is good for our eyes?', opts: ['Staring at screen', 'Eating carrots', 'No sleep', 'Rubbing eyes'], c: 1, e: 'Carrots have Vitamin A for eyes.' },
    { q: 'What should we do after playing?', opts: ['Sleep', 'Wash hands', 'Eat sweets', 'Skip bath'], c: 1, e: 'Washing hands prevents germs.' },
    { q: 'Which organ filters our blood?', opts: ['Heart', 'Kidneys', 'Lungs', 'Stomach'], c: 1, e: 'Kidneys filter blood.' },
    { q: 'What helps build strong muscles?', opts: ['Sitting only', 'Exercise and protein', 'No food', 'Sugar'], c: 1, e: 'Exercise and protein build muscles.' },
    { q: 'How often should we brush our teeth?', opts: ['Once a week', 'Twice a day', 'Once a month', 'Never'], c: 1, e: 'Brush twice daily.' },
    { q: 'Which is a healthy drink?', opts: ['Soda', 'Fresh juice', 'Energy drink', 'Cola'], c: 1, e: 'Fresh juice is healthy.' },
    { q: 'What do we need for strong bones?', opts: ['Sugar', 'Calcium', 'Salt', 'Oil'], c: 1, e: 'Calcium strengthens bones.' },
    { q: 'Which habit helps us sleep well?', opts: ['Screen before bed', 'Regular sleep time', 'Late night food', 'Loud music'], c: 1, e: 'Regular sleep time helps.' },
    { q: 'What do we call the tube that carries food to the stomach?', opts: ['Windpipe', 'Oesophagus', 'Artery', 'Vein'], c: 1, e: 'Oesophagus carries food.' },
    { q: 'Which vitamin helps in blood clotting?', opts: ['A', 'B', 'C', 'K'], c: 3, e: 'Vitamin K helps clotting.' },
  ],
  'environment-and-its-conservation': [
    { q: 'What does "recycle" mean?', opts: ['Throw away', 'Use again', 'Burn', 'Bury'], c: 1, e: 'Recycle means use again.' },
    { q: 'Which helps reduce pollution?', opts: ['More cars', 'Planting trees', 'Burning waste', 'Plastic bags'], c: 1, e: 'Trees clean the air.' },
    { q: 'What should we do with plastic bags?', opts: ['Reuse', 'Burn', 'Throw in river', 'Leave anywhere'], c: 0, e: 'Reusing reduces waste.' },
    { q: 'Which is a renewable resource?', opts: ['Coal', 'Wind', 'Petrol', 'Diesel'], c: 1, e: 'Wind energy is renewable.' },
    { q: 'What causes air pollution?', opts: ['Trees', 'Vehicle smoke', 'Rain', 'Plants'], c: 1, e: 'Vehicle smoke pollutes.' },
    { q: 'Why should we save water?', opts: ['It is free', 'It is limited', 'It is cold', 'It is hot'], c: 1, e: 'Water is a limited resource.' },
    { q: 'What do we call protecting nature?', opts: ['Pollution', 'Conservation', 'Destruction', 'Waste'], c: 1, e: 'Conservation protects nature.' },
    { q: 'Which animal is endangered?', opts: ['Dog', 'Tiger', 'Cow', 'Goat'], c: 1, e: 'Tigers are endangered.' },
    { q: 'What is global warming?', opts: ['Earth getting colder', 'Earth getting warmer', 'More rain', 'Less sun'], c: 1, e: 'Earth is getting warmer.' },
    { q: 'How can we save electricity?', opts: ['Leave lights on', 'Switch off when not needed', 'Use more AC', 'Keep TV on'], c: 1, e: 'Switch off to save.' },
    { q: 'What do we call protecting endangered species?', opts: ['Hunting', 'Wildlife conservation', 'Pollution', 'Deforestation'], c: 1, e: 'Wildlife conservation protects species.' },
    { q: 'Which helps reduce plastic waste?', opts: ['Use more plastic', 'Carry cloth bags', 'Burn plastic', 'Throw in sea'], c: 1, e: 'Cloth bags reduce plastic.' },
    { q: 'What do we call the process of planting trees?', opts: ['Deforestation', 'Afforestation', 'Pollution', 'Erosion'], c: 1, e: 'Afforestation is planting trees.' },
    { q: 'Which is a way to conserve water at home?', opts: ['Long showers', 'Fix leaking taps', 'Leave tap open', 'Waste water'], c: 1, e: 'Fixing leaks saves water.' },
    { q: 'What causes ocean pollution?', opts: ['Fish', 'Plastic waste', 'Coral', 'Seaweed'], c: 1, e: 'Plastic pollutes oceans.' },
    { q: 'Which energy source does not pollute?', opts: ['Coal', 'Solar', 'Diesel', 'Petrol'], c: 1, e: 'Solar energy is clean.' },
    { q: 'What do we call the natural home of animals?', opts: ['Zoo', 'Wildlife sanctuary', 'Circus', 'Farm'], c: 1, e: 'Sanctuaries protect wildlife.' },
    { q: 'Which is a sustainable practice?', opts: ['Overfishing', 'Crop rotation', 'Clear cutting', 'Overgrazing'], c: 1, e: 'Crop rotation is sustainable.' },
    { q: 'What do we call the warming of Earth\'s climate?', opts: ['Cooling', 'Global warming', 'Ice age', 'Winter'], c: 1, e: 'Global warming heats the planet.' },
    { q: 'Which helps reduce air pollution?', opts: ['More vehicles', 'Public transport', 'Burning waste', 'Factories'], c: 1, e: 'Public transport reduces pollution.' },
    { q: 'What do we call the variety of plants and animals?', opts: ['Pollution', 'Biodiversity', 'Erosion', 'Deforestation'], c: 1, e: 'Biodiversity is variety of life.' },
    { q: 'Which material takes longest to decompose?', opts: ['Paper', 'Plastic', 'Food waste', 'Leaves'], c: 1, e: 'Plastic takes hundreds of years.' },
    { q: 'What do we call rain collected for use?', opts: ['Waste water', 'Rainwater harvesting', 'Sewage', 'Pollution'], c: 1, e: 'Rainwater harvesting saves water.' },
    { q: 'Which helps protect the ozone layer?', opts: ['CFCs', 'Avoiding CFCs', 'Burning waste', 'More cars'], c: 1, e: 'Avoiding CFCs protects ozone.' },
    { q: 'What do we call converting waste into new products?', opts: ['Burning', 'Recycling', 'Dumping', 'Littering'], c: 1, e: 'Recycling makes new products.' },
    { q: 'Which animal is a symbol of conservation success?', opts: ['Dodo', 'Tiger', 'Panda', 'Elephant'], c: 2, e: 'Panda is a conservation symbol.' },
  ],
  'entertainment': [
    { q: 'What do we watch for fun?', opts: ['News', 'Movies', 'Weather', 'Sports scores'], c: 1, e: 'Movies entertain us.' },
    { q: 'Which instrument is used in music?', opts: ['Hammer', 'Guitar', 'Saw', 'Drill'], c: 1, e: 'Guitar is a music instrument.' },
    { q: 'What do we call a person who acts in films?', opts: ['Director', 'Actor', 'Cameraman', 'Producer'], c: 1, e: 'Actors perform in films.' },
    { q: 'Which dance form is from India?', opts: ['Ballet', 'Bharatanatyam', 'Salsa', 'Hip-hop'], c: 1, e: 'Bharatanatyam is Indian.' },
    { q: 'What do we use to listen to music?', opts: ['Book', 'Earphones', 'Pen', 'Ruler'], c: 1, e: 'Earphones play music.' },
    { q: 'Which is a folk dance of Punjab?', opts: ['Kathak', 'Bhangra', 'Odissi', 'Kuchipudi'], c: 1, e: 'Bhangra is from Punjab.' },
    { q: 'What do we call a story shown on TV?', opts: ['News', 'Serial', 'Advertisement', 'Weather'], c: 1, e: 'Serials are TV stories.' },
    { q: 'Which festival is known for colours?', opts: ['Diwali', 'Holi', 'Eid', 'Christmas'], c: 1, e: 'Holi is the festival of colours.' },
    { q: 'What do we do at a circus?', opts: ['Study', 'Watch acts', 'Cook', 'Sleep'], c: 1, e: 'Circus has performances.' },
    { q: 'Which game can we play indoors?', opts: ['Cricket', 'Football', 'Chess', 'Hockey'], c: 2, e: 'Chess is an indoor game.' },
    { q: 'What do we call a person who sings songs?', opts: ['Actor', 'Singer', 'Dancer', 'Painter'], c: 1, e: 'A singer performs songs.' },
    { q: 'Which instrument has strings?', opts: ['Drum', 'Flute', 'Guitar', 'Trumpet'], c: 2, e: 'Guitar has strings.' },
    { q: 'What do we watch in a cinema?', opts: ['News', 'Movies', 'Weather', 'Sports'], c: 1, e: 'Cinema shows movies.' },
    { q: 'Which dance is from Kerala?', opts: ['Bhangra', 'Kathakali', 'Garba', 'Bihu'], c: 1, e: 'Kathakali is from Kerala.' },
    { q: 'What do we call a funny show?', opts: ['Tragedy', 'Comedy', 'Drama', 'Horror'], c: 1, e: 'Comedy makes us laugh.' },
    { q: 'Which festival involves flying kites?', opts: ['Diwali', 'Makar Sankranti', 'Holi', 'Eid'], c: 1, e: 'Makar Sankranti has kite flying.' },
    { q: 'What do we use to watch videos online?', opts: ['Radio', 'Streaming app', 'Newspaper', 'Book'], c: 1, e: 'Streaming apps show videos.' },
    { q: 'Which art form uses colours on canvas?', opts: ['Sculpture', 'Painting', 'Music', 'Dance'], c: 1, e: 'Painting uses colours.' },
    { q: 'What do we call a live performance on stage?', opts: ['Movie', 'Play', 'Cartoon', 'Documentary'], c: 1, e: 'A play is performed live.' },
    { q: 'Which festival is celebrated with colours?', opts: ['Diwali', 'Holi', 'Eid', 'Christmas'], c: 1, e: 'Holi is the festival of colours.' },
    { q: 'What do we call music without words?', opts: ['Song', 'Instrumental', 'Rap', 'Opera'], c: 1, e: 'Instrumental has no words.' },
    { q: 'Which is a traditional Indian dance?', opts: ['Ballet', 'Kathak', 'Salsa', 'Hip-hop'], c: 1, e: 'Kathak is Indian classical dance.' },
    { q: 'What do we call a story in a newspaper?', opts: ['Novel', 'Article', 'Poem', 'Essay'], c: 1, e: 'Articles are in newspapers.' },
    { q: 'Which festival marks the end of Ramadan?', opts: ['Diwali', 'Eid', 'Christmas', 'Holi'], c: 1, e: 'Eid marks end of Ramadan.' },
    { q: 'What do we call a group of musicians?', opts: ['Team', 'Band', 'Crowd', 'Class'], c: 1, e: 'A band is a group of musicians.' },
    { q: 'Which art uses clay or stone?', opts: ['Painting', 'Sculpture', 'Music', 'Dance'], c: 1, e: 'Sculpture uses clay or stone.' },
  ],
  'universe': [
    { q: 'Which planet do we live on?', opts: ['Mars', 'Earth', 'Venus', 'Jupiter'], c: 1, e: 'We live on Earth.' },
    { q: 'What gives us light during the day?', opts: ['Moon', 'Stars', 'Sun', 'Lamp'], c: 2, e: 'The Sun gives daylight.' },
    { q: 'How many planets are in our solar system?', opts: ['Seven', 'Eight', 'Nine', 'Ten'], c: 1, e: 'There are eight planets.' },
    { q: 'Which is the closest star to Earth?', opts: ['Polaris', 'Sirius', 'Sun', 'Proxima'], c: 2, e: 'The Sun is our closest star.' },
    { q: 'What do we see in the sky at night?', opts: ['Sun', 'Clouds', 'Stars', 'Rainbow'], c: 2, e: 'Stars appear at night.' },
    { q: 'Which planet is the largest?', opts: ['Earth', 'Mars', 'Jupiter', 'Saturn'], c: 2, e: 'Jupiter is the largest.' },
    { q: 'What shape is the Earth?', opts: ['Flat', 'Square', 'Round', 'Triangle'], c: 2, e: 'Earth is round (sphere).' },
    { q: 'Which planet has rings?', opts: ['Mars', 'Venus', 'Saturn', 'Mercury'], c: 2, e: 'Saturn has visible rings.' },
    { q: 'What do we call the path Earth takes around the Sun?', opts: ['Spin', 'Orbit', 'Jump', 'Fall'], c: 1, e: 'Orbit is Earth\'s path.' },
    { q: 'How long does Earth take to orbit the Sun?', opts: ['One month', 'One year', 'One week', 'One day'], c: 1, e: 'One year = 365 days.' },
    { q: 'What do we call a shooting star?', opts: ['Star', 'Meteor', 'Planet', 'Comet'], c: 1, e: 'Meteors are shooting stars.' },
    { q: 'Which planet is known as the Morning Star?', opts: ['Mars', 'Venus', 'Jupiter', 'Saturn'], c: 1, e: 'Venus is the Morning Star.' },
    { q: 'What do we call a group of stars that form a pattern?', opts: ['Planet', 'Constellation', 'Galaxy', 'Comet'], c: 1, e: 'Constellations form patterns.' },
    { q: 'Which planet has the most moons?', opts: ['Earth', 'Mars', 'Saturn', 'Jupiter'], c: 2, e: 'Saturn has many moons.' },
    { q: 'What do we call the path of a planet?', opts: ['Spin', 'Orbit', 'Jump', 'Fall'], c: 1, e: 'Orbit is the planet\'s path.' },
    { q: 'Which is the smallest planet?', opts: ['Earth', 'Mars', 'Mercury', 'Venus'], c: 2, e: 'Mercury is the smallest.' },
    { q: 'What do we call a ball of ice and dust?', opts: ['Asteroid', 'Comet', 'Meteor', 'Planet'], c: 1, e: 'Comets are ice and dust.' },
    { q: 'Which planet is between Earth and Jupiter?', opts: ['Venus', 'Mars', 'Saturn', 'Mercury'], c: 1, e: 'Mars is between Earth and Jupiter.' },
    { q: 'What do we call our galaxy?', opts: ['Andromeda', 'Milky Way', 'Orion', 'Pleiades'], c: 1, e: 'We live in the Milky Way.' },
    { q: 'Which planet spins on its side?', opts: ['Earth', 'Mars', 'Uranus', 'Neptune'], c: 2, e: 'Uranus spins on its side.' },
    { q: 'What do we call the dark side of the Moon?', opts: ['Bright side', 'Far side', 'Near side', 'Hidden side'], c: 1, e: 'Far side faces away from Earth.' },
    { q: 'Which planet is blue?', opts: ['Mars', 'Venus', 'Neptune', 'Mercury'], c: 2, e: 'Neptune appears blue.' },
    { q: 'What do we call a hole in the Moon\'s surface?', opts: ['Mountain', 'Crater', 'Valley', 'Lake'], c: 1, e: 'Craters are impact holes.' },
    { q: 'Which is the hottest planet?', opts: ['Mercury', 'Venus', 'Mars', 'Jupiter'], c: 1, e: 'Venus is the hottest.' },
    { q: 'What do we call a small rocky body in space?', opts: ['Comet', 'Asteroid', 'Planet', 'Star'], c: 1, e: 'Asteroids are rocky bodies.' },
    { q: 'Which planet spins the fastest?', opts: ['Earth', 'Mars', 'Jupiter', 'Saturn'], c: 2, e: 'Jupiter spins the fastest.' },
  ],
  'social-studies': [
    { q: 'What do we call the study of the past?', opts: ['Geography', 'History', 'Science', 'Maths'], c: 1, e: 'History studies the past.' },
    { q: 'Which is a mode of transport?', opts: ['Book', 'Train', 'Pen', 'Table'], c: 1, e: 'Train is a transport.' },
    { q: 'What do we call the leader of a country?', opts: ['Teacher', 'President', 'Doctor', 'Driver'], c: 1, e: 'President leads the country.' },
    { q: 'Which document gives rights to citizens?', opts: ['Report', 'Constitution', 'Letter', 'Bill'], c: 1, e: 'Constitution gives rights.' },
    { q: 'What do we call a drawing of Earth\'s surface?', opts: ['Painting', 'Map', 'Photo', 'Sketch'], c: 1, e: 'A map shows the surface.' },
    { q: 'Which direction does the Sun rise?', opts: ['West', 'North', 'East', 'South'], c: 2, e: 'Sun rises in the East.' },
    { q: 'What do we call people who make laws?', opts: ['Judges', 'Lawmakers', 'Doctors', 'Engineers'], c: 1, e: 'Lawmakers make laws.' },
    { q: 'Which is the largest democracy?', opts: ['USA', 'India', 'China', 'Russia'], c: 1, e: 'India is the largest democracy.' },
    { q: 'What do we call the study of Earth?', opts: ['History', 'Geography', 'Science', 'Maths'], c: 1, e: 'Geography studies Earth.' },
    { q: 'Which river is the longest in India?', opts: ['Yamuna', 'Ganga', 'Brahmaputra', 'Godavari'], c: 1, e: 'Ganga is one of the longest.' },
    { q: 'What do we call the head of a state government?', opts: ['President', 'Prime Minister', 'Chief Minister', 'Governor'], c: 2, e: 'Chief Minister leads the state.' },
    { q: 'Which document is the supreme law of India?', opts: ['Report', 'Constitution', 'Bill', 'Letter'], c: 1, e: 'Constitution is the supreme law.' },
    { q: 'What do we call the study of maps?', opts: ['History', 'Cartography', 'Science', 'Maths'], c: 1, e: 'Cartography is map-making.' },
    { q: 'Which direction is opposite to North?', opts: ['East', 'West', 'South', 'Up'], c: 2, e: 'South is opposite to North.' },
    { q: 'What do we call a person who represents our area in Parliament?', opts: ['Judge', 'MP', 'Doctor', 'Teacher'], c: 1, e: 'MP is Member of Parliament.' },
    { q: 'Which is the oldest civilisation?', opts: ['Roman', 'Indus Valley', 'Greek', 'Egyptian'], c: 1, e: 'Indus Valley is ancient.' },
    { q: 'What do we call the line that divides Earth into hemispheres?', opts: ['Border', 'Equator', 'Pole', 'Axis'], c: 1, e: 'Equator divides the Earth.' },
    { q: 'Which system did ancient India use for numbers?', opts: ['Roman', 'Decimal', 'Binary', 'Octal'], c: 1, e: 'India contributed to decimal system.' },
    { q: 'What do we call the right to vote?', opts: ['Duty', 'Franchise', 'Law', 'Rule'], c: 1, e: 'Franchise is the right to vote.' },
    { q: 'Which ocean is the smallest?', opts: ['Pacific', 'Atlantic', 'Indian', 'Arctic'], c: 3, e: 'Arctic is the smallest ocean.' },
    { q: 'What do we call a period in history?', opts: ['Era', 'Day', 'Hour', 'Minute'], c: 0, e: 'Era is a historical period.' },
    { q: 'Which country is our eastern neighbour?', opts: ['Pakistan', 'Bangladesh', 'China', 'Sri Lanka'], c: 1, e: 'Bangladesh is to the east.' },
    { q: 'What do we call the study of coins?', opts: ['Biology', 'Numismatics', 'Chemistry', 'Physics'], c: 1, e: 'Numismatics studies coins.' },
    { q: 'Which is the largest desert in the world?', opts: ['Thar', 'Sahara', 'Gobi', 'Kalahari'], c: 1, e: 'Sahara is the largest desert.' },
    { q: 'What do we call the system of rules for a country?', opts: ['Law', 'Constitution', 'Rule', 'Order'], c: 1, e: 'Constitution sets the rules.' },
    { q: 'Which is the smallest country in the world?', opts: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'], c: 1, e: 'Vatican City is the smallest.' },
  ],
  'quantitative-aptitude-and-reasoning': [
    { q: 'What comes next: 2, 4, 6, 8, ___?', opts: ['9', '10', '11', '12'], c: 1, e: 'Pattern: add 2 each time.' },
    { q: 'If A=1, B=2, what is C?', opts: ['2', '3', '4', '5'], c: 1, e: 'C is the 3rd letter.' },
    { q: 'What is the odd one out: Apple, Banana, Car, Orange?', opts: ['Apple', 'Banana', 'Car', 'Orange'], c: 2, e: 'Car is not a fruit.' },
    { q: 'How many months have 30 days?', opts: ['4', '5', '6', '7'], c: 0, e: 'April, June, Sept, Nov have 30.' },
    { q: 'What is 15% of 100?', opts: ['5', '10', '15', '20'], c: 2, e: '15% of 100 = 15' },
    { q: 'Complete: 3, 6, 9, 12, ___?', opts: ['14', '15', '16', '18'], c: 1, e: 'Add 3 each time.' },
    { q: 'Which is different: Dog, Cat, Table, Cow?', opts: ['Dog', 'Cat', 'Table', 'Cow'], c: 2, e: 'Table is not an animal.' },
    { q: 'What is 25% of 200?', opts: ['25', '50', '75', '100'], c: 1, e: '25% of 200 = 50' },
    { q: 'How many sides does a hexagon have?', opts: ['5', '6', '7', '8'], c: 1, e: 'Hexagon has 6 sides.' },
    { q: 'What is the next letter: A, C, E, G, ___?', opts: ['H', 'I', 'J', 'K'], c: 1, e: 'Skip one letter each time.' },
    { q: 'What comes next: 1, 3, 5, 7, ___?', opts: ['8', '9', '10', '11'], c: 1, e: 'Odd numbers: add 2.' },
    { q: 'If Monday is day 1, what is day 5?', opts: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'], c: 3, e: 'Day 5 is Friday.' },
    { q: 'What is 20% of 50?', opts: ['5', '10', '15', '20'], c: 1, e: '20% of 50 = 10' },
    { q: 'Complete: 2, 4, 8, 16, ___?', opts: ['24', '32', '40', '48'], c: 1, e: 'Double each time.' },
    { q: 'Which is different: Red, Blue, Green, Apple?', opts: ['Red', 'Blue', 'Green', 'Apple'], c: 3, e: 'Apple is not a colour.' },
    { q: 'What is 1/2 + 1/4?', opts: ['1/6', '2/6', '3/4', '1/8'], c: 2, e: '1/2 + 1/4 = 3/4' },
    { q: 'How many prime numbers are between 1 and 10?', opts: ['3', '4', '5', '6'], c: 1, e: '2, 3, 5, 7 are prime.' },
    { q: 'What is the next number: 100, 90, 80, 70, ___?', opts: ['50', '60', '65', '75'], c: 1, e: 'Subtract 10 each time.' },
    { q: 'Which shape has 8 sides?', opts: ['Hexagon', 'Heptagon', 'Octagon', 'Nonagon'], c: 2, e: 'Octagon has 8 sides.' },
    { q: 'What is 12 × 5?', opts: ['50', '60', '70', '80'], c: 1, e: '12 × 5 = 60' },
    { q: 'If A=1, B=2, what is A+B?', opts: ['2', '3', '4', '5'], c: 1, e: 'A=1, B=2, so 1+2=3' },
    { q: 'What is the sum of angles in a triangle?', opts: ['90°', '180°', '270°', '360°'], c: 1, e: 'Triangle angles sum to 180°.' },
    { q: 'Complete: 5, 10, 15, 20, ___?', opts: ['22', '25', '28', '30'], c: 1, e: 'Add 5 each time.' },
    { q: 'What is 50% of 80?', opts: ['30', '40', '50', '60'], c: 1, e: '50% of 80 = 40' },
    { q: 'Complete: 1, 4, 9, 16, ___?', opts: ['20', '25', '30', '36'], c: 1, e: 'Squares: 1², 2², 3², 4², 5²=25' },
    { q: 'What is 18 ÷ 3?', opts: ['5', '6', '7', '8'], c: 1, e: '18 ÷ 3 = 6' },
  ],
  'our-environment': [
    { q: 'What do we call the natural world around us?', opts: ['City', 'Environment', 'Building', 'Road'], c: 1, e: 'Environment is nature.' },
    { q: 'Which is a natural disaster?', opts: ['Party', 'Earthquake', 'Concert', 'Game'], c: 1, e: 'Earthquake is natural.' },
    { q: 'What helps clean the air?', opts: ['Cars', 'Trees', 'Factories', 'Smoke'], c: 1, e: 'Trees produce oxygen.' },
    { q: 'Which is a source of water?', opts: ['Desert', 'River', 'Mountain', 'Road'], c: 1, e: 'Rivers are water sources.' },
    { q: 'What do we call rain, snow, and hail?', opts: ['Wind', 'Precipitation', 'Sunshine', 'Clouds'], c: 1, e: 'Precipitation is rain/snow.' },
    { q: 'Which gas do plants absorb?', opts: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], c: 1, e: 'Plants use CO2 for food.' },
    { q: 'What is deforestation?', opts: ['Planting trees', 'Cutting trees', 'Watering plants', 'Saving forests'], c: 1, e: 'Deforestation means cutting trees.' },
    { q: 'Which is a biodegradable material?', opts: ['Plastic', 'Paper', 'Glass', 'Metal'], c: 1, e: 'Paper decomposes naturally.' },
    { q: 'What do we call the layer that protects us from sun rays?', opts: ['Cloud layer', 'Ozone layer', 'Dust layer', 'Water layer'], c: 1, e: 'Ozone protects from UV.' },
    { q: 'Which activity harms the environment?', opts: ['Recycling', 'Polluting', 'Planting', 'Conserving'], c: 1, e: 'Pollution harms the environment.' },
    { q: 'What do we call a sudden shaking of the ground?', opts: ['Flood', 'Earthquake', 'Cyclone', 'Drought'], c: 1, e: 'Earthquake shakes the ground.' },
    { q: 'Which gas is most abundant in the air?', opts: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'], c: 2, e: 'Nitrogen is about 78% of air.' },
    { q: 'What do we call the process of water turning to vapour?', opts: ['Condensation', 'Evaporation', 'Precipitation', 'Freezing'], c: 1, e: 'Evaporation turns water to vapour.' },
    { q: 'Which helps in water cycle?', opts: ['Sun', 'Moon', 'Stars', 'Clouds only'], c: 0, e: 'Sun drives the water cycle.' },
    { q: 'What do we call the layer of soil?', opts: ['Crust', 'Mantle', 'Topsoil', 'Core'], c: 2, e: 'Topsoil is the top layer.' },
    { q: 'Which is a natural disaster?', opts: ['Party', 'Tsunami', 'Concert', 'Game'], c: 1, e: 'Tsunami is a natural disaster.' },
    { q: 'What do we call the study of weather?', opts: ['Geography', 'Meteorology', 'Biology', 'Chemistry'], c: 1, e: 'Meteorology studies weather.' },
    { q: 'Which helps prevent soil erosion?', opts: ['Cutting trees', 'Planting trees', 'Overgrazing', 'Deforestation'], c: 1, e: 'Trees hold soil.' },
    { q: 'What do we call the home of many species?', opts: ['Desert', 'Ecosystem', 'City', 'Road'], c: 1, e: 'Ecosystem supports life.' },
    { q: 'Which is a wetland?', opts: ['Desert', 'Marsh', 'Mountain', 'Valley'], c: 1, e: 'Marshes are wetlands.' },
    { q: 'What do we call the warming of oceans?', opts: ['Cooling', 'Ocean warming', 'Freezing', 'Evaporation'], c: 1, e: 'Ocean warming affects climate.' },
    { q: 'Which protects coastal areas?', opts: ['Mangroves', 'Desert', 'Mountain', 'Road'], c: 0, e: 'Mangroves protect coasts.' },
    { q: 'What do we call the variety of ecosystems?', opts: ['Pollution', 'Ecological diversity', 'Erosion', 'Deforestation'], c: 1, e: 'Ecological diversity is variety.' },
    { q: 'Which is a cause of climate change?', opts: ['Planting trees', 'Burning fossil fuels', 'Recycling', 'Saving water'], c: 1, e: 'Fossil fuels cause climate change.' },
    { q: 'What do we call the process of water falling as rain?', opts: ['Evaporation', 'Condensation', 'Precipitation', 'Transpiration'], c: 2, e: 'Precipitation is rain/snow.' },
    { q: 'Which layer of Earth do we live on?', opts: ['Core', 'Mantle', 'Crust', 'Magma'], c: 2, e: 'We live on the crust.' },
  ],
  'language-literature-and-media': [
    { q: 'What do we call news on TV or internet?', opts: ['Book', 'Media', 'Letter', 'Diary'], c: 1, e: 'Media includes TV and internet.' },
    { q: 'Who writes news articles?', opts: ['Actor', 'Journalist', 'Singer', 'Painter'], c: 1, e: 'Journalists write news.' },
    { q: 'What do we call a story passed down through generations?', opts: ['News', 'Folktale', 'Report', 'Advertisement'], c: 1, e: 'Folktales are traditional.' },
    { q: 'Which is a form of media?', opts: ['Chair', 'Newspaper', 'Table', 'Spoon'], c: 1, e: 'Newspaper is media.' },
    { q: 'What do we call false information spread online?', opts: ['News', 'Fake news', 'Fact', 'Report'], c: 1, e: 'Fake news is false info.' },
    { q: 'Who wrote Ramayana?', opts: ['Vyasa', 'Valmiki', 'Tulsidas', 'Kalidasa'], c: 1, e: 'Valmiki wrote Ramayana.' },
    { q: 'What do we call a short form of a word?', opts: ['Abbreviation', 'Sentence', 'Paragraph', 'Essay'], c: 0, e: 'Abbreviation is short form.' },
    { q: 'Which book is an epic from India?', opts: ['Harry Potter', 'Mahabharata', 'Alice in Wonderland', 'Robinson Crusoe'], c: 1, e: 'Mahabharata is Indian epic.' },
    { q: 'What do we use to find word meanings?', opts: ['Atlas', 'Dictionary', 'Encyclopedia', 'Novel'], c: 1, e: 'Dictionary has meanings.' },
    { q: 'Which is responsible use of media?', opts: ['Spreading rumours', 'Verifying facts', 'Ignoring news', 'Sharing everything'], c: 1, e: 'Verifying facts is responsible.' },
    { q: 'What do we call a story based on real events?', opts: ['Fiction', 'Non-fiction', 'Poetry', 'Drama'], c: 1, e: 'Non-fiction is based on facts.' },
    { q: 'Which is a form of social media?', opts: ['Newspaper', 'Radio', 'Blog', 'Book'], c: 2, e: 'Blogs are a form of social media.' },
    { q: 'What do we call the main idea of a story?', opts: ['Character', 'Theme', 'Setting', 'Plot'], c: 1, e: 'Theme is the main idea.' },
    { q: 'Which helps us find information online?', opts: ['Book', 'Search engine', 'Radio', 'TV'], c: 1, e: 'Search engines find information.' },
    { q: 'What do we call a picture that represents something?', opts: ['Word', 'Symbol', 'Number', 'Letter'], c: 1, e: 'Symbols represent ideas.' },
    { q: 'Which is a primary source of history?', opts: ['Textbook', 'Diary', 'Encyclopedia', 'Novel'], c: 1, e: 'Diaries are primary sources.' },
    { q: 'What do we call the person who presents news on TV?', opts: ['Actor', 'Anchor', 'Singer', 'Painter'], c: 1, e: 'Anchor presents news.' },
    { q: 'Which is a way to check if information is true?', opts: ['Believe everything', 'Cross-check sources', 'Ignore', 'Share immediately'], c: 1, e: 'Cross-checking verifies facts.' },
    { q: 'What do we call a short written work?', opts: ['Novel', 'Essay', 'Encyclopedia', 'Dictionary'], c: 1, e: 'Essay is a short composition.' },
    { q: 'Which media reaches the most people?', opts: ['Letter', 'Television', 'Notice board', 'Pamphlet'], c: 1, e: 'TV reaches many people.' },
    { q: 'What do we call the time and place of a story?', opts: ['Character', 'Setting', 'Plot', 'Theme'], c: 1, e: 'Setting is time and place.' },
    { q: 'Which is a bias in media?', opts: ['Facts', 'One-sided view', 'Balance', 'Evidence'], c: 1, e: 'One-sided view is bias.' },
    { q: 'What do we call a story passed orally?', opts: ['Novel', 'Oral tradition', 'Essay', 'Report'], c: 1, e: 'Oral tradition is spoken history.' },
    { q: 'Which helps in digital literacy?', opts: ['Ignoring technology', 'Understanding and using tech', 'Avoiding internet', 'No learning'], c: 1, e: 'Understanding tech is digital literacy.' },
    { q: 'What do we call a story with a lesson at the end?', opts: ['News', 'Fable', 'Report', 'Essay'], c: 1, e: 'Fables teach lessons.' },
    { q: 'Which helps us understand different perspectives?', opts: ['Ignoring others', 'Reading diverse sources', 'One source only', 'No research'], c: 1, e: 'Diverse sources show different views.' },
  ],
};

function toSlug(name) {
  return name.toLowerCase().replace(/[&]/g, 'and').replace(/['']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getTemplatesForTopic(topicName, _grade) {
  const slug = toSlug(topicName);
  const templates = QUESTION_TEMPLATES[slug] || QUESTION_TEMPLATES['current-affairs'];
  return templates;
}

function buildQuestion(template, exam, grade, topic, topicSlug, index) {
  const id = `igko-g${grade}-${topicSlug}-${String(index).padStart(4, '0')}`;
  return {
    id,
    exam,
    grade: String(grade),
    topic,
    subtopic: `${topic} Basics`,
    difficulty: index % 3 === 0 ? 'medium' : 'easy',
    modes: ['practice', 'mock'],
    questionText: template.q,
    image: '',
    options: [...template.opts],
    correctAnswer: template.c,
    explanation: template.e,
    tags: [topicSlug, 'igko', `grade${grade}`],
    sourceType: 'generated',
  };
}

function main() {
  const allQuestionIds = [];

  for (let grade = 1; grade <= 10; grade++) {
    const syllabusPath = join(IGKO_BASE, `grade${grade}`, 'syllabus.json');
    if (!existsSync(syllabusPath)) {
      console.warn(`Skipping grade ${grade}: no syllabus`);
      continue;
    }

    const syllabus = JSON.parse(readFileSync(syllabusPath, 'utf-8'));
    const topics = syllabus.topics || [];
    const questionsDir = join(IGKO_BASE, `grade${grade}`, 'questions');
    const packsDir = join(IGKO_BASE, `grade${grade}`, 'packs');

    mkdirSync(questionsDir, { recursive: true });
    mkdirSync(packsDir, { recursive: true });

    // Remove stale question files not in this grade's syllabus
    const existingFiles = existsSync(questionsDir)
      ? readdirSync(questionsDir).filter((f) => f.endsWith('.json') && f !== 'manifest.json')
      : [];
    const manifestFiles = [];
    const practicePacks = [];
    const gradeQuestionIds = [];

    const usedQuestionTexts = new Set();
    for (const t of topics) {
      const topicName = t.name;
      const slug = t.slug || toSlug(topicName);
      const templates = getTemplatesForTopic(topicName, grade);

      const questions = [];
      let qIndex = 1;
      for (const template of templates) {
        const textKey = template.q.trim().toLowerCase();
        if (usedQuestionTexts.has(textKey)) continue;
        usedQuestionTexts.add(textKey);
        const q = buildQuestion(template, 'igko', grade, topicName, slug, qIndex);
        questions.push(q);
        gradeQuestionIds.push(q.id);
        qIndex++;
        if (questions.length >= 25) break;
      }

      const filename = `${slug}.json`;
      writeFileSync(join(questionsDir, filename), JSON.stringify(questions, null, 2) + '\n', 'utf-8');
      manifestFiles.push(filename);

      practicePacks.push({
        packId: `igko-grade${grade}-${slug}-practice-01`,
        exam: 'igko',
        grade,
        mode: 'practice',
        title: `${topicName} Practice`,
        topic: topicName,
        questionCount: 25,
        durationMinutes: 25,
        selectionRules: {
          topics: [topicName],
          difficultyMix: { easy: 15, medium: 8, hard: 2 },
        },
      });
    }

    // Remove files not in manifest
    const manifestSet = new Set(manifestFiles);
    for (const f of existingFiles) {
      if (!manifestSet.has(f)) {
        try {
          unlinkSync(join(questionsDir, f));
          console.log(`  Removed stale: ${f}`);
        } catch {
          /* ignore */
        }
      }
    }

    writeFileSync(join(questionsDir, 'manifest.json'), JSON.stringify({ files: manifestFiles }, null, 2) + '\n', 'utf-8');

    practicePacks.forEach((p, i) => {
      const filename = `practice-${i + 1}.json`;
      writeFileSync(join(packsDir, filename), JSON.stringify(p, null, 2) + '\n', 'utf-8');
    });

    const mockQuestionIds = gradeQuestionIds.slice(0, 25);
    const mockPack = {
      packId: `igko-grade${grade}-mock-01`,
      exam: 'igko',
      grade,
      mode: 'mock',
      title: `IGKO Grade ${grade} Mock Test 1`,
      durationMinutes: 30,
      questionIds: mockQuestionIds,
    };
    writeFileSync(join(packsDir, 'mock-1.json'), JSON.stringify(mockPack, null, 2) + '\n', 'utf-8');

    // Remove stale pack files (e.g. mock-2 from old setup)
    const expectedPacks = new Set([
      ...practicePacks.map((_, i) => `practice-${i + 1}.json`),
      'mock-1.json',
    ]);
    const existingPacks = existsSync(packsDir) ? readdirSync(packsDir).filter((f) => f.endsWith('.json')) : [];
    for (const f of existingPacks) {
      if (!expectedPacks.has(f)) {
        try {
          unlinkSync(join(packsDir, f));
          console.log(`  Removed stale pack: ${f}`);
        } catch {
          /* ignore */
        }
      }
    }

    allQuestionIds.push(...gradeQuestionIds);
    console.log(`Grade ${grade}: ${topics.length} topics, ${gradeQuestionIds.length} questions, ${practicePacks.length} practice packs, 1 mock pack`);
  }

  console.log('\nDone. Run npm run update:question-bank-index');
}

main();
