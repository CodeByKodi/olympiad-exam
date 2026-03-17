# Olympiad Syllabus

Syllabus-first data structure for Grades 1–12 across NSO, IMO, IEO, ICS, IGKO, ISSO.

## Structure

```
syllabus/
├── nso/
│   ├── index.json      # Exam metadata, list of grades
│   ├── grade1.json
│   ├── grade2.json
│   └── ... grade12.json
├── imo/
├── ieo/
├── ics/
├── igko/
└── isso/
```

## Schema

Each grade file contains:

- **exam**, **grade**, **title**, **description**
- **topics[]**: each with `code`, `name`, `description`, `weightage`, `recommendedQuestionCount`, `subtopics[]`
- **subtopics[]**: each with `code`, `name`, `description`, `learningObjectives[]`, `difficultyRange[]`, `recommendedQuestionCount`, `tags[]`

## Scripts

- `npm run generate:syllabus` – Generate all syllabus files
- `npm run validate:syllabus` – Validate structure and required fields

## Usage

```js
import * as syllabusService from './services/syllabusService';

const syllabus = await syllabusService.loadSyllabus('nso', 3);
const topics = await syllabusService.listTopics('nso', 3);
const { total } = await syllabusService.computeRecommendedQuestionCount('nso', 3);
```
