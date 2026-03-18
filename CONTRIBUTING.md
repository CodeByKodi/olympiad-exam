# Contributing to Olympiad Mock Exam Platform

Thanks for your interest in contributing. This document helps you get started.

## Development setup

```bash
git clone <repo-url>
cd olympiad-exam
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project structure

- `src/` – React app (pages, components, services, hooks)
- `public/` – Static assets (question-bank, starter-packs)
- `docs/` – Runbook, developer guide, architecture docs

See [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) for architecture details.

## Workflow

1. Create a branch: `git checkout -b feat/my-feature`
2. Make changes and run tests: `npm run lint && npm run test:run && npm run validate:data`
3. Push and open a PR
4. CI runs verify + build; preview deploys to Surge when `SURGE_TOKEN` is set
5. Merge to `main` → production deploys to GitHub Pages

## Code style

- Use ESLint (run `npm run lint`)
- Prefer named exports for components
- Keep components focused; extract reusable logic into hooks

## Adding questions

- **Built-in**: Add JSON under `public/question-bank/` and update manifests
- **Manual import**: Use Question Library (JSON format)
- See [docs/ADDING_QUESTIONS.md](docs/ADDING_QUESTIONS.md) for details

## Testing

- Unit tests: `npm run test` | `npm run test:run`
- Data validation: `npm run validate:data`
- Build: `npm run build`

## Documentation

- Update [docs/](docs/) when adding features or changing workflows
- Keep README.md accurate for setup and deployment

## Questions

Open an issue or discussion in the repo.
