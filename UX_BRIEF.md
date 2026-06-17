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
>
> **THIS REVISION — ONE NEW FEATURE: cross-device "Move my setup" (Sync Code / portable
> bundle), spec flow 3.** Export ALL local accumulation as a `.json` file AND a copyable code;
> import via a CONFLICT-SAFE MERGE with a pre-apply added/updated/skipped summary the user
> confirms. Surfaced inside the EXISTING **Tools ▾** menu (no new above-grid banner, grid stays
> the hero). See **D10** + landing-structure Tools ▾ entry. All other sections unchanged.
>
> **PANEL ROUND-2 PASS (this revision, from panel round 1 = 1/10). Craft + IA only — NO new
> feature, NO new above-grid banner, grid-first landing MUST NOT regress.** The new "Move to
> another device" item tipped the **Tools ▾** menu into an 8–9-item junk drawer (5 testers:
> Elena, Dana, Jules, Priya, Wen) + two craft bugs. Six fixes, each tagged **[P2]** and
> checkable:
> - **P2-A Tools ▾ grouped into labeled sections (DOMINANT).** The flat menu becomes 3 LABELED
>   sections with tiny section headers, so it reads as an organized index, not a junk drawer.
>   Channel Presets surfaces FIRST (Jules + Dana: killer feature, was buried). See **D11** + §5.
> - **P2-B Copy-code confirms reliably even when clipboard is blocked.** The persistent
>   "Copy code" button flips to a green "Code copied!" fill the MOMENT it's clicked (optimistic),
>   with a clipboard fallback that selects the textarea + shows "press ⌘C / Ctrl-C". aria-live +
>   real accessible name. (Aisha, the craft judge; friction copy-confirmation-survives-tick-rerender.)
>   See **D10** EXPORT half (revised) + **D5**.
> - **P2-C Export "show what's inside" disclosure.** A muted, collapsed "Show what's inside"
>   toggle on the export panel reveals the human-readable JSON + one line "Export & import run
>   fully offline — zero network requests." (Wen, Tomás.) See **D10**.
> - **P2-D Post-import "Open to load it into the grid" hint.** After a confirmed import, a
>   one-line affordance points the user to Open a campaign to load it into the grid. (Rob.) See **D10**.
> - **P2-E Subhead reframes bulk-builder value FIRST.** Subhead now leads with "Build and tag a
>   batch of 30 campaign links at once" BEFORE the auto-fix/CSV framing. (Dana.) Copy-only; hero
>   structure unchanged. See **D1** (revised) + §6.
> - **P2-F ACTIONS column clip @1280px (builder note, no UX decision).** The 3rd per-row action
>   icon is clipped off the right edge at 1280px (Marcus) — pure CSS. Requirement: ALL per-row
>   action icons must be fully visible at 1280px, never clipped; no horizontal page overflow.

> **PANEL ROUND-3 FIX PASS (this revision, from panel round 2 = 6/10). Craft + IA only —
> NO new feature, NO new above-grid element, the grid-first landing and the 6 passers
> (Wen, Tomás, Dana, Aisha, Elena, Sam) MUST NOT regress.** Four fixes, each tagged **[P3]**
> and checkable. Flips Marcus + Priya + Jules → pass; Rob is the allowed miss.
>
> **What the "three persistent governance cards" actually are (investigation result — read
> before P3-B).** I inspected the real cold-open DOM (`app/page.tsx` + `UtmGrid.tsx`). On a
> cold open in default mode there are **NO persistent cards rendered above the grid.** The
> only things above the grid header are: the hero (H1 + subhead + trust line) and **ONE slim
> toolbar row**. `MyWorkspacesPanel` returns null when empty; the Compliance/Audit panels and
> the shared-grid banner are all absent on a cold open. What Priya read as "three persistent
> governance cards around a one-row grid" and Aisha (R1) as "home side-cards duplicating
> Tools/Rules entry points" are the **three dropdown launchers in that one toolbar row —
> `Tools ▾` / `Share ▾` / `Rules ▾`** (and, once Tools ▾ is opened, its three labeled section
> headers BUILD & REUSE / GOVERN CONVENTIONS / IMPORT & MOVE read as "three governance
> blocks"). They are launchers, not cards, and they do not duplicate each other. So P3-B is a
> de-WEIGHTING / visual-hierarchy fix, NOT a delete-features fix — and it confirms no feature
> is lost because nothing is removed.
>
> - **[P3-A] ACTIONS column clip @1280px (builder note, no UX decision — Marcus).** The
>   per-row ACTIONS cell now holds 4 icon-buttons (Copy · ⊞ QR · ⧉ duplicate · 🗑 trash). At
>   the current 160px width (px-2 padding) the content is ~174px, so the trash icon clips
>   ~12px past the cell's right edge at 1280px. **Requirement:** widen ACTIONS so all 4 icons
>   are fully visible at 1280px with NO cell or page horizontal overflow. Take the added width
>   (~+18–20px → ACTIONS ≈178–180px) from the read-only **Generated-URL** slab (currently
>   228px → ≈208–210px; it stays truncated with the full value on `title` hover per D8, so the
>   narrower slab loses nothing). Keep the table min-width within ~1217px so there is no
>   horizontal page overflow at 1280px. Desktop table only; the mobile card view is untouched.
>
> - **[P3-B] Cold landing is grid-first: de-weight the launcher row so nothing competes with
>   the grid (Priya).** Do NOT remove the editable grid, the example row, or the launcher row.
>   Do NOT remove any feature (nothing is a duplicate — see investigation above). Instead make
>   the one toolbar row read as a quiet utility strip the eye skips over on the way to the
>   grid: keep **+ Add row** as the single accent (filled) control; render **Auto-fix**,
>   Import/Export CSV, and the **Tools ▾ / Share ▾ / Rules ▾** launchers as lower-contrast
>   ghost/muted controls (thin border, gray text, no fills) so the colorful, editable grid is
>   unmistakably the hero. The three launchers stay as the SINGLE consolidated entry to the
>   long-tail tools — no second set of buttons, no above-grid cards, no panel auto-opens on
>   cold load. Acceptance: on a 1280px cold open, above the grid header there is exactly the
>   hero + one toolbar row; the most visually prominent element on screen is the example grid
>   row (its accent Add-row button + live Generated URL), not the toolbar. Every tool remains
>   reachable in one click of its launcher (no feature lost).
>
> - **[P3-C] Surface Channel Presets faster, with ZERO new above-grid element for returning
>   users (Jules — protect Dana/Elena).** Two changes, both low-risk:
>   1. **Cut the hop inside the menu (always on):** `Tools ▾ → Channel Presets` opens the
>      Presets panel ALREADY EXPANDED to the apply-able platform chips (the seeded
>      channel field-sets), so applying a preset is ONE click after opening the panel — not
>      "open → expand → apply". This removes Jules's extra "expand" hop for everyone with no
>      landing-density cost (the panel only exists once she opens it).
>   2. **Auto-open the Presets panel on a FIRST-EVER visit ONLY:** when localStorage has no
>      saved state — detected by the SAME empty-grid condition that seeds the example row
>      (`utm-grid:rows` absent/empty AND no saved campaigns/presets/workspaces) — the Presets
>      panel opens in the active-panel zone pre-expanded on first load, directly below the
>      toolbar and ABOVE the single example row, so a first-timer sees the platform chips
>      without hunting. **The MOMENT the user has ANY saved state** (edits a cell, applies a
>      preset, saves a campaign, or simply returns with non-empty localStorage) the panel does
>      NOT auto-open — it returns to closed-by-default, reachable only via Tools ▾.
>   **Exact empty-vs-returning condition:** auto-open fires iff the cold-open example-seed
>   condition is true (the `didSeedExample` empty check). First-ever visit = auto-open
>   pre-expanded; ANY subsequent visit / ANY saved state = closed, no auto-open. This adds NO
>   persistent above-grid element for returning users (cites
>   `optional-ui-gated-on-data-presence-vanishes-for-empty-case` — the regression that took
>   Dana 9→8 was an ALWAYS-ON above-grid element; this one is present ONLY in the empty/example
>   state and vanishes the instant there is data, which is exactly the safe shape). Per D3 the
>   panel is a full-width stacked strip, never a sidebar; it must not push the example row's
>   BASE URL below ~720px on desktop. Once dismissed/closed on the first visit it stays closed.
>
> - **[P3-D] OPTIONAL team-value line (Elena/Dana 9→10 nudge) — SKIP unless zero-cost.** Elena
>   and Dana already pass at 9; the only safe move is a copy tweak that adds NO banner and does
>   NOT push the grid down. The existing subhead already carries the "splits a campaign into
>   two in your analytics" payoff; you MAY tighten its tail to name team consistency WITHOUT
>   adding a line — e.g. end the existing one-line subhead with "…so your whole team's links
>   stay consistent." Only if it fits the existing subhead line at 1280px (no extra wrap, no
>   new element). Otherwise skip — do not add a banner or a second subtitle line.

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
- **Subhead (one muted line, leads with the BULK-BUILDER payoff first, THEN the auto-fix
  framing — [P2-E], Dana read the old casing-first copy as a CSV-cleanup utility and missed
  the 30-link batch value):**
  **"Build and tag a whole batch of 30+ campaign links at once — and auto-fix the casing and
  spacing that splits a campaign into two in your analytics, then export a clean CSV."**
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

**D10 — Cross-device "Move my setup" (Sync Code / portable bundle) lives inside Tools ▾,
opens a below-grid stacked panel; conflict-safe merge with a pre-apply summary (cites
`added-feature-buried-panel-surfaces-not-function`, `optional-ui-gated-on-data-presence-vanishes-for-empty-case`,
`copy-confirmation-survives-tick-rerender`, `side-panel-squeezes-grid-hides-editable-columns`,
`mobile-sticky-overlay-occludes-tap-targets`). NEW FEATURE — this is the only addition this pass.**

This is the free manual on-ramp to a future paid account-sync: export ALL local accumulation
(Campaigns + Presets + UTM Spec + Naming Template + lint toggles + editor/reviewer name +
My-Workspaces secret-link keychain) as one versioned bundle, and merge it into another device.

**Surfacing (decision):** ONE launcher entry inside the existing **Tools ▾** menu (the group
that already holds Campaigns / Presets / UTM Spec / Naming Template — the very state this
bundles), labeled **"Move to another device"** (sub-caption in the menu: *"export / import your
setup"*). It opens the **Setup transfer panel** as a full-width stacked strip BELOW the toolbar
per D3 — it adds NO new full-width banner above the grid, does NOT push the grid below the fold,
and the entry is **always present even with empty localStorage** (it sits in the menu, not in
prime above-grid real estate; an empty export shows a graceful message, see below).

**Setup transfer panel — two clearly separated halves, EXPORT (top) and IMPORT (bottom):**

*EXPORT half — "Move this device's setup":*
- One-line privacy reassurance at the top: **"This is your own local data — nothing is uploaded.
  Your shared workspaces already live online; this bundle just carries the secret links back."**
- A compact "what's included" count line: e.g. **"4 campaigns · 3 presets · UTM Spec · Naming
  Template · 2 saved workspaces"** so the user sees what they're moving.
- TWO side-by-side (stacked on mobile) primary actions:
  - **"Download .json"** — downloads the versioned bundle file (`utm-grid-setup-<date>.json`).
  - **"Copy code"** — copies the bundle as a code string. **[P2-B] CONFIRMATION MUST FIRE
    RELIABLY EVEN WHEN `navigator.clipboard` IS BLOCKED** (Aisha rated the feature value=No
    because she saw no visible confirmation; friction copy-confirmation-survives-tick-rerender):
    - The button flips to a green-fill **"Code copied!"** state OPTIMISTICALLY the moment the
      user clicks — NOT gated on the async clipboard promise resolving — held ~1.8s on the SAME
      persistent button (ref-stable timer that survives grid re-renders), with
      `aria-live="polite"` announcing "Code copied" and a real accessible name on the button
      (`aria-label="Copy setup code"`).
    - **Fallback when the clipboard write throws/rejects:** select the bundle textarea's
      contents and show an inline hint **"Press ⌘C (Ctrl-C on Windows) to copy"** right beside
      the button, so the user can always complete the copy manually. The green cue still shows
      (the code is selected and copyable).
    - Never flash the cue on a menu item or a transient/unmounting element — it lives on the
      persistent Copy-code button only.
- **[P2-C] "Show what's inside" disclosure (export trust — Wen, Tomás).** Below the two primary
  actions, UNDERSTATED: a muted, collapsed **"Show what's inside"** toggle that, when expanded,
  reveals the bundle's **human-readable (pretty-printed) JSON** in a read-only scroll box so a
  data-hygiene user can verify it is only their own local data. Directly under it, one explicit
  muted line: **"Export and import run fully offline — zero network requests."** Collapsed by
  default; it must NOT push the primary export actions below the fold.
- **Empty-export graceful state:** when there is nothing saved yet, the export actions are
  disabled with an inline hint **"Nothing saved yet — create a campaign, preset, or workspace
  first, then come back to move it."** (never a silent dead button, per D7).

*IMPORT half — "Bring a setup onto this device":*
- A **paste-a-code textarea** OR an **"Upload .json"** file picker (both accepted).
- A reassurance line that makes the conflict-safe nature legible BEFORE acting:
  **"We merge into what's already here — we never overwrite your saved campaigns."**
- On submit, parse + diff LOCALLY, then show a **pre-apply MERGE SUMMARY** before anything is
  written: **"X added · Y updated · Z skipped"**, with the affected items NAMED under each
  bucket (campaign / preset / workspace names), e.g. *Added: "Black Friday", "Q3 Taxonomy" ·
  Updated: "Spring Sale" · Skipped: "Holiday" (already up to date)*. Singleton settings
  (UTM Spec / Naming Template / lint toggles / names) are shown as **"adopt"** only when local
  is empty/default, otherwise as a checkbox-gated **"overwrite your current UTM Spec?"** the user
  must opt into. Two explicit buttons: **"Confirm import"** and **"Cancel"** — nothing is
  written to localStorage until Confirm.
- **[P2-D] Post-import "load it into the grid" affordance (Rob — merged campaigns land in the
  library, not the active grid).** After a SUCCESSFUL confirmed import, the success line names
  what merged AND tells the user the next step: e.g. **"Imported 2 campaigns into your library.
  Open one from Campaigns to load it into the grid."** — with **"Open Campaigns"** as an inline
  link/button that opens the Campaigns panel (per D3). The hint makes clear the import populated
  the LIBRARY, and the working grid is loaded by Opening a campaign — never leaving the user
  wondering why the grid looks unchanged.
- **Error states (reassure existing data is untouched):**
  - Malformed/garbage string → **"That doesn't look like a UTM Grid setup code. Your saved data
    is unchanged."**
  - Unknown/newer `version` → **"This setup was exported from a newer version of UTM Grid.
    Update, then import again. Nothing was changed here."**
  - Both leave existing local state intact and never reach the merge-summary step.

**Roadmap tease (honest, not a dark pattern):** a single muted line at the BOTTOM of the panel:
**"Coming soon: optional accounts sync your setup automatically — no export step. This manual
move is free and always will be."** It is informational only — it does NOT block, gate, or
interrupt export/import, and is NOT a signup CTA (no accounts exist this version).

**Mobile 375px:** the panel opens BELOW/stacked at full constrained width (per D3, never a side
panel that squeezes the grid). EXPORT and IMPORT halves stack vertically; the two export buttons
stack; the paste textarea is full-width; the merge-summary list wraps with no horizontal scroll;
Confirm/Cancel are ≥44px thumb targets. NO sticky/overlay element occludes any control
(elementFromPoint lands on the intended button). No horizontal page overflow at 375px or 1280px.

**Zero-network invariant:** export AND import (including the merge diff) run entirely client-side
— no `/api/` call fires from this panel. The privacy copy above is accurate.

**D11 — Tools ▾ de-densified into 3 LABELED sections, not a flat junk drawer  [P2-A]
(DOMINANT round-1 fix — Elena, Dana, Jules, Priya, Wen; cites
`added-feature-buried-panel-surfaces-not-function`). NO new above-grid banner; grid-first
landing UNCHANGED — this is purely the internal IA of the existing Tools ▾ menu.** The flat
~8-item list reads as overwhelming clutter and buries the killer features. Reorganize the menu
into 3 sections, each with a tiny muted UPPERCASE section header (non-clickable label, ~11px),
in THIS fixed order. Channel **Presets** sits FIRST in the first group (Jules + Dana: presets
were buried two hops deep). Exact buckets, labels, and item order:

1. **BUILD & REUSE** — *Presets* (sub-caption "saved channel field sets") · *Bulk edit* ·
   *Campaigns* ("saved grids library")
2. **GOVERN CONVENTIONS** — *UTM Spec* ("allowed values") · *Naming Template* ("utm_campaign
   structure") · *Run Launch Check* ("whole-grid compliance report")
3. **IMPORT & MOVE** — *Audit URLs* ("paste existing tagged links") · *Move to another device*
   ("export / import your setup")

Notes:
- *Import CSV* and *Export CSV* stay as inline toolbar buttons in the "Data" group (per §5) —
  they are NOT moved into the menu; only *Audit URLs* (the paste-inbound counterpart) lives in
  the menu's "Import & move" section.
- On `/w/<id>` workspace pages ONLY, the menu additionally shows a 4th section **SHARE
  GOVERNANCE** — *Share style guide* · *Share review summary* — so those two `/w/`-only entries
  group cleanly instead of dangling in the flat list. (They do not appear on `/`.)
- Section headers are visual dividers/labels only: they do not collapse, are not focusable as
  buttons, and add no extra click. Every item stays reachable in ONE click of opening Tools ▾,
  exactly as before — only the visual grouping changes. No item removed, no item renamed except
  the addition of the muted sub-captions above.
- The menu should read top-to-bottom as a scannable index: a marketer scanning for "presets"
  finds it FIRST; an eng/manager scanning for governance finds the three convention tools
  grouped together. Goal-met test: a cold tester opening Tools ▾ can name what's in the menu
  without it reading as an undifferentiated dump.

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
   - *Divider · Tools ▾* (one menu, GROUPED into labeled sections per **D11** [P2-A]) →
     **BUILD & REUSE** (Presets · Bulk edit · Campaigns) · **GOVERN CONVENTIONS** (UTM Spec ·
     Naming Template · Run Launch Check) · **IMPORT & MOVE** (Audit URLs · Move to another
     device, export/import setup per D10) (+ a 4th **SHARE GOVERNANCE** section — Share style
     guide · Share review summary — on `/w/<id>` ONLY). Each item opens its panel below the
     toolbar per D3; section headers are labels only, no extra click.
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
- **Subtitle [P2-E]:** **"Build and tag a whole batch of 30+ campaign links at once — and
  auto-fix the casing and spacing that splits a campaign into two in your analytics, then export
  a clean CSV."** (Bulk-builder value reads FIRST; Dana misread the old casing-first copy as a
  CSV-cleanup utility.) Trust line below: "No login — nothing leaves your browser."
- **Primary action:** the pre-filled example grid row with a live Generated URL + Copy, plus
  Add row / Auto-fix visible in the one toolbar; Share ▾ as the single share control.
- **Pre-filled example (ship literally):** BASE `https://acme.com/spring-sale`,
  utm_source `newsletter`, utm_medium `email`, utm_campaign `spring_sale_2026` →
  Generated URL `https://acme.com/spring-sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale_2026`,
  already green/clean and visible above the fold on BOTH desktop (≤720px) and 375px mobile
  (BASE URL field top ≤ ~600px). Editable + clearable; never blocks starting fresh.
- **Shared-link visitor instead sees:** the "Loaded shared grid (N links)" banner pinned at
  top with the shared grid scrolled into view (unchanged from prior spec).

## 7. NEW FEATURE — Branded bulk QR codes (spec Flow 4)

> Additive and unobtrusive: the link-building flow above is untouched. QR is a per-row icon +
> ONE primary batch button + ONE collapsed branding panel. Same visual language as the rest of
> the app: Inter, cool neutral grays, the existing single accent for primary actions, amber (not
> red) for the scannability warning, square/rounded cells unchanged. Do NOT introduce a new look.
> Honors the existing layout decisions: panels open BELOW the grid at full width, never a side
> panel (D3); copy/done confirms in place on the persistent trigger (D5); no silent dead buttons
> (D7); no sticky/overlay occlusion at 375px; SSR-safe (QR rendered in a client effect / on click,
> never a useState lazy initializer — matches the existing QrPopover).

**Q1 — Placement (the 5-second rule: discoverable, not cluttering).**
- *Per-row:* a small **⊞ QR** icon-button in the existing per-row ACTIONS column (it already
  sits there: Copy · ⊞ QR · duplicate · trash — keep all 4 fully visible at 1280px per P3-A). It
  is the row-level entry; one click opens the preview. No new column, no extra grid width.
- *Batch (PRIMARY):* a single **"Download QR codes (ZIP)"** button lives with the BULK action
  group (alongside Set column / Find & replace / Bulk edit), reached from the grid's bulk
  affordances — visually a notch quieter than the grid hero but unmistakably the batch action,
  using the existing accent for a primary verb. It is NOT a new above-grid banner and does not
  push the grid down (P3-B grid-first must not regress).
- *Branding:* a **"QR branding"** entry sits in the **Tools ▾ → BUILD & REUSE** section (it
  governs how the batch looks, like presets); opening it renders the Branding panel as a
  full-width stacked strip BELOW the toolbar (D3), never a sidebar. Closed by default on cold
  open — a cold visitor sees zero QR chrome beyond the quiet per-row icon.

**Q2 — Per-row vs. batch interaction model.**
- *Per-row preview = "see one before you commit."* Clicking ⊞ QR opens the existing
  popover (desktop) / inline card panel (mobile): the QR image, the encoded URL with a Copy
  affordance (confirms in place, D5), and **Download PNG** / **Download SVG**. The preview ALWAYS
  reflects the current grid-wide branding (colors + logo + size), so the row preview IS the
  branding preview — the user tweaks branding, reopens any row, and sees the result.
- *Batch = "ship the whole set."* "Download QR codes (ZIP)" uses the SAME selection model as
  other bulk ops (selected rows, or ALL rows when none selected), generates one image per valid
  row + a contact-sheet PNG, and downloads ONE ZIP. After download, an inline in-place result
  line reads e.g. **"12 QR codes generated, 2 skipped — incomplete or invalid URL"** (green-fill
  confirmation on the persistent button, D5), so the marketer knows exactly what they got.
- *Format/size selector* lives at the TOP of the Branding panel AND is mirrored compactly in the
  per-row preview: a **Size** segmented control (512 / 1024 / 2048px, default 1024) and a
  **PNG / SVG** choice; SVG visibly disables the px size (vector — no resolution to pick).

**Q3 — Branding panel layout (the free wedge, per-grid for batch consistency).**
Top-to-bottom, full-width stacked strip, three quiet groups separated by hairline dividers:
1. **Output** — Size segmented control + PNG/SVG toggle. One muted line: "Applies to every QR
   in this grid."
2. **Colors** — a **Foreground (dark)** swatch+picker and a **Background (light)** swatch+picker
   side by side, with a small live QR PREVIEW tile to their right that updates as colors change
   (the worked-example pattern: the user sees the branded result immediately, never a blank box).
3. **Center logo (optional)** — a drop/upload control accepting PNG or SVG, a thumbnail of the
   uploaded logo, and a **Remove logo** action. A muted helper: "We bump error-correction and
   keep a clear margin so it still scans." Logo is composited locally — never uploaded.
Branding state persists in localStorage and rides saved campaigns / share link / workspace
payload alongside the existing spec (no new schema). One muted footer line restates the wedge
honestly: "All client-side — your logo and links never leave your browser."

**Q4 — Scannability-warning UX (amber, actionable, blocks the unscannable batch).**
When the chosen fg/bg contrast falls below the reliable-scan threshold, the live preview tile
shows an **amber inline warning** directly beneath the color pickers (not red — this is guidance,
matching the app's amber lint convention), stating WHAT TO DO next, not what's wrong:
**"Low contrast — pick a darker foreground or a lighter background so scanners can read it."**
While the warning is active, both **Download PNG/SVG** (per-row) and **"Download QR codes (ZIP)"**
are disabled with the same hint on hover/tap, so a user can never ship an unscannable batch
(D7 — never a silent dead button; the disabled state always carries the reason). The moment a
high-contrast pair is chosen the warning clears and downloads re-enable. (A logo that would cover
too much of the code is auto-capped by the generator, not surfaced as a blocking warning.)

**Q5 — Empty & edge states (never a blank box, never a silent no-op).**
- *No rows / no valid row:* "Download QR codes (ZIP)" renders DISABLED with the hint
  **"Add at least one complete link first"** (D7). The Branding panel still opens and its preview
  tile shows a QR of the example/placeholder URL so the controls are never a blank box.
- *A row with an empty/invalid generated URL:* its per-row ⊞ QR icon is hidden (or shown disabled
  with the hint "Complete this link to generate a QR") — never a popover that renders an error;
  in a bulk run that row is silently SKIPPED and counted in the "M skipped" result line.
- *Logo upload of an unsupported file:* an inline amber hint "Use a PNG or SVG logo" — no crash,
  the prior logo (if any) is retained.

**Q6 — Mobile (375px).**
- Per-row ⊞ QR opens the inline CARD-flow panel (not a fixed popover) in normal document flow
  below the card — no overlay, no scroll-jump (existing QrPopover cardFlow behavior).
- The Branding panel and "Download QR codes (ZIP)" stack full-width below the grid; color
  pickers, size/format controls, logo upload, and the download button are all ≥44px thumb
  targets, reachable with NO horizontal scroll and NO sticky/overlay occlusion (elementFromPoint
  lands on the intended control). The live preview tile sits above the warning so the amber
  message is visible without hunting. No horizontal page overflow at 375px or 1280px.

## 8. CHANGE — Branded bulk QR is a FIRST-CLASS, always-visible toolbar action

> The branded bulk-QR capability (download ZIP of PNG/SVG QRs with brand color + center logo)
> is the headline reason a marketer comes here for QR — but today it only appears AFTER the user
> opens Tools ▾ → Bulk edit (it lives in BulkEditBar) and/or selects rows, so a COLD first-timer
> never discovers it. This change promotes it to an always-visible primary action with NO prior
> row-selection and NO mode-switch. Cites two friction lessons we must NOT repeat:
> `control-in-conditional-container-not-discoverable-in-cold-flow` (an action inside a component
> that only renders on a prior user action is NOT discoverable — it must be visible in the cold
> flow) and `added-feature-buried-panel-surfaces-not-function` (on this dense app a new control
> gets visually lost unless it is made deliberately distinct in the primary toolbar). Honors the
> existing layout decisions (panels open BELOW the grid full-width per D3; copy/done confirms in
> place per D5; no silent dead buttons per D7; SSR-safe per Flow 4). Same SSENSE/austere visual
> language as the rest of the app — no new look.

**C1 — Always-visible "QR codes" button in the grid-primary toolbar group.** Add a single
**"⊞ QR codes"** button to the LEFT grid-primary group of the slim toolbar, immediately after
**Auto-fix** (and before the Data divider) — NOT inside Tools ▾, NOT inside BulkEditBar. It is
present on the cold first paint with empty localStorage, with no row selected and no menu opened.
Per P3-B the grid stays the hero, so this button is a low-contrast GHOST/outline control in the
app's teal QR accent (thin border, no fill) — distinct enough to be findable at a glance, quieter
than the filled "+ Add row" accent. It does NOT add an above-grid banner and does NOT push the
grid down (one extra button in the existing single toolbar row).

**C2 — Clicking it opens the bulk-QR experience, defaulting to ALL rows.** The button opens a
full-width **"QR codes" panel** stacked BELOW the toolbar (per D3, never a sidebar; only one
launcher panel open at a time). Default scope is **ALL current rows**; if rows happen to be
selected, the panel narrows to the selected set (shows the same "Apply to: all N rows / N selected
rows" scope pill as the other bulk ops). The panel contains, top→bottom:
1. **The primary action** — the **"Download QR codes (ZIP)"** button (teal accent), with the scope
   pill beside it and the in-place green result line "N QR codes generated, M skipped — incomplete
   or invalid URL" (D5). This is the existing BulkEditBar QR block, surfaced here directly.
2. **The full QR branding controls** — the existing `QrBrandingPanel` (Output size + PNG/SVG,
   Foreground/Background pickers + live preview tile + amber scannability guard, optional center-
   logo upload/thumbnail/remove). So a cold user reaches download ZIP + format + color + logo in
   ONE click of one always-visible button. The amber low-contrast warning disables BOTH the ZIP
   download and per-row downloads with the actionable hint (Q4), never a silent dead button.

**C3 — Empty / disabled state (D7, never a silent no-op).** When the grid has no row with a valid
generated URL, the "Download QR codes (ZIP)" button inside the panel renders DISABLED with the
hint **"Add at least one complete link first"** (and the same hint on the toolbar button's title).
The panel still OPENS and the branding controls + live preview tile still render (preview shows the
example URL), so it is never a blank box — the user sees what branded output will look like and what
to do to enable the batch.

**C4 — Coexistence (additive, no regression).** (a) The existing **per-row ⊞ QR** affordance
(QrPopover / mobile card panel: preview + Copy + Download PNG/SVG, reflecting current branding) is
UNCHANGED. (b) The existing **Tools ▾ → QR Branding** and **Tools ▾ → Download QR codes** entries
keep working (they may simply open this same panel) — no path is removed; the new toolbar button is
an ADDITIONAL, more discoverable entry to the same experience. (c) BulkEditBar's QR block stays
functional for users already in the Bulk-edit panel. The same `QrBranding` state and selection model
drive all surfaces, so branding set in one place shows everywhere.

**C5 — 5-second legibility (the goal-met test).** On a cold load of `/` at 1280px with empty
localStorage and no rows selected, the **"⊞ QR codes"** button is visible in the primary toolbar
without opening any menu or selecting any row; clicking it reveals branded bulk-QR (download ZIP +
color + logo controls) below the toolbar. At 375px the button sits in the wrapped toolbar and its
panel stacks full-width below the grid with ≥44px targets, no horizontal scroll, no sticky/overlay
occlusion.
