# GitHub Pages Constraints & Applicable Features

The Olympiad Exam runs entirely on **GitHub Pages** – static hosting with no server, backend, or database. All features must work client-side only.

---

## What GitHub Pages Provides

| Capability | Available |
|------------|-----------|
| Static HTML, CSS, JavaScript | ✅ |
| Client-side routing (HashRouter) | ✅ |
| Fetch static JSON from repo | ✅ |
| IndexedDB, localStorage | ✅ |
| Service worker (PWA, offline) | ✅ |
| Custom domain | ✅ |
| HTTPS | ✅ |

---

## What Is NOT Available

| Capability | Not available |
|------------|---------------|
| Server-side code (Node, Python, etc.) | ❌ |
| Database (SQL, MongoDB) | ❌ |
| Server-side auth (sessions, JWT validation) | ❌ |
| API endpoints | ❌ |
| Environment variables at runtime | ❌ |
| Server-side file upload | ❌ |
| Email sending | ❌ |

---

## Feature Compatibility

### ✅ Fully applicable (client-only)

| Feature | How it works |
|---------|--------------|
| **More questions** | Add JSON files to `public/question-bank/` |
| **Images in questions** | Store in `public/`, reference in question `image` field |
| **Progress dashboard** | Read from IndexedDB (completed tests, best scores) |
| **Export / certificates** | Client-side PDF (e.g. jsPDF, html2canvas) |
| **Session timeout** | `setTimeout` + `logout()` |
| **Onboarding** | React state + localStorage flag |
| **Loading skeletons** | CSS/React components |
| **Accessibility** | ARIA, keyboard nav, semantic HTML |
| **E2E tests** | Playwright/Cypress against built `dist/` |
| **Unit tests** | Vitest for services, utils |
| **Lazy loading** | `React.lazy()` + Vite code-splitting |
| **Targeted loading** | Load question bank only for selected exam/grade |
| **Caching** | Service worker, browser cache |
| **Analytics** | Google Analytics, Plausible (client-side script) |
| **Changelog** | `CHANGELOG.md` in repo |

### ⚠️ Limited or workaround

| Feature | Constraint | Workaround |
|---------|------------|------------|
| **Environment-based auth** | No runtime env vars | Change `src/config/auth.js` before deploy; or use build-time `import.meta.env` |
| **Forgot password** | No backend to send email | Not feasible. Document: "Contact admin to reset" or use config file |
| **User registration** | No backend | Not feasible. Use predefined users only |
| **Multi-tenant / orgs** | No backend | Single app instance. All users share same predefined accounts |

### ❌ Not applicable

| Feature | Why |
|---------|-----|
| Server-side validation | No server |
| Real-time collaboration | No WebSockets / server |
| Centralized user database | No database |
| Server-side analytics | No server |
| OAuth / SSO (Google, etc.) | Requires backend for token exchange |

---

## Design Principles for This App

1. **All data in browser** – IndexedDB, localStorage, or static JSON
2. **Auth is client-side** – Predefined users in config; session in localStorage
3. **No secrets at runtime** – Credentials are in source (change before deploy if needed)
4. **Static assets only** – Questions, images, config as files in repo
5. **Build once, deploy** – Single `dist/` output; no server-side rendering

---

## When to Consider a Backend

If you need:

- User registration
- Forgot password / email
- Centralized progress across devices
- Real-time features
- Server-side validation

→ Use a backend (Vercel, Netlify Functions, Firebase, etc.) and keep GitHub Pages for the static frontend, or move hosting entirely.
