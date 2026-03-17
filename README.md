# Olympiad Mock Exam Platform

A cross-platform Olympiad mock exam app for Grade 3 students. Works on **desktop browsers**, **GitHub Pages**, **Android**, and **iPhone/iPad** from a single codebase.

## Features

- **Static hosting** – No backend required; runs entirely in the browser
- **Practice mode** – Instant feedback, combined question pool from enabled packs
- **Mock test mode** – Timed exams with separate test packs
- **Question Library** – Import, enable/disable, delete, and manage JSON question packs
- **Local persistence** – IndexedDB for attempts, scores, settings, and imported packs
- **Starter packs** – Built-in tests loaded from static JSON files
- **Responsive UI** – Desktop-friendly and mobile touch-friendly

## Supported Exams (Grade 3)

- NSO, IMO, IEO, ICS, IGKO, ISSO

---

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Build for Production

```bash
npm run build
```

Output goes to `dist/`. Preview with:

```bash
npm run preview
```

---

## Deploy to GitHub Pages

### 1. Configure repository

Update `package.json` homepage to match your repo:

```json
"homepage": "https://YOUR_USERNAME.github.io/olympiad-exam"
```

### 2. Build for GitHub Pages

The build uses a base path for the repo subpath:

```bash
npm run build:gh-pages
```

This runs `vite build --base /olympiad-exam/` so assets load correctly at `https://username.github.io/olympiad-exam/`.

### 3. Deploy

```bash
npm run deploy
```

This builds and pushes the `dist/` folder to the `gh-pages` branch. GitHub Pages will serve it.

### 4. Enable GitHub Pages

In your repo: **Settings → Pages → Source** → select **Deploy from a branch**.

Choose branch `gh-pages` and folder `/ (root)`.

Your app will be at: `https://YOUR_USERNAME.github.io/olympiad-exam/`

---

## GitHub Pages Routing

The app uses **HashRouter** so routes work on static hosting:

- `#/` – Home
- `#/exam/nso` – Grade selection
- `#/exam/nso/grade/3` – Test selection
- `#/exam/nso/grade/3/test/1` – Take test
- `#/library` or `#/question-library` – Question Library
- `#/manage-questions` – Question Manager

Deep linking works: `https://yoursite.github.io/olympiad-exam/#/exam/nso/grade/3`

---

## Starter Packs

Built-in tests are stored as static JSON in `public/starter-packs/`:

```
public/starter-packs/
├── nso/grade3/
│   ├── index.json      # Metadata: tests array
│   ├── test1.json
│   ├── test2.json
│   └── ...
├── imo/grade3/
├── ieo/grade3/
└── ...
```

### Format

**index.json** (per exam/grade):

```json
{
  "tests": [
    { "id": "1", "title": "NSO Grade 3 Test 1", "durationMinutes": 15, "questionCount": 10 },
    ...
  ]
}
```

**test1.json**:

```json
{
  "title": "NSO Grade 3 Test 1",
  "durationMinutes": 15,
  "questionCount": 10,
  "questions": [
    {
      "id": "nso-grade3-test1-q1",
      "questionText": "Question text...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "...",
      "topic": "Topic name"
    }
  ]
}
```

### Adding new starter packs

1. Add JSON files under `public/starter-packs/{exam}/grade3/`
2. Update `index.json` with the new test metadata
3. Rebuild and deploy

---

## Imported Packs (IndexedDB)

Imported packs are stored in the browser using **IndexedDB**. They persist across sessions but are not synced to a server.

### Import flow

1. Go to **Question Library** or **Library**
2. Click **Import Packs**
3. Select one or more JSON files (file picker)
4. Packs are validated and saved to IndexedDB
5. The library refreshes immediately

### Pack format

```json
{
  "packId": "nso-grade3-mock-01",
  "exam": "nso",
  "grade": 3,
  "mode": "mock",
  "title": "NSO Grade 3 Mock Test 1",
  "durationMinutes": 15,
  "questions": [
    {
      "id": "nso-g3-q1",
      "questionText": "Question text here",
      "image": "",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explanation here",
      "topic": "Topic name",
      "difficulty": "easy"
    }
  ]
}
```

### Validation

- `packId` – optional
- `exam` – one of: nso, imo, ieo, ics, igko, isso
- `grade` – 3 (only Grade 3 supported)
- `mode` – "practice" or "mock"
- `questions` – array of questions
- Each question: 4 options, valid `correctAnswer`, no duplicate ids or `questionText`

### Library actions

- **Delete** – Removes imported pack from IndexedDB (starter packs cannot be deleted)
- **Enable/Disable** – Toggles whether the pack appears in the pool
- **Export** – Downloads the pack as JSON
- **Reload Library** – Rebuilds from starter packs + IndexedDB

---

## Local Data Persistence

All data is stored in the browser:

| Data | Storage | Notes |
|------|---------|-------|
| Imported packs | IndexedDB | `question_packs` store |
| Enabled/disabled state | IndexedDB | `library_index` store |
| Completed attempts | IndexedDB | `kv` store |
| Best scores | IndexedDB | `kv` store |
| In-progress session | IndexedDB | `kv` store |
| Settings | IndexedDB | `kv` store |
| Dark mode | IndexedDB | `kv` store |
| Question Manager edits | localStorage | Overrides built-in tests |

Data persists until the user clears site data or uses a different browser/device.

---

## Services

- **storageService** – IndexedDB key-value operations
- **questionLibraryService** – Starter packs, imported packs, merge, import/export
- **libraryStorageService** – IndexedDB for question packs
- **attemptService** – In-progress and completed attempts
- **settingsService** – User preferences

---

## Capacitor – Android & iOS

The project includes Capacitor for native wrapping.

```bash
npm run cap:sync      # Build and sync to native projects
npm run cap:android   # Open Android Studio
npm run cap:ios       # Open Xcode
```

---

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production (base: `./`) |
| `npm run build:gh-pages` | Build for GitHub Pages (base: `/olympiad-exam/`) |
| `npm run deploy` | Build and deploy to GitHub Pages |
| `npm run preview` | Preview production build |
| `npm run cap:sync` | Build and sync to Android + iOS |

---

## Tech Stack

- React 19
- Vite 8
- React Router (HashRouter)
- IndexedDB (browser storage)
- No backend, no server database
