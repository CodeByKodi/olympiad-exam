# Question Bank Playbook

A step-by-step playbook to add more questions to the Olympiad exam question bank.

---

## Quick Reference

| Step | Action |
|------|--------|
| 1 | Pick exam, grade, topic |
| 2 | Create or edit topic JSON file |
| 3 | Add questions (use template below) |
| 4 | Update manifest (if new file) |
| 5 | Add pack (optional) |
| 6 | Validate |

---

## Step 1: Pick Exam, Grade, Topic

**Path pattern:** `public/question-bank/{exam}/grade{N}/questions/`

| Exam | Path |
|------|------|
| IMO | `imo/grade3/questions/` |
| NSO | `nso/grade3/questions/` |
| IEO | `ieo/grade3/questions/` |
| ICS | `ics/grade2/questions/` or `ics/grade3/questions/` |
| IGKO | `igko/grade3/questions/` |
| ISSO | `isso/grade3/questions/` |

**Topic file name:** Use a slug, e.g. `fractions.json`, `measurement.json`, `logical-reasoning.json`.

---

## Step 2 & 3: Question Template

**Copy this block** and fill in the values. Add multiple blocks to the array.

```json
{
  "id": "imo-g3-fractions-0026",
  "exam": "imo",
  "grade": "3",
  "topic": "Fractions",
  "subtopic": "Fractions",
  "difficulty": "easy",
  "modes": ["practice", "mock"],
  "questionText": "Your question here?",
  "image": "",
  "options": [
    "Option A",
    "Option B",
    "Option C",
    "Option D"
  ],
  "correctAnswer": 0,
  "explanation": "Why this answer is correct.",
  "tags": ["fractions", "imo", "grade3"],
  "sourceType": "generated"
}
```

### ID Format

`{exam}-g{grade}-{topic-slug}-{4-digit-index}`

| Exam | Grade | Topic | Example ID |
|------|-------|-------|------------|
| imo | 3 | fractions | `imo-g3-fractions-0026` |
| nso | 3 | plants | `nso-g3-plants-0001` |
| ieo | 3 | grammar | `ieo-g3-grammar-0015` |

### Field Cheat Sheet

| Field | Required | Notes |
|-------|-----------|-------|
| `id` | ✓ | Unique across the grade |
| `questionText` | ✓ | Must be unique (no duplicates) |
| `options` | ✓ | 4 options for Grade 3 |
| `correctAnswer` | ✓ | 0-based index (0 = first option) |
| `explanation` | ✓ | Shown after answering |
| `topic` | ✓ | Used for practice pack filtering |
| `difficulty` | | `easy`, `medium`, or `hard` |
| `subtopic` | | Optional |
| `image` | | Leave `""` if no image |
| `tags` | | e.g. `["fractions", "imo", "grade3"]` |

---

## Step 4: Update Manifest

**File:** `questions/manifest.json`

If you created a **new** topic file, add it to the `files` array:

```json
{
  "files": [
    "numbers.json",
    "fractions.json",
    "my-new-topic.json"
  ]
}
```

If you only **added questions** to an existing file, skip this step.

---

## Step 5: Add a Pack (Optional)

**Practice pack** – pulls questions by topic:

**File:** `packs/practice-N.json`

```json
{
  "packId": "imo-grade3-my-topic-practice-01",
  "exam": "imo",
  "grade": 3,
  "mode": "practice",
  "title": "My Topic Practice",
  "topic": "My Topic",
  "questionCount": 15,
  "durationMinutes": 15,
  "selectionRules": {
    "topics": ["My Topic"],
    "difficultyMix": { "easy": 10, "medium": 4, "hard": 1 }
  }
}
```

**Mock pack** – fixed question list (for deterministic tests):

```json
{
  "packId": "imo-grade3-mock-03",
  "exam": "imo",
  "grade": 3,
  "mode": "mock",
  "title": "IMO Mock Test 3",
  "durationMinutes": 30,
  "questionIds": ["imo-g3-fractions-0001", "imo-g3-fractions-0002"]
}
```

Packs are auto-discovered from the `packs/` folder. No manifest needed.

---

## Step 6: Validate

```bash
npm run validate:data
```

Fixes common issues:

- **Duplicate question text** → Change wording slightly
- **Duplicate ID** → Use next available index
- **correctAnswer out of range** → Use 0, 1, 2, or 3 for 4 options
- **Manifest references missing file** → Add the file or fix manifest

---

## Bulk Add: Same Topic, Many Questions

1. Open the topic file (e.g. `fractions.json`).
2. Find the last question's ID and index (e.g. `imo-g3-fractions-0025` → next is `0026`).
3. Copy the last question object, change:
   - `id` → increment
   - `questionText`, `options`, `correctAnswer`, `explanation`
4. Paste before the closing `]`.
5. Repeat for each new question.
6. Run `npm run validate:data`.

---

## Checklist

- [ ] Topic file path: `public/question-bank/{exam}/grade{N}/questions/{topic}.json`
- [ ] Each question has unique `id` and unique `questionText`
- [ ] `correctAnswer` is 0, 1, 2, or 3 (for 4 options)
- [ ] New file added to `manifest.json`
- [ ] Pack created/updated (optional)
- [ ] `npm run validate:data` passes

---

## New Exam/Grade with Question Bank

When adding a **new** exam/grade combo (e.g. `nso/grade3`), update the index so the app loads it quickly:

**File:** `public/question-bank/index.json`

```json
{
  "banks": [
    { "exam": "imo", "grade": "3" },
    { "exam": "nso", "grade": "3" }
  ]
}
```

Without this, the app probes every exam/grade for a syllabus, which slows initial load.

---

## See Also

- [ADDING_QUESTIONS.md](ADDING_QUESTIONS.md) – Automated generation, UI import
- [QUESTION_BANK_ARCHITECTURE.md](QUESTION_BANK_ARCHITECTURE.md) – Folder structure, pack types
