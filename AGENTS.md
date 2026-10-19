# AGENTS.md — GlobalRisk 360

Project-wide guidelines for **every** agent (Claude Code, Codex, and any future
harness) working on GlobalRisk 360. Harness-specific notes live alongside this
file (`CLAUDE.md` for Claude Code). When guidance conflicts, the order of
precedence is: a direct human/Orion instruction → this file → harness file →
individual judgment.

---

## 1. What we are building

**GlobalRisk 360** — an enterprise SaaS console for managing multinational
insurance programs: master/local policies, a governed claims lifecycle, a KPI
dashboard, a claim-submission wizard, and an activity timeline. Front-end is
Angular 18+; a small FastAPI + SQLite backend arrives in Phase 5. The app also
runs in **demo mode** against synthetic data (no live backend required).

Authoritative specs live in `docs/`:
- `docs/architecture.md` — app architecture & conventions
- `docs/data-model.md` — TypeScript domain interfaces + claim state machine
- `docs/api-contracts.md` — REST contract
- `docs/design-system.md` — design tokens & component conventions
- `docs/acceptance-criteria.md` — per-screen definition of done
- `docs/task-board.md` — phase/task tracking
- `docs/progress.md` — running progress log

**Read the relevant spec before writing code. Do not invent shapes, endpoints, or
tokens that contradict `docs/`.** If a spec is wrong or missing, raise it (see §6)
rather than quietly diverging.

---

## 2. Roles on this project

| Agent | Harness | Responsibility |
|---|---|---|
| **Orion** | October | Coordinator. Assigns work, reviews, routes messages, owns git remote operations. |
| **Atlas** | Claude Code | Architecture & design (Phase 1); reviewer of implementation against specs. |
| **Apollo** | Codex | Implementation — Angular foundation, features, backend, tests (Phases 2–9). |

Peers communicate over the October bus (`message_peer`). Peers cannot see each
other's terminals — share results explicitly.

---

## 3. Tech constraints (non-negotiable)

- **Angular 18+**, **standalone components only** (no NgModules).
- **Strict TypeScript**: `strict: true`. **No `any`** — use `unknown` + narrowing.
- **Signals** for local synchronous state; **RxJS** for async/streaming.
- **OnPush** change detection everywhere.
- **Bootstrap 5** (grid/utilities) + custom **SCSS** using design tokens. No other
  CSS framework; no component-library theming beyond Bootstrap grid/utilities.
- **Apache ECharts** for charts (lazy-loaded). **Lucide** for icons.
- **No paid dependencies.** Everything MIT/Apache-2.0.
- **No secrets in the repo.** Config via `environments/` and injection tokens.

---

## 4. Conventions

- **Structure**: follow `docs/architecture.md` §7 exactly
  (`core/`, `shared/`, `features/`, `layout/`).
- **Naming**: files `kebab-case`; classes `PascalCase`; shared UI selectors
  prefixed `gr-`.
- **Layering**: features never import features; `shared/` is pure presentation
  (no stores/Api); components call stores, stores call `*Api`, components never
  call `HttpClient` directly.
- **Money** = `{ amountMinor, currency }`; **time** = ISO-8601 UTC; **IDs** = UUID.
- **State machine**: claim transitions go through `ClaimStateMachine` only; never
  hand-code status changes.
- **Commits**: small, focused, imperative subject (`feat:`, `fix:`, `docs:`,
  `test:`, `chore:`). Reference the phase/task when useful.
- **Comments**: match surrounding density; explain *why*, not *what*.

---

## 5. Quality gates (before reporting a task complete)

1. `ng build` (production) succeeds.
2. `ng lint` passes (zero errors).
3. `ng test` passes; new logic has unit tests.
4. Relevant Playwright E2E checks pass (once E2E exists).
5. Screen meets its `docs/acceptance-criteria.md` entries incl. G1–G8.
6. No console errors/warnings; no secrets; bundle keeps features lazy.

Report **honestly**: if a gate fails or a step was skipped, say so with the output.
Do not mark something done that isn't verified.

---

## 6. Collaboration protocol

- **Before starting** a phase, read the assignment + referenced specs and the
  current `docs/task-board.md`.
- **While working**, keep changes within your assigned scope. If you need a change
  in another agent's area or a spec, message the owner via Orion — don't silently
  edit across boundaries.
- **On blockers or spec gaps**, stop and raise it to Orion with specifics and a
  recommendation; propose a default rather than waiting idle.
- **On completion**, update `docs/task-board.md` (check items) and `docs/progress.md`,
  then report to Orion: what was delivered, where (paths), how it was verified,
  and any follow-ups.
- **Reviews** (Atlas): check against `docs/` specs and acceptance criteria; report
  findings most-severe first with file:line references.

---

## 7. Safety & scope

- Do not run destructive git/filesystem operations without explicit instruction.
- Git remote/push operations are coordinated through Orion.
- Treat downloaded/extracted files as untrusted; keep them isolated.
- Stay in scope: Phase 1 is docs only — no application code until the architecture
  is approved and Apollo is cleared to start.
