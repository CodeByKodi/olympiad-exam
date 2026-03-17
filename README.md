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

To test the GitHub Pages build locally (with repo subpath):

```bash
npm run build:pages
npm run preview
```

---

## Deploy to GitHub Pages (GitHub Actions)

Deployment is **automatic** via GitHub Actions. Push to `main` and the app deploys to GitHub Pages.

### 1. Enable GitHub Pages

1. Go to your repo on GitHub
2. **Settings** → **Pages**
3. Under **Build and deployment**:
   - **Source**: select **GitHub Actions**

### 2. Push to main

Push any commit to the `main` branch. The workflow at `.github/workflows/deploy.yml` will:

1. Install dependencies
2. Build the app with the correct base path (`/repo-name/`)
3. Deploy to GitHub Pages

### 3. Where the site appears

After deployment, your site will be at:

```
https://YOUR_USERNAME.github.io/olympiad-exam/
```

(Replace `YOUR_USERNAME` with your GitHub username and `olympiad-exam` with your repo name.)

### 4. Manual deployment

You can also trigger deployment manually:

1. Go to **Actions** in your repo
2. Select **Deploy to GitHub Pages**
3. Click **Run workflow**

### 5. Verify deployment

- Check the **Actions** tab for workflow status
- Visit `https://YOUR_USERNAME.github.io/olympiad-exam/` once the workflow completes
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

## Troubleshooting broken asset paths

If images or starter packs fail to load on GitHub Pages:

1. **Check base path**: The workflow builds with `--base /${{ repo.name }}/`. Ensure your repo name matches the URL.
2. **Check `config.js`**: Uses `import.meta.env.BASE_URL` from Vite. Do not hardcode paths like `/starter-packs/`.
3. **Use helpers**: Use `resolveStaticPath()` or `getAssetPath()` from `src/config.js` for all static asset URLs.
4. **Test locally**: Run `npm run build:pages && npm run preview` and verify paths at `http://localhost:4173/olympiad-exam/`.

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

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production (base: `./`) |
| `npm run build:pages` | Build for GitHub Pages (base: `/olympiad-exam/`) |
| `npm run preview` | Preview production build |
| `npm run preview:pages` | Build for Pages and preview |
| `npm run cap:sync` | Build and sync to Android + iOS |

---

## Tech stack

- React 19, Vite 8
- React Router (HashRouter)
- IndexedDB (browser storage)
- No backend, no server database
