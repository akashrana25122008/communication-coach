# Communication Coach

A communication coaching application.

> **Status (Milestone 4):** The app is currently **frontend-only**. Practice
> sessions are persisted to the browser's `localStorage` behind a repository
> layer (no backend/database exists yet — `backend/`, `data/`, `tests/`, and
> `app/` are empty placeholders). Milestones 1–4 are implemented; Milestone 5
> (real AI/voice analysis) has not been started.

## Project Structure

- `backend/` - Backend service (empty placeholder, not yet implemented)
- `frontend/` - Frontend application (React + TypeScript + Vite)
- `app/` - Core application code (empty placeholder)
- `tests/` - Test suite (empty placeholder; frontend tests live under `frontend/src`)
- `data/` - Data files and databases (empty placeholder)
- `assets/` - Static assets
- `scripts/` - Helper scripts (empty placeholder)

## Frontend

The active application lives in `frontend/`. See `frontend/README.md` for the
detailed Milestone 4 architecture and data model.

### Getting Started (frontend)

```
cd frontend
npm install
npm run dev        # start dev server
npm run build      # type-check + production build
npm run lint       # oxlint
npm test           # vitest unit tests
```
