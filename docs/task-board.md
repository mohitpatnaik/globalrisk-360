# GlobalRisk 360 — Task Board

## Phase 0: Agent Orchestration (Orion)
- [x] Discover connected agents (Apollo/Codex, Atlas/Claude Code)
- [x] Verify October Bus communication
- [x] Verify Git and GitHub CLI configuration
- [ ] Verify browser-control capabilities
- [ ] Assign architecture task to Atlas
- [ ] Assign repository prep to Apollo

## Phase 1: Architecture (Atlas → Claude Code)
- [x] Design Angular application architecture → `docs/architecture.md`
- [x] Define design system → `docs/design-system.md`
- [x] Define data models → `docs/data-model.md`
- [x] Define API contracts → `docs/api-contracts.md`
- [x] Define acceptance criteria → `docs/acceptance-criteria.md`
- [x] Create AGENTS.md
- [x] Create CLAUDE.md
- [ ] Orion review of architecture docs

## Phase 2: Angular Foundation (Apollo → Codex)
- [x] Angular project initialization (Angular 18+, standalone, strict TS)
- [x] Application shell and routing
- [x] Sidebar navigation component
- [x] Reusable UI components (buttons, tables, cards, badges, forms)
- [x] Global styles and design tokens
- [x] Typed domain models
- [x] Synthetic seed data
- [x] Application config
- [x] Build verification
- [x] Atlas review → `docs/handoffs/review-phase2.md` (APPROVED to proceed; H1–H3 are Phase 3 entry criteria)

## Phase 3: Dashboard & Policy Management (Apollo)
- [ ] Dashboard with charts (Apache ECharts)
- [ ] Country/period filtering with RxJS
- [ ] Policy table with search, sort, pagination, filters
- [ ] Policy detail page/drawer
- [ ] Atlas review
- [ ] Browser verification

## Phase 4: Claims Management (Apollo)
- [ ] Claims list with status management
- [ ] State-machine enforcement
- [ ] Claim submission wizard (5-step Reactive Forms)
- [ ] Role-based actions
- [ ] Activity/timeline component
- [ ] Atlas review
- [ ] Browser verification of Poland scenario

## Phase 5: Backend & Persistence (Apollo)
- [ ] FastAPI backend with SQLite
- [ ] Pydantic models and endpoints
- [ ] Angular API services
- [ ] Synthetic data adapter for static demo
- [ ] Error handling
- [ ] Development API config

## Phase 6: Testing & Quality (Apollo)
- [ ] Unit tests (Jasmine/Karma or Vitest)
- [ ] Integration tests
- [ ] Playwright E2E tests
- [ ] ESLint configuration
- [ ] GitHub Actions CI/CD workflow
- [ ] Production build check
- [ ] Atlas review of test results

## Phase 7: UI Refinement
- [ ] Browser screenshot review
- [ ] Layout and typography polish
- [ ] Responsive design verification
- [ ] Keyboard accessibility improvements
- [ ] Visual consistency pass

## Phase 8: Documentation
- [ ] Professional README.md
- [ ] Architecture diagram
- [ ] Technology stack docs
- [ ] Local development instructions
- [ ] Test instructions
- [ ] Demo mode explanation
- [ ] Synthetic data disclosure
- [ ] API documentation
- [ ] Three-minute demo script

## Phase 9: Final Verification
- [ ] Production build succeeds
- [ ] All tests pass
- [ ] Playwright E2E passes
- [ ] Browser console clean
- [ ] No secrets in repo
- [ ] Final review by Atlas
- [ ] GitHub repo creation and push
- [ ] GitHub Pages deployment (if feasible)
- [ ] Final delivery report
