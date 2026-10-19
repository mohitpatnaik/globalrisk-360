# GlobalRisk 360 — Design System

> Visual language and design tokens for the GlobalRisk 360 console. Enterprise
> SaaS: **dark sidebar, light content**, restrained accents, data-dense but calm.
> Tokens below are the source of truth; implementation puts them in
> `src/styles/_tokens.scss` as CSS custom properties and SCSS vars. Colors chosen
> to meet **WCAG AA** for their stated use.

---

## 1. Design principles

1. **Content is light, chrome is dark.** The sidebar anchors; the workspace is a
   clean light canvas so data reads clearly.
2. **Restraint.** One primary accent, semantic status colors, generous neutral
   greys. Color carries meaning (status), never decoration.
3. **Density with air.** Tables and cards are information-dense but use an 8px
   spacing rhythm so nothing feels cramped.
4. **Consistency.** Every surface is a `gr-card`, every status a
   `gr-status-indicator`, every action a `gr-button` variant.
5. **Accessible by default.** AA contrast, visible focus rings, keyboard paths,
   never color-only signaling (pair with icon/label).

---

## 2. Color tokens

### 2.1 Brand / primary

| Token | Hex | Use |
|---|---|---|
| `--gr-primary-900` | `#0b2545` | Sidebar background (deep navy) |
| `--gr-primary-800` | `#13315c` | Sidebar active/hover, headers |
| `--gr-primary-700` | `#1b4079` | Gradients, emphasis |
| `--gr-primary-600` | `#2563eb` | **Primary action** (buttons, links) |
| `--gr-primary-500` | `#3b82f6` | Primary hover |
| `--gr-primary-100` | `#dbeafe` | Primary tint (selected rows, chips) |
| `--gr-primary-050` | `#eff6ff` | Subtle primary surface |

`--gr-primary-600` (#2563eb) on white = 4.6:1 (AA for UI/text ≥ normal). White on
`--gr-primary-900` = 15:1.

### 2.2 Neutrals (content)

| Token | Hex | Use |
|---|---|---|
| `--gr-bg` | `#f6f8fb` | App content background |
| `--gr-surface` | `#ffffff` | Cards, tables, drawers |
| `--gr-surface-2` | `#f1f4f9` | Subtle inset / zebra rows |
| `--gr-border` | `#e2e8f0` | Hairlines, dividers |
| `--gr-border-strong` | `#cbd5e1` | Input borders |
| `--gr-text` | `#0f172a` | Primary text (15:1 on surface) |
| `--gr-text-muted` | `#475569` | Secondary text (7:1 on surface) |
| `--gr-text-subtle` | `#64748b` | Tertiary/labels (AA for ≥14px bold) |
| `--gr-text-on-dark` | `#e8eef7` | Text on sidebar |
| `--gr-text-on-dark-muted` | `#9fb3cd` | Muted text on sidebar |

### 2.3 Semantic / status

Each status pairs a **solid** (icon/dot/text-on-tint) with a **tint** (badge bg).

| Meaning | Solid | Tint bg | Text-on-tint | Maps to |
|---|---|---|---|---|
| Success / Active / Approved / Settled | `--gr-success-600 #15803d` | `--gr-success-100 #dcfce7` | `#14532d` | Active policy, Approved/Settled claim |
| Warning / Pending / Info-requested | `--gr-warning-600 #b45309` | `--gr-warning-100 #fef3c7` | `#78350f` | Submitted, Info requested |
| Danger / Rejected / Cancelled / Expired | `--gr-danger-600 #b91c1c` | `--gr-danger-100 #fee2e2` | `#7f1d1d` | Rejected, Cancelled, Expired |
| Info / Under review / Draft | `--gr-info-600 #0369a1` | `--gr-info-100 #e0f2fe` | `#0c4a6e` | Under review |
| Neutral / Draft / Closed | `--gr-neutral-600 #475569` | `--gr-neutral-100 #f1f5f9` | `#334155` | Draft, Closed, Reopened |

Status → token mapping used by `gr-status-indicator`:

```
DRAFT→neutral  SUBMITTED→warning  UNDER_REVIEW→info  INFO_REQUESTED→warning
APPROVED→success  REJECTED→danger  SETTLED→success  CLOSED→neutral  REOPENED→info
Policy: ACTIVE→success  DRAFT→neutral  EXPIRED→danger  CANCELLED→danger
```

### 2.4 Categorical (charts)

Brand-neutral categorical ramp for ECharts series (distinguishable, AA-safe on
light bg). Swap into the dataviz palette file at implementation time:

```
--gr-chart-1 #2563eb  (blue)
--gr-chart-2 #0891b2  (cyan)
--gr-chart-3 #7c3aed  (violet)
--gr-chart-4 #d97706  (amber)
--gr-chart-5 #059669  (emerald)
--gr-chart-6 #db2777  (pink)
--gr-chart-7 #64748b  (slate)
```
Sequential (exposure heat): `#eff6ff → #2563eb → #0b2545`.

---

## 3. Typography

System font stack (no web-font dependency, fast, enterprise-neutral):

```
--gr-font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                'Helvetica Neue', Arial, sans-serif;
--gr-font-mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
```
Inter is optional/self-hosted; the stack degrades gracefully if absent.

### Type scale (1.250 major-third-ish, tuned for density)

| Token | Size / line-height | Weight | Use |
|---|---|---|---|
| `--gr-text-display` | 28 / 34 | 700 | Page title (rare) |
| `--gr-text-h1` | 22 / 28 | 700 | Screen heading |
| `--gr-text-h2` | 18 / 24 | 600 | Card / section heading |
| `--gr-text-h3` | 15 / 20 | 600 | Sub-section, table group |
| `--gr-text-body` | 14 / 20 | 400 | Default body / table cells |
| `--gr-text-sm` | 13 / 18 | 400 | Secondary, metadata |
| `--gr-text-xs` | 12 / 16 | 500 | Labels, badges, captions (uppercase + 0.04em tracking for labels) |
| `--gr-text-stat` | 26 / 30 | 700 | Dashboard stat-tile value |

Numbers in tables/stats use `font-variant-numeric: tabular-nums`.

---

## 4. Spacing & layout

8px base grid. `--gr-space-N` tokens:

| Token | px |
|---|---|
| `--gr-space-1` | 4 |
| `--gr-space-2` | 8 |
| `--gr-space-3` | 12 |
| `--gr-space-4` | 16 |
| `--gr-space-5` | 24 |
| `--gr-space-6` | 32 |
| `--gr-space-7` | 48 |
| `--gr-space-8` | 64 |

Layout metrics:

| Token | Value |
|---|---|
| `--gr-sidebar-w` | 248px (expanded) |
| `--gr-sidebar-w-collapsed` | 68px |
| `--gr-header-h` | 56px |
| `--gr-content-max` | 1440px (centered) |
| `--gr-content-pad` | 24px (16px < md) |
| `--gr-gutter` | 16px (min side gutter, phone) |

---

## 5. Radius, borders, elevation

| Token | Value |
|---|---|
| `--gr-radius-sm` | 6px (inputs, badges) |
| `--gr-radius-md` | 10px (cards, buttons) |
| `--gr-radius-lg` | 14px (drawers, modals) |
| `--gr-radius-pill` | 999px |
| `--gr-border-w` | 1px |
| `--gr-shadow-sm` | `0 1px 2px rgba(15,23,42,.06)` |
| `--gr-shadow-md` | `0 4px 12px rgba(15,23,42,.08)` (cards on hover, drawer) |
| `--gr-shadow-lg` | `0 12px 32px rgba(15,23,42,.16)` (modal) |
| `--gr-focus-ring` | `0 0 0 3px rgba(37,99,235,.35)` |

---

## 6. Component conventions

### Buttons (`gr-button`)
Variants: `primary` (filled blue), `secondary` (surface + border),
`ghost` (text only), `danger` (filled red). Sizes: `sm` (28px), `md` (36px),
`lg` (44px). Always 1 icon slot (Lucide, 16–18px). Disabled = 45% opacity +
`cursor:not-allowed`. Loading = spinner replaces icon.

### Badges & status (`gr-badge`, `gr-status-indicator`)
Pill, `--gr-radius-pill`, tint bg + text-on-tint + a 6px solid dot or Lucide icon.
`gr-status-indicator` takes a `status` input and maps via §2.3 — never style ad hoc.

### Cards (`gr-card`)
`--gr-surface`, `--gr-radius-md`, `--gr-border`, `--gr-shadow-sm`. Optional header
(title + actions slot) and padded body (`--gr-space-5`).

### Tables (`gr-table`)
Surface bg, sticky header (`--gr-surface-2`, `--gr-text-subtle` uppercase labels),
zebra via `--gr-surface-2`, row hover `--gr-primary-050`, 44px row height, right-
align numeric columns (tabular-nums). Built-in slots for sort indicators,
pagination footer, empty state (`gr-empty-state`), and a loading skeleton.

### Inputs (`gr-input`)
36px height, `--gr-border-strong`, `--gr-radius-sm`, focus → primary border +
`--gr-focus-ring`. Error state → danger border + helper text. Labels sit above.

### Drawer (`gr-drawer`)
Right-side, 480px (full-width < md), `--gr-shadow-lg`, backdrop
`rgba(15,23,42,.4)`, ESC + backdrop-click to close, focus trapped.

### Sidebar
`--gr-primary-900` bg, Lucide icons, active item = `--gr-primary-800` bg +
left 3px `--gr-primary-500` accent bar. Collapses to icons < lg; mobile = overlay
drawer toggled from header.

---

## 7. Responsive breakpoints

Aligned to Bootstrap 5 so grid utilities compose cleanly.

| Token | Min width | Behavior |
|---|---|---|
| `sm` | 576px | 1-col stat tiles → 2-col |
| `md` | 768px | sidebar collapses to icons; content pad 16→24 |
| `lg` | 992px | sidebar expands; tables show all columns |
| `xl` | 1200px | dashboard 3–4 col grid |
| `xxl` | 1400px | content capped at `--gr-content-max`, centered |

Below `md`: sidebar becomes an overlay drawer; tables allow horizontal scroll
inside the card (never the page); drawers go full-width; the submission wizard
stacks its step nav above content. **No horizontal page scroll at any width.**

---

## 8. Motion

Subtle, fast, respects `prefers-reduced-motion`.

| Token | Value |
|---|---|
| `--gr-ease` | `cubic-bezier(.2,.0,.0,1)` |
| `--gr-dur-fast` | 120ms (hover, focus) |
| `--gr-dur` | 200ms (drawer, dropdown) |
| `--gr-dur-slow` | 320ms (page/route cross-fade) |

---

## 9. Iconography

**Lucide** only, 16px (inline/badges), 18–20px (buttons/nav), 1.75px stroke.
Canonical mappings: dashboard `layout-dashboard`, policies `file-text`,
claims `clipboard-list`, activity `activity`, submission `file-plus`,
country `globe`, approve `check-circle`, reject `x-circle`, info `info`,
settle `badge-check`, reopen `rotate-ccw`, search `search`, filter `sliders-horizontal`.

---

## 10. Theming notes (for implementation)

- Define every token on `:root` in `_tokens.scss` as a CSS custom property.
- A dark **content** theme is **out of scope** for Phase 1 (the sidebar is always
  dark; content is always light). Structure tokens so a future
  `@media (prefers-color-scheme: dark)` content theme could remap neutrals/surface
  without touching component SCSS.
- Bootstrap overrides live in `_bootstrap-overrides.scss`: map `$primary` →
  `--gr-primary-600`, border-radius → `--gr-radius-md`, font-family → `--gr-font-sans`,
  and disable unused Bootstrap components to keep the bundle lean.
