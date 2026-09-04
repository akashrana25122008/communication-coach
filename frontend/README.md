# Communication Coach — Frontend

## Milestone 4 — Data & Persistence Foundation

The app persists practice sessions and derives all progress metrics, statistics,
and the communication profile from them. It is **frontend-only**: sessions are
stored in browser `localStorage` behind a repository layer. No backend/database
exists yet, and no AI/voice analysis has been implemented (Milestone 5).

### Data model

Defined in `src/types.ts`:

- `PracticeSession` — a completed practice round (`id`, `type`, `startedAt`,
  `completedAt`, `durationMinutes`, `overallScore`, `scores`, `summary`,
  `recommendations`). `type` is one of `free-conversation` | `interview` |
  `speaking`.
- `SessionScore` — per-dimension scores: `clarity`, `fluency`, `structure`,
  `conciseness`.
- `ProgressSnapshot` — derived metrics (total sessions, practice minutes,
  streak, average score, weekly delta, per-dimension deltas/trends).
- `CommunicationProfile` — derived `strengths` / `focusAreas` plus streak.

Static catalogue data (`Exercise`, `PracticeType`, user name) lives in
`src/data/demoData.ts`. This module holds **no fabricated sessions, scores, or
trends** — a new user starts at 0 sessions / 0 practice time / 0 streak.

### Persistence & service architecture

- `src/services/practiceRepository.ts` — localStorage-backed store for
  `PracticeSession[]`. UI must not touch this directly.
- `src/services/practiceService.ts` — bridges the repository and the pure
  engines, exposing the view-model shapes consumed by the UI.
- `src/services/api.ts` — the existing service layer; live data now resolves
  from `practiceService`, static catalogues from `demoData`.
- `src/lib/progressEngine.ts` — deterministic, pure functions: overall score,
  per-dimension averages, totals, streak, snapshot, progress points.
- `src/lib/communicationProfile.ts` — derives strengths / focus areas from
  scores using neutral language; never makes a personality diagnosis.

### How a session is created

Practice pages (`PracticeShell` + the three practice routes) let the user record
a round, then self-rate each of the four dimensions. "Complete & save" persists
the session via `practiceApi.createSession` and navigates to its detail page.
Scores are user-provided — nothing is fabricated.

### Empty states

New users (no sessions) see empty states on the dashboard, sessions, and
progress pages using the shared `LoadingState` / `EmptyState` / `ErrorState`
components in `src/components/ui/states.tsx`.

### Tests

Run with `npm test` (Vitest). Coverage includes the progress engine, the
communication profile engine, the repository, and the service (create /
retrieve / history, persistence across reload, empty history, score / streak /
profile calculation, missing-session handling).

### Scripts

- `npm run dev` — start dev server
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — oxlint
- `npm test` — vitest

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
