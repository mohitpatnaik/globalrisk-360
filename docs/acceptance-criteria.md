# GlobalRisk 360 — Acceptance Criteria

> Per-screen acceptance criteria, written so implementation (Apollo) and review
> (Atlas) share one definition of done. Format: Given/When/Then where useful.
> Each screen also lists the Playwright E2E checks that must pass.

Global (apply to every screen):
- **G1** Loads with no console errors/warnings.
- **G2** Renders correctly 360px → 1920px; no horizontal page scroll.
- **G3** Keyboard: all interactive elements reachable, visible focus ring, logical
  tab order.
- **G4** Loading, empty, and error states are explicit (skeleton / `gr-empty-state`
  / error toast) — never a blank screen.
- **G5** Role-disallowed actions are hidden or disabled with an explanatory tooltip.
- **G6** All money shows currency + locale formatting; all dates localized.
- **G7** Works identically in demo mode (synthetic data) and against the live API.
- **G8** Meets WCAG AA contrast using design tokens; status never color-only.

---

## 1. Application shell (layout)

- **1.1** Dark sidebar lists: Dashboard, Policies, Claims, Submit Claim, Activity,
  each with its Lucide icon; the active route is visually marked (bg + accent bar).
- **1.2** Sidebar collapses to icon-only < lg and to an overlay drawer on mobile
  (toggle in header); state persists for the session.
- **1.3** Header shows the global filter bar (country, line, period), a role
  switcher (demo), and breadcrumbs reflecting the route.
- **1.4** Changing a global filter updates the dashboard and any open list without
  a full reload.
- **E2E** Navigate to each route via the sidebar; active state and breadcrumb
  update; deep-link `/claims/:id` renders the detail as a full page.

---

## 2. Dashboard

- **2.1** Shows a KPI row of stat tiles: Active Policies, Total Premium, Open
  Claims, Approval Rate, Total Exposure — each with value and (where available)
  period delta + trend arrow.
- **2.2** Four charts render (ECharts): Premium by Country (bar), Claims by Status
  (donut), Exposure by Category (bar), Claims over Time (line). Each has a title,
  legend, accessible summary (`aria-label`/table fallback), and tooltip.
- **2.3** A "Recent Claims" list shows the latest claims with status badges;
  clicking one opens its detail.
- **2.4** Applying the global filter (country/line/period) re-queries
  `/dashboard/stats` and all tiles/charts reflect the slice.
- **2.5** Empty slice (e.g. a country with no data) shows empty states, not broken
  charts.
- **E2E** Load dashboard → 5 tiles + 4 charts present; switch country to Poland →
  values change; click a recent claim → detail opens.

---

## 3. Policies

### List
- **3.1** Paginated `gr-table` (default 20/page) with columns: Policy #, Kind
  (Master/Local badge), Line, Insured, Country, Status, Total Premium, Updated.
- **3.2** Search (`q`) is debounced (≥250ms) and filters server-side; sort by any
  sortable column (asc/desc); filter by country/line/status/kind.
- **3.3** Numeric columns right-aligned with tabular figures; premium shows money
  format.
- **3.4** Row click opens the **detail drawer** (same route feature) without full
  navigation; deep link opens full page.
- **3.5** Empty/loading/error states per G4.

### Detail (drawer / page)
- **3.6** Shows header (policy #, kind, status badge, insured, country, term dates)
  and tabs: Overview, Coverages, (Master only) Local Policies, Claims.
- **3.7** Coverages tab lists each coverage with limit, deductible, premium.
- **3.8** For a Master policy, Local Policies tab lists linked locals with country,
  admitted flag, currency; clicking a local navigates to it.
- **3.9** Claims tab lists claims under the policy with status badges.
- **3.10** UNDERWRITER/MANAGER see an Edit action; VIEWER/ADJUSTER do not (G5).
  `CANCELLED`/`EXPIRED` policies are not editable (409 surfaced gracefully).
- **E2E** Search a policy → open drawer → switch tabs → from a master, open a
  linked local policy.

---

## 4. Claims

### List
- **4.1** Paginated `gr-table`: Claim #, Title, Country, Policy #, Status, Priority,
  Claimed, Reported date, Assigned. Default sort `-reportedDate`.
- **4.2** Search + filters: country, status, priority, policy; debounced search.
- **4.3** Status rendered via `gr-status-indicator`; priority color-coded with
  label.
- **4.4** Row click opens claim detail.
- **E2E** Filter by status `UNDER_REVIEW` → only matching rows; open one.

### Detail
- **4.5** Header: claim #, title, status badge, country, policy link, insured,
  priority, claimed/reserve/settled amounts as applicable.
- **4.6** Three regions: line items table, **review notes**, **activity timeline**
  for this claim.
- **4.7** **Actions** reflect the state machine *and* role (`data-model.md` §6.2):
  only valid `(status, action, role)` buttons are enabled; invalid ones are hidden
  or disabled with a tooltip explaining why.
- **4.8** Performing an action (e.g. Approve) opens a small form when the action
  needs data (reserve on review, settled amount on settle, approved amounts on
  approve, note on request-info/reject), then calls `/transition`.
- **4.9** On success: status badge updates, a new activity event and (if a note was
  entered) a review note appear without a manual refresh; on `409`/`403` a clear
  toast explains the rejection and state is unchanged.
- **4.10** Review notes can be added by ADJUSTER+; each note shows author role and
  relative time.
- **E2E (Poland scenario)** Open a Poland claim in `SUBMITTED` → Start Review →
  Request Info → Resubmit → Approve (enter approved amounts) → Settle (enter
  settled amount) → Close. Each step: badge updates, timeline gains an event,
  invalid actions never selectable. As VIEWER, no action buttons are enabled.

---

## 5. Claim submission wizard

- **5.1** Five steps via Reactive Forms: (1) Policy & country, (2) Loss details
  (dates, description), (3) Line items (add/remove, amounts), (4) Priority &
  assignment, (5) Review & submit.
- **5.2** Step nav shows progress and completed/current/upcoming states; you cannot
  skip ahead past an invalid step; Back preserves entered data.
- **5.3** Per-field validation with inline messages: required fields, loss date not
  in the future, reported date ≥ loss date, at least one line item, positive
  amounts, valid currency.
- **5.4** Review step summarizes all entries and computed claimed total; Submit is
  disabled until the whole form is valid.
- **5.5** Submit → `POST /claims` (status `DRAFT`) then `SUBMIT` transition →
  success toast + redirect to the new claim's detail; failure keeps the form with
  an error toast.
- **5.6** A `CanDeactivate` guard warns before navigating away with unsaved changes.
- **5.7** Fully keyboard-operable; focus moves to the first field/error of each
  step on change.
- **E2E** Complete all five steps for a Poland policy → land on the new claim's
  detail in `SUBMITTED`; try to submit with a missing field → blocked with
  inline error.

---

## 6. Activity

- **6.1** Reverse-chronological paginated timeline of `ActivityEvent`s with type
  icon, summary, actor role, country, and relative time.
- **6.2** Filterable by country and type; respects the global country filter.
- **6.3** Each event linking to an entity (claim/policy) navigates to it.
- **6.4** Empty/loading/error states per G4.
- **E2E** Perform a claim transition in another screen → the new event appears at
  the top of the activity feed.

---

## 7. Cross-screen / non-functional

- **7.1** `ng build` (production) succeeds with no errors.
- **7.2** `ng lint` passes with zero errors.
- **7.3** `ng test` passes; `ClaimStateMachine`, pipes, and chart mappers have unit
  coverage; each store has load/error/transition tests.
- **7.4** Playwright suite (the E2E checks above) passes headless.
- **7.5** No secrets committed; API base URL comes from environment/config.
- **7.6** Synthetic-data disclosure visible somewhere in the UI (e.g. a demo-mode
  banner or footer note) when `demoMode` is true.
- **7.7** Bundle: features lazy-loaded; ECharts not in the initial chunk.

---

## 8. Definition of done (per screen)

A screen is **done** when: all its criteria above pass; G1–G8 hold; its E2E checks
are green; and Atlas has reviewed the implementation against this document and the
architecture/design-system specs.
