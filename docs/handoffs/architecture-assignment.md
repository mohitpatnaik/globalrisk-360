# Architecture Assignment — Atlas (Claude Code)

## Assignment: GlobalRisk 360 Architecture

### Deliverables
Create the following documents in the project root:

1. **`docs/architecture.md`** — Complete Angular application architecture including:
   - Component hierarchy and boundaries
   - State management approach (Signals + RxJS patterns)
   - Module decomposition (routing, feature modules via standalone)
   - Data flow architecture
   - File/folder structure (convention over configuration)
   - Shared services and injectables
   - Testing strategy

2. **`docs/data-model.md`** — All TypeScript interfaces for:
   - Country, Region
   - Policy (MasterPolicy, LocalPolicy)
   - Claim (with status enum, state machine)
   - Coverage, Risk, Insured
   - ActivityEvent, ReviewNote
   - DashboardStats, FilterState

3. **`docs/api-contracts.md`** — REST API contracts for FastAPI:
   - GET/POST/PUT/DELETE for policies, claims, activities
   - Request/response types
   - Error response format
   - Pagination parameters

4. **`docs/design-system.md`** — Visual design tokens:
   - Color palette (dark nav, light content, restrained accents)
   - Typography scale
   - Spacing system
   - Component styles conventions
   - Responsive breakpoints

5. **`docs/acceptance-criteria.md`** — Per-screen acceptance criteria

6. **`AGENTS.md`** — Project-wide agent guidelines for all future agents

7. **`CLAUDE.md`** — Specific guidelines for Claude Code agents

### Constraints
- Angular 18+ with standalone components, strict TypeScript
- RxJS for all async/streaming patterns
- Angular Signals for local synchronous state
- Bootstrap 5 + custom SCSS
- Apache ECharts for charts
- Lucide icons
- No paid dependencies
- Enterprise SaaS design (dark sidebar, light content)

### Do not implement code yet — only architecture and design documents.
