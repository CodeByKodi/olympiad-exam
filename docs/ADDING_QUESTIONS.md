# How to Add Questions and Answers Automatically

This guide covers automated and manual ways to add questions to the Olympiad Exam question bank.

---

## Overview

Questions live in `public/question-bank/{exam}/grade{N}/questions/` as JSON arrays. Each file is a topic (e.g. `numbers.json`, `fractions.json`). Packs reference these questions via `selectionRules` (practice) or `questionIds` (mock).

---

## Method 1: Generate from Syllabus (Automated)

The `generate-from-syllabus` script maps syllabus topics to an existing question pool and creates topic files + packs.

### Prerequisites

- Syllabus at `public/syllabus/{exam}/grade{N}.json`
- Question pool for the exam (e.g. from `question-bank/{exam}/grade3/questions/`)

### Run

```bash
npm run generate:from-syllabus
```

### What it does

1. Loads syllabus for each exam/grade
2. Loads question pool from Grade 3 (or specified source)
3. Maps syllabus topic names to question topics via `TOPIC_MAP`
4. Selects questions per topic (avoids duplicate question text)
5. Writes `questions/{topic-slug}.json`
6. Writes `questions/manifest.json`
7. Writes `syllabus.json` (copy)
8. Creates `packs/practice-1.json` … `practice-4.json`, `mock-1.json`, `mock-2.json`

### Topic mapping

Edit `scripts/generate-from-syllabus.js` → `TOPIC_MAP` to control which questions match which syllabus topics:

```javascript
imo: {
  'numbers': ['numbers', 'number', 'addition', 'subtraction'],
  'fractions': ['fractions'],
  'shapes': ['shapes'],
  // ...
}
```

---

## Method 2: Manual JSON (Add by Hand)

### Question format

Each question is a JSON object:

```json
{
  "id": "imo-g3-numbers-0001",
  "exam": "imo",
  "grade": "3",
  "topic": "Numbers",
  "subtopic": "Counting and Numbers",
  "difficulty": "easy",
  "modes": ["practice", "mock"],
  "questionText": "What is the place value of 5 in 456?",
  "image": "",
  "options": ["5", "50", "500", "5000"],
  "correctAnswer": 1,
  "explanation": "In 456, 5 is in the tens place, so its value is 50.",
  "tags": ["numbers", "imo", "grade3"],
  "sourceType": "generated"
}
```

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID, e.g. `{exam}-g{grade}-{topic}-{index}` |
| `questionText` | string | The question |
| `options` | array | 2–4 options (Grade 3 uses 4) |
| `correctAnswer` | number | 0-based index of correct option |
| `explanation` | string | Shown after answer |

### Optional fields

| Field | Type | Default |
|-------|------|---------|
| `exam` | string | — |
| `grade` | string | — |
| `topic` | string | Used for practice pack filtering |
| `subtopic` | string | — |
| `difficulty` | "easy" \| "medium" \| "hard" | "easy" |
| `modes` | ["practice", "mock"] | — |
| `image` | string | "" |
| `tags` | string[] | — |
| `sourceType` | string | — |

### Steps to add manually

1. **Create or edit a topic file**

   ```
   public/question-bank/imo/grade3/questions/fractions.json
   ```

2. **Add questions as a JSON array**

   ```json
   [
     {
       "id": "imo-g3-fractions-0011",
       "exam": "imo",
       "grade": "3",
       "topic": "Fractions",
       "subtopic": "Fractions",
       "difficulty": "easy",
       "modes": ["practice", "mock"],
       "questionText": "What is 1/2 of 12?",
       "image": "",
       "options": ["4", "6", "8", "10"],
       "correctAnswer": 1,
       "explanation": "Half of 12 is 6.",
       "tags": ["fractions", "imo", "grade3"],
       "sourceType": "generated"
     }
   ]
   ```

3. **Update manifest** (if new file)

   In `questions/manifest.json`:

   ```json
   {
     "files": [
       "numbers.json",
       "fractions.json",
       "measurement.json"
     ]
   }
   ```

4. **Create or update a pack** (optional)

   For practice:

   ```json
   {
     "packId": "imo-grade3-fractions-practice-01",
     "exam": "imo",
     "grade": 3,
     "mode": "practice",
     "title": "Fractions Practice Test",
     "topic": "Fractions",
     "questionCount": 25,
     "durationMinutes": 25,
     "selectionRules": {
       "topics": ["Fractions"],
       "difficultyMix": { "easy": 15, "medium": 8, "hard": 2 }
     }
   }
   ```

5. **Validate**

   ```bash
   npm run validate:data
   ```

---

## Method 3: Import via UI (For Custom Packs)

Admins/teachers can import pre-built packs via the Question Library:

1. Log in as admin or teacher
2. Go to **Question Library** (or **Library**)
3. Click **Import Packs**
4. Select JSON file(s) with full pack structure:

   ```json
   {
     "packId": "custom-pack-01",
     "exam": "nso",
     "grade": 3,
     "mode": "practice",
     "title": "Custom Practice",
     "questions": [
       { "id": "q1", "questionText": "...", "options": [...], "correctAnswer": 0, "explanation": "..." }
     ],
     "durationMinutes": 25
   }
   ```

Imported packs are stored in IndexedDB and merged with the built-in question bank.

---

## Validation Rules

Run `npm run validate:question-bank` to check:

- Unique question IDs
- No duplicate question text
- `correctAnswer` in range 0..(options.length - 1)
- `options` array with at least 2 items
- Manifest references only existing files
- Mock packs reference existing question IDs

---

## Adding a New Topic

1. Create `questions/{topic-slug}.json` with questions array
2. Add `{topic-slug}.json` to `manifest.json`
3. Create a practice pack that references the topic in `selectionRules.topics`
4. Run `npm run validate:data`

---

## Bulk Generation (External Tools)

You can generate JSON programmatically (e.g. Python, Node) and write to the question bank. Ensure:

- Valid JSON
- Unique IDs across the grade
- No duplicate `questionText`
- `correctAnswer` is 0-based index

Then run `npm run validate:question-bank`.
