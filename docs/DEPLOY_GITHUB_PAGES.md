# Deploy to GitHub Pages

Step-by-step guide to deploy the Olympiad Exam app to GitHub Pages.

---

## Prerequisites

- GitHub account
- Repository with the Olympiad Exam code
- Node.js 20+ (for local builds)

---

## 1. Enable GitHub Pages

1. Open your repository on GitHub
2. Go to **Settings** → **Pages**
3. Under **Build and deployment**:
   - **Source:** select **GitHub Actions**

---

## 2. Automatic Deployment (Recommended)

Deployment is handled by GitHub Actions. Pushing to `main` triggers the deploy workflow.

### Workflow: Deploy to Production

- **File:** `.github/workflows/deploy.yml`
- **Trigger:** Push to `main` or manual `workflow_dispatch`
- **Steps:**
  1. Checkout
  2. Setup Node 20
  3. `npm ci`
  4. Lint
  5. Unit tests
  6. Data validation
  7. Build with `--base /{repo-name}/`
  8. Deploy to GitHub Pages

### Deploy by Pushing to Main

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Then:

1. Go to **Actions** in your repo
2. Open the **Deploy to Production** workflow run
3. Wait for it to complete
4. Visit `https://<username>.github.io/<repo-name>/`

### Manual Deploy

1. Go to **Actions**
2. Select **Deploy to Production**
3. Click **Run workflow** → **Run workflow**

---

## 3. Base Path and URL

The app is built with a base path matching the repo name:

- **Build:** `npx vite build --base /olympiad-exam/`
- **URL:** `https://<username>.github.io/olympiad-exam/`

If you rename the repo, the workflow uses `${{ github.event.repository.name }}`, so the base path updates automatically.

---

## 4. Preview Deployments (Optional)

For branches and PRs, the CI workflow can deploy previews to Surge.sh.

### Enable Preview

1. Create an account at [surge.sh](https://surge.sh)
2. Get your token: `npx surge login` (follow prompts)
3. In your repo: **Settings** → **Secrets and variables** → **Actions**
4. Add secret: **SURGE_TOKEN** = your Surge token

### Preview URLs

- **Pull request:** `https://olympiad-exam-pr-{number}.surge.sh`
- **Branch:** `https://olympiad-exam-{branch-slug}.surge.sh`

Without `SURGE_TOKEN`, CI still runs verify + build; only the preview deploy step is skipped.

---

## 5. Verify Deployment

After a successful run:

1. Open `https://<username>.github.io/<repo-name>/`
2. Check routes:
   - `#/` – Home
   - `#/login` – Login
   - `#/exam/nso` – Grade selection (requires login)
   - `#/exam/nso/grade/3` – Test selection

3. Test login (see `src/config/auth.js` for predefined users)

---

## 6. Troubleshooting

### Blank page

- **Cause:** Base path mismatch or JS error
- **Fix:** Ensure Pages source is **GitHub Actions**. Check browser console for errors.

### 404 on assets

- **Cause:** Wrong base path
- **Fix:** Workflow uses `--base /${{ github.event.repository.name }}/`. Repo name must match the URL path.

### Build fails in CI

- **Fix:** Run locally first:
  ```bash
  npm run lint
  npm run test:run
  npm run validate:data
  npm run build
  ```

### Deployment not updating

- **Fix:** Clear browser cache or use incognito. GitHub Pages can cache for a few minutes.

---

## 7. Custom Domain (Optional)

1. Add a `CNAME` file in `public/` with your domain
2. In repo **Settings** → **Pages** → **Custom domain**, enter the domain
3. Configure DNS: add a CNAME record pointing to `<username>.github.io`

---

## 8. Workflow Summary

| Workflow | Trigger | Result |
|----------|---------|--------|
| **CI (Verify + Preview)** | Push to branch, PR | Lint, test, validate, build; optional Surge preview |
| **Deploy to Production** | Push to `main`, or manual | Deploy to GitHub Pages |

Only `main` deploys to production. Feature branches get verification and optional previews.
