# Olympiad dataset validation report

**Scope:** `practice_exams` and `mock_exams` in `src/data/olympiadContent.ts` (IGKO, IMO, NSO, IEO) plus all TypeScript mock banks merged via `mockExamBank.ts`.

**Validator:** `npm run validate:olympiad-dataset` → `scripts/validateOlympiadDataset.ts`

**Report date:** 2026-03-16 (generated with codebase state at validation time)

---

## 1. Overall summary

| Metric | Value |
|--------|------:|
| Exams reviewed | 142 |
| Questions reviewed | 3,470 |
| Practice exams (declared in `olympiadContent`) | 4 (one sample set per olympiad: IGKO G4, IMO G7, NSO G8, IEO G6) |
| Mock exams (TS bank) | 138 |

**Assessment:** Typed mocks and practice samples satisfy the shared `PracticeExam` / `MockExam` interfaces. Automated checks report **no critical schema or consistency errors** after the fixes below. **Semantic syllabus audit** (human review of every stem vs SOF PDFs) is **not** fully automated; flags are noted under warnings.

---

## 2. Critical errors

### Before fixes (historical)

| Issue | Resolution |
|-------|------------|
| Within-exam **duplicate prompts** on many IMO mocks (tier-1 addition / tier-2 square / tier-3 area generators reused stems) | **Fixed:** `IMO_ADD_PAIRS` / `IMO_RECT_PAIRS` consecutive slices; tier-2/3 stem rotation; tier-1 uses indexed pair table. |
| Within-exam duplicate **IGKO/NSO/IEO supplement** stems (small rotating pools) | **Fixed:** Larger fact pools + **`pickDistinctIndices`** (no replacement within a padding batch). |
| IMO G8 **explanation** too short (`y = 3x.`) | **Fixed:** Full proportion explanation in `imoMockExams.ts`. |
| `createPracticeExam` allowed `total_questions` drift | **Fixed:** Throws if `total_questions` / `total_marks` ≠ flattened question count. |

### After fixes

- **None** (`validate:olympiad-dataset` exits 0).

---

## 3. Duplicate report

### 3.1 Exact duplicate exams

- **None** (mock bank enforces unique `exam.id`; practice ids are unique).

### 3.2 Near-duplicate exams

- **Structural similarity:** Multiple mocks share the same *generator pattern* (e.g. synthetic full papers per grade/set). They are **intentionally parallel** (same layout, different parameters), not erroneous copies.
- **Imported JSON packs** (outside this TS dataset) may still duplicate titles/counts; not part of `olympiadContent.ts`.

### 3.3 Exact duplicate questions

- **None within a single exam** (validator + within-exam prompt normalization).
- **Cross-exam:** Supplement and template items **may repeat prompts** across different exam IDs (acceptable for low-cost filler; reduced vs prior pool-only rotation).

### 3.4 Near-duplicate questions

- **Hand-authored mocks** may occasionally align closely with **practice sample** stems (e.g. similar “heart pumps blood” GK). **Confidence:** low–medium. **Action:** optional editorial pass.
- **IMO** synthetic addition/square/area items are **parametric**; different exams will re-use *patterns* with different numbers.

### 3.5 Reused practice / mock content

- Practice sets are **single-section samples**; mocks are **multi-section**. No practice exam is a byte-identical copy of a mock in the TS source.

---

## 4. Warnings

| Area | Note |
|------|------|
| **Schema checklist vs code** | User checklist mentions `section.question_count`, `marks_per_question`, `negative_marking`. **`ExamSection` in `olympiadContent.ts` does not define these**—only `section_name`, optional `section_title`, `questions[]`. Align docs or extend interface if needed. |
| **Syllabus alignment** | Automated checks do **not** map each `topic` string to official PDF outlines. Flag for **manual** SOF syllabus review, especially **synthetic** IGKO/NSO/IEO pools. |
| **Difficulty / Bloom** | Labels are **author-declared**, not ML-verified. HOTS sections may still contain “medium” stems in places. |
| **IGKO “national animal”** wording | Stem uses cautious phrasing (“most commonly cited”)—appropriate for syllabus ambiguity. |
| **Global `question_id` uniqueness** | IDs are unique in practice; **warning-only** if the same `question_id` appeared in two exams (currently **0** warnings). |

---

## 5. Syllabus coverage issues

| Gap | Detail |
|-----|--------|
| **Practice breadth** | Only **one** practice exam per olympiad in `olympiadContent`; not full K–12 practice library. |
| **Synthetic mocks** | Grades without hand-written mocks use **template** science/GK/English items; topics may not hit every subsection in `*Syllabus.ts`. |
| **IEO template grammar** | Example: “Neither … nor” agreement is syllabus-dependent; keep for “hard” drills but verify class fit. |

---

## 6. Suggested fixes (done vs backlog)

| Status | Item |
|--------|------|
| Done | Within-exam duplicate prompt elimination (IMO + supplements). |
| Done | `createPracticeExam` integrity guard. |
| Done | `validate:olympiad-dataset` script. |
| Done | Short explanation fix (IMO proportion). |
| Backlog | Expand `practice_exams` to more grades/topics. |
| Backlog | Optional: automated **topic ∈ class syllabus** checker using `getClassSyllabus` + fuzzy match. |
| Backlog | Human proofread **synthetic** stems for cultural/geographic sensitivity. |
| Backlog | Normalize mock titles in UI (“Mock Test” vs “Mock Paper”)—product layer. |

### Duplicate prevention (hashing)

- **Content hash:** `hash(normalize(prompt) + normalize(options.join('|')) + correct_answer)`.
- **Store hashes** in CI when running `validate:olympiad-dataset`; fail on collisions **within** an exam.
- **Globally:** allow collisions only for whitelisted “template” IDs.

---

## 7. Final verdict

**PASS WITH FIXES** — Critical automated issues found during validation have been corrected; validator passes. Ongoing **content/syllabus quality** still benefits from editorial review and expanded practice banks.

---

## Changelog (dataset fixes applied)

| Change | Files |
|--------|--------|
| Distinct supplement selection + expanded pools | `src/data/mockExams/syntheticPadding.ts` |
| Unique IMO tier-1 pairs, tier-2 stems, tier-3 rectangles | `src/data/mockExams/syntheticPadding.ts` |
| Practice exam count validation | `src/data/olympiadContent.ts` (`createPracticeExam`) |
| IMO G8 q08 explanation | `src/data/mockExams/imoMockExams.ts` |
| Validator + npm script | `scripts/validateOlympiadDataset.ts`, `package.json` |
