# Olympiad Exam – Developer Guide

Architecture, data flow, and development practices for the Olympiad Exam platform.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 19 |
| Build | Vite 8 |
| Routing | React Router (HashRouter) |
| Storage | IndexedDB, localStorage |
| Hosting | Static (GitHub Pages) |
| Backend | None – client-only |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                          │
├─────────────────────────────────────────────────────────────────┤
│  React App                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ RoleContext │  │ QuestionLib │  │ Storage (IndexedDB,      │  │
│  │ (Auth)      │  │ Context     │  │ localStorage)           │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                      │                 │
│  ┌──────▼────────────────▼─────────────────────▼─────────────┐  │
│  │ Pages: Landing, Grade, TestSelect, Exam, Result, Login,     │  │
│  │        QuestionLibrary, QuestionManager                     │  │
│  └────────────────────────────────────────────────────────────┘  │
│         │                                                         │
│  ┌──────▼──────────────────────────────────────────────────────┐  │
│  │ Services: authService, questionBankService,                  │  │
│  │           questionLibraryService, libraryStorageService     │  │
│  └────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
         │
         │ fetch (static assets)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  Static Assets (public/)                                         │
│  - question-bank/{exam}/grade{N}/questions/*.json                │
│  - question-bank/{exam}/grade{N}/packs/*.json                     │
│  - question-bank/{exam}/grade{N}/syllabus.json                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Application Flow

### 1. App Bootstrap

```
initStorage() → RoleProvider → QuestionLibraryProvider → HashRouter → Routes
```

- `initStorage`: Loads settings, completed tests, best scores from IndexedDB/localStorage
- `RoleProvider`: Manages auth state (user, role, login/logout)
- `QuestionLibraryProvider`: Loads question bank + imported packs, merges into unified library

### 2. Authentication Flow

```
User → LoginPage (username/password) → authService.login()
  → localStorage → RoleContext updates
  → Redirect to requested page or /
```

**Roles:** admin, teacher, student

- **admin / teacher:** Access Library, Manage Questions
- **student:** Access exams, practice, mock
- **Guest:** Landing only; exam routes redirect to `/login`

### 3. Question Library Load Flow

```
reloadLibrary()
  ├── loadQuestionBankPacks() [parallel per exam/grade]
  │     ├── hasQuestionBank() → fetch syllabus.json
  │     ├── loadQuestionBank() → fetch manifest + topic JSONs
  │     └── loadPackDefinitions() → fetch packs/*.json
  └── loadImportedPacks() → IndexedDB
  → mergeLibraries() → setPacks()
```

### 4. Taking a Test Flow

```
TestSelectPage → User picks pack → ExamPage
  → loadPackData(pack)
       ├── If question bank: resolveMockPack / resolvePracticePack
       └── If imported: getPack from IndexedDB
  → Render questions → User answers → Submit
  → ResultPage → save completed test, best score
```

### 5. Practice vs Mock

| Mode | Pack type | Resolution |
|------|-----------|------------|
| Practice | `selectionRules` | `resolvePracticePack()` – filter by topic, sample by difficulty |
| Mock | `questionIds` | `resolveMockPack()` – fixed order by IDs |

---

## Folder Structure

```
olympiad-exam/
├── public/
│   └── question-bank/           # Static question data
│       └── {exam}/grade{N}/
│           ├── syllabus.json
│           ├── questions/
│           │   ├── manifest.json
│           │   └── {topic}.json
│           └── packs/
│               ├── practice-1.json … practice-9.json
│               └── mock-1.json, mock-2.json
├── src/
│   ├── components/              # Reusable UI
│   ├── config/                  # Auth, app config
│   ├── constants/               # Exams, grades
│   ├── context/                 # Role, QuestionLibrary
│   ├── hooks/                   # useRole, useDarkMode, etc.
│   ├── layouts/                 # MainLayout
│   ├── pages/                   # Route components
│   ├── services/                # Auth, question bank, library
│   ├── styles/                  # CSS modules
│   └── utils/                   # Storage, validation
├── scripts/                     # CLI tools
│   ├── generate-from-syllabus.js
│   ├── validate-question-bank.js
│   └── validate-data.js
└── .github/workflows/
    ├── ci.yml                   # Verify + Preview
    └── deploy.yml               # Production deploy
```

---

## Key Components

| Component | Purpose |
|-----------|---------|
| `AuthRoute` | Requires login for exam routes |
| `AdminRoute` | Requires admin/teacher for Library, Manage |
| `QuestionLibraryContext` | Unified pack list, loadPackData |
| `questionBankService` | Load bank, resolve packs |
| `questionLibraryService` | Merge bank + imported, loadPackData |

---

## Routing

| Path | Access | Description |
|------|--------|-------------|
| `/` | All | Landing |
| `/login` | All | Login form |
| `/exam/:examId` | Logged in | Grade selection |
| `/exam/:examId/grade/:gradeId` | Logged in | Test selection |
| `/exam/.../test/:testId` | Logged in | Take test |
| `/exam/.../test/:testId/result` | Logged in | Result |
| `/question-library`, `/library` | Admin/Teacher | Library |
| `/manage-questions` | Admin/Teacher | Question Manager |

---

## Adding a New Exam or Grade

1. Add `question-bank/{exam}/grade{N}/syllabus.json`
2. Add `questions/manifest.json` and topic JSONs
3. Add `packs/practice-*.json`, `packs/mock-*.json`
4. Grade is auto-discovered if `syllabus.json` exists
5. Run `npm run validate:data`

---

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run build:pages` | Build for GitHub Pages base path |
| `npm run test:run` | Unit tests |
| `npm run lint` | ESLint |
| `npm run validate:data` | Full data validation |
| `npm run validate:question-bank` | Question bank only |
| `npm run generate:from-syllabus` | Generate questions from syllabus |

---

## Coding Conventions

- Use `resolveStaticPath()` for all static asset URLs
- Question IDs: `{exam}-g{grade}-{topic}-{index}` (e.g. `imo-g3-numbers-0001`)
- Pack IDs: `{exam}-grade{grade}-{slug}-practice-01` or `mock-01`
- `correctAnswer`: 0-based index into `options` array
