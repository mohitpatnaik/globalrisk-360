# Repository Setup Assignment — Apollo (Codex)

## Assignment: GlobalRisk 360 Angular Foundation

### Do not start until Atlas (Claude Code) delivers architecture documents. Wait for confirmation from Orion.

### Deliverables

1. **Angular Project Initialization**
   - Angular 18+ (latest stable), standalone components, strict TypeScript
   - Routing enabled
   - SCSS for styles
   - Jasmine/Karma for testing
   - ESLint configured

2. **Folder Structure** (per agreed architecture)
   ```
   src/app/
     core/          (services, guards, interceptors, models)
     shared/        (reusable components, pipes, directives)
     features/
       dashboard/
       policies/
       claims/
       claim-submission/
       activity/
     layout/        (sidebar, header, shell)
   ```

3. **Application Shell**
   - Dark sidebar navigation
   - Light main content area
   - Angular Router with named outlets
   - Base styles, CSS variables, design tokens

4. **Reusable Components** (first batch)
   - `gr-card`, `gr-badge`, `gr-table`, `gr-button`, `gr-input`
   - Status indicator component with color-coded states

5. **Domain Models** (initial TypeScript interfaces)

6. **Synthetic Seed Data** (service with realistic mock data)
   - 4 countries: Germany, France, Poland, United States
   - ~20 policies across countries
   - ~8 claims with varied statuses
   - ~15 activity events

7. **Build Verification**
   - `ng build` succeeds in production mode
   - `ng test` runs with at least 1 passing test
   - `ng lint` passes

### Reporting
Report completion with:
- Build output showing success
- List of files created
- Any blockers encountered
