# CLAUDE.md — GlobalRisk 360 (Claude Code)

Guidance for **Claude Code** agents on this project. Read `AGENTS.md` first — it
holds the project-wide rules; this file adds Claude Code specifics and does not
repeat them. Precedence: human/Orion instruction → `AGENTS.md` → this file.

---

## 1. Context & environment

- Working directory: `/Users/mohitkumarpatnaik/Documents/ANGULAR` (the Angular
  app lives here; backend under `backend/` in Phase 5).
- This terminal is an October-bus agent (typically **Atlas**). Peer messages
  arrive as `[Name]:` lines; reply with the `message_peer` tool. Peers cannot see
  this terminal's output — share results explicitly.
- Specs are in `docs/` (see `AGENTS.md` §1). **Always read the relevant spec
  before editing or reviewing code.**

---

## 2. Start-of-task checklist

1. Read the assignment (often in `docs/handoffs/`) and the specs it references.
2. Check `docs/task-board.md` for current phase and open items.
3. Check the inbox / peer context (`check_inbox`, `get_peer_context`) for updates
   from Orion/Apollo.
4. Confirm scope before coding; if the task is docs/review only, do not write app
   code.

---

## 3. How to work

- **Plan briefly, then act.** Don't over-ask; pick sensible defaults consistent
  with the specs and note them. Use `AskUserQuestion`/Orion only for genuine forks.
- **Prefer the dedicated tools** (Read/Edit/Write/Grep/Glob) over shell `cat`/`sed`.
- **Batch independent tool calls** in one turn.
- **Match existing style**: naming, comment density, and idioms from surrounding
  code and the specs.
- **Keep edits in scope.** Don't refactor across feature/agent boundaries without
  coordinating through Orion.
- Use the **scratchpad** (`/private/tmp/.../scratchpad`) for throwaway files, not
  the project tree.

---

## 4. Angular specifics to honor

- Standalone components, `ChangeDetectionStrategy.OnPush`, Signals for view/store
  state, RxJS for async. No NgModules. No `any`.
- Components → stores → `*Api`; never call `HttpClient` from a component.
- Shared `gr-*` components are presentational: `@Input()`/`@Output()` only.
- Claim status changes only via `ClaimStateMachine`.
- Charts: ECharts option objects built in pure, unit-tested mapper functions;
  ECharts lazy-loaded.

---

## 5. Verification & honesty

- Before saying a task is done, run the applicable quality gates in `AGENTS.md` §5
  and paste/summarize the real output. If a gate fails, report it — don't paper
  over it.
- When reviewing (Atlas's recurring job), compare against `docs/architecture.md`,
  `docs/data-model.md`, `docs/api-contracts.md`, `docs/design-system.md`, and
  `docs/acceptance-criteria.md`. Report findings most-severe first with
  `file:line` references and a concrete failure scenario.
- Don't claim a watch, a passing build, or a verified behavior you didn't observe.

---

## 6. Git & external actions

- Commit messages: imperative, conventional prefixes (`feat:`, `fix:`, `docs:`,
  `test:`, `chore:`). Branch before committing on a shared branch if asked.
- **Remote/push operations are coordinated through Orion** (who owns the GitHub
  auth). Do not push or create remotes unilaterally.
- Confirm before anything hard to reverse or outward-facing.

### Commit / PR attribution
- End commit messages with:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- End PR descriptions with:
  `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
- A human/CLAUDE.md/memory rule about these lines overrides this section.

---

## 7. Reporting back

On completion, update `docs/task-board.md` and `docs/progress.md`, then report to
Orion via `message_peer`: deliverables, their paths, how verified, and
follow-ups/blockers. Keep terminal replies concise; put durable findings in the
docs, not just chat.

<!-- october:canvas-guide:start -->
# Working in this app (built with October)

This project is built inside **October**, a spatial canvas where each app **screen/route shows up as its own node**. October discovers screens by scanning the route files on disk, so how you structure routes is exactly what the user sees on the canvas.

## One screen = one route file

Give every screen its own route and its own component file, and register each route in the app's router. Use flat, lowercase, hyphenated route paths (e.g. `/sign-up`).

## When the user asks for a flow or multiple screens

Onboarding, a wizard, "a few screens", steps, a set of screens — **create one separate route file per screen.** Never put multiple screens inside a single component: no internal step/pager/carousel state standing in for separate screens, and no extra screen components exported from one file. One screen = one file = one route, so each shows up as its own node on the canvas.

## Dependencies

When you import a new package, add it to `package.json` in the same change (for Expo / React Native, run `npx expo install <pkg>` so it picks a compatible version and writes `package.json` for you). Anything missing from `package.json` disappears on a clean install and crashes the app.

## Working with other agents

If you're connected to October's bus (the october-bus MCP tools), you can bring on helper agents. Use `add_terminal` or `add_chat` without a target to share the current workspace's files; `checkoutId` or `joinTaskOf` selects an existing working location. Use `createWorkspace:{requestId,name,isolated:true}` for independent work in a separate workspace. Keep requestId stable on retry. Creation returns the child workspace, canvas and node references. Use `list_children`, `message_child`, `get_child_status` and `stop_child` for your children across workspaces; they reply with `message_parent`. Same-workspace agents retain ordinary connections and `message_peer`.
<!-- october:canvas-guide:end -->
