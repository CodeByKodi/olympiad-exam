# Question Bank Architecture

Scalable question storage for Olympiad exams (Grade 1–12).

## Structure

```
question-bank/
├── {exam}/                    # nso, imo, ieo, ics, igko, isso
│   └── grade{grade}/           # grade3, grade4, ...
│       ├── syllabus.json       # Topics, subtopics, learning objectives
│       ├── questions/          # Questions by topic
│       │   ├── {topic-slug}.json
│       │   └── ...
│       └── packs/              # Pack definitions
│           ├── practice-*.json # Dynamic practice (selectionRules)
│           └── mock-*.json    # Fixed mock (questionIds)
```

## Question Model

See `scripts/schemas/question-schema.json`

## Pack Types

- **Fixed mock**: `questionIds` array references question bank IDs
- **Dynamic practice**: `selectionRules` filter questions from bank
