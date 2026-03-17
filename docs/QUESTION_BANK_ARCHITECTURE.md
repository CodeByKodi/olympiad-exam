# Question Bank Architecture

Scalable dataset architecture for Olympiad exams (Grade 1–12).

## Overview

- **Question bank**: Questions stored with full metadata, organized by exam/grade/topic
- **Fixed mock packs**: Reference `questionIds` for deterministic tests
- **Dynamic practice packs**: Use `selectionRules` to filter and sample from the bank
- **Backward compatible**: Falls back to legacy starter-packs when question bank is unavailable

## Folder Structure

```
public/question-bank/
├── {exam}/                    # nso, imo, ieo, ics, igko, isso
│   └── grade{grade}/
│       ├── syllabus.json      # Topics, subtopics, learning objectives
│       ├── questions/
│       │   ├── manifest.json  # Lists topic files
│       │   ├── {topic-slug}.json
│       │   └── ...
│       └── packs/
│           ├── practice-1.json
│           ├── mock-1.json
│           └── ...
```

## Question Model

```json
{
  "id": "imo-g3-numbers-operations-0001",
  "exam": "imo",
  "grade": 3,
  "topic": "Numbers and Operations",
  "subtopic": "Place Value",
  "difficulty": "easy",
  "modes": ["practice", "mock"],
  "questionText": "...",
  "options": [...],
  "correctAnswer": 1,
  "explanation": "...",
  "learningObjective": "...",
  "tags": [...],
  "sourceType": "generated",
  "syllabusCode": "..."
}
```

## Pack Definitions

**Fixed mock pack** (`questionIds`):

```json
{
  "packId": "imo-grade3-mock-01",
  "exam": "imo",
  "grade": 3,
  "mode": "mock",
  "title": "IMO Mock Test 1",
  "durationMinutes": 30,
  "questionIds": ["imo-g3-numbers-operations-0001", "..."]
}
```

**Dynamic practice pack** (`selectionRules`):

```json
{
  "packId": "imo-grade3-numbers-operations-practice-01",
  "exam": "imo",
  "grade": 3,
  "mode": "practice",
  "title": "Numbers and Operations Practice Test",
  "topic": "Numbers and Operations",
  "questionCount": 25,
  "durationMinutes": 25,
  "selectionRules": {
    "topics": ["Numbers and Operations"],
    "difficultyMix": { "easy": 15, "medium": 8, "hard": 2 }
  }
}
```

## Scripts

- `npm run migrate:question-bank` – Migrate Grade 3 starter packs to question bank
- `npm run validate:question-bank` – Validate question bank (ids, duplicates, pack refs)

## Adding New Grades

1. Create `question-bank/{exam}/grade{N}/syllabus.json`
2. Add questions to `questions/{topic}.json`
3. Add `questions/manifest.json` listing topic files
4. Create pack definitions in `packs/`
5. Enable grade in `constants/exams.js`
