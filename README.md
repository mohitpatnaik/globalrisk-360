# GlobalRisk 360

> Enterprise insurance portfolio management prototype — Angular 21 SPA with RxJS, TypeScript, and FastAPI backend.

**Built for the HDI IT Frontend Developer position (1192) demonstration.**

![CI](https://github.com/mohitpatnaik/globalrisk-360/actions/workflows/ci.yml/badge.svg)

---

## Overview

GlobalRisk 360 is a **fictional multinational insurance operations platform** that demonstrates practical Angular frontend engineering. It manages international insurance programmes, master and local policies, claims with governed state transitions, and operational activity tracking.

The fictional customer is an industrial manufacturing organization headquartered in **Hannover** with operations in **Germany, France, Poland, and the United States**.

**Disclaimer:** GlobalRisk 360 is an **independent portfolio prototype**, not an official HDI application. All data, customer details, and financial amounts are **synthetic**.

---

## Key Screens

| Screen | Description |
|---|---|
| **Dashboard** | Global operations overview with ECharts — country filtering, premium stats, claims trends |
| **Policy Management** | Searchable, sortable, paginated table with master/local policy relationships |
| **Claims Management** | Governed claims workflow with strict state machine transitions |
| **Claim Submission** | 5-step Reactive Forms wizard with validation, cross-field rules, draft persistence |
| **Activity Timeline** | Audit trail with status changes, review notes, and role-based actions |

---

## Business Demonstration Scenario

The application supports this complete workflow:

1. Open the global operations dashboard
2. Filter by **Poland** → verify statistics and charts update reactively
3. Open a Polish policy detail
4. Start a new property damage claim
5. Enter a synthetic claim amount of **€180,000**
6. Complete the Angular Reactive Forms wizard
7. Submit the claim → verify it appears in claims list
8. Switch to reviewer role → change status to **Under Review**
9. Add a review note → verify in activity timeline
10. Return to dashboard → verify counts updated
11. Refresh → verify persistence

---

## Technology Stack

### Frontend
- **Angular 21** (latest stable) — standalone components, strict TypeScript
- **RxJS** — `debounceTime`, `distinctUntilChanged`, `switchMap`, `combineLatest`, `shareReplay`, `takeUntilDestroyed`
- **Angular Signals** — local synchronous state, `toSignal`, `computed`
- **Reactive Forms** — multistep claim submission wizard
- **Bootstrap 5** grid + custom SCSS with design tokens
- **Apache ECharts** — lazy-loaded charts (premium by country, claims by status, exposure, trends)
- **Lucide icons** — free open-source icon library

### Backend (Phase 5)
- **FastAPI** — REST API
- **SQLite** — persistence
- **Pydantic** — request/response validation

### Testing & CI/CD
- **Jasmine + Karma** — unit tests
- **Playwright** — E2E tests (Poland scenario, filtering, forms, validation)
- **ESLint + Prettier** — code quality
- **GitHub Actions** — build, lint, test, security scan

---

## Architecture

```
src/app/
  core/           ─ Singleton services, stores, guards, interceptors, models, data
  shared/         ─ Presentational gr-* components (no business logic)
  features/       ─ Dashboard, Policies, Claims, Claim-Submission, Activity
  layout/         ─ Shell (sidebar + header + router outlet)
```

### State Management
- **Signals** for local component & store state
- **RxJS** for async streams, debounced search, filter bus
- **Store facade pattern** — components → stores → API interface
- **Demo mode** — `InMemoryDataService` swaps seamlessly for live backend

### Claim State Machine
Governed lifecycle with 9 statuses and 10 transitions. Role-gated actions enforced at UI, store, and API levels.

---

## Development

### Prerequisites
- Node.js 20+
- npm

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm start          # http://localhost:4200

# Production build
npm run build --configuration production

# Unit tests
npm test

# E2E tests
npx playwright test

# Lint
npm run lint
```

### Backend (optional)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install fastapi uvicorn aiosqlite pydantic
uvicorn main:app --reload
```

---

## Design Decisions

| Decision | Rationale |
|---|---|
| Standalone components | Cleaner tree-shaking, no NgModules boilerplate |
| Signals + RxJS | Signals for sync state, RxJS for async/streaming |
| Store facade pattern | Single source of truth, easy to swap HTTP ↔ in-memory |
| Demo mode | Works offline for GitHub Pages review without backend |
| ECharts lazy-loaded | Keeps initial bundle under 110KB |
| `gr-*` prefix | Clear naming convention for shared UI components |

---

## Known Limitations

- **Demo mode only (Phase 5 not wired)**: The app runs on a browser-persisted in-memory adapter (`InMemoryDataService`). The backend API interface (`*Api` tokens in `core/api/`) is defined but not connected to an HTTP client. A live FastAPI backend (Phase 5) and HTTP service wiring are not yet implemented — the app works fully offline as a demo.
- **No live persistence**: All data is stored in `localStorage`; no server round-trip for create/update/delete.
- **No authentication**: Role switching is simulated via a header dropdown.
- **No file upload**: Supporting documents use synthetic metadata.
- **Single user**: No real multi-user collaboration.
- **Testing scope**: 2 unit tests cover the claim state machine. 6 Playwright E2E tests cover golden paths (dashboard, policy search, claim list, wizard, activity, 404). Store unit tests, pipe tests, and chart-mapper tests are noted as future work.
- **GitHub Pages**: Not deployed (future enhancement).

---

## Synthetic Data Disclosure

This application runs entirely on **synthetic demonstration data**:
- Customer names, policy numbers, claim details are all fictional
- Financial amounts are illustrative only
- No real customer or production information is shown or stored
- All state is browser-persisted via `localStorage` (demo mode)

---

## Three-Minute Demo Script

| Time | Demonstration |
|---|---|
| 0:00–0:20 | Introduce fictional multinational insurance scenario (Hannover HQ, 4 countries) |
| 0:20–0:50 | Dashboard and country filtering — select Poland, verify all charts/tiles update |
| 0:50–1:20 | Policy management — search, filter, open detail drawer with coverage info |
| 1:20–2:05 | Claim submission — 5-step wizard, €180K property damage claim, validation |
| 2:05–2:35 | Architecture highlights — RxJS patterns, Signals, state machine, testing |
| 2:35–3:00 | GitHub Actions CI/CD, relevance to HDI IT position |

---

## License

MIT — built with free and open-source technologies only.
