# GlobalRisk 360 — Application Architecture

> Phase 1 architecture specification. Authored by **Atlas** (Claude Code) for the
> GlobalRisk 360 program. This is the source of truth for the Angular front-end;
> implementation (Apollo/Codex) must conform to the decisions here or raise a
> change request through Orion.

---

## 1. Product context

**GlobalRisk 360** is an enterprise SaaS console for managing **multinational
insurance programs**. A multinational company buys one global **master policy**;
that master program is implemented locally in each country by a **local policy**
to satisfy local regulation and currency. Risk managers, underwriters, and claims
adjusters use the console to monitor exposure, manage policies, and process
claims through a governed lifecycle.

The application is a **client-side SPA** backed by a small **FastAPI** service.
For demo and offline use it also runs against an in-memory synthetic data layer
(see §9), so the UI must never assume a live backend is reachable.

### Primary users / roles

| Role | Can do |
|---|---|
| `VIEWER` | Read dashboards, policies, claims, activity. No mutations. |
| `ADJUSTER` | Create & submit claims, add review notes, request info. |
| `UNDERWRITER` | Manage local policies, approve/reject claims. |
| `MANAGER` | All of the above + reopen/close claims, see all countries. |

Roles gate **actions**, not navigation — every authenticated user sees every
screen; disallowed actions are hidden or disabled with a tooltip.

---

## 2. Technology baseline

| Concern | Choice | Notes |
|---|---|---|
| Framework | **Angular 18+** | Standalone components only; no NgModules. |
| Language | **TypeScript (strict)** | `strict: true`, `noImplicitAny`, `strictTemplates`. |
| Local sync state | **Angular Signals** | Component & store state, derived values. |
| Async / streams | **RxJS** | HTTP, debounced search, cross-screen filter bus. |
| Styling | **Bootstrap 5 grid/utilities + custom SCSS** | Design tokens in `styles/`. No component library theming beyond grid + utilities. |
| Charts | **Apache ECharts** (`ngx-echarts` wrapper or direct) | Lazy-loaded. |
| Icons | **Lucide** (`lucide-angular`) | Tree-shakeable icon set. |
| Routing | **Angular Router** | Lazy `loadComponent` / `loadChildren` per feature. |
| Testing | **Jasmine + Karma** (unit), **Playwright** (E2E) | See §10. |
| Lint | **ESLint** (`angular-eslint`) + Prettier | |

**No paid dependencies.** All libraries above are MIT/Apache-2.0.

---

## 3. Architectural style

A **feature-oriented, layered** architecture:

```
┌──────────────────────────────────────────────────────────┐
│  layout/            shell: sidebar + header + router outlet │
├──────────────────────────────────────────────────────────┤
│  features/          dashboard · policies · claims ·         │
│                     claim-submission · activity             │
│   (smart components → call facades/stores, render dumb UI)  │
├──────────────────────────────────────────────────────────┤
│  shared/            gr-* presentational components, pipes,  │
│                     directives (no business logic)          │
├──────────────────────────────────────────────────────────┤
│  core/              singleton services, stores/facades,     │
│                     guards, interceptors, models, data      │
└──────────────────────────────────────────────────────────┘
```

Rules of dependency (enforced by convention + ESLint boundaries where possible):

- `features/*` may import from `core`, `shared`, and their **own** folder only.
  Features never import from each other — cross-feature needs go through a `core`
  store or the router.
- `shared/*` imports from `shared` and Angular/third-party only. **No `core`
  services, no feature imports.** Shared is pure presentation.
- `core/*` imports from `core` and third-party only.
- `layout/*` may import `core` + `shared`.

---

## 4. State management

Two complementary mechanisms, each with a clear job:

### 4.1 Signals — synchronous local & store state
- Component view state (open drawer, selected row, wizard step).
- **Stores** expose state as `readonly` signals + `computed` derived values.
- Mutations happen through store methods that call `.set`/`.update`.

### 4.2 RxJS — async, streaming, and cross-cutting
- All `HttpClient` calls return Observables; stores subscribe and push into signals.
- **Debounced search / filter** streams (`debounceTime`, `distinctUntilChanged`,
  `switchMap`).
- The **global filter bus** (country + period + line of business) is a
  `FilterService` holding a `BehaviorSubject<FilterState>`; the dashboard and
  policy/claims lists subscribe. Stores also expose the current value as a signal
  via `toSignal` for template use.

### 4.3 Store pattern (facade)

Each feature that owns data has a **store** service, `providedIn: 'root'`,
e.g. `PolicyStore`, `ClaimStore`, `ActivityStore`, `DashboardStore`. Shape:

```ts
@Injectable({ providedIn: 'root' })
export class ClaimStore {
  private readonly _claims = signal<Claim[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly claims = this._claims.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // derived
  readonly byStatus = computed(() =>
    groupBy(this._claims(), c => c.status));

  constructor(private api: ClaimApi) {}

  load(filter: FilterState): void { /* set loading, call api, push */ }
  transition(id: string, action: ClaimAction): Observable<Claim> { /* ... */ }
}
```

Smart components read signals in templates and call store methods on events.
**Components never call `HttpClient` directly** — only through an `*Api` service,
and usually only through a store.

### 4.4 Claim state machine (authoritative)

The claim lifecycle is enforced in **one place** — `ClaimStateMachine` in
`core/claims/`. UI, store, and (mirrored) backend all consult it. See
`data-model.md` §Claim for the full transition table. The front-end guards
action buttons by `ClaimStateMachine.canTransition(status, action, role)`.

---

## 5. Component hierarchy

```
AppComponent
└── ShellComponent (layout/)
    ├── SidebarComponent        (dark, collapsible, Lucide icons, nav)
    ├── HeaderComponent         (global filter bar, role switch, breadcrumbs)
    └── <router-outlet>
        ├── DashboardComponent              (features/dashboard)
        │   ├── StatTileComponent[]  (shared gr-stat)
        │   ├── ExposureMapChart / ChartPanelComponent (ECharts)
        │   └── RecentClaimsListComponent
        ├── PolicyListComponent             (features/policies)
        │   ├── gr-table (columns, sort, pagination)
        │   ├── PolicyFiltersComponent
        │   └── PolicyDetailDrawerComponent  (gr-drawer + tabs)
        ├── ClaimListComponent              (features/claims)
        │   ├── gr-table
        │   ├── ClaimStatusBadge (gr-badge/status indicator)
        │   └── ClaimDetailComponent
        │       ├── ClaimTimelineComponent (activity)
        │       ├── ReviewNotesComponent
        │       └── ClaimActionsComponent  (role + state gated)
        ├── ClaimSubmissionComponent        (features/claim-submission)
        │   └── 5-step wizard (Reactive Forms, one child per step)
        └── ActivityComponent               (features/activity timeline)
```

**Smart vs. presentational**
- *Smart* (feature container) components inject stores, hold routing, orchestrate.
- *Presentational* (`shared/gr-*`) take `@Input()` signals/values and emit
  `@Output()` events only. No injection of stores or Api services.

---

## 6. Routing

Top-level routes are **lazy** via `loadComponent`. Route config lives in
`app.routes.ts`; each feature exposes its own `*.routes.ts` where it has children.

```ts
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'policies', loadChildren: () => import('./features/policies/policies.routes').then(m => m.POLICY_ROUTES) },
  { path: 'claims', loadChildren: () => import('./features/claims/claims.routes').then(m => m.CLAIM_ROUTES) },
  { path: 'claims/new', loadComponent: () => import('./features/claim-submission/claim-submission.component').then(m => m.ClaimSubmissionComponent) },
  { path: 'activity', loadComponent: () => import('./features/activity/activity.component').then(m => m.ActivityComponent) },
  { path: '**', loadComponent: () => import('./shared/not-found/not-found.component').then(m => m.NotFoundComponent) },
];
```

- **Deep-linkable detail**: `claims/:id`, `policies/:id` resolve the entity; a
  guard/resolver handles not-found → redirect to list with a toast.
- Policy & claim **detail open in a drawer** over the list when navigated within
  the feature, and as a full page on deep link (same component, responsive).
- `CanDeactivate` guard on the claim-submission wizard warns on unsaved changes.

---

## 7. File / folder structure

Convention over configuration. One component per folder; file names are
`kebab-case`, classes `PascalCase`, the `gr-` prefix for shared UI selectors.

```
src/
  main.ts
  styles/
    _tokens.scss        design tokens (colors, type, spacing) — see design-system.md
    _mixins.scss
    _bootstrap-overrides.scss
    styles.scss         global entry
  app/
    app.component.ts
    app.config.ts       providers: router, http, echarts, etc.
    app.routes.ts

    core/
      models/           domain interfaces (see data-model.md)  — one file per aggregate
        country.model.ts  policy.model.ts  claim.model.ts  activity.model.ts  common.model.ts
      api/              thin HttpClient wrappers (PolicyApi, ClaimApi, ActivityApi, DashboardApi)
      stores/           PolicyStore, ClaimStore, ActivityStore, DashboardStore
      claims/           claim-state-machine.ts  claim-actions.ts
      services/         FilterService, RoleService, ToastService, ConfigService
      data/             synthetic seed data + InMemoryDataService (demo mode)
      guards/           unsaved-changes.guard.ts
      interceptors/     http-error.interceptor.ts  base-url.interceptor.ts
      tokens/           injection tokens (API_BASE_URL, DEMO_MODE)

    shared/
      ui/
        gr-card/  gr-badge/  gr-table/  gr-button/  gr-input/
        gr-status-indicator/  gr-drawer/  gr-stat/  gr-empty-state/
      pipes/            currency-compact.pipe.ts  relative-time.pipe.ts
      directives/       autofocus.directive.ts
      not-found/

    layout/
      shell/            shell.component.*
      sidebar/          sidebar.component.*
      header/           header.component.*

    features/
      dashboard/        dashboard.component.*  + widgets/
      policies/         policy-list.*  policy-detail-drawer.*  policies.routes.ts  policy-filters.*
      claims/           claim-list.*  claim-detail.*  claim-timeline.*  review-notes.*  claim-actions.*  claims.routes.ts
      claim-submission/ claim-submission.component.*  steps/ (step-1 … step-5)
      activity/         activity.component.*
  assets/
  environments/         environment.ts  environment.prod.ts  (API_BASE_URL, demoMode)
```

Backend (delivered later, Phase 5) lives under `/backend` (FastAPI + SQLite); out
of scope for front-end structure but its contract is fixed in `api-contracts.md`.

---

## 8. Cross-cutting services (`core/services`)

| Service | Responsibility |
|---|---|
| `FilterService` | Holds global `FilterState` (country, period, line). `BehaviorSubject` + signal view. Single source for dashboard & list filtering. |
| `RoleService` | Current role signal; `can(action)` helper. Demo lets you switch role from the header. |
| `ToastService` | Transient notifications (success/error/info). |
| `ConfigService` | Resolves `API_BASE_URL`, `demoMode` from environment + `APP_CONFIG` token. |
| `ClaimStateMachine` | Pure functions over claim status; no Angular deps → easy to unit test. |

**Interceptors**: `baseUrlInterceptor` prefixes relative URLs with
`API_BASE_URL`; `httpErrorInterceptor` maps the standard error envelope
(see `api-contracts.md` §Errors) to `ToastService` + rethrows a typed error.
In demo mode the HTTP layer is swapped for `InMemoryDataService` behind the same
`*Api` interface so no component changes.

---

## 9. Data flow

```
 User event ─▶ Smart component ─▶ Store method
                                   │
                                   ├─ demoMode? ─▶ InMemoryDataService (sync/synthetic)
                                   └─ else ──────▶ *Api ─▶ HttpClient ─▶ FastAPI
                                   │
                           result pushed into signals
                                   │
                 computed() derive ▼  (stats, groupings, filtered views)
                         Template renders from signals
```

- The global **filter** (`FilterService`) emits → stores reload or re-derive.
- Writes (claim transitions, policy edits) go store → Api → on success, store
  refetches or optimistically updates, and appends an `ActivityEvent`.
- Charts receive plain arrays from `computed()` selectors; ECharts option objects
  are built in small pure mapper functions (unit-testable).

**Demo mode** (`demoMode: true`): `InMemoryDataService` serves the synthetic seed
(4 countries, ~20 policies, ~8 claims, ~15 activity events). Mutations persist in
memory for the session only. This is what GitHub Pages / offline review uses.

---

## 10. Testing strategy

| Level | Tool | Scope |
|---|---|---|
| Unit | Jasmine + Karma | Pure logic first: `ClaimStateMachine`, pipes, store reducers, ECharts option mappers. Then components with `TestBed` + harnesses. |
| Component | Jasmine + Karma | `gr-*` shared components (inputs/outputs), smart components with mocked stores. |
| E2E | Playwright | Golden paths: dashboard loads & filters; policy search/sort/paginate; **claim submission wizard end-to-end**; **claim lifecycle (Poland scenario)**; role-gated actions hidden for VIEWER. |

Principles:
- **Logic out of components**: state machine, derivations, and mappers are pure
  and carry the heaviest unit coverage.
- Every store has tests for load / error / transition paths with a fake Api.
- Minimum bar for Phase 2: production `ng build` green, `ng lint` clean, ≥1
  passing spec; coverage grows per feature phase.
- Accessibility: Playwright checks focus order on the wizard and keyboard
  operability of the sidebar and tables.

---

## 11. Non-functional constraints

- **Strict TS, no `any`** (use `unknown` + narrowing). Lint blocks `any`.
- **OnPush everywhere** — with Signals, change detection stays cheap.
- **Lazy-load** every feature route and ECharts.
- **Accessible**: semantic landmarks, `aria-*` on interactive widgets, visible
  focus, color contrast meeting WCAG AA (verified against design tokens).
- **Responsive** at the breakpoints in `design-system.md`; sidebar collapses to
  icons < lg, to a drawer on mobile.
- **No secrets in repo**; API base URL comes from environment/config.

---

## 12. Open decisions for review (Orion)

1. ECharts integration via `ngx-echarts` wrapper vs. direct `echarts` + a thin
   directive. **Recommendation: direct + thin directive** to avoid an extra dep
   and keep tree-shaking control.
2. Detail view as **drawer-over-list** (recommended) vs. separate full pages.
3. Whether demo mode and live backend ship in the same build toggled by config
   (recommended) or separate builds.

*(Master prompt file was not present at repo root during authoring; this
architecture is derived from the architecture + repo-setup assignments and the
task board. Flag any divergence from the intended master spec.)*
