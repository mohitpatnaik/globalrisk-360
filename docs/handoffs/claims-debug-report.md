# Claims Workflow — Debug Report (Atlas)

> Reviewer/debugger: **Atlas** (Claude Code). Date: 2026-10-19.
> Assignment: debug & fix the claims workflow; verify the Poland claim lifecycle;
> add tests; verify build/lint/unit/E2E. Method: read the claims code path, then
> reproduce empirically with Playwright against the running app (both the dev
> server and a statically-served production build to rule out HMR artifacts).

## TL;DR

Three real defects found and fixed; two reported "console errors" were **not** in
the app. The full Poland lifecycle now works and is covered by a new E2E test.

| Gate | Result |
|---|---|
| `ng lint` | ✅ pass |
| unit (`ng test`) | ✅ 5/5 (was 2) |
| prod build | ✅ success |
| E2E (Playwright) | ✅ 7/7 — both dev-server and prod-static configs |

---

## Diagnosis of the reported symptoms

### "TypeError: Illegal invocation" + "SyntaxError: Illegal return statement"
**Not application bugs.** Captured the real browser console via Playwright on
`/`, `/claims`, and `/claims/new` (dev server and prod build): only normal
`vite`/Angular dev messages, **no `Illegal invocation`, no `Illegal return`, no
pageerror**. Both originate from October's browser-automation **eval tool**, not
Angular (Orion already suspected the sibling `Illegal return statement`). No app
change is needed for these; the defensive string-method changes added in
`f355bf8` are harmless but were not required to fix a real app fault.

### "Claims list shows 0 claims"
**False at runtime.** The list renders 8 synthetic claims (5 per page; badge
reads "8 claims"). The transient "0" is the eval tool or the 250 ms search
debounce flash on first paint — not a data/filter failure.

---

## Defects found & fixed

### D1 — Data loss: submitted claims & status changes were wiped (critical)
`ClaimStore.search()` called `api.list()` and `tap`-ed the result back into
`claimState`, overwriting it. Mutations (`addClaim`, `transitionClaim`) wrote only
to the store signal, while `search()`/`load()` re-read from the untouched
`InMemoryDataService` — two diverging sources of truth. Every list re-filter
discarded the newly submitted claim and any reviewer status change.
**Fix:** `search()` is now a pure, non-overwriting filter over the store's current
claims (`filterClaims`), and `claim-list` feeds `toObservable(store.claims)` into
its `combineLatest` so results stay reactive to mutations without a destructive
refetch. (Committed in `f355bf8`.)

### D2 — No reviewer status-change UI
`transitionClaim` was only ever called by the submission's `SUBMIT`. The claim
drawer had **no action buttons**, so a reviewer could not move a claim through its
lifecycle — the "reviewer status change" step of the scenario was unreachable,
though the state machine, labels, and store method all existed.
**Fix:** the claim drawer now renders state-machine- and role-gated action buttons
(`ClaimStateMachine.actionsFor` → `transitionClaim`), and updates the open claim
after a transition. (Committed in `f355bf8`.)

### D3 — Wizard submitted the claim prematurely (root cause of the "broken" feel)
`gr-button` rendered `<button>` with **no `type`**, so inside the submission
`<form>` it defaulted to `type="submit"`. Every "Continue" click therefore also
fired the form's `(ngSubmit)="submit()"`; once the form became valid (after
step 3), clicking Continue **submitted the claim and navigated away mid-wizard**,
bypassing steps 4–5 and the review step. This also caused the Playwright
instability we first saw (the footer button detaching as the page navigated).
**Fix:** `gr-button` now has `@Input() type: 'button' | 'submit' | 'reset' =
'button'` bound to the native button, so it never submits implicitly. Submission
still happens via the explicit "Submit claim" button's `(pressed)="submit()"`.
*(Uncommitted — see below.)*

---

## Poland lifecycle — verified end to end

New E2E `e2e/claim-workflow.spec.ts` drives the real scenario and passes:
submit a Poland claim (~180k) → it **appears in the claims list** as `SUBMITTED`
(persistence) → open it → **Start review** (reviewer transition) → status becomes
`UNDER_REVIEW` → the event shows on the **activity/audit timeline** (via
client-side nav; a hard reload resets in-memory demo state — see note).

New unit `src/app/core/stores/claim.store.spec.ts` covers the fix directly:
added claims survive `search()`, transitions persist + log activity, and
`filterClaims` narrows without mutating input.

---

## Files changed

Committed in `f355bf8` (merged with Orion's concurrent edits): `claim.store.ts`,
`claim-list.component.ts`, `claim-list.component.html`.

**Uncommitted (verified, ready to commit):**
- `src/app/shared/ui/gr-button/gr-button.component.ts` + `.html` — D3 fix (`type`).
- `e2e/claim-workflow.spec.ts` — new Poland-lifecycle E2E.
- `src/app/core/stores/claim.store.spec.ts` — new persistence/transition units.
- `docs/handoffs/claims-debug-report.md` — this report.

---

## Remaining issues / notes

1. **Demo persistence is in-memory only.** A full page reload resets claims &
   activity to the synthetic seed. The README states localStorage persistence,
   but there is **no `localStorage` usage in the codebase** (grepped). Either wire
   a localStorage-backed demo store or correct the README. (Doc/scope follow-up.)
2. **Dashboard is not live after a new submission.** `DashboardStore` reads via
   the API → `InMemoryDataService`, which store mutations don't write back to, so
   KPIs/charts won't reflect a just-submitted claim until reload. Out of the
   reported scope; note for a future "single source of truth" pass.
3. **Unit-test depth** is still modest (5). The new store spec is a good template
   to extend to `PolicyStore`, pipes, and the dashboard chart mapper.
