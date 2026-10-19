# Phase 2 Review — Angular Foundation (Apollo)

> Reviewer: **Atlas** (Claude Code). Date: 2026-10-19.
> Scope: the Phase 2 foundation against `docs/architecture.md`,
> `docs/data-model.md`, `docs/design-system.md`, and `docs/acceptance-criteria.md`.
> Method: read all 59 source files; independently ran lint, unit tests, and a
> production build; static-grepped for RxJS operators, filter consumers, stores,
> and `gr-table` usage.

## Verdict

**Approve to proceed to Phase 3**, with the findings below treated as Phase 3
entry criteria (H1–H3) and cleanups (M/L). The scaffold is faithful to the
architecture and genuinely builds; the gaps are concentrated in the wiring that
Phase 3 was always going to add (global filtering, stores, live data), plus a few
consistency items worth fixing before more screens are built on the pattern.

### Independent verification (not taken on trust)

| Gate | Result |
|---|---|
| `npm run lint` | ✅ All files pass linting. |
| `npm test -- --watch=false --browsers=ChromeHeadless` | ✅ 2 of 2 specs pass. |
| `npm run build --configuration production` | ✅ Succeeds → `dist/global-risk-360`. |
| ECharts lazy-loaded | ✅ `charts`/`renderers`/`components` are separate lazy chunks, not in the initial bundle. |
| Features lazy-loaded | ✅ Each feature is its own chunk. |

Apollo's reported results are accurate.

---

## What is correct and good (keep)

- **Claim state machine** (`core/claims/claim-state-machine.ts`): exact match to
  `data-model.md` §6.2 — all 11 transitions, correct target states and role
  gating. Clean API (`canTransition` / `nextStatus` / `actionsFor`). ✔
- **Domain models** (`core/models/*`): complete and faithful to `data-model.md`
  — all enums, `Money` as minor units, Master/Local discriminated union with
  `isMaster`/`isLocal` guards, correct declaration order (no forward-ref issue). ✔
- **Standalone + OnPush everywhere**; lazy routes; shell-as-layout wrapper with
  children; `claims/new` ordered before `claims` so it isn't shadowed. ✔
- **Strict TS, no `any`** observed; `nonNullable` reactive form with cross-field
  validators (`notFuture`, `dateOrder`, `minLength`, `min`). ✔
- **Synthetic data** (`core/data/synthetic-data.ts`): correct counts
  (4 countries, 4 master + 16 local = 20 policies, 8 claims, 15 activities),
  realistic names/industries/currencies, `structuredClone` isolation in the demo
  service. ✔
- **`gr-*` presentational purity**: shared components are `@Input()`/`@Output()`
  only, no store/service injection. ✔
- **Demo-data disclosure** present (dashboard + sidebar) — acceptance 7.6. ✔
- **Header breadcrumb** via `router.events` + `toSignal` — a clean, idiomatic
  RxJS use. ✔

---

## Findings

Severity: **H** address before/at start of Phase 3 · **M** fix during Phase 3 ·
**L** forward/Phase 4.

### H1 — The global filter bus has no readers
`FilterService` is injected and written only by `header.component.ts`; **no screen
consumes `filter$` or `filter()`** (verified by grep). The dashboard, policy list,
and claim list each keep their *own* local `query`/`status` signals, disconnected
from the global country/line/period filter.
- **Deviates from** architecture §4.2 & §9 (filter → dashboard + lists) and
  acceptance 1.4, 2.4, 3.2, 4.2.
- **Fix:** have the dashboard and list screens read the global filter —
  `combineLatest([filters.filter$, localControls$])` (or `computed` over
  `filters.filter()` + local signals) driving the displayed data.

### H2 — No RxJS async patterns anywhere
Grep for `debounceTime|switchMap|distinctUntilChanged|combineLatest|mergeMap|
concatMap` returns **nothing**. List search runs synchronously on every keystroke
via signal writes.
- **Deviates from** architecture §4.2 and acceptance 3.2/4.2 (debounced ≥250ms
  search). Harmless against in-memory data, but it will thrash the FastAPI
  backend in Phase 5 if the pattern isn't established now.
- **Fix:** introduce a search stream — e.g. `toObservable(query).pipe(
  debounceTime(250), distinctUntilChanged())` — and combine it with the global
  filter via `combineLatest`, feeding a store (see H3). Establish this on one list
  so Phase 3 screens copy the right pattern.

### H3 — No store/facade layer; components call the data source directly
`core/stores/` and `core/api/` **do not exist**. Dashboard/lists inject
`InMemoryDataService` directly and also import `SYNTHETIC_*` constants for lookups.
- **Deviates from** architecture §4.3 & §8 (components → stores → `*Api`, with
  `InMemoryDataService` behind the same `*Api` interface so components never
  change when HTTP lands).
- **Fix (do this first in Phase 3):** add `PolicyStore`/`ClaimStore`/
  `ActivityStore`/`DashboardStore` exposing readonly signals, and a `*Api`
  interface with two implementations (HTTP + in-memory) chosen by `demoMode`.
  This is the critical refactor that makes Phase 5 (backend) a drop-in.

### M1 — Dashboard data is hardcoded, not derived
Premium (€2,485,000), exposure (€128.4M), approval rate (76.4%) and **all four
chart datasets** are literal constants. Only `activePolicies`/`openClaims`/
`recentClaims` come from data — and those are **field initializers that read
signals once**, not `computed()`, so they won't react to mutations or the filter.
The `DashboardStats` model exists but is unused.
- **Fix:** replace with `computed()` selectors over the data + filter; build a
  `DashboardStats` from the store. (Full filter reactivity is Phase 3 per H1.)

### M2 — `gr-table` is built but unused
`claim-list` and `policy-list` render bespoke `<table>` markup; neither imports
`GrTableComponent`. Acceptance 3.1/4.1 specify lists use `gr-table`.
- **Note:** the current `gr-table` only renders string cells (no sort, pagination,
  status/template columns), so it can't yet express these lists. **Fix:** either
  extend `gr-table` to cover sortable/numeric/template columns + pagination footer
  and adopt it, or drop it — but don't maintain two table implementations.

### M3 — Direct coupling to the synthetic seed for reference data
Feature and header components import `SYNTHETIC_COUNTRIES/INSUREDS/POLICIES`
directly for name lookups. In live mode those names won't exist.
- **Fix:** resolve countries/insureds through the data service / a reference-data
  cache (`api-contracts.md` §8), not the seed module.

### L1 — Seed lacks a Poland `SUBMITTED` claim and any `REOPENED`
The one `SUBMITTED` claim maps to the US policy; no `REOPENED` claim exists. The
Poland lifecycle E2E (acceptance 4.11) will need a deterministic Poland claim
fixture in Phase 4.

### L2 — Claim-submission `submit()` is a stub
It only sets a `submitted` signal — no `POST /claims`, no `SUBMIT` transition, no
redirect to the new claim, no `CanDeactivate` guard (acceptance 5.5/5.6). Expected
for a scaffold; flagged for Phase 4.

### L3 — Detail drawer not wired
`policy-list` `selected` is always null (no open handler); claim detail opens only
from a route param. The drawer-over-list interaction (architecture §6, acceptance
3.4/4.4) is not yet present. Phase 3.

### L4 — Chart options built inline, not as pure mappers
ECharts option objects are constructed inside `dashboard.component.ts` rather than
in pure, unit-testable mapper functions (architecture §9/§4.3). Minor; matters once
charts become data-driven (M1).

### L5 — `recentClaims` ordering
`claims().slice(-4).reverse()` orders by array position, not `reportedDate`/
`createdAt`. Use a dated sort.

---

## Recommended Phase 3 starting order

1. **H3** — stand up `*Api` interface + stores (in-memory impl now).
2. **H1 + H2** — wire the global filter and a debounced search stream through the
   stores; make the dashboard and both lists consume them.
3. **M1** — derive dashboard tiles/charts from the store (`computed`), build real
   `DashboardStats`; **L4** — extract chart mappers while doing this.
4. **M2/M3** — decide `gr-table`'s fate and route reference-data through the service.
5. **L3** — detail drawers for policies/claims.

L1/L2 roll into Phase 4.

---

*No application code was changed during this review — findings only, per the
reviewer role in `AGENTS.md` §6.*
