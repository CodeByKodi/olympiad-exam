# Student feedback review (Jithisha — Grade 6 IMO Data Handling practice)

This document summarizes feedback from a student, how the app behaves today, and recommended follow-ups. Use it for product copy, content QA, and future settings work.

---

## 1. Topic relevance (“some questions weren’t related to Data Handling”)

### Current behavior

- Each question can show a **per-question topic** badge (`QuestionCard` uses `question.topic`).
- The test list shows a **pack-level** title/topic; if the pack mixes topics or tags are wrong, the experience feels inconsistent.

### Likely cause

- **Content / tagging**: questions in `imo-grade6-data-handling-practice-01` (or equivalent) need syllabus-aligned `topic` values and editorial review.

### Actions

| Priority | Action |
|----------|--------|
| P0 | Content QA: audit that pack’s questions vs Grade 6 Data Handling syllabus. |
| P1 | On test select, add short copy that topics on **individual questions** may vary within the pack (or show topic distribution if available). |

### Suggested UI copy (test card / pre-start)

- **Body (optional):** “Each question shows its topic on the card. This pack is centered on Data Handling; some items may touch related ideas.”
- **If you add topic breakdown later:** “This pack: 20 Data Handling · 5 Numbers” (example).

---

## 2. “Results beforehand” (seeing correct/incorrect before finishing)

### Current behavior

- **Practice mode:** `showFeedback` is on → after answering, the UI shows correct/wrong and explanation when present. **This is intentional** for learning.
- **Mock test mode:** feedback is **off** until submit; full results on the results screen.

### Likely cause

- Students may not distinguish **Practice** vs **Mock** on the home/test list.

### Actions

| Priority | Action |
|----------|--------|
| P0 | **Copy:** Explain Practice vs Mock wherever users choose the test (see strings below). |
| P2 | **Optional setting:** defer feedback in practice until end of test (requires code: `showFeedback` driven by setting + mode). |

### Suggested UI copy

**Implemented on `TestSelectPage`** (Practice & Mock section intros):

- **Practice:** Explains immediate feedback, explanations when available, and pack vs per-question topic badges.
- **Mock:** Explains no right/wrong until submit and points learners to Practice for instant feedback.

**Before starting a practice test (modal or banner — if you add one)**

> In practice mode, you’ll get immediate feedback on each question. For exam-style practice with no hints until the end, use **Mock test** from the test list.

---

## 3. “Allow changing answers” (wants first answer to stick)

### Current behavior

- Users can **change** the selected option until submit.
- **Clear answer** is available from the bottom bar in practice flow.

### Likely cause

- **By design** for revision and self-correction; not everyone wants this.

### Actions

| Priority | Action |
|----------|--------|
| P2 | Add optional **“Lock answer after first choice”** (and disable or hide **Clear** when locked). |
| P3 | Consider default: **Mock** stricter (optional lock), **Practice** permissive unless the user opts in. |

### Proposed settings schema (future)

Store under existing user settings (e.g. `STORAGE_KEYS.SETTINGS`), namespaced for clarity:

```js
// Example shape — implement when building the feature
{
  shuffleQuestions: boolean,
  shuffleOptions: boolean,

  // New (optional):
  practiceDeferFeedback: boolean,   // if true: practice behaves like mock for feedback timing
  lockAnswerAfterSelect: boolean, // if true: cannot change option after first selection (per question)
}
```

| Key | Type | Default | Behavior sketch |
|-----|------|---------|-----------------|
| `practiceDeferFeedback` | `boolean` | `false` | When `true` and mode is practice, do not show per-question correct/wrong until submit or until “end section”. |
| `lockAnswerAfterSelect` | `boolean` | `false` | When `true`, `onSelectAnswer` no-ops if question already has an answer; hide or disable Clear for that question. |

### Accessibility notes

- If locking: provide an explicit **“Change my answer”** secondary action (with confirmation) so users aren’t trapped by mis-taps.
- Announce lock state to screen readers (`aria-live` or updated `aria-label` on options).

---

## Summary

| Feedback | Nature | Primary fix |
|----------|--------|----------------|
| Off-topic questions | Content + expectations | Pack QA + clearer copy on how topics are shown |
| Results before finishing | Mode confusion + practice design | Copy; optional `practiceDeferFeedback` |
| Changing answers | Design vs preference | Optional `lockAnswerAfterSelect` |

---

## References (code)

- Practice feedback: `ExamPage.jsx` → `QuestionCard` `showFeedback={isPractice}`.
- Option changes: `OptionCard.jsx` — only fully `disabled` after submit.
- Per-question topic: `QuestionCard` `topic={currentQuestion.topic}`.

_Last updated: aligned with student feedback review session._
