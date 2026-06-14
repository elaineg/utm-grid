# UTM Grid — UX Brief

> **This brief supersedes prior layout sections for the LANDING.** It is a grid-first
> legibility pass, not a new feature: same flows, same data model, new top-to-bottom layout.
> Acceptance = APP_SPEC.md "Landing legibility (grid-first)" + "One consolidated tool
> launcher" + "Mobile grid-first" + "My Workspaces unobtrusive when empty" success checks.
> Everything inside opened panels keeps its prior spec (Campaigns, UTM Spec, Naming
> Template, Launch Check, Audit, share, workspace) — only the LANDING chrome changes.

## 1. Problem statement
Tag every campaign link with clean, consistent UTM tags in one grid — so a stray capital
letter never splits your data in Google Analytics.

## 2. Primary user action
Fill a row (base URL + utm_*) and copy the clean tagged URL. The grid opens pre-filled with
ONE worked example row showing a live generated URL + Copy, so the outcome is visible before
the user types. The first editable cell (or the example's base URL) is the visual anchor of
the first screen.

## 3. Emotional tone
Fast and businesslike, spreadsheet-confident. Inter, cool neutral grays, one accent for
primary actions, amber (not red) warnings, tight cell spacing. The first screen should feel
like opening a clean sheet, not reading a landing page.

## 4. Design decisions (the landing pass)

**D1 — One-line hero, grid above the fold (the blocker; cites
`added-feature-buried-panel-surfaces-not-function` — this IS the owed standalone landing
pass).** Replace the two-line jargon hero with ONE concise sentence = the problem statement
above (≤2 lines desktop, ≈20px), plus one muted subtitle line: "Edit links in a grid,
auto-fix naming, export clean CSV — no login, nothing leaves your browser." Kill every
full-width feature / privacy / lint BANNER from the cold open. At 1280px with empty
localStorage the grid header row + first editable row sit within the first viewport height
(first editable row top ≤ ~720px). The hero + the single toolbar are the ONLY things above
the grid header.

**D2 — One compact tool launcher, not six banners (cites
`config-panels-below-full-width-grid`).** Collapse the stacked Toolbar / Lint Rules /
Presets / Bulk-edit / privacy bands into ONE slim toolbar row directly under the hero, above
the grid. Grouped left→right with thin dividers (see §5). Every feature stays ≤1 click:
primary actions are inline buttons; the long tail lives behind a single **"Tools ▾"** menu
and **"Share ▾"** menu; lint rules collapse to a **"Rules ▾"** popover (the canonical Enforce
UTM Spec / Enforce naming template toggles live there, one switch each). No feature removed.

**D3 — Panels open BELOW, full grid width, never beside it (cites
`side-panel-squeezes-grid-hides-editable-columns`, `config-panels-below-full-width-grid`,
`readonly-wide-column-must-be-width-capped-from-build`).** Any launcher panel (Presets, Bulk
edit, UTM Spec, Naming Template, Campaigns, Launch Check report, Audit) opens as a full-width
strip STACKED in normal flow between the toolbar and the grid (report-style panels — Launch
Check, Audit summary — render above the grid), constrained max-width, NEVER as a right
sidebar that steals grid width. The grid keeps full width at all times; the read-only
Generated-URL column stays width-capped + ellipsized (full value on hover/title) so utm_*
inputs are never pushed off-screen. Only ONE launcher panel open at a time (opening another
closes the prior). No horizontal page overflow at 1280px.

**D4 — My Workspaces / Campaigns: top panel only when they have content.** My Workspaces
renders ABOVE the toolbar as a first-class compact panel ONLY when it has ≥1 entry;
empty = fully hidden, zero above-grid space (per its round-3 spec — an empty panel read as
"one more banner" and pushed the grid down). Campaigns moves OUT of the old right sidebar
into the **"Tools ▾"** menu and opens as a below-grid stacked panel per D3; its empty state
is the quiet one-liner, never a sidebar that squeezes the grid.

**D5 — Copy confirms in place (cites `copy-confirmation-survives-tick-rerender`).** Every
copy trigger (row Copy, Copy all URLs, Copy share link, Copy workspace link, share-guide /
review links, Copy summary) swaps to a green "Copied!" fill on the SAME persistent button for
~1.8s with a ref-stable timer that survives grid re-renders, `aria-live="polite"`, and an
execCommand fallback. No corner toast that can scroll off.

## 5. Landing structure (top → bottom)

**Desktop ≥1280px:**
1. **My Workspaces panel** — present only when non-empty (else absent). Compact, full-width,
   above everything.
2. **Hero** — one-line headline (problem statement) + one muted subtitle. ~2 lines total, no
   image, tight top/bottom padding.
3. **Tool launcher (one slim full-width row):**
   - *Left — grid primary:* **Add row** (accent), **Auto-fix naming**, the
     **"Unsaved grid / In: <name>"** status pill.
   - *Divider · Data:* **Import CSV**, **Export CSV**, **Audit URLs**.
   - *Divider · Tools ▾* (one menu) → **Presets**, **Bulk edit**, **UTM Spec**, **Naming
     Template**, **Campaigns**, **Run Launch Check** (+ **Share style guide** / **Share review
     summary** on `/w/<id>`). Each opens its panel below the toolbar per D3.
   - *Divider · Share ▾* (one menu) → **Copy share link**, **Copy all URLs**, **Create shared
     workspace** (+ **Copy workspace link** on `/w/<id>`).
   - *Divider · Rules ▾* (popover) → required source/medium/campaign, Lowercase only, No
     spaces, **Enforce UTM Spec**, **Enforce naming template** (canonical single toggles).
4. **Active panel zone** — when a Tools item is open, its panel renders here as a
   constrained-width stacked strip; closed by default on cold open.
5. **The grid (HERO)** — header row + the pre-filled example editable row, full width,
   visible without scrolling. Read-only Generated-URL column width-capped + ellipsized;
   per-row Copy + row actions in a fixed-width column to its right.
6. Quiet trust line under the grid (single muted line): "Everything runs in your browser —
   saved on this device, nothing sent to a server (Team Workspaces excepted)."

**Mobile 375px (cites `mobile-sticky-overlay-occludes-tap-targets`):** compact hero (≤2
lines, ~20px) + subtitle (≤3 lines), ≤ ~120px tall; the toolbar collapses to wrapped
full-label thumb buttons (Add row, Auto-fix, Import, Export, Audit) plus **Tools ▾** /
**Share ▾** / **Rules ▾** disclosures, all collapsed by default; the first editable grid CARD
(label-over-input fields with live Generated URL + Copy) begins within ~1.5 viewport heights.
NO sticky/overlay element occludes any grid input or launcher control — elementFromPoint at
375px lands on the intended control, never a cell behind it. Opened panels stack full-width
in flow, never overlay a cell.

## 6. 5-second check (cold visitor, above the fold)
- **Headline:** "Tag every campaign link with clean, consistent UTM tags in one grid — so a
  stray capital letter never splits your data in Google Analytics."
- **Subtitle:** "Edit links in a grid, auto-fix naming, export clean CSV — no login, nothing
  leaves your browser."
- **Primary action:** the pre-filled example grid row with a live Generated URL + Copy, plus
  Add row / Auto-fix visible in the one toolbar.
- **Pre-filled example:** one clean example row (base + utm_* → live URL); optionally one
  flagged cell with its inline Fix so the auto-fix value is shown, not just described.
- **Shared-link visitor instead sees:** the "Loaded shared grid (N links)" banner pinned at
  top with the shared grid scrolled into view (unchanged from prior spec).
