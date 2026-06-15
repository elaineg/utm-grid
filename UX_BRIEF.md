# UTM Grid — UX Brief

> **This brief supersedes prior layout sections for the LANDING.** It is a grid-first
> legibility pass, not a new feature: same flows, same data model, new top-to-bottom layout.
> Acceptance = APP_SPEC.md "Landing legibility (grid-first)" + "One consolidated tool
> launcher" + "Mobile grid-first" + "My Workspaces unobtrusive when empty" success checks.
> Everything inside opened panels keeps its prior spec (Campaigns, UTM Spec, Naming
> Template, Launch Check, Audit, share, workspace) — only the LANDING chrome changes.
>
> **ROUND-2 EDITS (this revision, from panel round 1 = 4/10).** Layout/discoverability/copy
> only, plus two tiny behavior touches (the example row + empty-grid feedback). Six fixes,
> each tagged **[R2]** below and checkable:
> - **R2-A Mobile grid-first** — at 375px the secondary feature panels/accordions default
>   COLLAPSED and sit BELOW the grid; tighten the hero; the first editable grid card sits
>   within ~1 viewport height. (C1: Dana, Sam, Elena — dominant blocker.)
> - **R2-B Pre-filled worked-example row** — on a cold/empty-localStorage open, ship ONE
>   example row with its generated URL already visible above the fold, editable/clearable.
>   (C2: Elena value=No, Sam; VALIDATION P3 — promised, never built.)
> - **R2-C Hero rewrite** — short headline (not a wrapping sentence) + subhead leading with
>   the payoff; "no login" demoted to a trust line. (C3: Aisha, Rob, Jules.)
> - **R2-D Share ▾ consolidation** — one "Share ▾" control on the main builder, items
>   labeled by output; Copied! flashes on the persistent trigger. (C4: Marcus, Elena.)
> - **R2-E Empty-grid feedback** — Create-workspace on a grid with no usable row gives clear
>   feedback, never a silent no-op. (Elena bug.)
> - **R2-F Polish** — Generated-URL full value on hover/title; legible per-cell Fix +
>   discoverable global Auto-fix (discoverability/labeling only, behavior unchanged). (Priya,
>   Dana.)
> DEFER to backlog (NOT this pass): Wen's "standardize column to <value>" from the
> inconsistency warning; Tomás's "apply Auto-fix during CSV import." Tomás may stay at 8.
>
> **ROUND-3 EDIT (this revision, from panel round 2 = 8/10). ONE fix only — MOBILE CARD
> VIEW ≤640px ONLY, do NOT touch the desktop table view.**
> - **R3-A Mobile generated-URL preview high in the card** — in the mobile per-row CARD,
>   surface the row's GENERATED URL as a compact, legible ONE-LINE preview HIGH in the card,
>   directly under the base-URL / utm_campaign area and ABOVE the optional empty
>   utm_term/utm_content fields, so on a 375px cold open the example row's clean generated
>   URL is visible within the FIRST screenful (≤~667px). Width-contained (ellipsize/wrap
>   gracefully, NO horizontal scroll at 375px); keep the existing per-row copy affordance
>   reachable. (Elena's sole in-scope blocker; Sam named the identical wish. See D9 + §5.)
> Constraints: mobile-card-only; no horizontal overflow at 375px; no sticky/overlay
> occlusion; effect-based reads / getSnapshot stability unchanged. DEFER (unchanged):
> Tomás's clean-on-CSV-import — he remains the one accepted holdout at 8.

## 1. Problem statement
Build clean, consistent campaign tracking links in a grid — so a stray capital or stray space
never splits your report into two.

## 2. Primary user action  [R2-B]
Fill a row (base URL + utm_*) and copy the clean tagged URL. **On a cold (empty-localStorage)
open the grid ships pre-filled with ONE worked example row whose live Generated URL is already
visible above the fold**, so the user sees "messy in → clean tagged link out" before typing.
The example row is fully editable and clearable (a quiet "Clear example" / "Start fresh"
affordance plus normal cell editing) and must NEVER block starting fresh. The first editable
cell (the example's BASE URL) is the visual anchor of the first screen on both desktop AND
375px mobile.

**Exact example-row values (ship these literally):**
| field | value |
|-------|-------|
| BASE URL | `https://acme.com/spring-sale` |
| utm_source | `newsletter` |
| utm_medium | `email` |
| utm_campaign | `spring_sale_2026` |

**Resulting Generated URL (must render in the read-only column, copy-verifiable):**
`https://acme.com/spring-sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale_2026`

The example values are already clean (lowercase, underscored) so the visible URL demonstrates
the desired outcome, not an error state. Do NOT pre-fill a dirty/flagged example as the cold
hero — the first impression must be a working, green result. (A user can still type a messy
row to see lint + Auto-fix; that is discovery, not the cold landing.)

## 3. Emotional tone
Fast and businesslike, spreadsheet-confident. Inter, cool neutral grays, one accent for
primary actions, amber (not red) warnings, tight cell spacing. The first screen should feel
like opening a clean sheet, not reading a landing page.

## 4. Design decisions (the landing pass)

**D1 — Short headline, payoff-first subhead, grid above the fold  [R2-C] (the blocker; cites
`added-feature-buried-panel-surfaces-not-function` — this IS the owed standalone landing
pass).** Replace the two-line run-on GA-jargon sentence with a SHORT headline that does not
wrap to two lines on desktop, then a subhead that LEADS WITH THE PAYOFF, then a small muted
trust line. Ship this exact copy:
- **Headline (H1, ~28-32px, one line desktop, ≤2 short lines mobile):**
  **"Clean campaign links in a grid"**
- **Subhead (one muted line, leads with the payoff for marketer AND engineer):**
  **"Auto-fix the casing and spacing that splits a campaign into two in your analytics, and
  export a clean CSV that drops straight into your sheet."**
- **Trust line (smaller, muted, BELOW the subhead — kept, not the lead):**
  **"No login — nothing leaves your browser."**
Rationale: Jules nearly read the old GA-analyst headline as "not for me"; Rob/Aisha wanted
the payoff and a non-run-on headline. "Campaign links" + "your analytics" stays legible to
both a marketer and an engineer without locking to Google Analytics. Kill every full-width
feature / privacy / lint BANNER from the cold open. At 1280px with empty localStorage the grid
header row + the pre-filled example row sit within the first viewport height (first editable
row top ≤ ~720px). The hero (headline + subhead + trust line) + the single toolbar are the
ONLY things above the grid header.

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

**D6 — One "Share ▾" control, items labeled by output  [R2-D] (cites
`copy-confirmation-survives-tick-rerender`).** Collapse the three side-by-side share verbs on
the MAIN BUILDER into ONE **"Share ▾"** menu in the toolbar (replaces the standalone Copy
share link / Copy all URLs / Create workspace buttons). Menu items, each labeled by exactly
what it OUTPUTS (so the user never has to reason about snapshot-vs-live):
- **"Copy snapshot link"** — a frozen `/#g=...` state-encoded URL.
- **"Create live workspace"** — a server-synced editable `/w/<id>` everyone shares.
- **"Copy all URLs"** — the generated URLs as plain text.
The **"Copied!" / done confirmation flashes on the PERSISTENT "Share ▾" trigger itself**,
NEVER on the menu item (menu items unmount on click — copy-confirmation-survives-tick-rerender
lesson). On `/w/<id>` the menu also carries "Copy workspace link". A short one-line caption in
the menu header may read "Snapshot = frozen copy · Workspace = live shared edit."

**D7 — No silent dead buttons; empty-grid feedback  [R2-E].** When the grid has NO usable row
(empty / example cleared with nothing typed), **"Create live workspace"** must NOT be a silent
no-op (Elena hit a dead button). Either render it disabled with a tooltip/hint **"Add a row
first"**, OR keep it enabled and on click show an inline message **"Add at least one link
before creating a workspace."** Same rule for any action that needs ≥1 usable row (Copy all
URLs, Run Launch Check): never nothing-happens.

**D8 — Generated-URL & Fix legibility  [R2-F] (discoverability/labeling only; behavior
unchanged).** (a) The read-only Generated-URL column stays width-capped + ellipsized, and the
**full generated URL is available on hover via the native `title` attribute** (plus the
existing per-row Copy) — Priya could not read the truncated string before copying. (b) The
inline per-cell **"Fix"** affordance stays per-cell BY DESIGN but must be legible as such:
label/tooltip it so it reads "fix THIS cell" (e.g. "Fix this value"), and make the global
**"Auto-fix naming"** discoverable next to affected rows (e.g. when a row has ≥1 warning, show
a row-level "Auto-fix row" or a hint pointing at the global Auto-fix) so users who clicked
inline Fix and saw one field change (Priya, Dana) immediately find the whole-row/whole-grid
fix. Do NOT change Auto-fix's normalization behavior — labeling and discoverability only.

**D9 — Mobile card surfaces the generated URL above the optional fields  [R3-A]
(MOBILE CARD VIEW ≤640px ONLY — desktop table view UNCHANGED).** In the mobile per-row
CARD, render the row's **GENERATED URL as a compact one-line preview HIGH in the card** —
positioned directly under the BASE URL / utm_campaign block and **ABOVE the optional empty
utm_term / utm_content fields**. On a 375×667 cold open this puts the example row's clean
green generated URL (`https://acme.com/spring-sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale_2026`)
inside the FIRST screenful (≤~667px), so the "messy in → clean tagged link out" payoff is
visible without a scroll-flick. Requirements:
- **Width-contained**: single line, ellipsized (or graceful wrap) — **NO horizontal scroll
  at 375px**, no page overflow.
- The existing **per-row Copy affordance stays reachable** (the preview carries / sits
  beside the row's Copy URL button; copy still confirms in place per D5).
- **No sticky/overlay element** occludes the preview or any grid input
  (elementFromPoint at 375px lands on the intended control, never a cell behind it).
- **Desktop table view is untouched** — the read-only Generated-URL column there keeps its
  D3/D8 treatment (width-capped, ellipsized, full value on `title` hover).
- Behavior/data unchanged: effect-based reads / getSnapshot stability are NOT altered —
  this is a per-card layout reorder of an already-computed value, not new state.
Rationale: Elena (375px) was capped at 8 solely because the green generated URL sat below
the fold behind two empty optional fields; Sam (passing) named the identical wish. This is
the "payoff in the first mobile screenful" fix.

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
   - *Divider · Share ▾* (one menu, per D6) → **Copy snapshot link**, **Create live
     workspace**, **Copy all URLs** (+ **Copy workspace link** on `/w/<id>`). Confirmation
     flashes on the persistent Share ▾ trigger, never on a menu item.
   - *Divider · Rules ▾* (popover) → required source/medium/campaign, Lowercase only, No
     spaces, **Enforce UTM Spec**, **Enforce naming template** (canonical single toggles).
4. **Active panel zone** — when a Tools item is open, its panel renders here as a
   constrained-width stacked strip; closed by default on cold open.
5. **The grid (HERO)** — header row + the pre-filled example editable row (D2 §2 values),
   full width, the example's BASE URL + its live Generated URL visible without scrolling.
   Read-only Generated-URL column width-capped + ellipsized, full value on `title` hover (D8);
   per-row Copy + row actions in a fixed-width column to its right.
6. Quiet trust line under the grid (single muted line): "Everything runs in your browser —
   saved on this device, nothing sent to a server (Team Workspaces excepted)."

**Mobile 375px  [R2-A] (cites `mobile-sticky-overlay-occludes-tap-targets`) — the dominant
round-1 blocker (Dana, Sam, Elena): cold mobile open showed NO grid; the first field sat
~700px down behind a 3-4 line hero + toolbar + three accordion cards + a Select-all bar.**
Required ordering and budget at 375px, cold open:
1. **Compact hero** — short headline (≤2 lines) + payoff subhead (≤3 lines) + the small trust
   line; the whole hero block ≤ ~150px tall. No banners.
2. **One slim toolbar** — wrapped full-label thumb buttons (Add row, Auto-fix, Import, Export)
   plus **Tools ▾** / **Share ▾** / **Rules ▾** disclosures, ALL collapsed by default.
3. **The grid (HERO)** — the pre-filled example grid CARD (label-over-input fields with the
   live Generated URL + Copy) **must begin within ONE viewport height** of a 375×667 screen,
   i.e. the example's BASE URL field top ≤ ~600px. **Card-internal order [R3-A / D9]:**
   BASE URL → utm_source/medium/campaign → **the compact one-line GENERATED-URL preview +
   Copy** → THEN the optional utm_term / utm_content fields. The green generated URL must be
   visible WITHOUT scrolling (≤~667px), NOT pushed below the two empty optional fields.
   Width-contained, no horizontal scroll at 375px.
4. **BELOW the grid, collapsed:** the three secondary feature panels/accordions (Campaign
   Naming Template / Campaigns / Allowed values) default COLLAPSED and sit beneath the grid —
   they must NOT appear above or between the hero and the first grid card. The "Select all"
   bar must not sit between the toolbar and the first editable card.
NO sticky/overlay element occludes any grid input or launcher control — elementFromPoint at
375px lands on the intended control, never a cell behind it. Opened panels stack full-width in
flow, never overlay a cell. Desktop grid-first (already passing) must NOT regress.

## 6. 5-second check (cold visitor, above the fold)  [R2-B, R2-C]
- **Headline:** **"Clean campaign links in a grid"** (one line, not a wrapping sentence).
- **Subtitle:** **"Auto-fix the casing and spacing that splits a campaign into two in your
  analytics, and export a clean CSV that drops straight into your sheet."** Trust line below:
  "No login — nothing leaves your browser."
- **Primary action:** the pre-filled example grid row with a live Generated URL + Copy, plus
  Add row / Auto-fix visible in the one toolbar; Share ▾ as the single share control.
- **Pre-filled example (ship literally):** BASE `https://acme.com/spring-sale`,
  utm_source `newsletter`, utm_medium `email`, utm_campaign `spring_sale_2026` →
  Generated URL `https://acme.com/spring-sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale_2026`,
  already green/clean and visible above the fold on BOTH desktop (≤720px) and 375px mobile
  (BASE URL field top ≤ ~600px). Editable + clearable; never blocks starting fresh.
- **Shared-link visitor instead sees:** the "Loaded shared grid (N links)" banner pinned at
  top with the shared grid scrolled into view (unchanged from prior spec).
