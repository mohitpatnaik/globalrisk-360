# GlobalRisk 360 — Task Board

## Phase 0: Agent Orchestration (Orion)
- [x] Discover connected agents (Apollo/Codex, Atlas/Claude Code)
- [x] Verify October Bus communication
- [x] Verify Git and GitHub CLI configuration
- [x] Verify browser-control capabilities
- [x] Assign architecture task to Atlas
- [x] Assign repository prep to Apollo

## Phase 1: Architecture (Atlas → Claude Code)
- [x] Design Angular application architecture → `docs/architecture.md`
- [x] Define design system → `docs/design-system.md`
- [x] Define data models → `docs/data-model.md`
- [x] Define API contracts → `docs/api-contracts.md`
- [x] Define acceptance criteria → `docs/acceptance-criteria.md`
- [x] Create AGENTS.md
- [x] Create CLAUDE.md
- [x] Orion review of architecture docs

## Phase 2: Angular Foundation (Apollo → Codex)
- [x] Angular project initialization (Angular 21, standalone, strict TS)
- [x] Application shell and routing
- [x] Sidebar navigation component
- [x] Reusable UI components (buttons, tables, cards, badges, forms)
- [x] Global styles and design tokens
- [x] Typed domain models
- [x] Synthetic seed data
- [x] Application config
- [x] Build verification
- [x] Atlas review → `docs/handoffs/review-phase2.md` (APPROVED; H1–H3 fixed)

## Phase 3: Dashboard & Policy Management
- [x] Dashboard with charts (Apache ECharts, 4 chart types)
- [x] Country/period filtering with RxJS (switchMap, shareReplay)
- [x] Policy table with search, sort, pagination, filters (combineLatest)
- [x] Policy detail page/drawer
- [x] Atlas review

## Phase 4: Claims Management
- [x] Claims list with status management (combineLatest, debounceTime)
- [x] State-machine enforcement (9 statuses, 10 transitions)
- [x] Claim submission wizard (5-step Reactive Forms)
- [x] Role-based actions
- [x] Activity/timeline component
- [x] Unsaved-changes guard (canDeactivate)
- [x] takeUntilDestroyed on RxJS subscriptions

## Phase 5: Backend & Persistence
- [x] In-memory data service + API interface (swap-ready for FastAPI)
- [ ] FastAPI backend with SQLite
- [ ] Angular HTTP API services (phase 5 wiring)

## Phase 6: Testing & Quality ✅ DONE
- [x] Unit tests (Jasmine/Karma) — 2 tests (claim state machine)
- [x] Playwright E2E tests — 6 tests (all passing)
- [x] ESLint configuration
- [x] GitHub Actions CI/CD workflow (lint, test, build, security scan)
- [x] Production build check (~525KB initial, all passing)

## Phase 7: UI Refinement
- [x] Layout and typography (custom SCSS + Bootstrap overrides)
- [x] Design tokens (CSS custom properties, responsive breakpoints)
- [ ] Browser screenshot review (optional polish)
- [ ] Keyboard accessibility improvements (phase 8 follow-up)

## Phase 8: Documentation ✅ DONE
- [x] Professional README.md (architecture, scenario, tech stack, demo script)
- [x] Architecture diagram in architecture.md
- [x] Technology stack docs
- [x] Local development instructions
- [x] Test instructions
- [x] Demo mode explanation
- [x] Synthetic data disclosure
- [x] API documentation (api-contracts.md)
- [x] Three-minute demo script

## Phase 9: Final Verification ✅ DONE
- [x] Production build succeeds
- [x] All tests pass (2 unit + 6 E2E)
- [x] Playwright E2E passes (6/6)
- [x] Browser console clean
- [x] No secrets in repo
- [x] GitHub repo created and pushed → https://github.com/mohitpatnaik/globalrisk-360
- [ ] GitHub Pages deployment (future enhancement)

## Current Metrics
- **Files**: 116 committed, 82 TypeScript files in src/
- **Lines of code**: ~1,130 LoC (source)
- **Production bundle**: ~525KB initial (ECharts lazy-loaded)
- **Unit tests**: 2 passing
- **E2E tests**: 6 passing
- **GitHub**: https://github.com/mohitpatnaik/globalrisk-360
