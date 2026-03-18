# Olympiad Mock Exam Platform

An Olympiad mock exam app for Grade 3 students. Deploys to **GitHub Pages** and runs in any modern browser.

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

Output goes to `dist/`. Preview locally with:

```bash
npm run preview
```

Then open [http://localhost:4173](http://localhost:4173).

> **Note:** Use `npm run build` (not `build:pages`) for local preview. `build:pages` uses a base path for GitHub Pages and will not load correctly at `http://localhost:4173/`.

---

## Development workflow

```
create branch → push → review preview link → merge to main → production auto-deploy
```

### 1. Create a branch

```bash
git checkout -b feat/my-feature
```

### 2. Push your branch

```bash
git push -u origin feat/my-feature
```

### 3. Review preview link

The **CI (Verify + Preview)** workflow runs on every push and pull request:

- **Tests** – Lint, unit tests, data validation
- **Build** – Production build
- **Preview** – Deploys to Surge.sh (when `SURGE_TOKEN` is configured)

Check the **Actions** tab for the workflow run. If `SURGE_TOKEN` is set, you'll get a preview URL like:

- PR: `https://olympiad-exam-pr-42.surge.sh`
- Branch: `https://olympiad-exam-feat-my-feature.surge.sh`

### 4. Merge to main

After review, merge via pull request. **Only `main` deploys to production.**

### 5. Production auto-deploy

The **Deploy to Production** workflow runs when code is pushed to `main`:

1. **Verify** – Same checks as CI
2. **Deploy** – Deploys to GitHub Pages

---

## Deploy to GitHub Pages (GitHub Actions)

### Environments

| Environment | Trigger | URL |
|-------------|---------|-----|
| **Preview** | Push to branch, pull request | `https://olympiad-exam-pr-*.surge.sh` or `https://olympiad-exam-*.surge.sh` |
| **Production** | Push to `main` | `https://YOUR_USERNAME.github.io/olympiad-exam/` |

### Enable GitHub Pages (production)

1. Go to your repo on GitHub
2. **Settings** → **Pages**
3. Under **Build and deployment**:
   - **Source**: select **GitHub Actions**

### Enable preview deployments (optional)

1. Create a free account at [surge.sh](https://surge.sh)
2. Run `npx surge login` locally to get your token
3. Add **SURGE_TOKEN** as a repository secret: **Settings** → **Secrets and variables** → **Actions**

Without `SURGE_TOKEN`, CI still runs verify + build; only the preview deploy step is skipped.

### Manual production deployment

1. Go to **Actions** in your repo
2. Select **Deploy to Production**
3. Click **Run workflow**

### Verify deployment

- Check the **Actions** tab for workflow status
- Visit `https://YOUR_USERNAME.github.io/olympiad-exam/` once the deploy workflow completes
- Test routes: `#/`, `#/exam/nso`, `#/library`

---

## Changing the repo name or base path

If you rename your repository, the base path updates automatically. The workflow uses `${{ github.event.repository.name }}` so the build always uses the correct subpath.

For local testing with a different base path:

```bash
npx vite build --base /your-repo-name/
```

---

## GitHub Pages routing

The app uses **HashRouter** so all routes work on static hosting:

| Route | Description |
|-------|-------------|
| `#/` | Home |
| `#/exam/nso` | Grade selection |
| `#/exam/nso/grade/3` | Test selection |
| `#/exam/nso/grade/3/tests` | Redirects to test selection |
| `#/exam/nso/grade/3/test/1` | Take test |
| `#/library` or `#/question-library` | Question Library |
| `#/manage-questions` | Question Manager |

Deep links work: `https://yoursite.github.io/olympiad-exam/#/exam/nso/grade/3`

Refresh and direct navigation work correctly in GitHub Pages mode.

---

## Starter packs

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

### How they load

- **Local dev**: Fetched from `./starter-packs/...` (Vite serves from `public/`)
- **GitHub Pages**: Fetched from `https://yoursite.github.io/olympiad-exam/starter-packs/...`

All paths use `resolveStaticPath()` from `src/config.js`, which respects `import.meta.env.BASE_URL` set by Vite.

### Adding new starter packs

1. Add JSON files under `public/starter-packs/{exam}/grade3/`
2. Update `index.json` with the new test metadata
3. Push to `main` – deployment is automatic

---

## Imported packs (IndexedDB)

Imported packs are stored in the browser using **IndexedDB**. They persist across sessions but are not synced to a server.

### Import flow

1. Go to **Question Library** or **Library**
2. Click **Import Packs**
3. Select one or more JSON files (file picker)
4. Packs are validated and saved to IndexedDB
5. The library refreshes immediately (no restart)

### Merged library

The app merges:

- **Starter packs** – from static JSON in the repo
- **Imported packs** – from IndexedDB

Import, delete, enable/disable, and reload work without restart after deployment.

---

## Troubleshooting

### Nothing loads at http://localhost:4173/

You likely ran `npm run build:pages` instead of `npm run build`. The Pages build uses a base path (`/olympiad-exam/`) and assets won’t load when previewing at the root. Use:

```bash
npm run build
npm run preview
```

Then open [http://localhost:4173](http://localhost:4173).

### Broken asset paths on GitHub Pages

If images or starter packs fail to load on GitHub Pages:

1. **Check base path**: The workflow builds with `--base /${{ repo.name }}/`. Ensure your repo name matches the URL.
2. **Check `config.js`**: Uses `import.meta.env.BASE_URL` from Vite. Do not hardcode paths like `/starter-packs/`.
3. **Use helpers**: Use `resolveStaticPath()` or `getAssetPath()` from `src/config.js` for all static asset URLs.

---

## Local data persistence

| Data | Storage |
|------|---------|
| Imported packs | IndexedDB |
| Enabled/disabled state | IndexedDB |
| Completed attempts | IndexedDB |
| Best scores | IndexedDB |
| In-progress session | IndexedDB |
| Settings, dark mode | IndexedDB |
| Question Manager edits | localStorage |

---

## Quality gate

Deployment to GitHub Pages runs only after all checks pass:

1. **Lint** – ESLint
2. **Unit tests** – Vitest
3. **Data validation** – Question bank and syllabus JSON
4. **Production build** – Vite build

### Run locally before pushing

```bash
npm run lint          # Lint
npm run test          # Unit tests (watch mode)
npm run test:run      # Unit tests (single run)
npm run validate:data # Validate question-bank and syllabus
npm run build         # Production build
```

If any step fails, deployment stops. Fix errors and push again.

---

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run build:pages` | Build for GitHub Pages (used by CI) |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit tests (watch mode) |
| `npm run test:run` | Run unit tests (single run) |
| `npm run lint` | Run ESLint |
| `npm run validate:data` | Validate question-bank and syllabus data |
| `npm run e2e` | Run Playwright E2E tests |

---

## PWA & Offline

The app works as a PWA (Progressive Web App):

- **Install**: Add to home screen from the browser menu (Chrome, Safari, etc.)
- **Offline**: After first load, cached content (app + starter packs) works offline
- **Indicator**: A banner appears when you're offline

## Documentation

| Document | Description |
|----------|-------------|
| [CHANGELOG.md](CHANGELOG.md) | Version history and notable changes |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [docs/RUNBOOK.md](docs/RUNBOOK.md) | Operations, troubleshooting, quick reference |
| [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) | Architecture, data flow, development practices |
| [docs/ADDING_QUESTIONS.md](docs/ADDING_QUESTIONS.md) | How to add questions automatically or manually |
| [docs/DEPLOY_GITHUB_PAGES.md](docs/DEPLOY_GITHUB_PAGES.md) | Deploy to GitHub Pages step-by-step |
| [docs/QUESTION_BANK_ARCHITECTURE.md](docs/QUESTION_BANK_ARCHITECTURE.md) | Question bank structure and pack format |
| [docs/QUESTION_BANK_PLAYBOOK.md](docs/QUESTION_BANK_PLAYBOOK.md) | Step-by-step playbook to add questions |
| [docs/GITHUB_PAGES_CONSTRAINTS.md](docs/GITHUB_PAGES_CONSTRAINTS.md) | What works on static hosting; feature compatibility |

---

## Tech stack

- React 19, Vite 8
- React Router (HashRouter)
- IndexedDB (browser storage)
- Service worker (offline cache)
- No backend, no server database
