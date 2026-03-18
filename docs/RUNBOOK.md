# Olympiad Exam – Runbook

Operational procedures for running, monitoring, and troubleshooting the Olympiad Exam platform.

---

## Quick Reference

| Action | Command / Location |
|--------|--------------------|
| Run locally | `npm run dev` → http://localhost:5173 |
| Build | `npm run build` |
| Preview build | `npm run preview` → http://localhost:4173 |
| Run tests | `npm run test:run` |
| Validate data | `npm run validate:data` |
| Lint | `npm run lint` |
| Production URL | `https://<username>.github.io/olympiad-exam/` |

---

## Pre-deployment Checklist

Before merging to `main` or deploying:

1. **Lint** – `npm run lint`
2. **Tests** – `npm run test:run`
3. **Data validation** – `npm run validate:data`
4. **Build** – `npm run build`

All must pass. CI runs these automatically on push/PR.

---

## Common Operations

### Start Development Server

```bash
npm install
npm run dev
```

Open http://localhost:5173. Hot reload is enabled.

### Build for Production

```bash
npm run build
```

Output in `dist/`. For local preview:

```bash
npm run preview
```

Open http://localhost:4173.

### Build for GitHub Pages (correct base path)

```bash
npm run build:pages
# or
npx vite build --base /olympiad-exam/
```

Use this only when deploying to GitHub Pages. Local preview at root will fail with this build.

### Validate Question Bank

```bash
npm run validate:question-bank
```

Checks: unique IDs, no duplicate question text, valid `correctAnswer`, manifest references.

### Validate Syllabus

```bash
npm run validate:syllabus
```

Validates syllabus JSON structure for all exams/grades.

---

## Troubleshooting

### App shows "Loading content..." forever

- **Cause:** Question bank load timeout (30s) or network failure.
- **Fix:** Check browser console. Verify `question-bank/` files are served. Add `SURGE_TOKEN` if using preview deploys.
- **Workaround:** Click "Reload library" if shown.

### Practice pack hangs / never loads

- **Cause:** Pack requests more questions than available in filtered pool (e.g. topic has 23 questions, pack requests 25).
- **Fix:** Reduce `questionCount` in pack definition or add more questions to the topic. See `questionBankService.js` – pool exhaustion is handled.

### Build fails: "base path" or asset 404

- **Cause:** Wrong base path for deployment target.
- **Fix:** Use `npm run build` for local; CI uses `--base /${{ repo.name }}/` for GitHub Pages.

### GitHub Pages shows blank page

- **Cause:** Base path mismatch, or JavaScript error.
- **Fix:**
  1. Settings → Pages → Source: **GitHub Actions**
  2. Verify repo name in URL matches `--base` in workflow
  3. Check browser console for errors

### Lint / test failures in CI

- **Fix:** Run locally first:
  ```bash
  npm run lint
  npm run test:run
  npm run validate:data
  ```

### Login not working

- **Fix:** Clear `localStorage` and try again. Predefined users are in `src/config/auth.js`.

---

## Environments

| Environment | URL | Trigger |
|-------------|-----|---------|
| Local dev | http://localhost:5173 | `npm run dev` |
| Preview (Surge) | https://olympiad-exam-pr-*.surge.sh | Push to branch / PR |
| Production | https://<username>.github.io/olympiad-exam/ | Push to `main` |

---

## Rollback

1. Revert the merge commit on `main`
2. Push. Deploy workflow will run with previous code.
3. Or: Actions → Deploy to Production → Re-run failed workflow after fix.

---

## Related docs

- **README** – Project overview
- **DEVELOPER_GUIDE.md** – Architecture
- **QUESTION_BANK_ARCHITECTURE.md** – Question bank structure
- **ADDING_QUESTIONS.md** – Adding questions
- **GITHUB_PAGES_CONSTRAINTS.md** – Static hosting limits; feature compatibility
