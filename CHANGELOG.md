# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **E2E tests** – Playwright smoke tests (landing, login, exam flow)
- **Timer pause** – Pause/Resume button for mock tests in ExamHeader
- **Math/LaTeX rendering** – KaTeX for question text and options via `\(...\)` delimiters
- **Topic-wise progress** – Progress dashboard shows performance by topic (e.g. Fractions 65%)
- **Confirmation before exit** – `beforeunload` when leaving an in-progress mock test
- `question-bank/index.json` – Lists exam/grade combos with banks; skips 70+ syllabus probes on load
- IMO Grade 3: 25 questions each for Fractions, Measurement, Money, Logical Reasoning, Data Handling (was 10 each)
- Session timeout: auto logout after 30 minutes of inactivity
- Loading skeletons for pack selection (TestSelectPage)
- Lazy-loaded routes for Exam, Result, Library, Manager, Progress
- Progress dashboard: completed tests, best scores, recent activity
- Export result as PDF via Print dialog (Print / Save as PDF button)
- Keyboard shortcuts in exam: ←/→ for prev/next, 1–4 for answer selection
- First-time hint on landing page
- Progress link on landing dashboard when logged in
- CHANGELOG.md and CONTRIBUTING.md

### Changed

- **Reload performance**: Parallel topic fetches, parallel pack fetches, index-based bank discovery
- Result page Print button now labeled "Print / Save as PDF" with tooltip
- Improved empty states on TestSelectPage with import/sample options

### Fixed

- Infinite loop when practice pack pool exhausted (questionBankService)
- IEO practice-4 topic alignment
- Loading performance: parallel pack loading, 30s timeout

### Security

- Auth required before accessing exams
- Demo credentials removed from docs and UI

---

## [1.0.0] – Initial release

- Olympiad mock exam platform for NSO, IMO, IEO, ICS, IGKO, ISSO
- Practice mode with instant feedback
- Mock test mode with timed exams
- Question Library with import/export
- GitHub Pages deployment
- PWA support
