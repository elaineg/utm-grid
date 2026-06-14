# UTM Grid — UX Brief (Round 2 deltas)

Existing deployed app. Clarity scored unanimous Yes — do NOT touch headline, subhead, or
lint toggles. Stay one screen, no new pages. Each item below is a delta tied to a synthesis
cause (A–F).

1. **Problem statement** — "Tag all your campaign links with clean, consistent UTM tags at
   once — so one stray capital letter never splits your data in Google Analytics."

2. **Primary user action** — Fill a row (or import), then copy clean tagged URLs. The grid
   opens pre-filled with one worked example row showing a live generated URL.

3. **Emotional tone** — Fast and businesslike, spreadsheet-confident. Crisp sans (Inter),
   cool neutral grays with one accent for actions, tight cell spacing. Warnings amber not
   alarming red; fixes feel like one satisfying tap.

## Design decisions (deltas)

**A — Lint must FIX, not just warn (the blocker, 8/10).** Every linted cell shows an inline
**Fix** affordance: hovering/focusing a flagged cell reveals a small "Fix" link in the
warning tooltip that, on click, rewrites THAT source cell to convention (lowercase, spaces/
separators normalized per active rules) — the cell value visibly changes, briefly flashing
green. A global **"Clean all"** button sits in the top toolbar next to Export. Clicking it
rewrites every flagged source cell at once, flashes each changed cell green, and shows a
toast "Cleaned 7 cells." Because source cells change, URL + CSV now carry clean values.
Clean all is undoable via the same Undo as row-delete (E). Never silent — always visible
cell change + count.

**B — Seeded presets, one-click apply, save confirm.** Ship four built-in presets in a
"Presets" dropdown: Email, Paid Social – LinkedIn, Google / CPC, Organic Social. Clicking
one applies its utm_source/utm_medium to the currently selected row (or the focused/last
row if none selected) and flashes the filled cells green. Saving a custom preset shows a
toast "Saved preset 'X'." Fix the apply-to-row path so a saved preset reliably populates a
new row.

**C — Mobile (~375px).** Grid scrolls horizontally inside its own container (page doesn't
scroll sideways). The generated-URL column and its per-row **Copy** button are sticky to the
right edge so the primary path — fill a row, copy URL — is always reachable without
horizontal scrolling to find Copy. Toolbar actions (Clean all, Add row, Export) collapse
into a top action bar usable by thumb.

**D — Import safety.** Base-URL automap matches headers `url`, `landing_url`, `link`,
`destination`, `base_url` (case-insensitive). The import mapping step shows an
**Append / Replace** choice (default Append) before committing; either way the import is a
single Undo step, so it never silently destroys the grid.

**E — Lint de-noise + safe Del.** Multiple warnings in one cell collapse to a single amber
warning icon; hover/tap expands the full list (and the Fix link). Row **Del** asks inline
confirm OR commits immediately with a 5-second "Row deleted — Undo" toast (shared Undo).

**F — Trust note.** One quiet line under the grid: "Generated URLs are trimmed of trailing
spaces; your source cells are left as typed."

## 5-second check (unchanged above the fold)
- **Headline:** the problem statement above.
- **Subtitle:** "Edit links in a grid, fix naming automatically, export clean CSV — no
  account."
- **Primary action:** the pre-filled example row with a live generated URL and Copy button;
  Clean all + Presets visible in the toolbar.
- **Pre-filled example:** one row showing a clean source → URL, plus optionally one flagged
  cell with a visible Fix link so the headline value is demonstrated, not described.

## Round 3 delta — Copy share link

Turns a single-user batch into a team handoff: send a link, not a CSV. Encodes the whole grid
(rows + utm_* fields + active lint toggles) into the URL hash, compressed, 100% client-side.

**1. Button placement + states.** A **"Copy share link"** button sits in the top toolbar
between **Export** and **Clean all**, same button styling as its neighbors (secondary, not the
accent). Idle label: "Copy share link". On click: button text swaps to **"Link copied!"**, the
button fills solid green and shows a small check, and an inline persistent label stays for
**~1.8s** before reverting — peripherally unmissable for someone who clicked and looked away (no
brief flash, no tiny distant toast). The copied-state timer MUST be ref-stable so it survives the
grid's re-renders, and the cue is backed by `aria-live="polite"`. Clipboard write MUST use an
execCommand/textarea fallback if `navigator.clipboard` rejects, so the green "Link copied!" still
fires in blocked-clipboard contexts.

**2. "Loaded shared grid" banner.** When a URL with a share fragment opens, the grid rehydrates
to exactly that state and a banner appears directly **above the grid** (in normal flow, pushing
the grid down — never an overlay/modal, never blocking a cell): cool-neutral background, left text
**"Loaded shared grid (N links)"**, a quiet "These are someone's links — edit any cell to make
them yours" sub-line, and an **×** dismiss on the right. The banner does NOT overwrite the
visitor's own saved localStorage until they edit a cell; dismissing it (or editing) clears it.
`aria-live="polite"` so it's announced.

**3. Privacy reassurance.** A quiet single line directly under/beside the button (and echoed in
the banner): **"Shareable link is built in your browser — nothing is sent to any server."** This
earns trust before the user pastes a link into a teammate's chat.

**4. Mobile (~375px).** "Copy share link" joins the collapsed top action bar with Clean all / Add
row / Export, full-label, thumb-reachable. On copy, the same green "Link copied!" fill on the
button itself (not a corner toast that scrolls off). The loaded-grid banner spans full width above
the grid container and stays in flow.

## Round 4 delta — Campaigns library (personal-accumulation layer)

A named, client-side library: save the WHOLE current grid (all rows + active lint toggles) under a
name and return to it weekly. Directly answers Sam's R3 note (c) — the share link was a frozen
snapshot with "no named 'this batch' to re-share in place"; named campaigns give the re-shareable
home. Keep the cold-open grid the hero — a visitor with zero saved campaigns must still understand
the app in 5 seconds. Stay one screen, no new pages. Do NOT touch the grid layout, headline, or
toolbar order from R1–R3.

**1. Where it lives (accumulation home, not a bolted-on box).** A **right-hand sidebar** on desktop
(~260px), pinned alongside the grid, NOT above it — the grid keeps its full-width hero position and
stays above the fold. Sidebar header: **"Campaigns"** with the **"+ Save as campaign"** button as
its top action. Below it, the saved list. On mobile/narrow (<900px) the sidebar collapses to a
single **"Campaigns (N)"** disclosure bar directly UNDER the toolbar and ABOVE the grid, collapsed
by default so it never pushes the grid down on cold open; tapping expands the list inline. The
existing channel-Presets dropdown stays in the toolbar where it is — campaigns are grid-level
saves, presets are field-level fills; do not merge them.

**2. Empty state (zero campaigns).** The list area shows one quiet line, no nag, no empty box
outline: **"No saved campaigns yet — build a grid, then 'Save as campaign' to reuse it next week."**
The "+ Save as campaign" button stays enabled above it so the invitation is the action itself.

**3. Labels, placement, the naming affordance.**
- **"+ Save as campaign"** — sidebar header (primary/accent), always visible. Click reveals an
  **inline name field** in the sidebar (not a modal) with placeholder **"Name this campaign"**,
  pre-focused, plus **Save** / **Cancel**. Enter saves, Esc cancels. Saving an unnamed grid is the
  only entry point — there is no separate dialog.
- Each saved row: clicking the **name** (or an explicit **Open**) loads it. Hover/tap reveals a
  compact action cluster on the row: **Open**, **Duplicate**, **Delete** (icon + label on desktop;
  icon row on mobile). Duplicate creates **"<name> copy"**. Keep verbs exactly: Open / Duplicate /
  Delete.

**4. Saved-row layout (compact).** One line per campaign: **name** (bold, truncates with ellipsis) on
the left; a small muted right-aligned meta line **"12 links · saved 2d ago"** (relative time:
"just now", "3h ago", "2d ago", then a date). Currently-open campaign row gets a left accent bar +
subtle tint so it reads as the active one. No thumbnails, no nesting.

**5. Open-campaign indicator + unsaved-changes signal.** A small status pill in the toolbar (left of
"Copy share link") shows the working-grid's identity:
- Saved & clean: **"In: Black Friday"** (neutral).
- Edited since open/save: **"In: Black Friday · unsaved changes"** with an amber dot, and the
  sidebar's matching row shows the same amber dot. **"+ Save as campaign"** header button relabels
  to **"Save changes"** when a clean-or-dirty campaign is open (saving updates it in place); a
  caret/secondary **"Save as new…"** stays available.
- Scratch grid (nothing open): pill reads **"Unsaved grid"** (neutral) — never alarming; the cold
  visitor sees this and it implies "you can save this."

**6. The two confirm moments — both native `confirm()` (reliable, unmissable, no custom-modal
focus traps), exact copy:**
- **Replace unsaved working grid** (firing on Open-a-campaign OR opening a share link, only when the
  working grid has unsaved edits): `"Open \"Black Friday\"? Your current unsaved grid (8 links) will be replaced. This can't be undone."` — OK loads, Cancel leaves the grid untouched. Names the
  target AND the count being lost so a hurried marketer knows exactly what they're trading.
- **Overwrite existing name** (Save-as-campaign under a name that already exists): `"A campaign named \"Black Friday\" already exists. Replace it with the current grid (8 links)?"` — OK updates in
  place (single entry, new count + time), Cancel returns to the name field.
- Delete keeps its own: `"Delete campaign \"Black Friday\"? This can't be undone."`

**7. Save/update confirmation — peripherally unmissable (heed copy-confirmation friction).** On a
successful Save/Save-changes, do NOT rely on a 1-second toast: the new/updated row **flashes green
and the open-indicator pill flips to "In: Black Friday" (green for ~2s, ref-stable timer that
survives re-render), with `aria-live="polite"`**. The amber "unsaved changes" dot clearing IS the
durable confirmation — it persists, so a user who looked away still sees the saved state on return.

**8. Privacy / no-cloud consistency.** Nothing here implies sync. One quiet line under the sidebar
header: **"Saved on this device."** Do not say "synced", "account", or "cloud". A campaign is local
to this browser, same prop as the rest of the app.

## 5-second check (still unchanged above the fold)
Cold visitor sees the same hero: headline, subtitle, the pre-filled example grid row with a live
generated URL + Copy. The Campaigns sidebar is present but quiet (empty-state one-liner on desktop,
collapsed bar on mobile) — it never displaces the grid or competes for the first read.

## Round 4 panel fixes (run 20260613-095144-daily)

Targeted affordance/label/copy fixes only — keep the zero-network privacy prop, the cold-open
grid-hero, and the R1–R3 grid/toolbar layout. Ceiling 9/10; Elena is the lone structural
non-pass. Each item ties to a synthesis cause (A–G).

**Fix A — Duplicate/Delete disambiguation (P0, biggest lever; A).** The collision is two
different scopes sharing the verbs "Dup/Del". Resolve by scope-naming, never bare verbs:
- **Grid-ROW buttons** become icon-only with explicit row scope: a copy-rows icon + tooltip
  **"Duplicate row"** and a trash icon + tooltip **"Delete row"**. They never read "Dup"/"Del"
  again. Place them inside a fixed-width row actions column (see Fix F).
- **Campaign-CARD actions** keep full word verbs that name the object: **"Open"**,
  **"Duplicate campaign"**, **"Delete campaign"**, rendered INSIDE the card's bounds, visually
  attached to that card's name row (indented under/aligned to the name, on the card's tint),
  so "Duplicate" unmistakably belongs to the card it sits on.
- Campaign **Duplicate campaign** is exactly ONE click: it immediately creates a new library
  card named **"<name> copy"**, increments the header count (e.g. 2→3), flashes the new card
  green for ~2s. It must NOT load an unsaved draft, must NOT require a "Save as new" step.

**Fix B — "Clean all" label + safety (P0; B).** Builder confirms the real action. Per R2 brief
"Clean all" only rewrites flagged cells (lint auto-fix), is non-destructive, and is Undo-able —
so it is NOT a grid wipe. Relabel to **"Auto-fix naming"** (tooltip: "Lowercase + normalize all
flagged cells"). No native confirm needed for the lint-fix action (it's Undo-backed). Result
copy: on changes **"Auto-fixed 7 cells — Undo"** (persistent ~5s, Undo inline); when nothing was
flagged **"Nothing to fix — all cells are clean."** If the builder discovers it actually clears
grid data, then keep destructive behavior gated behind a native `confirm()`: `"Clear all 8 links
from the grid? This can't be undone."` — but the expected outcome is the rename above with no
confirm.

**Fix C — Campaign-card actions always discoverable (P1; C).** Remove hover/tap-gating entirely.
On touch/narrow viewports (<900px) Open / Duplicate / Delete are ALWAYS visible as a persistent
icon row under each card name — no reveal, no flicker, identical on first vs. existing cards. On
desktop, surface a persistent **"⋯"** overflow affordance on every card (always rendered, not
hover-gated) that opens the Open / Duplicate campaign / Delete campaign menu; hover may raise
contrast but must never be the only way to learn the actions exist. A first-time mobile user must
see actions exist without tapping.

**Fix D — Overwrite confirm on "Save as new…" collision (P1; D).** Already specified in R4 §6
(native `confirm()` "A campaign named … already exists. Replace it…?"). Reaffirm: this confirm
MUST fire on the Save-as-new path too — no silent merge, no silent second entry. Cancel returns
to the name field.

**Fix E — Persist active-campaign pointer across reload (P1/P2; E).** The open-campaign pill
("In: <name>") must survive reload, matching the grid that already persists (builder persists
openCampaignId in localStorage and rehydrates the pill + the sidebar's active-row accent). It
reverts to "Unsaved grid" only when nothing is open, never merely because the page reloaded.

**Fix F — Row actions must not overlap the Generated URL cell (P1, CSS; F).** Row Copy /
duplicate-row / delete-row icons live in a fixed-width actions column to the RIGHT of the
Generated URL cell; the URL cell truncates with ellipsis (full value on hover/title) so buttons
never render on top of URL text at ANY URL length. Per-row Copy stays reachable (sticky right on
mobile per R2 §C).

**Fix G — Preset Apply without a selected row (P1; G).** Clicking a preset chip must never be a
no-op. If a row is selected, apply to it (flash green, per R2 §B). If NO row is selected, apply to
the focused/last row, or if the grid is empty create a new row and apply — a click always produces
a visible fill. Show a one-line hint beside the Presets control: **"Applies to the selected row
(or adds a new one)."** so the behavior is legible before the first click.

## Round 6 delta — Bulk edit (row/column power-tool)

ONE new capability: set or find-and-replace a UTM column across many rows in one move, so a
weekly 20–50 link batch sharing utm_campaign/source/medium is tagged once, not per-row. Fully
client-side, instant, persisted to localStorage, lint re-runs immediately. Additive only — do NOT
touch the headline, toolbar order, grid layout, Presets, Campaigns sidebar, or share button. Keep
the cold-open grid the hero; the bulk surface is a quiet power-tool, never a mode.

**1. Row selection.** Add a narrow leftmost **checkbox column** to the grid (left of the row data,
not overlapping the right-side row-actions column from Fix F). Each row gets a checkbox; the grid
**header row gets a "select all" checkbox** that selects/clears every row (indeterminate state when
some are selected). Selection is purely transient (drives bulk scope) — it is NOT persisted and has
no per-row action of its own, so it never reads as another row control.

**2. Bulk-edit bar — one labeled surface, distinct verbs (VERB-COLLISION guard — biggest lever).**
A single horizontal **"Bulk edit"** bar sits directly **above the grid header, below the top
toolbar** (in flow, full width, cool-neutral tinted strip so it reads as part of the grid, not the
toolbar). It is collapsed/quiet but always present — labeled **"Bulk edit"** on the left so its
purpose is legible in 5 seconds. The bar's verbs MUST be distinct from every existing control:
- Per-row controls are icon-only **"Duplicate row" / "Delete row"** + per-cell **Copy** (Fix A/F).
- Bulk controls use the verbs **"Set column"** and **"Find & replace in column"** — never "Dup",
  "Del", "Copy", "Clean", or a bare "Replace". The word **"column"** in both labels makes the scope
  (a whole field across rows) unmistakable and stops a hurried tester reading them as row actions.
The bar contains, left to right: the **"Bulk edit"** label · a **column picker** (dropdown:
utm_source / utm_medium / utm_campaign / utm_term / utm_content, default utm_campaign) · for **Set
column**: one value input + a **"Set column"** button · for **Find & replace in column**: a
**Find** input + a **Replace** input + a **"Find & replace in column"** button. Group the two
operations visually (a thin divider between them) so each button clearly owns its inputs.

**3. Targeting model — state the scope, never let it surprise (unambiguous-at-a-glance guard).**
The bar shows a live **"Apply to:"** indicator that updates with selection:
- No rows selected → **"Apply to: all 5 rows"** (neutral).
- Some selected → **"Apply to: 2 selected rows"** (accent-tinted to match the row checkboxes).
The two action buttons' tooltips echo the same scope. This makes "selected → only those; none
selected → all rows" obvious before the click — the user is never surprised about what changed.

**4. What the actions do (instant, visible, lint-aware).**
- **Set column** writes the entered value into the chosen column on every targeted row. An **empty
  value clears** that field across them (state the affordance inline: a quiet hint "Empty value
  clears the column."). Changed cells **flash green** (same cue as Auto-fix/preset apply).
- **Find & replace in column** replaces the find string (substring match) with the replace string in
  the chosen column on every targeted row; changed cells flash green. A no-match run shows a quiet
  inline **"No matches in utm_campaign."** (never a silent no-op).
- Both run **synchronously, persist to localStorage** like every grid edit, **trigger zero network
  requests**, and **re-run lint immediately** so cross-row consistency + case/space warnings update
  on the affected cells in the same tick. Both fold into the existing **Undo** (shared with
  row-delete / Auto-fix) — a single Undo reverts the whole bulk change. Result copy mirrors Auto-fix:
  **"Set utm_campaign on 5 rows — Undo"** / **"Replaced in 2 rows — Undo"** (persistent ~5s).

**5. Don't crowd the existing UI.** On desktop the Bulk-edit bar is one slim row; inputs are compact.
On mobile/narrow (<900px) it collapses into a **"Bulk edit"** disclosure directly under the top
action bar (collapsed by default so it never pushes the grid down on cold open); expanded, the
picker + inputs + two buttons stack full-width and thumb-reachable. It must not regress the grid,
lint, CSV, Campaigns sidebar, or share button.

## 5-second check (still unchanged above the fold)
Cold visitor still sees the hero: headline, subtitle, the pre-filled example grid row with a live
generated URL + Copy. The **Bulk edit** bar is present and labeled (so its power-tool purpose is
instantly legible) but quiet — it never displaces the grid or competes for the first read.

## Mobile card view (≤640px) — added 2026-06-13

ONE new capability: at ≤640px each grid ROW renders as a vertical CARD instead of a table row;
at ≥640px the desktop spreadsheet table is **unchanged**. This SUPERSEDES the old R2 §C mobile
approach (sticky horizontally-scrolling table with a pinned URL/Copy column) — that pinned
column is the ROOT CAUSE of this app's two recurring occlusion bugs (it overlapped the bulk
checkboxes, then the off-spec "Fix to <value>" link). The card view has no sticky column and
no horizontal scroll, so it removes the bug class rather than patching its z-index again.

**1. Card anatomy (one row → one card).** Each card is a bordered, generously-padded block
(≥16px padding, ≥12px gap between cards) in this top-to-bottom order:
- **Top bar:** the row **select checkbox** (≥44px, with a "Select this link" label) on the
  left, and the row-scope icons **Duplicate row** / **Delete row** (each ≥44px, icon+label,
  the Fix A scope-named tooltips) on the right. These are the only row controls here — no
  sticky/pinned anything.
- **Stacked fields:** Base URL, then utm_source / utm_medium / utm_campaign / utm_term /
  utm_content, each as a **label ABOVE its full-width input** (label small/muted, input
  full card width, ≥44px tall). No field requires horizontal scroll to reach.
- **Inline lint under each field:** the cell's collapsed warning pill (amber case/space,
  violet off-spec, cross-row color — all three still tellable apart) renders **directly
  under that field's input**, in normal flow, pushing content down — never an overlay. The
  off-spec **"Fix to <value>"** violet chip auto-reveals inline under its field (≥44px),
  same as desktop; it sits in card flow so nothing can occlude it.
- **Generated URL block:** full-width, label "Generated URL" above a wrapping/selectable
  value (no ellipsis-truncation needed — full width is available), with a full-width
  **Copy** button (≥44px) directly beneath it. The fill-a-row → copy path is one vertical
  read, no sideways scroll to find Copy.

**2. PURE CSS breakpoints — no JS viewport detection (hard requirement, two bug classes).**
The table and the card list are BOTH always in the DOM; visibility is Tailwind only —
table is `hidden sm:block` (or `sm:table`), card list is `sm:hidden`. There is NO
`useEffect`/`window.innerWidth`/matchMedia/`useMediaQuery` swap — that would cause an
SSR/hydration mismatch and re-introduce a sticky-overlay-on-a-tap-target regression.
GOTCHA (dual-mount strict-mode collision has bitten this app): any `data-testid` shared by
the table and card renderings of the same control MUST be breakpoint-suffixed
(e.g. `copy-url-row-3-card` vs `copy-url-row-3-table`) OR the test scoped to one breakpoint —
two elements with the same testid mounted at once is a strict-mode/`getByTestId` collision.
Both layouts read the SAME row state, so editing a card and resizing to desktop shows the
edit (and vice-versa) with zero state loss.

**3. Reads as a deliberate phone app, not a squished table.** The card list must look
designed for the phone on first glance. The toolbar/panels stack sensibly and stay reachable:
the top action bar (Auto-fix naming, Add row, Export, Import, Copy share link) wraps to
full-label thumb-sized buttons; the **Bulk edit**, **Campaigns**, and **UTM Spec** surfaces
stay as the existing collapsed disclosures under the toolbar (collapsed by default so they
never push the card list down on cold open), expanding to full-width stacked controls. The
lint-rule toggles (incl. the one canonical Enforce UTM Spec) stay reachable above the cards.
Nothing horizontally scrolls; spacing is generous (cards breathe) so it reads polished, not
dense.

**4. Shared-link landing on a phone (the viral loop's landing).** A teammate opening a
"Copy share link" URL at 375px rehydrates into THIS card view. The **"Loaded shared grid
(N links)"** banner renders full-width, in flow, directly above the card list (never an
overlay/modal over a card), with its "edit any cell to make them yours" sub-line and (when
the share carried a spec) the "… including this team's UTM Spec" clause, `aria-live="polite"`.
Each shared row's fields are immediately legible as stacked cards with no horizontal scroll —
the teammate's first impression is a clean, readable phone view, not a sideways-scrolling
grid.

**5-second check (mobile, ≤640px).** Headline + subtitle + the pre-filled example as the
FIRST card (label-over-input fields with a live Generated URL + Copy button visible without
scroll). The card view IS the hero on a phone; disclosures stay collapsed and quiet.

## Round 2 fixes — Bulk edit (panel round 1: 2/10 pass; ceiling = 2 recurring causes)

Additive, client-side only. The zero-network privacy prop, cold-open grid-hero, headline, toolbar
order, and R1–R5 layout must NOT regress. Each fix maps to a synthesis cause and the testers behind
it. Scope is exactly these six — no more.

**Fix 1 — Mobile overlap bug (P0; Cause 1: Sam t10, Jules t6).** On narrow/375px viewports the
sticky Generated-URL/Actions column (and sticky header) currently render ON TOP of the leftmost
row-select checkboxes, the header "select all" checkbox, AND the expanded Bulk-edit "Find & replace
in column" button — a real tap hits the URL cell (elementFromPoint), so subset selection and F&R are
both un-tappable on a phone. Fix the stacking/layout so **every** selection checkbox and **every**
bulk control is fully tappable on mobile and never covered by the pinned column (raise the
selection/bulk surface z-index above the pinned column, and/or reserve clear space so the pinned
column can't overlap them). Verify on 375px: tap select-all, tap a single row checkbox, tap
"Find & replace in column" — each lands on its own control.

**Fix 2 — Find & replace feedback + matching (P0/P1; Cause 2: Rob t8, Marcus t2, Wen t3, Priya t1,
Tomás t4, + validator P3).** (a) ALWAYS show a result message, never a silent no-op: on success
**"Replaced in N rows"**, on zero matches **"No matches in <column>"**, and for an empty Find string
a clear **"Enter a value to find"** hint. (b) Add a **"Match case" toggle defaulting to OFF**
(case-insensitive) so `Spring-Sale` and `spring_sale` collapse in one pass instead of two. (c) Lint
must keep re-running immediately after a replace (it already does) so the result reflects current
warnings. Keep the result copy consistent with the Undo toast ("Replaced in 2 rows — Undo").

**Fix 3 — Clear vs Set wording (P2; Cause 3: Aisha t7).** When the Set-column value is empty, the
result toast must read **"Cleared <column> on N rows"**, not "Set <column> on N rows". A clear is not
a set; the copy must say so.

**Fix 4 — Scope-pill emphasis (P2; Cause 4: Aisha t7).** When scope is narrowed to selected rows,
the "Apply to: K selected rows" pill must visibly change color/weight (e.g. neutral → accent fill +
heavier weight) versus the all-rows default, so the targeting state is unmissable before Apply — not
just a text diff a hurried user could overlook.

**Fix 5 — Base URL as a bulk column (P2; Cause 5: Rob t8).** Add **Base URL** to the bulk-edit
column picker so Set column / Find & replace operate on the base URL too, not only utm_* fields —
filling one shared landing page across a batch in one move. Purely additive to the picker; all other
bulk behavior unchanged.

**Fix 6 — Keyboard reachability (P2; Cause 6: Priya t1).** The Bulk-edit toolbar controls (column
picker, value input, "Set column", Find/Replace inputs, "Find & replace in column", Match-case
toggle) must be reachable and operable by keyboard: sensible tab order, and Enter from a text input
triggers the adjacent action button.

**Explicitly OUT OF SCOPE this round (do NOT build):**
- **Cross-device / team sync** (Elena t9, value No, adv 5) — needs accounts + a server, blocked on a
  missing credential, and would regress the zero-network privacy prop. Elena is the accepted
  structural out-of-ICP holdout; the panel ceiling for this round is 9/10, not 10/10.
- **Multi-field "set source+medium+campaign in one action"** (Dana t5) — bigger feature, deferred.
  NOTE: Dana's other ask, an Undo after bulk ops, ALREADY EXISTS — just ensure the **Undo affordance
  after a bulk op stays unmissable** (no new build, confirm it isn't weakened by the above changes).
- Tomás's Excel-paste fill-down and Sam's "Bulk hidden behind Expand" discoverability — noted, not
  this round.

All six changes are additive and client-side; the zero-network prop must not regress.

## UTM Spec (added 2026-06-13)

ONE new capability: a governed allowed-value dictionary. The user defines, per UTM field, the
org's canonical taxonomy; the grid then autocompletes to it and flags off-spec values with a
one-click fix. Additive only — do NOT touch the headline, subtitle, toolbar order, grid layout,
Presets, Campaigns sidebar, Bulk-edit bar, or share button. The cold-open grid stays the hero.

**1. Where the UTM Spec panel lives.** Mirror the Campaigns sidebar pattern, do NOT add a page.
The UTM Spec is a **disclosure panel in the right-hand sidebar, directly under the Campaigns
section** (header **"UTM Spec"**, collapsed by default so it never displaces the grid on cold
open). On mobile/narrow (<900px) it is a **"UTM Spec"** disclosure bar under the Campaigns
disclosure, collapsed by default. Quiet sub-line under the header: **"Your team's allowed values
— enforced on every cell. Saved on this device."** (no "sync/account/cloud" — same prop).

**2. Editing per-field allowed-value lists.** Expanded, the panel shows the **five UTM fields as
labeled rows** (utm_source / utm_medium / utm_campaign / utm_term / utm_content). Each row holds
its allowed values as **removable chips** (each chip has an × to remove) plus one **"+ add value"**
input (Enter or comma commits a value, flashes the new chip green). A field with zero chips reads
**"any value"** (muted) — no enforcement for it. No modal; all inline like the Campaigns name field.

**3. The "Enforce UTM Spec" toggle.** Place it as a **rule toggle ALONGSIDE the existing
lint-rule toggles** (required-params / lowercase / no-spaces), same control style and group, so a
marketer reads it as one more lint rule. Also surface it at the top of the UTM Spec panel so the
panel's own state is self-evident. Off → no off-spec warnings, no datalist suggestions; on with
zero defined values → still no warnings (nothing to enforce). Persists with the other toggles.

**4. Datalist autocomplete (native, no custom dropdown).** When Enforce is on and a field has
allowed values, that field's cell `<input>` gets a native **`<datalist>`** of those values — the
browser's own suggestion UI, zero custom dropdown, zero new tap-target risk on mobile.

**5. Off-spec warning — ADDITIVE lint, visually distinct, never a competing control.** An off-spec
cell is a lint warning like the others (it folds into the cell's single collapsed amber warning
icon per Fix E), but it gets its **own distinct color: a violet/purple accent** (NOT the amber used
for case/space, NOT the cross-row color) so "this value isn't in your taxonomy" reads as a separate
class of problem at a glance. Expanded message names the nearest allowed value: **"Off-spec —
nearest allowed: twitter"**. CRITICAL (heed same-verb-adjacent-controls-read-as-broken): the fix
affordance is a **"Fix to twitter"** link rendered **inside the warning popover/tooltip**, scoped by
its own naming ("Fix to <value>"), NEVER a bare "Fix" sitting next to the row Duplicate/Delete icons
or the Bulk controls — it must not read as another row/bulk control. Clicking it sets the cell to the
allowed value, flashes the cell green, re-runs lint, clears the warning. It folds into the shared
Undo. (Note: the auto-fix lint "Fix" link from R2-A still exists for case/space; "Fix to <value>" is
the taxonomy variant and names the target value so the two never blur.)

**6. Mobile (~375px) — fix affordance must be tappable, never occluded (heed
mobile-sticky-overlay-occludes-tap-targets).** The off-spec warning popover and its **"Fix to
<value>"** link must render ABOVE the sticky Generated-URL/Actions column and sticky header
(z-index above the pinned column), and must not be covered by them — verify at 375px that tapping
"Fix to <value>" lands on the link, not the URL cell behind it. The popover opens in-flow space that
isn't occluded (open it toward the cell's free side); the link is a full tap-target (≥44px).

**7. Propagation (no new UX surface, just reassurance).** The UTM Spec rides inside saved campaigns
and the share-link fragment automatically (per spec Flows 3–4). When a share link or campaign with a
non-empty spec loads, the existing "Loaded shared grid" banner gains a quiet sub-clause: **"…
including this team's UTM Spec"** so the visitor knows their cells are now governed. No extra dialog.

**5-second legibility.** The sidebar header **"UTM Spec"** + sub-line **"Your team's allowed values
— enforced on every cell"** tells a cold marketer exactly what this is: the place their team's UTM
taxonomy is defined and enforced. The grid hero, headline, and above-the-fold first read are
unchanged — the panel is quiet and collapsed until opened.

**Risk the builder must heed.** (a) The off-spec violet must be genuinely distinct from the case/
space amber AND the cross-row color — three warning classes must be tellable apart, and all still
collapse into the one cell warning icon (don't stack three icons in a cell). (b) "Fix to <value>"
must never visually neighbor the row Duplicate/Delete or Bulk Set/Replace controls — keep it inside
the warning popover only. (c) At 375px the popover + fix link must clear the sticky URL/Actions
column (the exact occlusion bug fixed for bulk in "Round 2 fixes — Fix 1"); re-verify it here.

## UTM Spec — Round 2 fixes (2026-06-13)

Panel round 1 scored 2/10 fully-passing; concept + trust + value land (value=Yes 10/10), the
gap is pure advocacy from surfacing/craft. These six fixes are interaction/surfacing polish, NOT
a redesign — do NOT touch the headline, subtitle, toolbar order, grid layout, Presets, Campaigns
sidebar, Bulk-edit bar, or share button. Ranked by impact (B, A, C, D, E + bundled cheap wins).

**Fix B — Surface "Fix to <value>" on the cell, one mobile tap, never behind the pill (P0; cause B,
5 testers).** The "Fix to <value>" affordance must be DIRECTLY visible and tappable on the cell when
off-spec is the cell's primary/only warning — no expand-the-pill step. Rules:
- When a cell's ONLY warning (or its highest-priority warning) is off-spec, render the **"Fix to
  <value>"** action inline on/under the cell as a small violet chip-button, auto-revealed — not
  hidden inside a popover, not gated behind tapping the "N warnings" pill.
- When the cell has MULTIPLE warnings (off-spec + case/space), the collapsed violet warning pill
  shows directly and tapping it expands to the list WITH "Fix to <value>" at the top — but the
  primary-off-spec case still shows the inline chip so a one-tap fix never requires an expand.
- Mobile (375px): the inline "Fix to <value>" chip is a ≥44px tap-target, rendered ABOVE the sticky
  URL/Actions column (z-index over the pinned column), positioned so it is NOT occluded and the tap
  lands on the chip, never the URL cell behind it. Verify with elementFromPoint at 375px.
- Same-verb guard still holds: the label is always **"Fix to <value>"** (names the target), violet-
  tinted, and must NOT sit adjacent to row Duplicate/Delete (Fix A/F) or Bulk Set column / Find &
  replace in column — the violet color + "to <value>" wording keeps it unmistakably the taxonomy fix.
- BUNDLED cheap win: "Copy share link" must show a visible **"Link copied!"** confirmation on mobile
  (the button-fill green + label swap from R3 §4 must actually fire at 375px — it currently shows
  none on narrow viewports; do not rely on a corner toast that scrolls off).

**Fix A — Off-spec distinct at the GLANCE layer (P0; cause A, 3 testers).** Carry the violet up from
the popover to the cell itself so a taxonomy violation is tellable from a casing typo on a 50-row
grid without clicking:
- An off-spec cell gets a **VIOLET cell border + violet-tinted background** and a **violet badge/dot**
  — distinct from the amber border/bg used for case/space lint, and distinct from the cross-row
  consistency color. The "N warnings" pill on an off-spec cell is violet (or violet when off-spec is
  among the warnings), never the same amber as a pure case/space cell.
- All three warning classes must stay clearly readable as lint and tellable apart: amber = case/space,
  violet = off-spec taxonomy, cross-row = its existing color. Add a tiny one-line **legend/"enforcing"
  hint** near the lint bar so the green→violet chip jump on toggling Enforce reads as intentional, not
  a state bug (resolves Marcus's chip-jump doubt).

**Fix C — Make the UTM Spec panel discoverable cold (P1; cause C, 4 testers).** Lightest change that
makes a cold user find the governance value:
- **Open the UTM Spec panel by default once it has ANY allowed values** (collapsed only while empty,
  so the cold-open grid stays the hero for a first-time visitor with no spec).
- Add a **top-level "N cells off-spec" indicator** in the lint bar (next to the warning counts) that,
  when Enforce is on and any cell is off-spec, reads e.g. **"3 cells off-spec"** in violet and scrolls
  to / opens the UTM Spec panel on click — this advertises the feature is doing work.
- One-line subhead/hero mention: a quiet line near the lint toggles — **"Enforce your team's UTM
  taxonomy"** — so the differentiator is named in the 5-second skim, not buried below the fold.

**Fix D — One canonical "Enforce UTM Spec" toggle (P1; cause D, 3 testers).** The toggle currently
appears in the lint bar AND inside the panel and reads as two switches. Make it ONE control:
- The **canonical toggle lives in the lint-rule group** (alongside required-params / lowercase /
  no-spaces) where a marketer reads it as one more lint rule. Inside the UTM Spec panel, do NOT render
  a second independent switch — instead show the SAME control (shared state, e.g. a single bound
  component) or a read-only status line **"Enforcement: on — change in lint rules"** that links to the
  one toggle. There must be exactly one switch a user can flip.

**Fix E — Bulk-add allowed values by paste (P2; cause E, drives the floor + the two 9s).** Adding
values one-at-a-time is slow:
- The **"+ add value"** input accepts **comma- AND newline-separated paste**: on commit it splits,
  trims whitespace, drops empties, dedupes against existing chips, and flashes each new chip green.
  Pasting an Excel column (newline-separated) or a "a, b, c" list both work in one action.
- Add a one-line hint under the field selling the payoff: **"Paste a list — define once, reuse every
  week, share it to your team."**

**Risk the builder must heed (Round 2).** (1) Mobile tappability of the new INLINE "Fix to <value>"
chip is the highest-risk item — it must clear the sticky URL/Actions column at 375px (same occlusion
bug class as Bulk Fix 1) and be a ≥44px target; verify the tap lands on the chip via elementFromPoint.
(2) The three warning colors MUST stay distinct AND readable — violet off-spec vs amber case/space vs
cross-row — do not let the new violet cell-tint wash out into the amber or collide with the cross-row
color. (3) The inline "Fix to <value>" chip must still never neighbor row Dup/Delete or Bulk
Set/Replace — keep it on/under its own cell, violet, named to its target value.

## Mobile-card panel Round 1 response (2026-06-13) — the cold-open craft pass

Panel round 1 (10 testers) on the mobile card build: **0/10 hit the 9-bar (all 6–8), value=Yes
10/10**, and the card layout ITSELF tested well (5 testers praised it unprompted). The blockers are
pre-existing craft exposed by the cold open. Two P0 levers (hero, share-landing) + P1 affordance
polish + one P2. Do NOT regress the card view, the ≥640px desktop table, the zero-network privacy
prop, toolbar order, Presets, Campaigns/UTM-Spec panels, or Bulk edit. Pure CSS breakpoints only —
no JS viewport detection. Each item maps to a synthesis cause (C1–C4 + preset quirk).

**P0-1 — Rewrite the hero (C1; the clarity blocker, 6 testers, top lever).** The current hero
("Share one link that enforces your team's UTM taxonomy — stop policing casing and typos that split
your GA4 data") is too long (a 5–6 line wall at 375px that pushes the grid below the fold), uses
jargon ("taxonomy"/"lint"), and mis-pitches ("your team's") so solo marketers and freelancers
bounce. Replace with the SHORT, benefit-first, plain-language copy below; the subhead now carries the
team/enforce detail so the headline doesn't have to. Sizing so it's compact on phones and the first
card is visible/near-visible on first paint at 375px:
- **Headline (verbatim):** `Clean UTM links for your whole campaign — in one grid.`
- **Subhead (verbatim):** `Auto-fix messy casing and typos before they split your Google Analytics. Share one link your teammates can reuse — no login, nothing leaves your browser.`
- **Mobile sizing (≤640px):** headline `text-xl` (≈20px) / `leading-snug`, max two lines on a 375px
  width; subhead `text-sm` muted, max three lines; total hero block ≤ ~120px tall with `pt-3 pb-2`
  so the first example card's top edge sits at/just below the fold on a 375px×667px viewport. No
  hero image, no extra tagline rows.
- **Desktop (≥640px):** headline `text-3xl`/`text-4xl` as today; subhead one line under it. Same
  copy. Keep the quiet zero-network line where it is.
- Word "taxonomy"/"lint" must NOT appear in the hero (keep them only inside the UTM Spec / lint-rule
  controls where they're labels, not pitch).

**P0-2 — Shared-link landing = clean handoff (C2; the viral-loop surface, Sam & Elena gate their 9
here).** When the URL carries a share fragment (`#g=…`), the page must FOREGROUND the loaded grid,
not the marketing homepage. Spec (one paragraph): on a fragment load, **replace/collapse the
marketing hero** (headline + subhead hidden, or rendered as a single muted one-liner below the
banner) and **pin a compact summary banner at the very top** reading **"Loaded shared grid (N
links)"** with the sub-line **"These are someone's links — edit any cell to make them yours"**; when
the shared grid carries a non-empty UTM Spec, append the clause **"· enforces a UTM spec — M
allowed-value rules"** so the recipient knows their cells are governed; then **scroll the first grid
row/card into view** on load so the sent grid is front-and-center. The banner is full-width, in
normal flow (never an overlay/modal over a cell), cool-neutral, with an **×** dismiss; it does not
overwrite the visitor's own saved localStorage until they edit or dismiss; `aria-live="polite"`.
**Desktop (≥640px):** banner spans the grid width above the table, marketing hero collapsed to the
muted one-liner. **Mobile (375px):** banner spans full width directly above the card list, the
collapsed hero one-liner sits below it (or is hidden), and the first shared card is in view without
horizontal scroll — the recipient's first impression is the sent grid, not the generic page.

**P1-1 — Surface the power features (C3; Tomás, Dana, Wen).** (a) Restyle the Bulk-edit **"Set
column"** and **"Find & replace in column"** controls so they unmistakably read as BUTTONS, not
inputs — accent or solid secondary fill, button cursor, clearly distinct from the gray text inputs
beside them (Tomás had to hunt). (b) Make the Bulk-edit bar more discoverable: on mobile the
collapsed disclosure must label its payoff, e.g. **"Bulk edit — set or replace a column across rows"**
(not a bare "Expand"/icon), so the time-saving feature isn't missed (Dana). (c) UTM Spec: keep the
prior fix — open the panel by default once it has any allowed values, surface the **"N cells
off-spec"** lint-bar indicator, and keep the paste-a-list entry visible (Wen). Do NOT over-expand the
dense layout — these are affordance/label changes, the panels stay collapsed on a true cold open.

**P1-2 — Mobile fixes (C4 + Dana clip).** (a) The Bulk-edit **"Apply to: N selected rows"** button
must wrap/fit within the 375px viewport — clips off the right edge today (Dana); let it wrap to a
second line or shrink, never overflow horizontally. (b) **"Copy share link"** and **"Copy all URLs"**
must give the SAME peripherally-unmissable **"Copied!"** cue on mobile that row "Copy URL" already
gives — button-fill green + label swap on the button itself for ~1.8s, ref-stable timer that survives
re-render, `aria-live="polite"`, execCommand/textarea fallback when `navigator.clipboard` rejects
(this is the recurring **copy-confirmation-survives-tick-rerender** lesson; Jules). No corner toast
that scrolls off.

**P2 — Preset rows guide, don't error (Marcus, Sam).** Applying a channel preset (source/medium)
currently leaves required utm_campaign blank, so the row opens with a red "required" error sitting
beside Auto-fix's "Nothing to fix — all cells are clean" (contradictory). If cheap: on a fresh
preset row, render the empty utm_campaign as a **guiding hint** (muted "Add a campaign name" /
placeholder + neutral styling), NOT a red error, until the user has touched the grid — so a preset
feels like a head-start, not a broken state. Keep the true required-field validation for export/URL
generation.

## 5-second check (mobile-card Round 1 — cold open at 375px)
- **Headline:** `Clean UTM links for your whole campaign — in one grid.` (≤2 lines, ~20px).
- **Subtitle:** `Auto-fix messy casing and typos before they split your Google Analytics. Share one link your teammates can reuse — no login, nothing leaves your browser.`
- **Primary action:** the pre-filled example card (label-over-input fields) with a live Generated URL
  + Copy button visible/near-visible on first paint — the hero no longer buries it below the fold.
- **Pre-filled example:** one clean example row as the first card, plus one flagged cell with its
  visible inline Fix so the "auto-fix" value is shown, not just described.
- **Shared-link visitor instead sees:** the "Loaded shared grid (N links)" banner pinned at top
  (+ "enforces a UTM spec — M rules" when present) with the sent card scrolled into view — a clean
  handoff, not the generic homepage.

## Hero + share-handoff panel Round 2 response (2026-06-13) — finish-the-craft pass

Panel R2 = **5/10 at the 9-bar** (Tomás, Dana, Jules, Aisha, Sam all 9), up from 0/10. Clarity 10/10
Yes, value 10/10 Yes — the cap is now craft bugs, not comprehension. Remaining sub-bar: Priya 8,
Marcus 8, Wen 8, Rob 7, Elena 8. These are cheap, high-confidence flips. Additive/CSS/copy only — do
NOT touch the headline, subhead, lint toggles, toolbar order, or the ≤640px card view; keep desktop
≥640px table behavior intact; pure CSS breakpoints, no JS viewport detection.

**P0-1 — Desktop header clipping when the sidebar is open (Marcus 8, Aisha 9; biggest lever).** At
~1280–1440px with the Campaigns/UTM-Spec sidebar open the grid is squeezed: the `utm_campaign` header
clips to "UTM_" and the term/content headers vanish — reads as broken to an engineer instantly. Make
ALL column headers stay legible when the sidebar is open: give the table area a `min-width` and let it
**scroll horizontally inside its own container** (page never scrolls sideways), so headers keep full
labels rather than truncating; the header row must show full `utm_campaign` / `utm_term` / `utm_content`
at every width from 1280→1440px with the sidebar open. (No `text-overflow:ellipsis` on header cells.)

**P0-2 — Dead pseudo-link under LINT RULES (Wen 8; trust trap).** The purple "Enforce your team's UTM
taxonomy" text is link-styled but an inert `<span>`. Make it FUNCTIONAL: clicking it (a) turns ON the
canonical **Enforce UTM Spec** toggle and (b) opens/expands and scrolls to the UTM Spec panel — one
gesture from the named differentiator to the place you configure it. It stays the single canonical
toggle (Fix D); this link drives that one switch, never a second one. (If for any reason it can't be
wired, strip the link affordance so it no longer looks clickable — but prefer making it work.)

**P0-3 — Shared-link spec clause + dirty handoff (Elena 8; the viral-loop landing).**
(a) **Render the spec clause:** the recipient banner must append **"· enforces a UTM spec — N
allowed-value rules"** whenever the shared grid carries **≥1 allowed-value rule** (count the rules,
not the Enforce flag) — it currently never renders even with Enforce on.
(b) **Recipient "Fix all naming":** the shared row reaches the recipient dirty (e.g. `Paid%20Social`,
`Q3%20Launch`). Add a recipient-facing **"Fix all naming"** action in/under the banner that, in ONE
tap, runs Auto-fix on the shared grid's fixable cells (same engine as the toolbar Auto-fix, folds into
Undo, flashes changed cells green, result "Auto-fixed N cells — Undo"). Keep it the recipient's choice
— do NOT silently rewrite on load — but make the fix a single tap so a hurried recipient is never
handed a broken link. Mobile: the banner + "Fix all naming" render full-width, in flow, ≥44px target.

**P1 — Lighten the first screen for the simple case WITHOUT losing discoverability (Rob 7, Priya 8;
echoed by Sam, Wen).** Balance is the point — the same Bulk/Spec/Presets surfacing that Dana, Wen, and
Tomás praised must NOT be buried. The compromise: (a) **Soften body copy toward plain language** —
panel labels/hints drop "team / teammates / taxonomy / lint" framing in favor of plain words
("allowed values", "set a column across rows", "fix naming"); keep "taxonomy"/"lint" only as the
technical control labels where they're accurate, never as body pitch. (b) **Make the four config
sections read as compact, collapsible affordances** (Lint Rules, Presets, Bulk Edit, UTM Spec /
Campaigns): each a one-line labeled disclosure, collapsed by default on cold open so the core grid
stays the prominent hero for someone doing 3 links — but each label still names its payoff so it's
discoverable in the 5-second skim. Do NOT bury the bulk toolbar or UTM Spec that Dana/Wen needed
surfaced; "collapsed-but-labeled-and-one-tap-away" is the balance, not "hidden."

**P2 — Cold share-restore sanity-check (Priya 8; likely harness artifact).** Priya saw a generic home
+ empty grid on one `/#g=` cold load; share e2e is green and Jules/Sam/Elena confirmed restore on
mobile. Builder: sanity-check the cold share-restore path (fragment parse on first paint, before any
localStorage hydration overwrites it) — no rebuild expected, just confirm the path can't no-op.

### 5-second check (unchanged above the fold)
Headline, subhead, lint toggles, and the pre-filled example grid row + Copy stay exactly as shipped.
The config sections read as compact labeled disclosures (collapsed, discoverable), and a shared-link
visitor sees the banner with the now-rendering "enforces a UTM spec — N rules" clause plus a one-tap
"Fix all naming" — a clean, governed handoff.

## Panel Round 3 response (2026-06-13) — fix the viral-loop landing + solo framing

Panel R3 = **7/10 at the 9-bar** (Marcus, Wen, Tomás, Dana, Elena 9; Jules, Aisha carried 9).
Clarity 10/10, Value 10/10 — comprehension is solved; this is craft + one P0 regression on the
share-link landing. Additive / CSS / copy / logic only — do NOT touch the headline, subhead, lint
toggles, toolbar order, ≤640px card view, or ≥640px desktop table; pure CSS breakpoints, no JS
viewport detection. Builder task list, priority order:

**P0-1 — Share fragment takes DISPLAY precedence over existing localStorage (Sam 9→6, Priya; THE
viral-loop landing, top lever).** When the URL has a `#g=` fragment, the page MUST render the SHARED
grid + the **"Loaded shared grid (N links)"** banner (+ the **"· enforces a UTM spec — N allowed-value
rules"** clause when the share carries ≥1 rule + the **"Fix all naming"** button) EVEN IF the visitor
already has a saved working grid in localStorage. Today a pre-populated localStorage grid wins first
paint and SUPPRESSES the shared state + banner — the recipient lands on the generic marketing page.
Precedence rule, explicit: on first paint, if a `#g=` fragment is present, parse it BEFORE localStorage
hydration and display the shared grid + banner; the shared state owns the screen regardless of any
pre-existing saved grid. It must NOT overwrite the visitor's localStorage until they edit a cell
(preserve the existing spec behavior) — show the shared state, persist nothing until first edit.

**P1-1 — Dial down team/taxonomy framing for the solo user (Rob 8).** "Enforce your team's UTM
taxonomy" is still verbatim on the toggle/link; the subhead adds "Share one link your teammates can
reuse." Soften to plain language that doesn't read as enterprise team-governance: the toggle/link
reads **"Enforce allowed values"** (drop "your team's UTM taxonomy"), and reconsider the "teammates"
subhead clause so a solo freelancer doing 3 links isn't pitched at an ops team. Keep it accurate for
team users without alienating solos — plain words, not org-governance pitch.

**P1-2 — Auto-fix must trim leading/trailing whitespace (Rob; credibility bug for a cleaning tool).**
`Instagram ` (trailing space) became `instagram_` (trailing underscore). Auto-fix/clean must **trim
leading/trailing whitespace FIRST, THEN** convert internal spaces to underscores — so a stray trailing
space never becomes a trailing underscore.

**P2 — Cheap correctness wins on a passing tester (Elena).** (a) The "Fix all naming" / Auto-fix toast
must report the ACTUAL count of cells changed — it said "Auto-fixed 1 cell" when it fixed 3. (b) When
the shared grid carries an allowed-value spec, "Fix all naming" should prefer the **SPEC's allowed
value** (e.g. `paid-social` if that's the allowed value) over the generic underscore rule
(`paid_social`) — only if cheap; otherwise note as backlog.

Out of scope (accepted structural ceiling, do NOT build): cross-device / team sync (Wen, Dana) — needs
accounts + server, regresses zero-network prop; panel ceiling is 9/10. Keep desktop table + mobile
cards + collapsed-config-sections intact.

### 5-second check (unchanged above the fold)
Cold visitor: same hero (headline, subhead, pre-filled example row + Copy). Shared-link visitor —
**even one with a saved localStorage grid** — now sees the "Loaded shared grid (N links)" banner with
the "enforces a UTM spec — N rules" clause and one-tap "Fix all naming" on first paint, not the
generic homepage.

## Team Workspace delta (server-persisted, secret-link) — added 2026-06-13

ONE new capability: promote the current grid+spec to a server-saved **Team Workspace** at a secret
`/w/<id>` link where the team edits a shared source-of-truth and edits autosave. This is the feature
that closes the long-standing 9-ceiling complaint ("no real cross-device sync" — Wen, Dana, Elena).
Additive only — do NOT touch the headline, subhead, lint toggles, grid layout, Presets, Campaigns/
UTM-Spec panels, Bulk edit, the one-shot "Copy share link", or the mobile card view. Each item below
designs around this app's OWN repeated panel failures.

**1. Same-verb collision — the two share actions must never read as duplicates (this app's lowest
score before).** The existing one-shot button stays exactly as shipped: **"Copy share link"**, with
its quiet sub-line **"Built in your browser — nothing leaves it. A frozen snapshot of this grid."**
The NEW action is a SEPARATE button, different verb, different placement:
- **Verb:** **"Create shared workspace"** (verb = *create*, not *copy*; object = *workspace*, not
  *link*) — never "share", "copy", or "link" in its label.
- **Placement:** NOT adjacent to "Copy share link" in the toolbar (adjacency is what read as a
  duplicate before). Put it as a distinct, accented **"Create shared workspace"** button one logical
  group apart — its own slim labeled strip directly **below the top toolbar / above the grid** (in
  flow), styled as the accent/primary share action so it out-ranks the secondary snapshot button.
- **One-line disambiguator under it (verbatim):** **"A live workspace your team edits together —
  changes save to a private link and sync across devices. (Different from "Copy share link", which
  sends a frozen snapshot.)"** This single line names the difference in plain words a hurried tester
  reads in one pass: live + synced + cross-device vs frozen snapshot.

**2. Discoverable on first scan, value legible in ~5 seconds (added features ship buried here twice).**
The "Create shared workspace" strip is **always visible in flow above the grid** (not inside a
collapsed disclosure, not in the sidebar) so it is on the first scan of the dense page. Its strip
carries a 4–5 word value tag to its left — **"Live team workspace"** — so even before reading the
sub-line a scanner sees this is a *live* shared thing, distinct from the snapshot link. On mobile it
joins the top action bar as a full-label accent button **"Create shared workspace"** (never an icon,
never collapsed). It must read as the heavier, "real sync" action; "Copy share link" stays the
lighter snapshot.

**3. Create-and-copy confirmation — peripherally unmissable (copy-confirm has failed 3 ways here:
blocked clipboard / live re-render / perceptually invisible).** On click, "Create shared workspace"
POSTs, then navigates to `/w/<id>` AND copies the link. The confirmation must survive the navigation
and re-render: on the `/w/<id>` page that loads, the **"Copy workspace link"** button mounts already
in its **green filled "Workspace link copied!"** state for ~2s (ref-stable timer, `aria-live="polite"`),
then reverts to idle "Copy workspace link". Use the execCommand/textarea clipboard fallback so the
green state fires even when `navigator.clipboard` rejects. Same green-fill-in-place pattern (NOT a
corner toast that scrolls off) on every later click of **"Copy workspace link"**: button text swaps
to **"Workspace link copied!"**, fills solid green with a check, holds ~1.8s. This reuses the proven
copy-confirmation-survives-tick-rerender pattern already shipped for "Copy share link".

**4. "Team Workspace — synced" banner placement — NEVER an overlay at 375px (mobile occlusion bit
this app twice).** The banner sits in **normal document flow, directly above the grid/card list,
pushing content down** — it is NOT `position: fixed`/`sticky` and never overlays a grid cell,
checkbox, row control, or the "Fix to <value>" chip at any width. Full-width, cool-neutral tinted
strip. Left: the label **"Team Workspace — synced"** + the live sync-status text (item 5). Right: the
**"Copy workspace link"** button. At 375px it stacks (label+status on the first line, full-width
"Copy workspace link" button beneath) so nothing is clipped and the first grid card sits fully below
it, untouched and tappable. Verify at 375px with elementFromPoint that no banner pixel covers a
checkbox, per-row control, or Fix chip.

**5. Sync-status pattern — make "saved on the server" believable without realtime (the whole value
prop: a team source-of-truth they trust).** Inside the banner, a single status line to the right of
"Team Workspace — synced" reads one of three states, each with a distinct dot + word so a hurried
human believes their edits persisted:
- **Idle / settled:** green dot + **"All changes saved"** + relative time **"· saved just now / 12s
  ago / 3m ago"** (relative time ticks up so the user sees it's a real persisted timestamp, not a
  fake static label).
- **In-flight (during the debounced ~800ms PUT):** amber dot + **"Saving…"** — shown the moment a
  cell changes, so an edit always produces an immediate "I saw that" signal.
- **Failed (PUT rejects / offline):** red dot + **"Couldn't save — retrying"** with an inline
  **"Retry now"** action; the status must say what to do next, never just "error". On recovery it
  returns to green "All changes saved". `aria-live="polite"` so the state change is announced.
This Saving… → All changes saved (· saved Ns ago) cycle on every edit is what makes the workspace
feel trustworthy without presence/cursors/realtime: the user edits, sees "Saving…", then sees the
timestamp advance, and believes the team's source-of-truth is real.

**6. "Workspace not found" state (bad id).** A bad `/w/<id>` renders a calm full-page state in normal
flow: heading **"Workspace not found"**, sub-line **"This workspace link is invalid or was never
created."**, and a primary button **"Go to the UTM grid builder →"** linking to `/`. Never a crash,
blank page, or raw error. The visitor's local default grid is untouched.

### 5-second check (Team Workspace — added 2026-06-13)
On the main builder, a cold visitor still sees the unchanged hero; the **"Create shared workspace"**
strip ("Live team workspace — a live workspace your team edits together…") is visible above the grid,
clearly distinct from the lighter "Copy share link". On a `/w/<id>` page the first read is the in-flow
**"Team Workspace — synced"** banner with the live **"All changes saved · saved just now"** status and
a **"Copy workspace link"** button — the grid/cards sit fully below it, none occluded at 375px.

## Panel Round 2 fixes (2026-06-13) — mode-aware copy, UTM Spec visibility, disambiguation

**Fix 1 — Mode-aware privacy copy.** All copy referencing "browser / server / localStorage / network"
is now mode-aware:
- **Local / snapshot mode (main page `/`):**
  - Toolbar sub-line: "Shareable link is built in your browser — nothing is sent to any server."
  - Footer: "Everything runs in your browser — no account, no server, no network requests after page
    load. Grid rows, presets, campaigns, and lint toggles are saved in localStorage."
- **Workspace mode (`/w/<id>`):**
  - Toolbar sub-line: "Synced to a private server workspace — anyone with the secret link can view
    and edit. Changes save automatically."
  - Footer: "Generated URLs are trimmed of trailing spaces; your source cells are left as typed.
    Changes are synced to the server workspace automatically — anyone with the secret link can view
    and edit."

**Fix 2 — Permission note on workspace pages.** Below the "Copy workspace link" button on `/w/<id>`
pages, a one-line note appears: **"Anyone with this secret link can edit."** (blue, 10px, right-aligned).

**Fix 3 — Copy confirmation on "Copy share link" and "Copy all URLs".** Already shipped in the
previous build round (green-fill button + "Link copied!" / "Copied!" + aria-live region). Confirmed
present in both buttons.

**Fix 4 — Disambiguate the two share buttons inside a workspace.** On `/w/<id>` pages:
- "Copy workspace link" (banner, right side) = the live synced workspace link.
- "Copy share link" (toolbar) shows a sublabel beneath it: **"Frozen snapshot of the current grid"**
  (shown only in workspace mode, hidden when the copied state is showing).

**Fix 5 — 1280px desktop layout.** Sticky right column offsets corrected: both header and body cells
use `right-[116px]` for Generated URL (matching the actual Actions column width of 116px). Generated
URL column min-width reduced to 240px/220px to reduce cramping at 1280px with sidebar open.

**Fix 6 — UTM Spec visible in workspace mode.** The UTM Spec panel is now shown on `/w/<id>` pages
in both desktop sidebar and mobile disclosure. Header label: **"Shared UTM taxonomy"**. Sub-line:
**"Synced to this workspace — your team's shared allowed values, enforced on every cell."** Mobile
toggle label: **"Shared UTM taxonomy — synced to this workspace"**. Load-sample and Share-spec
buttons are hidden in workspace mode (spec syncs automatically via workspace PUT).

**Fix 7 — Remove duplicate "Enforce allowed values" control.** The redundant `enforce-taxonomy-link`
button (a styled link under the lint bar that duplicated the canonical `enforce-spec-toggle` checkbox)
has been removed. Only the checkbox remains.

## Side-panel behavior at constrained widths — bounded-internal-scroll design (2026-06-13)

At ≤1535px viewport widths (including 1280px laptops), both the Campaigns sidebar and the
"Shared UTM taxonomy" (UTM Spec) panel remain as an **inline right-hand column** (the
existing `min-[900px]:flex w-64` layout). The grid table uses a **bounded-internal-scroll**
approach — the table has comfortable, readable column widths, the inner `overflow-x-auto`
container scrolls horizontally while the PAGE never scrolls sideways:

**Column widths:**
- Base URL: 160px min-width
- utm_source / utm_medium / utm_campaign / utm_term / utm_content: 120px min-width each
- Generated URL: 250px (fixed) — wide enough for Dana to read a typical final URL inline
- Actions (Copy/Dup/Del): 116px (fixed)
- Row checkbox + row number: 32px each

The table's natural width (~1100px+) exceeds the ~960px available area at 1280px+sidebar.
That is expected and intentional — the INNER container (`overflow-x-auto`, bounded as a
flex child of the main layout) scrolls internally. The PAGE (`documentElement`) never
receives horizontal overflow.

**Sticky-pinned columns:**
- Generated URL: `sticky right-[116px]` (exact Actions column width), `z-20`, solid
  `bg-white` background — visible at the container's right edge while UTM columns scroll
- Actions: `sticky right-0`, `z-20`, solid `bg-white` — Copy/Dup/Del always reachable
- Header sticky cells: `z-30` (above body sticky cells)
- Row checkbox body cell: `z-30` (above sticky columns for tappability)
- Header checkbox: `z-20` (in thead, separate stacking layer)

**Why this resolves the Dana vs Marcus/Aisha tension:**
- Dana (edit 30-50 rows, must scan values): readable 120-250px columns mean she can eyeball
  utm values and full generated URLs without clicking into each cell or relying on hover.
  `title` attributes on all UTM inputs provide the full value on hover as a cheap scan aid.
- Marcus + Aisha (no page overflow at 1280px+sidebar): the bounded `overflow-x-auto`
  container prevents page-level horizontal scroll. Copy button is sticky-pinned to the
  container's right edge and always visible/reachable.

**Why not table-fixed / shrink-to-fit:** `table-fixed` with ~960px constraint forced UTM
columns to ~87px (~6-7 chars visible), making Dana unable to scan values inline. The internal
scroll approach removes the width constraint entirely — readable columns, no page overflow.

**Why not overlay drawers:** Overlay drawers would hide the sidebar on narrow screens,
losing the Campaigns/UTM-Spec panels. The bounded-internal-scroll keeps the sidebar visible
and avoids toggling state to show/hide it.

Mobile card view (≤640px) is unchanged — it uses a separate pure-CSS card layout with no
horizontal scroll needed (`sm:hidden` / `hidden sm:block` breakpoint CSS only).

## Workspace History & Attribution (server-persisted `/w/<id>` ONLY) — added 2026-06-13

ONE new capability, on `/w/<id>` pages ONLY: a calm, secondary version **History** plus a one-tap
**"Editing as: [name]"** identity. Builds directly on the Team Workspace banner. Additive only —
ZERO change to the main builder `/`, the cold-open, headline, subhead, lint toggles, grid layout,
Presets, Campaigns/UTM-Spec panels, Bulk edit, "Copy share link", or the mobile card view. Nothing
here may look like or require an account/login. The 5-second read of `/w/<id>` ("a shared, synced
UTM grid") must NOT change — History/attribution stay secondary and out of the way.

**1. "Editing as" control — one tap, never a signup (lives in the synced banner).** Inside the
existing "Team Workspace — synced" banner, a small inline **"Editing as: <name>"** affordance sits
on the banner's first line, left of (or just under) the sync-status text — NOT in the toolbar, NOT a
modal. Default text **"Editing as: Anonymous"** with a quiet pencil/"edit" affordance. Tapping it
turns the name into a small inline text input (pre-focused, placeholder "Your name", ≥44px on
mobile); Enter or blur commits, Esc cancels. The name persists in localStorage (per-device, like a
nickname) so it's remembered on return — it is NOT a login and stores no credential. It must read as
"a label on your edits", never "sign in". Once set, the sync-status line becomes
**"last edited by Alex · 2m ago"** (relative time ticks) alongside the green "All changes saved" dot;
with no name it reads **"last edited by Anonymous · 2m ago"**. The committed name rides into the next
autosave PUT so the server records who made each version.

**2. "History" affordance — calm, secondary, never competes with build-links.** A quiet text/ghost
button labeled **"History"** (with a small clock icon, secondary styling — NOT the accent used for
"Copy workspace link") sits on the banner's right side, left of "Copy workspace link". It is a
disclosure, not always-open: clicking toggles a **History panel that opens in normal document flow,
directly BELOW the banner and ABOVE the grid/cards**, pushing content down — never a fixed/sticky
overlay, never covering a grid cell, checkbox, row control, or "Fix to <value>" chip. Closed by
default on every load so the grid stays the first thing after the banner. A small count on the
button when collapsed (**"History (12)"**) hints depth without opening.

**3. History panel contents — a list, newest first.** Panel header: **"Version history"** + a quiet
sub-line **"Every save is kept. Restoring brings a version back without losing the current one."**
Below it, a scrollable list (max-height ~320px, internal scroll) of saved versions, newest first.
Each row: a left **relative time** (bold-ish — "just now", "2m ago", "3h ago", then a date), the
**editor's display name** muted ("by Alex" / "by Anonymous"), and on the right two secondary actions
— **"Preview"** and **"Restore this version"** (full word verbs; on mobile an icon+label row, ≥44px
each, always visible, never hover-gated). The CURRENT live version gets a left accent bar + subtle
tint + a muted **"current"** tag and NO actions (you can't preview/restore what you're already on).

**4. Empty / single states.** A brand-new workspace with only its creation save shows ONE entry
(the initial version, tagged "current") plus the quiet line **"This is the first version — edits
you save will appear here."** — no empty box, no nag. There is never a truly empty list (creation
is always version 1).

**5. Preview mode — read-only, clearly reversible.** Clicking **"Preview"** on a past version loads
that version's grid into the editor as **READ-ONLY** (inputs disabled/non-editable, lint still
shown) and replaces the banner's sync-status with a distinct, peripherally-unmissable
**preview ribbon** in normal flow at the top of the grid area: amber/cool-neutral tinted strip
reading **"Previewing version from 3h ago (by Alex) — read-only"** with two buttons:
**"Restore this version"** and **"Back to current"** (exit preview, return to the live editable
grid). Preview makes ZERO writes — no PUT fires while previewing, autosave is suspended. The history
list stays open with the previewed row marked. "Back to current" returns to the normal editable
synced state with no data change.

**6. Restore — safe, confirmed, non-destructive (feels reversible because it is).** **"Restore this
version"** (from the list or from preview) fires a native `confirm()` (reliable, unmissable, no
custom-modal focus trap), verbatim: **`Restore the version from 3h ago (by Alex)? It becomes the
current grid for everyone on this link. Your current version is saved in history first, so nothing
is lost.`** — OK restores, Cancel leaves the live grid untouched. On OK: the app first snapshots the
CURRENT live state as a new history entry (so restore is non-destructive — the prior current is
recoverable), THEN writes the restored version as the new current via the normal autosave PUT, then
exits any preview into the editable synced state.

**7. Restore confirmation — peripherally unmissable, survives re-render (heed
copy-confirmation-survives-tick-rerender).** Do NOT rely on a transient toast. On a successful
restore: the banner's sync-status flips to a green **"Restored version from 3h ago · all changes
saved"** state held for ~3s on a ref-stable timer that survives the grid re-render, with
`aria-live="polite"`; the restored grid's changed cells flash green (same cue as Auto-fix/preset);
and the History list shows the new top entry ("just now · by <name> · restored from 3h ago") — that
durable new entry IS the lasting confirmation a user who looked away still sees on return.

**8. Mobile (375px) — stack, never occlude (this exact regression was a prior panel finding).** At
375px the synced banner already stacks (label/status, then "Editing as", then "Copy workspace link"
full-width). The **History** button joins this stack full-label (not an icon-only). The History panel
and the preview ribbon render full-width in normal flow directly below the banner, pushing the card
list down — NEVER a sticky/fixed overlay over a card, checkbox, row control, or "Fix to <value>"
chip. Each list row's "Preview" / "Restore this version" actions are ≥44px and always visible (no
hover reveal). Verify at 375px with elementFromPoint that no History/preview/banner pixel covers a
grid cell, checkbox, per-row control, or Fix chip — and that the first card sits fully below a closed
banner. The "Editing as" inline input is ≥44px and one tap to open.

### 5-second check (`/w/<id>` — unchanged first read)
A stranger landing on `/w/<id>` still instantly sees "a shared, synced UTM grid": the in-flow
**"Team Workspace — synced"** banner with **"All changes saved · saved just now"** and the grid/cards
directly below, none occluded. History is a quiet collapsed **"History"** button in the banner and
**"Editing as: Anonymous"** is a small one-tap label — both secondary, discoverable, never competing
with the primary build-links task and never reading as a login. The main builder `/` is untouched.

## Workspace History & Attribution — Round 2 fixes (panel R1: 1/10 at the 9-bar) — added 2026-06-13

Clarity 10/10 Yes, Value 10/10 Yes — comprehension and value are solved. Nine testers sit at 7–8,
each one fix away from 9. These are surfacing/affordance/trust fixes, NOT a redesign. Do NOT regress:
5-second `/w/<id>` clarity, mobile 375px reachability with NO occlusion of cells/checkboxes/row
controls, copy/confirmation durability across re-render, anonymous-first (no account/login), and zero
change to the cold-open builder `/`. Ranked by testers unblocked.

**P0-1 — Preview cells must READ as locked at a glance (G1, ~4 testers; converts Marcus's only
blocker).** Today Preview blocks edits via `pointer-events`/`opacity` only, so cells still LOOK
typeable and a teammate will "click, type, see nothing, think it's broken." Make the read-only state
unmistakable at the DOM and visual layer, in addition to the existing amber ribbon:
- Every grid `<input>` (and any contenteditable cell) in Preview mode gets the real `disabled`
  attribute (or `readOnly` + `aria-disabled="true"`) — not just a pointer-events wrapper. A real
  disabled input can't be focused or typed into, so the "type, see nothing" failure can't happen.
- Visual treatment that reads as locked WITHOUT a click: cells get a clearly **greyed/muted fill**
  (e.g. `bg-slate-50`/`bg-gray-100`), **muted text**, **no focus ring**, a **`cursor: not-allowed`**
  on hover, and a small **lock glyph** in the cell-block (desktop: a lock icon at the row/grid edge;
  mobile cards: a lock icon by the card header). The whole grid area carries a subtle locked overlay
  tint so the "this is frozen" read is immediate.
- The amber ribbon stays and is reinforced (verbatim): **"Previewing version from 3h ago (by Alex) —
  read-only. Cells are locked."** with **"Restore this version"** + **"Back to current"**. "Back to
  current" re-enables the inputs (drops `disabled`, restores normal styling) and returns to the
  editable synced grid. Lint stays visible (read-only) in preview, as before.
- Mobile (375px): the disabled/greyed/lock treatment applies identically to the stacked card inputs;
  the ribbon renders full-width in flow above the cards, occluding nothing.

**P0-2 — Gentle name nudge so history isn't all "by Anonymous" (G2, 3–4 testers; never blocks).**
When a visitor lands on `/w/<id>` with NO name set in localStorage, surface and pre-focus the
"Editing as" field BEFORE/AT their first edit, calm and non-blocking — anonymous-first stays, editing
is never gated:
- On a no-name load, the banner's "Editing as" affordance renders **already in its open inline-input
  state** (not the collapsed "Editing as: Anonymous" label), **auto-focused**, placeholder **"Your
  name"**, with a one-line hint directly beneath it (verbatim): **"Add your name so teammates see who
  changed what — optional, saved on this device."** It is a quiet inline field on the banner, NEVER a
  modal, NEVER an overlay, and it does NOT steal the grid or block typing into cells.
- Non-blocking guarantee: the visitor can ignore it entirely and edit any cell immediately; clicking a
  grid cell simply moves focus there. If they edit a cell while still unnamed, attribution falls back
  to "Anonymous" exactly as today — no interruption, no confirm, no wall.
- Once a name is entered (Enter/blur commits), it persists in localStorage and the affordance reverts
  to the compact **"Editing as: Alex"** label with its pencil edit; the nudge never fires again on
  this device. The committed name rides into the next autosave PUT.
- Mobile (375px): the open inline input is ≥44px, auto-focused, with the hint wrapping full-width
  beneath it in the stacked banner — it pushes the cards down in flow, occludes nothing, and the
  cards stay immediately tappable.

**P0-3 — Shared UTM taxonomy must visibly belong to (and persist in) the synced workspace (G3,
blocking bug; builder fixes persistence, you own the UI truth).** On `/w/<id>` the "Shared UTM
taxonomy" panel's allowed-value chips are part of the synced workspace and the UI must make
"Synced to this workspace — enforced on every cell" actually trustworthy:
- **Saved-state affordance on every chip change.** When a chip is added/removed, the panel shows the
  SAME sync-status pattern as the grid banner: a small inline status by the panel header reading
  **"Saving…"** (amber dot) the moment a chip changes, flipping to **"Synced · saved just now"**
  (green dot, relative time ticks) once the workspace PUT settles, and **"Couldn't save — Retry now"**
  (red) on failure. This is the affordance that makes "synced to this workspace" believable — the user
  adds a chip, sees Saving… → Synced, and trusts it reached teammates and survives reload.
- **Not buried.** In workspace mode the "Shared UTM taxonomy" panel is **expanded by default whenever
  it has ≥1 allowed value** (collapsed only when empty), so a visitor immediately sees the governed
  taxonomy is live — it does not sit hidden in a collapsed sidebar disclosure when it's actually
  enforcing values. Header sub-line stays **"Synced to this workspace — your team's shared allowed
  values, enforced on every cell."**
- Newly added chips flash green (existing cue) and, on reload, render from the synced workspace record
  (builder's persistence fix) — the UI must reflect that they survived, never showing an empty panel
  after a chip was added.

**P1-1 — Synced grid must visibly show editable source columns, not read copy-only (G4, 2 testers).**
Two testers saw the `/w/` grid collapse to GENERATED URL + ACTIONS, so utm_source/medium/campaign read
as off-screen/hidden and the workspace looked copy-only. Make it obvious on the first screenful that
this is an EDITABLE shared grid:
- **Desktop (≥640px):** the first screenful must show the editable source columns (Base URL,
  utm_source, utm_medium, utm_campaign at minimum) WITHOUT requiring horizontal scroll to discover
  them — the sticky Generated URL + Actions columns must not visually dominate or push the source
  columns off-screen-left. Reduce/cap the sticky-column footprint so the leftmost editable columns are
  the first thing read after the banner; the source-cell inputs render with their normal editable
  styling (clear input affordance, not greyed) so "you can type here" is unmistakable. If horizontal
  scroll exists for later columns, ensure the source columns are the on-screen default, not the
  scrolled-away ones.
- **Mobile (≤640px):** the card view already stacks every source field label-over-input as a full-width
  editable input — confirm the FIRST card's source fields are visible without horizontal scroll and
  read as editable (not greyed/locked), so the synced workspace reads as editable on a phone too.
- Net: a visitor's first read of `/w/<id>` is "a shared grid I can edit," with the source columns
  present and clearly typeable — never "a read-only link."

**P1-2 — Optional workspace name/label (G5, 1 tester, cheap).** Add a small **optional** "Workspace
name" field so a team running multiple client/campaign grids can tell them apart:
- It lives in the synced banner, on the first line left of the sync-status (or just under the
  "Team Workspace — synced" label). Default empty shows a quiet ghost affordance **"Name this
  workspace"** (pencil); clicking turns it into an inline text input (placeholder **"e.g. Q3 Paid
  Campaigns"**, ≥44px on mobile), Enter/blur commits, Esc cancels. NEVER required, never blocks.
- Once set, the name shows IN the banner label as **"Team Workspace: Q3 Paid Campaigns — synced"** and
  rides into the autosave PUT so it persists with the workspace and reaches teammates on the link. It
  also makes a good `<title>` so multiple workspace tabs are tellable apart.
- Mobile (375px): the field/label is part of the stacked banner, full-width, ≥44px, occluding no card.

### 5-second check (`/w/<id>` Round 2 — unchanged first read)
A stranger still instantly reads "a shared, synced UTM grid I can edit": the in-flow synced banner
(now carrying the optional **"Team Workspace: <name> — synced"** label when set, plus the gentle
auto-focused name nudge on a no-name first visit), the **editable source columns visible on the first
screenful** (clearly typeable, not greyed), and the grid/cards directly below — none occluded at
375px. In Preview, every cell READS as locked at a glance (greyed, disabled, lock glyph) under the
amber "read-only — cells are locked" ribbon. The "Shared UTM taxonomy" panel shows a live
"Synced · saved just now" state so the team's allowed values are trustworthy. The cold-open builder
`/` is untouched.

## Workspace History & Attribution — Round 3 fixes (panel R2: 7/10 at the 9-bar) — added 2026-06-13

Clarity 10/10, Value 10/10 — the cap is now a small set of craft bugs blocking three holdouts
(Tomás 8, Dana 6, Elena 8) and a couple of passing testers. Surfacing/interaction/copy only, NOT a
redesign. Do NOT regress: 5-second `/w/<id>` clarity, mobile 375px no-occlusion, durable copy/
confirmation, anonymous-first (no login), the visibly-locked Preview, the name nudge, taxonomy
persistence, the workspace name, and ZERO change to the cold-open `/`. Ranked by testers unblocked.

**P0-1 — First click on History AND on "Shared UTM taxonomy" must work on cold load (THE blocker;
Aisha, Elena, Tomás, Dana, Jules).** Root cause (verifier-diagnosed): on a fresh `/w/` load the name
nudge auto-FOCUSES the "Editing as" input, and that input's `onBlur` fires on the user's first click
on a sibling toggle (History, the taxonomy disclosure) — the blur commits/re-renders the banner and
the toggle never receives/processes that first pointer event, so the panel renders empty or stays
closed and needs a second click. The user-visible requirement is absolute: **open `/w/` cold → ONE
click on "History" shows the version list; ONE click on "Shared UTM taxonomy" reveals the chip-entry
field** — no second click, no empty render. Fix mechanism (do all three so it's robust):
- **Stop the nudge from stealing/trapping the click.** Do NOT auto-`focus()` the "Editing as" input
  on load. Render the nudge in its open inline-input state (so it's still a one-tap, visible prompt
  per the R2 design) but leave document focus on `<body>` — nothing to blur, so the first click on any
  sibling lands cleanly. The hint ("Add your name so teammates see who changed what — optional, saved
  on this device.") stays. (If product still wants the field pre-focused, then the nudge's commit-on-
  blur must NOT re-render or move the toggles: commit name silently to localStorage/state without a
  layout-shifting re-render, so the toggle the user clicked still resolves on that same pointer event.)
- **Make the toggles open on the first pointer event regardless of blur.** History and the taxonomy
  disclosure must respond to `onPointerDown`/`onClick` independently of any input blur — a blur on the
  name field must never swallow, cancel, or pre-empt the toggle. The toggle's open state is derived
  state that renders its content synchronously, so a single click both opens the panel AND paints its
  contents in the same commit (no "open now, render list next click").
- **Render content synchronously on open.** History fetches/holds its versions so that the FIRST open
  shows the list (and the "History (N)" count) immediately — never an empty list that fills on a
  second toggle. Likewise the taxonomy panel's per-field chip rows + "+ add value" inputs render the
  instant it expands. Verify on a cold `/w/` load: one click History → versions + Preview/Restore
  visible; one click Shared UTM taxonomy → chip rows + add-value input visible and typeable.

**P0-2 — "Shared UTM taxonomy" panel must NOT re-hide the editable source columns (Dana 6, Priya).**
Opening the right-rail taxonomy panel currently squeezes the grid to BASE URL + GENERATED only,
hiding utm_source/medium/campaign — Dana's source-of-truth use breaks. In workspace mode the editable
source columns (Base URL, utm_source, utm_medium, utm_campaign at minimum) MUST stay visible whether
or not the taxonomy panel is open. Mechanism: the taxonomy panel must not steal grid width — keep the
grid's bounded-internal-scroll (per the side-panel design) with the leftmost editable source columns
as the on-screen default, OR stack the taxonomy panel BELOW the grid instead of beside it at
constrained widths, so opening it never reflows the source columns off-screen. Opening/closing the
panel must not change which columns are the first thing read after the banner.

**P1-1 — "Editing as" name persists across reload and attributes early edits (Tomás, Sam).** The name
currently reverts to "Anonymous" after reload, and the first autosave at workspace creation logs
"Anonymous" before the nudge is filled. Fix: (a) the committed name is read back from per-device
localStorage on every `/w/` load and re-applied to the banner ("Editing as: <name>") AND to the
attribution that rides the autosave PUT — it must NOT revert to Anonymous merely because the page
reloaded. (b) Surface the nudge BEFORE the first snapshot is attributed where possible; if the
creation snapshot was already written as "Anonymous", the moment a name is committed, back-fill that
first snapshot's attribution to the entered name (single PUT), so a fresh teammate's history isn't
permanently stuck as "Anonymous". Still never blocks editing; still no login.

**P2 — Clarify sync-vs-enforce (Priya, Wen, Dana; keep light).** Defining allowed values shows "Not
enforcing — enable in Naming rules", so syncing a taxonomy and enforcing it read as two confusing
steps. Make the relationship intentional and obvious: when the user adds the FIRST allowed value to a
previously-empty taxonomy, offer to turn enforcement on — an inline one-tap **"Enforce these allowed
values now"** action right by the panel's status line (flips the canonical Enforce toggle, no
separate hunt in Naming rules). If declined/until enabled, the status reads the plain, intentional
**"Saved, not yet enforced — turn on 'Enforce allowed values' to block off-spec values"** (names the
exact toggle, frames two steps as a deliberate choice, not a dead end). One canonical toggle still;
this is copy + one shortcut affordance, no new control.

### 5-second check (`/w/<id>` Round 3 — unchanged first read)
A stranger still instantly reads "a shared, synced UTM grid I can edit": the in-flow synced banner,
the gentle name nudge, the editable source columns visible after the banner — and now, on a cold
load, **one click opens History (versions shown) and one click opens Shared UTM taxonomy (chip field
shown)**, with the source columns staying visible even while the taxonomy panel is open. The cold-open
builder `/` is untouched.

## Paste & Audit existing UTM URLs — added 2026-06-13

ONE new capability: the audit-INBOUND counterpart to the build-OUTBOUND grid. A marketer pastes a
list of already-tagged full URLs (one per line — inherited from a campaign sheet, or pre-launch QA);
the app parses each back into a grid row (base URL + utm_* columns) and immediately lints the whole
set against the active rules + UTM Spec, surfacing every casing/spelling/off-spec inconsistency at
once for bulk-fix + re-export. Additive only — do NOT touch the headline, subhead, lint toggles, grid
layout, Presets, Campaigns/UTM-Spec panels, Bulk edit, the two share actions, or the mobile card
view. Every item below designs out a recorded utm-grid panel failure (verb collision, buried features,
375px occlusion, perceptually-invisible confirmation, unsafe replace). This goes in the BUILDER toolbar
group (alongside Import CSV / Add row / Export), NOT in the `/w/<id>` banner group.

**1. VERB COLLISION — the entry point must never read as a sibling of Import / Copy (this app's
lowest-scoring failure mode).** Two adjacent controls sharing a verb have twice read as one broken
feature here. So:
- **Label (verbatim):** **"Paste & Audit URLs"** — verb is *audit* (judge existing), object is
  *URLs*. Never "Import", "Paste links", "Add", "Copy", or a bare "Audit". The word *Audit* is the
  whole differentiator: Import CSV builds NEW rows from a file; Paste & Audit JUDGES existing tagged
  URLs you already have. They must never blur.
- **Icon:** a **magnifying-glass-over-list / checklist-with-checkmark** glyph (inspection), distinct
  from Import's down-arrow/file-in and from Copy's two-squares glyph. No arrow, no file, no clipboard.
- **Placement:** put it as a distinct accented chip in the toolbar **with one logical group's gap from
  "Import CSV"** — never immediately adjacent. Order: [Add row · Import CSV] ··gap·· [**Paste & Audit
  URLs**] ··gap·· [Export · Copy share link]. Adjacency to Import is exactly what reads as a duplicate;
  the gap + the accent + the inspection icon make it a separate, heavier-intent action.

**2. DISCOVERABILITY — a cold user must NOTICE it on the first screen, desktop AND 375px, without
crowding the toolbar (added features have shipped invisible here and burned 1–2 panel rounds just
being found).**
- **Desktop:** the chip carries a 2–3 word value tag baked into its styling — render it as
  **"Paste & Audit URLs"** with a quiet sub-caption beneath the toolbar row (one muted line, in flow):
  **"Already have tagged links? Paste them to find every inconsistency at once."** This single skim
  line names the inbound job so a scanner who came to QA existing links sees the feature exists in the
  5-second read — without expanding the toolbar.
- **375px:** it joins the top action bar as a **full-label accent button "Paste & Audit URLs"** (never
  an icon-only, never collapsed inside a disclosure) so a phone user finds it on the first scan. It is
  the only NEW always-visible toolbar button; the existing Bulk/Spec/Campaigns disclosures stay
  collapsed and quiet so the screen doesn't crowd.

**3. The dialog + textarea affordance — legible, reassuring parse summary, safe replace-vs-append.**
Clicking opens a **centered modal dialog** (focus-trapped, Esc closes, returns focus to the chip —
this one IS a modal because pasting is a deliberate detour, not an in-flow grid edit):
- **Title:** **"Paste your existing tagged URLs"**. Sub-line: **"One full URL per line. We'll parse
  each back into the grid and flag every inconsistency."**
- **A large pre-focused textarea** (≥6 rows, monospace) with **example content as the placeholder**
  showing the outcome before typing — three realistic lines that include a deliberate inconsistency so
  the value is shown not described:
  `https://acme.com/sale?utm_source=Newsletter&utm_medium=email&utm_campaign=Spring_Sale`
  `https://acme.com/sale?utm_source=newsletter&utm_medium=Email&utm_campaign=spring-sale`
  `https://acme.com/blog?utm_source=twitter&utm_medium=social&utm_campaign=spring sale`
  (placeholder is muted/illustrative; an empty submit is blocked with the inline hint **"Paste at least
  one URL to audit."**).
- **Primary CTA (verbatim):** **"Audit N URLs"** — the button's count updates live as the user pastes/
  types (counts non-empty lines): "Audit 0 URLs" (disabled) → "Audit 3 URLs". The verb stays *Audit*,
  reinforcing the inbound job right on the action.
- **Parse SUMMARY before commit (legible + reassuring).** On clicking Audit, the dialog shows an inline
  summary panel BEFORE writing to the grid: **"3 parsed · 1 skipped"**, with the skipped lines listed
  by line number + reason (**"Line 4: not a valid URL — skipped"**) so nothing fails silently. A line
  with no utm_* params parses as a base-URL-only row (counts as parsed, not skipped). This summary is
  the reassurance that the paste did the right thing.
- **Replace-vs-append guard (the unsaved-edits safety — reuse the Import §D / Campaigns §6 pattern).**
  The commit step offers **Append / Replace** (default **Append**), shown as two clear radio/segmented
  options with the live grid's current count named: **"Append to current grid (5 rows)"** /
  **"Replace current grid (5 rows)"**. Either way the whole paste is a **single Undo step** so it never
  silently destroys the grid. If Replace is chosen AND the working grid has unsaved edits, fire the
  same native `confirm()` guard the app already uses: **`Replace your current grid (5 links)? This
  can't be undone (one Undo will restore it).`**
- On commit: dialog closes, the new rows land in the grid, **lint re-runs immediately on the whole
  set**, and a **peripherally-unmissable** confirmation fires (heed copy-confirmation-survives-tick-
  rerender): a persistent ~5s status **"Audited N URLs — M cells flagged. Undo"** (ref-stable timer,
  `aria-live="polite"`), and every flagged cell carries its existing amber/violet/cross-row warning so
  the inconsistencies are visible at a glance. The user's natural next move is the already-shipped
  **Auto-fix naming** / **"Fix to <value>"** — so audit flows straight into bulk-fix + re-export with
  zero new fix UI.

**4. 375px — entry, dialog, textarea, summary, and resulting linted rows all reachable, ≥44px, no
horizontal scroll, nothing occluded (this app's recurring mobile-overlay failure).**
- The dialog is **full-width (inset ~12px), vertically scrollable in its own bounds**, never wider than
  the viewport. Textarea full-width ≥6 rows; the **"Audit N URLs"** CTA and **Append/Replace** options
  are ≥44px and stack vertically (no side-by-side clipping). The parse summary renders in flow inside
  the dialog, pushing the CTA down — never an overlay over the CTA.
- On commit the dialog closes and the audited rows render in the **mobile CARD view** (the ≤640px
  pure-CSS cards), each flagged field showing its inline warning + the inline "Fix to <value>" chip in
  card flow — no sticky column, no sideways scroll. Verify at 375px with elementFromPoint that no
  dialog/summary/status pixel covers a card field, checkbox, row control, or Fix chip.

**5. VALUE legible in 5s — "paste your existing tagged links → see what's inconsistent" (distinct from
"build new links").** The toolbar chip **"Paste & Audit URLs"** + its sub-caption **"Already have
tagged links? Paste them to find every inconsistency at once."** + the dialog placeholder showing three
real URLs with a visible casing mismatch tell a cold marketer the inbound job in one read: this is
where you QA links you already have, not where you build new ones. The grid hero, headline, and
above-the-fold first read are unchanged — the audit entry is a single quiet-but-discoverable accented
chip until clicked.

### 5-second check (Paste & Audit — added 2026-06-13)
Cold visitor still sees the unchanged hero (headline, subhead, pre-filled example row + Copy). The new
**"Paste & Audit URLs"** chip is visible in the builder toolbar one group apart from Import CSV, with
its sub-caption naming the inbound QA job; on 375px it's a full-label accent button in the top action
bar. Opening it shows a pre-focused textarea with three example tagged URLs (one deliberately
inconsistent), a live **"Audit N URLs"** CTA, a **"N parsed · M skipped"** summary, and a default-Append
(vs guarded-Replace) commit that lands the rows and lints them on the spot.

### Paste & Audit — Round 2 fixes (panel R1: 3/10 pass, 7 at advocacy 7–8) — added 2026-06-13

Clarity 10/10 Yes, Value 10/10 Yes — the feature is clear and wanted; the entire gap is post-audit
friction polish. This is craft on a shipped, loved feature, NOT a redesign. Do NOT touch the
headline, subhead, lint toggles, the audit entry chip/dialog/textarea, the existing per-cell warning
colors (amber case/space, violet off-spec, cross-row), Auto-fix, "Fix to <value>", or the toolbar
order. Each fix maps to a synthesis cause. Fix 1 is the biggest lever and subsumes Causes 2 and 3.

**Fix 1 — GROUPED POST-AUDIT SUMMARY panel makes the payoff legible without horizontal scroll (P0;
Cause 1: Priya, Tomás, Rob t8 LOWEST, Elena — biggest theme; also resolves Causes 2 & 3).** On a
successful audit, render a **results summary panel in normal document flow directly ABOVE the grid /
card list** (cool-neutral tinted strip, full-width, pushing the grid down — never an overlay, never a
sticky column). It is the primary post-audit readout; the per-cell flags stay but become secondary.
Header line: **"Audited N URLs — M issues across K fields. Undo"** (ref-stable ~persistent status,
`aria-live="polite"`, with the existing Undo inline). Below it, issues GROUPED BY FIELD, one line per
field+conflict — never one line per row:
- **Inconsistent casing/variants:** **"utm_source: 'Facebook' vs 'facebook' (2 rows) — will split
  campaign data in GA4"**, with a scoped **"Fix this field"** action that lowercases/normalizes just
  that field's flagged cells (reuses Auto-fix engine, folds into Undo, flashes the changed cells
  green). One line per conflicting field, naming the variants + the row count.
- **Missing required:** **"utm_medium: missing on 1 row"** (names the field + count).
- **Off-spec (when Enforce is on):** **"utm_campaign: 'spring sale' off-spec — nearest allowed:
  spring-sale (1 row)"** in the violet off-spec color, with the existing **"Fix to <value>"** scoped
  to that field.
- **Skipped lines (Cause 3, see Fix 2):** listed here by line number + reason.
The grouped lines are the de-dupe: the full GA4 sentence appears ONCE per field, not once per row.
A **"Clear summary"** × dismisses it (the per-cell flags remain). On mobile (375px) it spans full
width above the card list, in flow, ≥44px tap-targets, nothing occluded — verify with elementFromPoint.

**Fix 1b — utm_* columns must be REACHABLE after audit, not collapsed behind the sticky URL +
sidebar (P0; Cause 1, Rob's 1800px report — the prior width fix is insufficient with the sidebar
open).** Two changes so the editable flagged columns aren't off-screen-right at common laptop widths:
- On a successful audit, **auto-scroll the grid's inner `overflow-x-auto` container to the first
  flagged utm_* column** (not its default left edge), so the user lands on a flagged value, not on
  BASE URL + a wide GENERATED URL. Clicking a summary line (Fix 1) also scrolls the grid to that
  field's first flagged cell.
- Revisit the width budget when the Campaigns/UTM-Spec sidebar is OPEN: at ≤1800px with the sidebar
  open, the GENERATED URL sticky column + sidebar must NOT collapse utm_source/medium/campaign to a
  sliver. Cap the GENERATED URL sticky column narrower in this state (or let the sidebar yield width)
  so at least Base URL + utm_source + utm_medium + utm_campaign read at usable widths within the
  bounded-internal-scroll container — verify utm_source is never squeezed to ~40px/"Fac…" at 1500px or
  1800px with the sidebar open. (Page never scrolls sideways; this is the existing
  bounded-internal-scroll, just re-budgeted.) The summary panel (Fix 1) is the safety net regardless.

**Fix 2 — Name the skipped line(s) in the summary (P0/P1; Cause 3: Marcus, Dana, Tomás, Jules, Sam —
5 testers, the most-named).** The audit summary (Fix 1) must list every skipped line concretely so a
user can fix a typo'd URL: **"Line 4: not a valid URL — skipped: `htps://acme.com/sale?utm_…`"**
(line number + truncated offending text + reason), one line per skipped input. This is critical at
30–50-line real pastes where a fat-fingered real URL could silently drop. Never just a bare count.

**Fix 3 — Live flag counter after a fix (P2; Cause 4: Elena, single-persona quirk).** After
"Auto-fix naming" / a scoped "Fix this field" / "Fix to <value>" clears flagged cells, **recompute
and update the summary header's issue/cell count live** (e.g. "M issues" drops, and a field whose
issues are all resolved disappears from the grouped list) — never leave a stale "N cells flagged"
record-of-run. When all issues clear, the summary reads **"All audited URLs are clean."**

**Fix 4 — Minor copy nits (optional, cheap; don't over-engineer).** (a) The pre-submit CTA should
count PARSEABLE lines, not raw lines — label it **"Audit N URLs"** by parseable count (or **"Audit up
to N"**) so pure-garbage lines don't inflate the count before submit (Aisha). (b) The parsed Base-URL
cell already truncates with a `title` tooltip for the full value — leave as-is, it's working; only
widen if free (Marcus).

**Risk the builder must heed (Round 2).** (1) The summary panel and Fix 1b auto-scroll must NOT
regress the zero-network privacy prop, the cold-open grid-hero, or the existing per-cell warning
colors — three warning classes (amber case/space, violet off-spec, cross-row) must stay tellable
apart in BOTH the per-cell flags and the grouped summary lines. (2) On 375px the summary renders in
flow above the card list, never over a card field/checkbox/row control/Fix chip — re-verify the
recurring occlusion bug class with elementFromPoint. (3) The scoped "Fix this field" / "Fix to
<value>" actions in the summary must fold into the SAME shared Undo as the toolbar Auto-fix.

### 5-second check (Paste & Audit Round 2 — unchanged above the fold)
Cold visitor still sees the unchanged hero. After an audit the FIRST thing read is the in-flow grouped
summary — **"Audited N URLs — M issues across K fields"** with one line per field
("utm_source: 'Facebook' vs 'facebook' (2 rows)…"), the named skipped lines, and scoped one-tap fixes
— no horizontal scroll needed to see the payoff; the grid auto-scrolls to the first flagged utm_*
column beneath it, and the issue count updates live as fixes are applied.

## Campaign Naming Template — added 2026-06-14

ONE new capability: define the STRUCTURE of `utm_campaign` (an ordered list of named segments + a
separator), then build compliant names per row from a composer and lint off-template values. This is
DISTINCT from UTM Spec: UTM Spec governs allowed VALUES per field; the Naming Template governs the
COMPOSITION of one field (utm_campaign) — `quarter_channel_audience`, not "is this value allowed."
Additive only — do NOT touch the headline, subhead, lint toggles, grid layout, Presets, Campaigns/
UTM-Spec panels, Bulk edit, the two share actions, Paste & Audit, or the mobile card view. Every item
below designs out a recorded utm-grid panel failure (buried feature, width-stealing panel, 375px
occlusion). The cold-open grid stays the hero; this panel is quiet-but-discoverable until opened.

**1. ENTRY POINT — first-class, visually DIFFERENT from UTM Spec (buried-feature failure has burned
1–2 panel rounds here twice).** The Naming Template panel is a **sibling disclosure in the right-hand
sidebar, directly UNDER the "UTM Spec" panel** (same disclosure styling so it reads as a peer config
surface, NOT nested inside UTM Spec). Make the two unmistakably different at a glance:
- **Header label (verbatim):** **"Campaign Naming Template"** with a **structure/blocks icon** (e.g.
  three joined segment chips `[ ]_[ ]_[ ]`), distinct from UTM Spec's allowed-values/checklist glyph.
- **Sub-line (verbatim):** **"The STRUCTURE of utm_campaign — its parts and their order (e.g.
  quarter_channel_audience). Different from UTM Spec, which sets allowed values. Saved on this
  device."** This one line names the difference in plain words so a tester never reads it as a
  duplicate of UTM Spec.
- **Discoverability:** collapsed by default on a true cold open (grid stays hero), but **expanded by
  default once a template has ≥1 segment** (same rule as UTM Spec) so a returning user sees their
  structure is live. When Enforce naming template is on and any cell is off-template, add a top-level
  **"N off-template"** indicator in the lint bar (in the off-template warning color — see item 5) that
  scrolls to / opens this panel on click, advertising the feature is working — mirrors the "N cells
  off-spec" indicator already shipped for UTM Spec.

**2. PANEL LAYOUT — segment rows, stacked BELOW at constrained width, never a width-stealing sidebar
(width-steal-hides-editable-columns failure).** The panel renders like the UTM Spec panel: as the
inline right-rail column at wide widths, but at constrained widths (≤1535px / 1280px laptops with the
sidebar open, and in workspace mode) it must NOT squeeze the grid — the editable source columns (Base
URL, utm_source, utm_medium, utm_campaign at minimum) stay the on-screen default; if the rail would
collapse them, **stack the Naming Template panel BELOW the grid** rather than beside it (the same
resolution applied to the taxonomy panel in "Workspace History R3 P0-2"). Inside the panel, expanded:
- **A separator control** at the top: a small segmented picker **`_` / `-`** (default `_`), labeled
  **"Join parts with"**, with a live one-line preview of the assembled pattern (e.g.
  **"quarter_channel_audience"**) that updates as segments/separator change.
- **An ordered list of SEGMENT ROWS**, one per part, each showing: a drag-handle/order number, a
  **segment-name input** (placeholder "e.g. quarter"), an **optional allowed-token list** (reuse the
  UTM Spec chip UX exactly — removable chips + a "+ add token" input that accepts comma/newline paste;
  a row with zero chips reads a muted **"any text"**), and a **remove (×)** for that segment. A
  **"+ Add segment"** button below the list. All inline, no modal, like the UTM Spec field rows.
- **The "Enforce naming template" toggle** surfaced at the top of the panel AND placed as a rule in
  the lint-rule group alongside required-params / lowercase / no-spaces / Enforce allowed values
  (canonical single control, shared state) — independent of "Enforce UTM Spec" (flipping one never
  touches the other).

**3. EMPTY / FIRST-USE state.** With no segments defined, the panel body shows ONE quiet line, no
empty box, no nag: **"No naming template yet — add segments (e.g. quarter, channel, audience) to build
consistent campaign names and flag ones that don't match."** The **"+ Add segment"** button stays
enabled above it so the invitation IS the action.

**4. PER-ROW "Build name" COMPOSER — compact inline popover, one control per segment, joined preview,
Apply.** Each grid row exposes a small **"Build name"** affordance ON the utm_campaign cell (a tiny
segment-blocks icon button inside/under the cell — NOT adjacent to the row Duplicate/Delete or Bulk
controls, to avoid the same-verb-adjacency failure). Clicking it opens a **compact popover anchored to
that cell** (in-flow on mobile cards), titled **"Build campaign name"**, containing:
- **One control per segment in order:** a **dropdown** when that segment has an allowed-token list
  (options = its tokens), a **free-text input** otherwise, each labeled with the segment name.
- A **live joined preview** of the assembled value (e.g. **`2026q3_paidsocial_retargeting`**) updating
  as the user fills controls, using the chosen separator — so the outcome is seen before applying.
- An **"Apply"** primary button that writes the joined value into that row's utm_campaign cell, closes
  the popover, flashes the cell green, and re-lints. A **"Cancel"** / Esc closes without writing.
- It opens toward the cell's free side so it never covers the cell or row controls; the popover and its
  controls are ≥44px at 375px and render in card flow on mobile (no sticky/overlay occlusion).

**5. OFF-TEMPLATE LINT — additive, consistent with the existing warning styling, names the EXACT
problem.** An off-template utm_campaign is a lint warning like the others — it folds into the cell's
single collapsed warning pill (per Fix E), never a competing control. Give it its own **distinct color
(a teal/cyan accent)** so the four warning classes stay tellable apart at a glance — amber = case/space,
violet = off-spec taxonomy, cross-row = its color, **teal = off-template structure** (add it to the
tiny lint legend near the lint bar so the new color reads as intentional). The expanded message names
exactly what's wrong, matching the off-spec "names the problem" pattern:
- Wrong count: **"Off-template — expected 3 segments, found 2"**.
- Bad token: **"Off-template — segment 'channel' must be one of: paidsocial, email"** (names the
  offending segment + its allowed tokens).
There is NO blind "Fix" for off-template (the right value is the user's choice of parts) — instead the
warning offers a **"Build name…"** link that opens the per-row composer (item 4) pre-filled with any
parseable existing segments, so the fix path is the composer, scoped and named, never a bare adjacent
button. Folds into the shared Undo; clears when the value matches the pattern. At 375px the warning +
"Build name…" link render in card flow above the sticky/over nothing, ≥44px, verified non-occluded.

### 5-second check (Campaign Naming Template — added 2026-06-14)
Cold visitor still sees the unchanged hero. The **"Campaign Naming Template"** disclosure is visible in
the sidebar directly under UTM Spec, its sub-line naming it as the campaign-name STRUCTURE (distinct
from UTM Spec's allowed values); opening it shows the separator picker, ordered segment rows (name +
optional token chips), the "Enforce naming template" toggle, and the empty-state hint when no template
exists. On a row, a **"Build name"** composer opens a compact popover with one control per segment, a
live joined preview, and Apply; off-template values flag in the distinct teal lint color naming the
exact mismatch ("expected 3 segments, found 2"). All reachable, ≥44px, non-occluded at 375px.

### Campaign Naming Template — Round 1 panel fixes (panel R1: 9/10 at advocacy 8, Wen 6; clarity & value 10/10)

Comprehension and value are SOLVED — every tester read the panel as distinct from Allowed
Values and wanted the feature. The 9-bar miss is one near-universal cause: the panel (and its
per-row composer) is BELOW THE FOLD and found only by hunting (9/10 testers). Plus a P1
returning-user bug (Wen → 6) and four P2/P3 defects. UX owns surfacing + the popover clip below;
the BUILDER owns the functional bugs (hydration, loose-enforce, column-visibility, label
fallback — those are NOT in this brief). Additive / surfacing / CSS / copy only — do NOT touch
the headline, subhead, lint toggles, grid layout, the existing four warning colors, or any
other panel's order. Each item maps to a synthesis cause.

**Fix 1 — Make the Naming Template entry point FIRST-CLASS, not a bottom-of-rail afterthought
(P0; Cause A, 9/10 testers — the dominant blocker).** The "Different from Allowed Values" copy
is praised but only disambiguates ONCE FOUND; it does not get the panel found. Do all of:
- **Promote it ABOVE Allowed Values / Campaigns in the right rail.** The Campaign Naming Template
  disclosure moves to the TOP of the sidebar config stack (above UTM Spec / Allowed values and
  above Campaigns), so a cold skimmer's eye lands on it first, not after scrolling past two other
  panels. It is the marquee new feature — it leads the rail.
- **Auto-expand on cold open the first time** (or until the user has interacted with it once,
  tracked in localStorage), instead of collapsed-by-default. A first-time visitor sees the
  separator picker + the empty-state "add segments…" line without any hunt. After first
  interaction it follows the standard rule (expanded when ≥1 segment, collapsed when empty).
- **A visible pointer from the top toggle.** The "Enforce naming template" lint-rule toggle (in
  the lint-rule group up top) carries a small inline **"Define structure →"** link that scrolls
  to / expands the panel — so a tester who finds the toggle first (Marcus, Sam) is taken straight
  to where segments are defined, never left guessing. Mirror the "N cells off-spec" indicator
  pattern already shipped for UTM Spec.
- **Visually SEPARATE the three "naming" surfaces** so they don't blur (Jules: NAMING RULES
  toggles / Allowed values / Campaign Naming Template all read alike). Give the Campaign Naming
  Template disclosure its own **distinct structure/blocks icon** (`[ ]_[ ]_[ ]`, segment chips)
  and a one-line sub-label directly under the header verbatim: **"Define your campaign-name
  structure — its parts and their order."** This sub-label, paired with the existing "Different
  from UTM Spec…" line, names the JOB (not just the difference) so a hurried marketer reads it in
  one pass. Keep its teal accent tied to the off-template warning color so panel and lint read as
  one feature, distinct from the amber lint group and violet UTM Spec.
- **Distinct from the two near-identical "Enforce" toggles** (Priya): the Naming Template's
  Enforce toggle carries its structure-blocks icon + the label **"Enforce naming template"** with
  a one-line caption **"flags utm_campaign values that don't match your structure"**, so it never
  reads as a clone of "Enforce allowed values" sitting beside it.

**Fix 2 — Make the per-row "Build name" composer affordance obviously discoverable (P1; Cause A2,
Dana + Aisha).** The current subtle teal pill under the utm_campaign cell is missed cold (and
only appears after a template exists). Strengthen it WITHOUT letting it read as a row/bulk verb:
- Render it as a clearly-labeled chip-button **"Build name"** with the structure-blocks icon and a
  visible (not hover-gated) teal outline, sitting ON / directly under the utm_campaign cell —
  large enough to read as an action, ≥44px on mobile. It must stay **distinct from the row
  Duplicate/Delete icons and the Bulk Set/Find-&-replace verbs** (the recurring same-verb-adjacency
  failure): keep it on its own cell, teal, named "Build name", never in the row-actions column.
- When Enforce is on and a cell is off-template, the off-template warning's **"Build name…"** link
  (already specified) is the second discovery path — but the cell-level "Build name" chip must be
  findable even on an on-template / blank cell once segments exist, so the composer isn't gated
  behind first producing an error. (Keep the "appears once segments exist" rule — that's correct;
  the fix is making it un-subtle, not making it always-on with no template.)

**Fix 3 — Composer popover must NOT be clipped (P1; Cause C, Sam — laptop + 375px).** The
"Build campaign name" popover currently clips at the row boundary so the segment pickers are cut
off until scrolled. Render it so it OVERFLOWS the row/grid correctly:
- Portal the popover to the document body (or render it outside any `overflow:hidden`/`auto`
  ancestor) and POSITION it relative to the trigger cell, so the full body (all segment controls +
  live preview + Apply/Cancel) is visible regardless of the row's height or the table's internal
  scroll clipping. It opens toward the cell's free side and **reflows to stay within the viewport**
  (flips up/left if there's no room below/right) — never cut off by the row, the sticky columns,
  or the grid container.
- **At 375px in the mobile CARD view:** the composer renders in CARD FLOW (in-document, pushing
  content down — never a sticky/fixed overlay over a card, checkbox, or row control), full-width,
  every control ≥44px, the live preview and Apply/Cancel all visible without horizontal scroll.
  Verify with elementFromPoint that no popover pixel is occluded by, and the popover occludes no,
  card field / checkbox / row control / Fix chip.

**Fix 4 — Keep all controls reachable and hittable at 375px (P1; spans the above).** Across the
promoted panel, the per-row "Build name" chip, the composer popover, the "Enforce naming
template" toggle and its "Define structure →" pointer: every interactive element is ≥44px,
fully on-screen with no horizontal scroll, and nothing is occluded by the sticky URL/Actions
column or any banner. Verify at 375px with elementFromPoint that each tap lands on its own
control — this is the recurring mobile-occlusion bug class this app has hit repeatedly.

**Builder-owned (NOT this brief, named for routing):** Cause B P1 reload-hydration (segments
must rehydrate from localStorage into the panel on mount, not just the enforce toggle); Cause D
loose enforcement (empty/blank segments like `_email_` must flag off-template); Cause E column
visibility (re-budget the bounded-internal-scroll so a flagged cell stays visible with Enforce on
+ a long URL); Cause F label fallback (`segment ""` → "segment N").

### 5-second check (Campaign Naming Template Round 1 — unchanged above the fold)
Cold visitor still sees the unchanged hero. The **Campaign Naming Template** panel now leads the
sidebar config stack (above UTM Spec / Campaigns), auto-expanded on first cold open, with its
distinct structure-blocks icon and the sub-label **"Define your campaign-name structure — its
parts and their order"** — impossible to scroll past. The "Enforce naming template" lint toggle
carries a **"Define structure →"** pointer to it. On a row, an un-subtle teal **"Build name"**
chip opens a composer popover that is never clipped (portaled, viewport-aware) and renders in
card flow at 375px; every control is ≥44px and non-occluded.

## Team UTM Style Guide — new read-only page (2026-06-14)

ONE new capability: a shareable, READ-ONLY governance reference at **`/w/<id>/guide`**, derived
entirely from the existing Team Workspace payload (reuse GET `/api/workspace/<id>` — no new
schema/table/credential). Audience: a teammate / agency / contractor who needs to KNOW how this
team tags links WITHOUT editing. It is a DOCUMENT, not a tool. Additive only — do NOT redesign the
app, the grid, the `/w/<id>` editor, or any panel. The page makes ZERO writes (no PUT/POST, no
autosave, no localStorage) — read-only or it can clobber the workspace.

**1. Problem statement (the page's own 5-second read).** "See exactly how this team tags its links
— the approved values, names, and rules — without touching anything." A stranger opening
`/w/<id>/guide` cold must understand within 5 seconds: *this is <team>'s UTM tagging standard, here
are the rules.* Lead with a clear **h1 title** + a **one-line description**. NO editable inputs
anywhere — it must READ like a typeset reference, not the editor with disabled fields.

**2. Emotional tone.** Authoritative and calm — an internal wiki / style guide. Document feel:
real headings + body prose (not grid chrome), a centered reading column (~720px max-width),
generous vertical spacing, neutral/cool palette consistent with the app. Allowed values render as
quiet labeled chips, never as form controls.

**3. Sections, in this exact order.**
- **(a) What & why** — ONE short line: consistent UTM tags keep campaign data from silently
  splitting in GA4.
- **(b) Allowed values** — per UTM field, render ONLY fields that have a non-empty allowed-value
  list (utm_source / utm_medium / utm_campaign / utm_term / utm_content). Each as a labeled value
  list / chip set. Skip fields with no list (don't show empty rows).
- **(c) Campaign naming template** — show the ORDERED segments + the separator + each segment's
  allowed tokens, AND a **worked concrete example string** assembled from the template (first
  allowed token per segment, else a `<segment-name>` placeholder), e.g.
  `2026q3_paidsocial_retargeting`, so the reader sees a real compliant name, not just a schema.
- **(d) Conventions** — plain language, listing ONLY the lint rules that are ON (e.g. "lowercase
  only", "no spaces", "utm_source / utm_medium / utm_campaign required", "values must be from the
  allowed list", "campaign names must follow the template"). State the casing/separator
  conventions in words.
- **(e) CTA card** — prominent **"Open the editable workspace →"** linking to `/w/<id>`. This is
  the viral on-ramp turning a recipient into a user; make it a real card, not a footer link.

**4. Empty state (graceful, never blank).** If the workspace has NO UTM Spec values AND no naming
template: still render section (d) Conventions (the active lint rules) + section (a) + the CTA, plus
one friendly line — **"This team hasn't defined a custom value or naming taxonomy yet — the
conventions below still apply."** Never a blank page.

**5. Mode-aware copy (server-backed page — trust bomb if wrong).** NO "nothing leaves your browser"
/ "client-side only" wording anywhere on the guide (it's a server fetch). If privacy is mentioned at
all, say the secret link is the access control: **"Anyone with this secret link can view this page."**

**6. Not-found state.** `/w/<bad-id>/guide` shows a clean **"Workspace not found"** message with a
link back to the builder (`/`) — mirror the existing `/w/<id>` not-found, never a crash or blank.

**7. Discoverability FROM the editable `/w/<id>` (friction: added features get buried, panels burn
rounds surfacing them).** Add a FIRST-CLASS, visually distinct **"Share style guide"** action near
the **"Team Workspace — synced"** banner — NOT buried at the bottom of a rail. One-line sublabel or
tooltip: **"A read-only page teammates can read without editing."** Clicking COPIES the
`/w/<id>/guide` link and shows a **peripherally-unmissable green-fill-in-place "Copied!"**
confirmation that **survives re-render** (ref-stable timer, `aria-live="polite"`, execCommand/
textarea clipboard fallback) — reuse this app's established copy-cue pattern; do NOT regress to a
fast-fading corner toast for this button.

**8. Layout residual to FIX on the editable `/w/<id>` + main grid (call-out for builder).** At
~1280px with Enforce on and a long generated-URL column the table overflows horizontally and inline
warnings need sideways scroll. Fix direction: ensure NO child carries a hardcoded `w-NN shrink-0`
that escapes the container (container-resize-leaves-hardcoded-width-children lesson); the
generated-URL column must truncate/wrap, OR the table scrolls WITHIN its own container — never the
page. **No horizontal PAGE scroll at 1280px.**

**9. Mobile (375px).** The guide is fully legible top-to-bottom with NO horizontal scroll; all
sections stack; value chips wrap.

### 5-second check (the guide page, above the fold)
- **Headline (h1):** "<editor-label or 'Team'> UTM Tagging Standard".
- **Subtitle (one line):** "How this team tags campaign links so reporting stays clean. Read-only reference."
- **Primary action:** none to perform — the page IS the outcome (the reader reads); the prominent
  **"Open the editable workspace →"** CTA card is the on-ramp and is visible near the top.
- **Pre-filled example:** the first visible content is real workspace data — allowed-value chips and
  the worked naming-template example string (e.g. `2026q3_paidsocial_retargeting`) — never a blank box.

## Style Guide — Round 2 fixes (panel run 20260614-015304-daily: 5/10 at the 9-bar)

Clarity 10/10 Yes, value 10/10 Yes — comprehension and value are solved; the exit gap is pure
craft on advocacy. Sub-bar: Marcus 7, Priya/Jules/Aisha/Rob 8. Additive / CSS / copy only — do
NOT touch the headline, subhead, lint toggles, ≤640px card view, or the guide page content; pure
CSS breakpoints, no JS viewport detection. Four fixes, priority order.

**Fix 1 — Copy cue on "Share style guide" must be peripherally UNMISSABLE (P0; the dominant
blocker — Jules 8, Aisha 8, Sam 9).** The button copies the correct `/guide` URL but the on-screen
confirmation is silent/intermittent — testers clicked unsure it worked. On click: the button
**fills solid green in place**, label flips to **"Copied ✓"** for **~1.5s**, then reverts. The
timer MUST be **ref-stable so it survives re-render** (the recurring copy-confirmation-survives-
tick-rerender lesson — three testers saw nothing while three others saw the flip, which is exactly
the non-stable-timer symptom), backed by `aria-live="polite"`, with an execCommand/textarea
clipboard fallback when `navigator.clipboard` rejects. Match or upgrade the strongest copy cue
already in the app. Apply the SAME treatment to **"Copy workspace link"** and **"Copy share link"**
if either is weaker, so all three share-copies confirm identically. Verify the green-fill + label
flip actually fires at 375px (no corner toast that scrolls off).

**Fix 2 — Give the editable grid real width at ≥1280px; sticky columns must never occlude editable
cells (P0; the only thing pinning Marcus to 7 — Marcus 7, Rob 8).** Page-level horizontal scroll
is already fixed; the regression is the right-rail config panels (UTM Spec / Campaigns / Naming
Template / Presets) permanently squeezing the grid into a ~958px sub-pane while the table needs
~1745px, so editable cells + Generated URL scroll horizontally inside the box even on a 1680px
monitor. Direction (apply the established lesson — render config panels BELOW/ABOVE the full-width
grid, not beside it, so editable columns stay visible): make those config panels **collapsible and
stack them above OR below the full-width grid**, OR move them into a **collapsible drawer**, so the
grid uses the full page width. Separately, fix the sticky **Generated-URL / Actions** columns so
they **NEVER overlap or occlude the editable utm cells at any width** — either drop sticky when it
would overlap, or give the sticky column an **opaque background** AND have the editable cells
reserve their own space so the sticky column can't sit on top of them. **Target:** at 1280px with
Enforce ON + a long generated URL, ALL editable cells AND inline lint warnings are readable with
NO horizontal scrolling, and no sticky column sits on top of an editable cell. Do NOT regress the
375px card view.

**Fix 3 — Differentiate the three share actions so each is instantly distinct (P1; Priya 8,
Tomás 9, Elena 9).** "Copy share link" / "Create shared workspace" / "Share style guide" read as
confusingly similar to a skimmer. Differentiate with labels + one-line sublabels + visual
grouping so each is unmistakable at a glance, e.g.:
- **"Copy share link (snapshot)"** — sublabel "a frozen copy of this grid".
- **"Create shared workspace (live, synced)"** — sublabel "a workspace teammates edit together".
- **"Share style guide (read-only reference)"** — sublabel "a page teammates read without editing".
Group the workspace-page share actions together visually (one share cluster) so the three read as
distinct members of one group, not three lookalike buttons scattered in the rail.

**Fix 4 — Workspace empty/short state must not read as unfinished or as data loss (P1; Aisha 8,
Dana 9; + Tomás 9 server note).** (a) A new/short workspace grid must NOT render a ~200px-tall
single row with a large empty white block below — **size the grid area to its content** (or add a
subtle starter affordance/placeholder row) so a one-row workspace reads as deliberate, not a
broken empty state. (b) After **Auto-fix**, the layout must NOT read as if the input columns
vanished — keep the source/medium/campaign columns visible (don't collapse to Generated-URL only)
or give explicit feedback ("Auto-fixed N cells — Undo") so a user never thinks their inputs were
lost. (c) Add a small, **mode-aware** server-data note where a workspace is shared — e.g.
**"Shared workspace data lives on our server behind this secret link"** (only on the shared-
workspace surface, NOT on the client-side local grid, whose "nothing leaves your browser" prop
must not regress) — addressing Tomás's company-data concern; the secret link is the access control.

**Deprioritized with reason (NOT this round):** Priya CLI single-link fast path (out of scope —
the app is a grid); Priya view-only-guide-exposes-edit (design stance: secret link = access
control); Jules X/Mastodon presets + auto-fix trailing-punctuation strip; Wen per-row Auto-fix
diff + lint-report CSV export; Elena enforcement-that-blocks (the guide is documentation by
design; Enforce already lints); Sam/Elena team branding + "ours, governed" guide. **Bad TEST seed
data, not an app bug:** seeded template channel segment (email/social/ppc) not matching utm_medium
allowed values (email/paid_social/cpc) — fix the seed, don't re-architect the guide.

### 5-second check (Style Guide Round 2 — unchanged above the fold)
Headline, subhead, lint toggles, and the pre-filled example grid row + Copy stay exactly as
shipped. On `/w/<id>` the three share actions now read as a clearly-labeled, grouped cluster with
distinct sublabels; clicking any copy action gives a peripherally-unmissable green "Copied ✓"; the
grid uses full page width with config panels collapsible/stacked so editable cells + lint are
readable at 1280px with no horizontal scroll.

## Launch Check — whole-grid Compliance Report (added 2026-06-14)

ONE new capability: a **"Run Launch Check"** action that runs the existing lint suite across ALL
grid rows at once and shows a **Compliance Report** scorecard — "is this whole batch ready to
ship?" (vs inline lint, which answers one cell). Directly delivers Wen's R1 deprioritized ask
(export the lint violation report as CSV). Additive only — do NOT touch the headline, subhead, lint
toggles, grid layout, Presets, Campaigns/UTM-Spec/Naming-Template panels, Bulk edit, or any share
action. Read-only of current state: NEVER mutates the grid, NEVER autosaves, no network on `/`, no
POST/PUT on `/w/<id>`. Each item is shaped by this app's own repeated panel failures.

**1. Trigger — a FIRST-CLASS, scoped "QA / check" affordance, NOT another share (heed
added-feature-buried-panel + share-concept-clutter, both repeat blockers here).** A primary,
visually distinct **"Run Launch Check"** button with a **checklist/shield icon** and a one-line
sublabel **"Check every link in this batch before you launch."** It is a top-level action in flow,
on the FIRST scan of the page — never inside a collapsed disclosure, the sidebar, or at the bottom
of a rail.
- **Placement:** in its OWN slim labeled strip directly **above the grid** (in normal flow), beside
  / just under the **"Audit URLs"** entry point — the two form one **"Check / QA"** group, kept one
  logical group APART from the share cluster ("Copy share link" / "Create shared workspace" / "Share
  style guide") so it never reads as a share. Tag the group **"Pre-launch QA"** so a marketer reads
  the purpose in 5 seconds.
- **`/w/<id>`:** same button, same strip above the grid, BELOW the synced banner — distinct from the
  banner's share/History actions. Its "no network / read-only" claim is mode-aware (it makes no
  write; copy never says "client-side" on the server-backed page — say "Reads this workspace without
  changing it.").
- **Mobile (375px):** full-label accent button in the top action stack (never icon-only, never
  collapsed), ≥44px.

**2. Verb/concept disambiguation — Launch Check ≠ Audit URLs (heed
same-verb-adjacent-controls-read-as-broken).** The two QA-group actions carry distinct one-sentence
helpers and never share a verb; the word **"Audit"** NEVER appears in Launch Check copy:
- **"Audit URLs"** → helper **"Paste finished links from elsewhere to pull them into the grid."**
  (inbound: brings external URLs IN.)
- **"Run Launch Check"** → helper **"Check every link in this batch before you launch."**
  (read-only: scores what's ALREADY in the grid.)

**3. Compliance Report — full-width summary panel ABOVE the grid, visually DISTINCT from the violet
paste-Audit panel (heed audit-result-feature-needs-summary-above-the-grid, R1=3/10 when violated).**
The report renders as a full-width panel in normal page flow directly **above the grid** (pushing it
down) — NEVER inside grid columns, never behind a sticky column or side rail, never an overlay.
- **Distinct identity from AuditSummaryPanel:** the paste-audit panel is **violet**; the Compliance
  Report uses a different accent — a **slate/teal "QA report" treatment** with a checklist/shield
  glyph and a clear title **"Launch Check — Compliance Report"** so the two never read as the same
  thing.
- **Scorecard (top):** three big counts — **N links checked · N passing · N with issues** — passing
  in green, issues in amber; a thin pass-ratio bar. A fully-clean grid shows the success state
  **"All N links pass"** (green, check glyph) and lists no issues.
- **Issues (below):** grouped by issue type/field; each line names **row # + field/cell + the
  existing lint message** (required, lowercase, no-spaces, inconsistent, off-spec, off-template,
  invalid-url, base-utm). Each line is a quiet jump-to-row affordance.
- **Actions (in the panel):** **"Download report (CSV)"** (one row per violation: row #, base URL,
  field, value, issue type, message; a single all-clear row when clean) and **"Copy summary"**
  (plain-text summary). A small **×** dismisses the panel; re-running refreshes it in place.

**4. "Copy summary" cue — peripherally unmissable, ref-stable (heed
copy-confirmation-survives-tick-rerender, THE recurring R1 dominant blocker on this app).** On
click, the button label flips IN PLACE to **"Copied!"**, the button fills solid green with a check,
and holds **~1.8s** before reverting — backed by `aria-live="polite"`, on a **ref-stable timer that
survives the grid's re-render** (reuse the exact proven pattern from "Copy share link"). Clipboard
write uses the **execCommand/textarea fallback** when `navigator.clipboard` rejects, so the green
"Copied!" still fires in blocked-clipboard contexts. No corner toast that scrolls off.

**5. Mobile (375px) — stack, full-width, nothing occluded (heed
mobile-sticky-overlay-occludes-tap-targets).** The trigger, the Compliance Report panel, and BOTH
**"Download report (CSV)"** / **"Copy summary"** buttons stack full-width, each ≥44px, with no
horizontal scroll. The report panel renders in flow above the card list, pushing cards down — never
a sticky/fixed overlay over a card, checkbox, row control, or "Fix to <value>" chip. The green
"Copied!" cue fires on the button itself at 375px.

### 5-second check (Launch Check — unchanged above the fold)
Cold visitor still sees the unchanged hero (headline, subhead, pre-filled example row + Copy) and no
report (Launch Check renders nothing until clicked). The **"Run Launch Check"** button — icon +
"Check every link in this batch before you launch." — sits in the labeled **Pre-launch QA** group
above the grid, clearly distinct from "Audit URLs" and from every share action, so a marketer
opening the builder cold understands in 5s: this checks my whole batch before launch.

## Bulk QR codes for tagged links (added 2026-06-14)

ONE new capability: a **per-row QR popover** and a **bulk "Download QR codes"** action, both 100%
client-side over the existing generated-URL column. A marketer pastes a tagged link into a deck,
a print flyer, or a retail/event sign by scanning instead of retyping. Additive only — do NOT
redesign the app; do NOT touch the headline, subhead, lint toggles, grid layout, Presets,
Campaigns/UTM-Spec/Naming-Template panels, the Bulk-edit bar's existing two verbs, CSV, Audit URLs,
Launch Check, or any share action. Read-only-safe everywhere: QR generation only READS already-
loaded grid state — it NEVER mutates the grid, NEVER autosaves, NEVER POSTs/PUTs (zero network after
page load on `/`; no write on `/w/<id>`). Cold open shows no popover until a QR button is clicked.
Each item is shaped by this app's repeated panel failures (buried-but-working features; verb
collision; mobile occlusion; copy/result cues that don't survive a re-render).

**1. Per-row "QR" button — discoverable on the row, never a bare glyph (heed
added-feature-buried-panel).** Each row whose generated URL is valid/non-empty exposes an inline
**"QR"** button (small **QR-square icon + the literal word "QR"** — never an unlabeled glyph) inside
the existing **fixed-width row-actions column to the RIGHT of the Generated-URL cell** (the Fix F
column that already holds Copy / Duplicate row / Delete row), placed **immediately beside the per-row
Copy** so it reads as "do something with this URL." Same secondary button styling/weight as its
neighbors. A row with an empty/invalid generated URL shows the QR button **disabled with a tooltip
"Add a valid URL to make a QR."** — never hidden silently, never crashing.
- **On click → a small popover/inline panel anchored to that row** renders the QR (generated in a
  client effect / on the click via the `qrcode` lib — NEVER in a useState lazy initializer, no
  window/document reads during render) of that row's **FULL generated tagged URL including every
  `utm_*` param**. The panel contains, top to bottom: the rendered QR (~160px), the **exact URL
  string it encodes** (small, mono, selectable, wrapping — so the user can verify what's encoded),
  and two buttons **"Download PNG"** and **"Download SVG"**.
- **Dismiss + z-stack:** the popover closes on **click-out** (pointerdown outside it) AND on **Esc**,
  and on opening a different row's QR (only one open at a time). It z-stacks **ABOVE all cell
  affordances and the sticky/pinned column** (z-index over the Fix F actions column + sticky header),
  rendered so it is NOT occluded and never sits behind a cell. On desktop it opens toward the cell's
  free side (won't clip off the right edge of the grid container).

**2. Bulk "Download QR codes" — distinct verb, in the Bulk-edit bar, scope stated inline (heed
same-verb-adjacent-controls-read-as-broken + verb-collision, the recurring bulk blocker).** A
**"Download QR codes"** action (QR-square + download icon) lives in the existing **Bulk-edit bar**,
visually **set apart from the bar's two edit verbs** ("Set column" / "Find & replace in column") by a
thin divider and its own small "Export" sub-label — and distinct from every share/export/check
control (Copy share link / Create shared workspace / Copy workspace link / Share style guide / Run
Launch Check / Audit URLs / Import CSV / Export CSV). The word "QR" + the download glyph keep it from
ever reading as a column edit or a duplicate of CSV export.
- **Selection semantics inline, mirroring the existing bulk ops:** it uses the SAME row-selection
  model and shows the SAME live **"Apply to:"** indicator — **"Apply to: all 5 rows"** (none selected)
  / **"Apply to: 2 selected rows"** (accent-tinted, heavier weight when narrowed), so the user knows
  before clicking that none-selected = all rows. On click it generates a QR for every TARGETED row
  with a valid generated URL and downloads a **ZIP** (`jszip`): one PNG per row named by the stable
  scheme (zero-padded row # + slugified `utm_campaign`, falling back to the zero-padded row # when
  campaign is empty), PLUS one printable **contact-sheet PNG**. Rows with empty/invalid URLs are
  **skipped**, never dropped silently, never a crash.
- **Confirmation cue — peripherally unmissable, ref-stable, survives re-render (heed
  copy-confirmation-survives-tick-rerender, THE dominant blocker on this app).** After the download
  the bar shows a **green-fill-in-place result message** reading e.g. **"5 QR codes generated, 1 row
  skipped — no valid URL"** (drop the skipped clause when zero skipped: "5 QR codes generated").
  It is **NOT a corner toast**: it renders in flow on/beside the button, fills solid green with a
  check, is backed by **`aria-live="polite"`**, and is held on a **ref-stable timer (~3s) that
  survives the grid's re-render** (reuse the proven Copy-share-link / Copy-summary pattern). An
  all-skipped run (no valid URLs in scope) reads **"No QR codes — no rows have a valid URL yet."**

**3. Discoverability is FIRST-CLASS (this app has repeatedly burned panel rounds on buried-but-
working features).** Concretely: the per-row **"QR"** (icon + label) sits in the Fix F row-actions
column right next to Copy on EVERY valid row — obvious on the row without hunting. The bulk
**"Download QR codes"** (icon + label + "Export" sub-label) sits in the always-present Bulk-edit bar
above the grid header — obvious in the toolbar. Neither is behind a hover-reveal or a collapsed
disclosure on desktop. Crowding guard: the row already carries Copy/Dup/Delete, so QR is the row's
4th icon — keep the actions column fixed-width with the URL cell truncating to ellipsis (Fix F) so
adding QR never pushes buttons onto the URL text; if width is tight, the QR button is icon+"QR" at
the same compact size as the others, not a wider pill.

**4. Mobile (375px card view) — reachable, operable, nothing occluded (heed
mobile-sticky-overlay-occludes-tap-targets).** In the ≤640px card view the per-row **"QR"** button
joins the card's **top-bar row-action cluster** (alongside Duplicate row / Delete row), each ≥44px,
icon+label, in normal card flow — no sticky/pinned anything. Tapping it opens the QR panel **stacked
BELOW that card's fields at constrained width, in flow** (pushing content down) — it NEVER overlays a
field, checkbox, or button, NEVER squeezes the editable inputs, and the QR + URL + PNG/SVG buttons
fit the 375px width with **no horizontal scroll**; the panel z-stacks above any cell affordance.
Esc/tap-out dismisses. The bulk **"Download QR codes"** lives in the **"Bulk edit"** disclosure under
the top action stack, full-width and ≥44px when expanded; its green result message renders full-width
in flow under the button, never a corner toast that scrolls off.

**5. Identical on `/` and `/w/<id>`, read-only-safe (heed read-only-page-must-not-write).** Both
surfaces work the same on the main builder and on workspace pages. On `/w/<id>` the QR button sits in
the same row-actions / card top-bar position, BELOW the synced banner, and generating a QR (per-row
OR bulk) fires **NO POST/PUT** — a `GET /api/workspace/<id>` before equals one after; QR reads only
the already-loaded workspace state and does not trip autosave. Any "client-side / no network" wording
is mode-aware: on `/w/<id>` say "Built here without changing this workspace," never a stale
zero-network claim.

### 5-second check (Bulk QR — unchanged above the fold)
Cold visitor still sees the unchanged hero (headline, subhead, pre-filled example row + Copy) and no
QR popover (nothing renders until a QR button is clicked). On the example row, the **"QR"** button
(icon + label) is visible beside Copy in the row-actions column, and **"Download QR codes"** sits
labeled in the Bulk-edit bar with its live "Apply to: …" scope — so a marketer instantly sees both
the per-row and whole-batch ways to turn tagged links into scannable codes, without hunting.

### Bulk QR — Round 1 fixes (panel R1: 2/10 at the 9-bar — Marcus, Tomás)

Clarity 10/10 Yes, value 9/10 Yes (Elena the lone value=No, caused entirely by broken mobile QR);
the QR CRAFT (zero-network client-side gen, true-vector SVG, printable contact sheet, popover showing
the exact encoded URL) tested WELL — do NOT regress it. The gap is one data-integrity bug across 4
testers plus three craft fixes and two cheap carries. Additive / logic / CSS / copy only — do NOT
touch the headline, subhead, lint toggles, grid layout, the QR concept/placement/verbs, or any other
panel. Each fix maps to a synthesis group; fixes ranked by testers unblocked.

**Fix 1 — QR eligibility = no BLOCKING lint error (P0; Group 1: Wen, Dana, Rob, Sam — biggest
lever, 4 testers).** Today "skip" only drops blank/unparseable generated URLs, so an INCOMPLETE row
(missing required utm_source/medium/campaign, or an invalid URL) still ships a QR — a printed code
pointing to an UNTRACKED link, and an overcounted "N generated." Redefine eligibility, both paths:
- A row is **QR-eligible ONLY if** it has a non-empty parseable generated URL **AND** no BLOCKING lint
  error (missing-required-param OR invalid-URL). Rows with only **style/consistency warnings** (case,
  cross-row, off-spec taxonomy, off-template) **still generate** — those are quality nags, not
  link-breaking errors. **Reuse the existing lint engine (`lintRows`)** to decide blocking-vs-warning;
  add NO new lint logic.
- **Bulk:** generate ONLY for eligible targeted rows; skip the rest and name the reason in the result:
  **"N QR codes generated, M skipped — incomplete or invalid URL"** (drop the skipped clause at M=0).
  The count must mean VALID, never "parseable." An all-skipped scope reads the existing
  **"No QR codes — no rows have a valid URL yet."**
- **Per-row:** the per-row **"QR" button is disabled (with a tooltip)** on a non-eligible row by the
  SAME rule — extend the existing "Add a valid URL to make a QR." disabled state to cover the
  missing-required-param case, not only empty/invalid URLs.

**Fix 2 — Mobile per-row QR: inline, visible, no scroll-jump, real downloads (P0; Group 2: Elena
value=No adv 4, Sam — the value=No fix).** On a phone, tapping a card's **"QR"** today bounces the
page to the top and renders no visible QR (only a toast); per-row Download PNG/SVG fire no file.
Fix all three:
- Clicking **"QR"** on a card MUST render the QR image **inline in the card's flow** (the panel
  stacked below that card's fields, per the existing mobile design) with **NO scroll-jump** — do NOT
  move focus or scroll to the page top; the tapped card stays put and the QR appears beneath it.
- The rendered QR must be a **genuinely visible image** on screen (so a phone user has a usable path
  even when they can't open a ZIP on iOS) — this is the path Elena needs; a toast alone is not it.
- **Download PNG / Download SVG must actually produce a file on mobile Safari + Chrome:** use a
  **blob URL + a programmatic anchor with the `download` attribute** (not a bare `data:` URI, which
  iOS Safari frequently blocks), with an **open-in-new-tab fallback** if the browser blocks the
  download so the user can long-press-save. Verify a file lands at 375px on Safari and Chrome.

**Fix 3 — Channel-aware filenames + contact-sheet labels (P1; Group 3: Dana, Jules).** Today QR PNG
filenames and contact-sheet labels use **utm_campaign only**, so multiple rows of ONE campaign across
channels are indistinguishable on a printed sheet. Add channel context:
- **PNG filename** includes **utm_source and/or utm_medium** alongside row # and campaign, e.g.
  **`01-spring_sale-newsletter-email.png`**. **Contact-sheet label** likewise, e.g.
  **`01 · spring_sale · newsletter/email`**.
- Keep all values **slugified (filesystem-safe)** and the row-# zero-padded so ordering is **stable**;
  fall back gracefully (omit an empty source/medium segment) so a row missing a channel field still
  produces a valid, distinct name.

**Fix 4 — Desktop popover anchored beside its trigger, clamped in viewport (P1; Group 4: Aisha,
Jules).** Today the per-row popover lands at page bottom-right overlapping the Allowed-values panel /
below the fold, so it reads as "nothing happened" on first click. Anchor it **adjacent to its trigger
row** and **flip/clamp it to stay within the viewport** (open toward the cell's free side; flip
up/left when there's no room below/right) so it NEVER lands at page-bottom and **never overlaps the
Allowed-values / Campaigns / UTM-Spec / Naming-Template config panels**. The QR + encoded URL +
Download buttons must be fully visible at the click position on 1280–1440px with the sidebar open,
without scrolling.

**Fix 5 — Cheap carried (P2; Group 5: Wen, Tomás, Sam).** (a) Add a **UTF-8 BOM (`EF BB BF`)** to the
**Export CSV** download so non-ASCII campaign names don't mojibake on double-click into Excel —
match whatever the Launch Check Compliance-Report CSV already does (keep them consistent). (b) Ensure
**Launch Check "Copy summary"** shows the peripherally-unmissable **green-fill-in-place + `aria-live`**
confirmation on **mobile** too (the cue currently doesn't fire at 375px) — reuse the proven
copy-confirmation-survives-tick-rerender pattern; no corner toast that scrolls off.

**Do NOT build this round (deprioritized, with reason):** Priya's read-only `/guide` "Open the
editable workspace" link is the BY-DESIGN viral on-ramp (secret-link = the access-control capability)
— keep it, it is not a bug; Priya's Launch Check typo "did-you-mean" suggestion and Rob's PNG-DPI
option are out-of-scope feature requests (the true-vector SVG already covers print); Marcus's "busy
toolbar" is a longstanding separate concern and he passes at 9. Single-persona P3s (Aisha's
contact-sheet single-row overflow + muted "QR" styling, Tomás's PNG/SVG accessible-name collision) —
address only if free.

#### 5-second check (Bulk QR Round 1 — unchanged above the fold)
Cold visitor still sees the unchanged hero and no QR popover. On the example row the **"QR"** button
sits beside Copy; it is now **disabled (tooltip)** on any row with a blocking lint error so a printed
QR can never point to an untracked link, and the bulk result honestly reads **"N QR codes generated,
M skipped — incomplete or invalid URL"**. On a phone, tapping **"QR"** renders a **visible QR inline
below the card** with working PNG/SVG downloads and no scroll-jump; QR filenames and contact-sheet
labels now name the channel (`01-spring_sale-newsletter-email.png`); the desktop popover opens beside
its trigger within the viewport; Export CSV carries a UTF-8 BOM and Launch Check "Copy summary"
confirms on mobile.

### Bulk QR — Round 2 fixes (panel R2: 7/10 at the 9-bar — up from 2/10)

Clarity 10/10 Yes, value 10/10 Yes — the QR feature is clear, wanted, and now trusted (eligibility,
channel filenames, contact sheet, desktop popover, CSV BOM all verified across the panel). Exactly
TWO craft fixes flip the bar, each tied to one sub-bar tester who gave an explicit "do X → 9". Both
are QR-popover-scoped, low regression risk. Additive / logic / CSS only — do NOT touch the headline,
subhead, lint toggles, grid layout, the QR concept/placement/verbs, the eligibility rule, channel
filenames, the contact sheet, or any other panel. **Explicitly NO whole-app hero/layout reshuffle
this round** (Elena's "grid sits below ~6 feature cards" is a deferred dedicated-layout pass, NOT
in scope here — re-ordering the landing risks regressing the 7 passing testers).

**Fix 1 — Card-view (mobile ≤640px) per-row Download PNG/SVG must produce a REAL file (P0; Sam 8).**
The per-row popover's **"Download PNG" / "Download SVG"** fire NO file in the **CARD-VIEW** instance
on mobile (0/3 at 375px, no error), even though the **identical buttons work in the desktop
TABLE-VIEW** instance. The Round-1 blob-download fix landed on the table-view popover only; the
card-view popover never invokes it (the bug points to a stale/different handler on the card
instance). Fix:
- The card-view popover's Download PNG/SVG MUST use the **same Blob + object-URL + programmatic
  `<a download>` (revoke after)** path that already works on desktop — wire the card instance to the
  SAME handler, not a stale/different one. Keep the existing iOS open-in-new-tab fallback so a
  blocked download still lets the user long-press-save.
- **Verify a file actually downloads at 375px on mobile Safari AND mobile Chrome** from the card-view
  popover (not just the table view). This is the device Sam lives on and it was reported fixed last
  round, so the verification at 375px is mandatory, not optional.

**Fix 2 — Per-row QR popover must read as TETHERED to its trigger + show the full encoded URL (P1;
Aisha 8).** The popover now stays in-viewport (Round-1 fix verified at 1280/1440px) but **floats
~350px above its trigger row with no caret/arrow**, so the row association is lost; and the encoded
URL is **hard-clipped mid-string** with no ellipsis/tooltip/copy, reading as unfinished. Fix both,
on **desktop AND card view**:
- **Tether it:** add a **caret/arrow pointing at the row's QR trigger button** (or position the
  popover immediately adjacent to it) so the row association is obvious — while KEEPING the existing
  viewport clamp/flip from Round 1 (do not regress the anchoring fix that just landed).
- **Show the full URL, never hard-clipped:** the encoded-URL display must **wrap or ellipsis** (no
  `white-space:nowrap` + `overflow:clip` mid-string cut), carry a **`title`/tooltip with the full
  value**, and offer a **small copy affordance** that reuses the app's existing green copy-
  confirmation cue (ref-stable, `aria-live`, the proven copy-survives-rerender pattern). Aisha
  stated: caret tether + ellipsis-or-copy → she goes to 9.

**Do NOT build this round (deprioritized, with reason):** Elena's hero/feature-card layout reshuffle
(whole-app landing change, regression risk to 7 passing testers — candidate for a future dedicated
layout pass) and her shareable read-only Launch Check link for a cold user (needs a server
workspace). Non-blocking nits from PASSING testers stay unactioned: Wen (skipped-count more
prominent), Dana (contact-sheet label raw casing vs slug filename), Tomás (a11y accessible-name
overlap on Download buttons), Jules (X/Mastodon/Buffer presets out of the box), Priya (separate
read-only share token), Rob (PNG DPI option).

#### 5-second check (Bulk QR Round 2 — unchanged above the fold)
Cold visitor still sees the unchanged hero and no QR popover. On a phone, the per-row QR popover's
**Download PNG/SVG now save a real file at 375px** (card view), matching desktop; the popover reads
as **tethered to its row** (caret/adjacent) and shows the **full encoded URL** (wrapped/ellipsis +
tooltip + a copy button) instead of a mid-string clip — while the Round-1 viewport-clamp anchoring
stays intact. No landing/hero/feature-card layout changed this round.

## Workspace Review & Approval — two-way pre-launch sign-off (added 2026-06-14)

ONE new capability, ONLY on Team Workspace pages (`/w/<id>`): turn the one-way shared workspace into
a two-way **review loop**. A teammate acts as a **REVIEWER** (no account) — sets a reviewer name once
(anonymous, localStorage, NEVER blocks the cold-open editable grid), then marks each link row
**Approved** or **Needs changes** with an optional short note. Everyone on the workspace sees a live
**review roll-up** and per-row state, plus a shareable READ-ONLY **`/w/<id>/review`** summary page for
a stakeholder. Server-persisted (it's a shared workspace), free-tier (reuses the existing workspace
payload / Turso — no new credential). Additive only — do NOT touch the headline, subhead, lint
toggles, grid layout, Presets, Campaigns/UTM-Spec/Naming-Template panels, Bulk edit, CSV, Audit URLs,
Launch Check, QR, or any share action. NONE of this exists off `/w/` pages: the main builder, Rung-1
share link, Campaigns library, presets, and a cold `/` open have zero review state. Each item is
shaped by this app's repeated panel failures.

**1. Distinct verb — "Review" / "Approve" / "Needs changes", never a near-duplicate of an existing
control (heed same-verb-adjacent-controls-read-as-broken).** The app already has "Paste & Audit",
"Run Launch Check", and the share cluster. Review uses its OWN word family — **"Review"**,
**"Approve"**, **"Needs changes"** — and its OWN color identity (a distinct **indigo/blue "review"
accent**, NOT the slate/teal Launch-Check QA treatment, NOT the violet off-spec lint, NOT the amber
case/space lint). The roll-up panel is titled **"Workspace Review — Approval Status"** so a skimmer
never confuses it with Launch Check (which scores lint) — Launch Check answers "is the naming
clean?", Review answers "did a human sign off?". The two never sit in the same strip.

**2. Reviewer-name entry — set once, optional, NEVER blocks the cold-open grid (heed anonymous-first;
the editable grid must never be gated).** A small **"Reviewing as: [name]"** control in the review
roll-up panel header (mirrors the existing History "Editing as:" pattern). Default **"Anonymous"**;
clicking reveals an inline pre-filled field (Enter commits, Esc cancels), stored in **localStorage
per browser** — never required, never an account, never an email, and it NEVER blocks loading or
editing the grid. The grid is fully usable before any name is set; the name is only attached to
review marks the user makes. A reviewer who never sets a name still reviews — marks just show
"Anonymous".

**3. Roll-up panel — FULL-WIDTH SUMMARY ABOVE the grid, in normal flow, default visible (heed
added-feature-buried-panel-surfaces-not-function — 4 recurrences — and
audit-result-feature-needs-summary-above-the-grid).** The live review roll-up renders as a
**full-width panel in normal page flow directly above the grid** on `/w/<id>` (below the synced
banner, above/separate from the Pre-launch-QA strip), pushing the grid down — NEVER per-cell-only,
NEVER a collapsed disclosure at the bottom of a side rail, NEVER inside grid columns, NEVER an
overlay. It is **default-visible** on every `/w/<id>` page (a `×` collapses it to a one-line
**"Review: 12 approved · 3 need changes · 5 unreviewed"** chip that re-expands on click — it is never
hidden by default). Panel contents:
- **Title** "Workspace Review — Approval Status" + the **"Reviewing as: [name]"** control.
- **Live roll-up counts** (the headline number): **"12 approved · 3 need changes · 5 unreviewed"**
  out of N total — approved in green, needs-changes in amber, unreviewed muted, with a thin
  three-segment ratio bar. Updates the instant any row mark changes (and on workspace refresh).
- A short mode-aware line (see item 7) and, when every row is approved, a clear
  **"All N links approved — ready to launch"** success state (green, check glyph).

**4. Per-row review affordance — COMPACT, never a wide squeezing column (heed
side-panel-squeezes-grid-hides-editable-columns, readonly-wide-column-must-be-width-capped-from-build,
container-resize-leaves-hardcoded-width-children; NO horizontal overflow at 1280px).** The per-row
review control must NOT be a wide inline grid column that pushes the 6 editable UTM columns
off-screen. Concretely, on the desktop table (≥640px):
- Add ONE **fixed-width, narrow review cell** as the **leftmost column** (next to the existing bulk
  select checkbox, LEFT of the row data) — a compact **state badge/button ≤ ~72px wide** showing the
  row's current state: a muted **"Review"** prompt when unreviewed, a green **"Approved ✓"** badge, or
  an amber **"Needs changes"** badge. It is a single small control, NOT separate Approve + note +
  reviewer-name columns inline. The note + reviewer name do NOT get their own grid columns.
- Clicking the badge opens a **small popover anchored to that row** (indigo accent, reuse the proven
  viewport-clamped/tethered popover pattern from QR) containing: an **Approve** button, a **Needs
  changes** button, an optional short **note** input, and (read-only) the reviewer name. Choosing a
  state sets the badge, records reviewer + note + timestamp, closes the popover, and updates the
  roll-up. The reviewer name + note surface as a small `title`/tooltip + a one-line muted sub-row
  under the badge (truncated, ellipsis) — never as wide inline columns.
- **Width budget (must verify at 1280px with Enforce ON + a long generated URL):** the review column
  is fixed-width and capped FROM THE BUILD (no hardcoded `w-NN shrink-0` that escapes the container);
  all 6 editable UTM columns + the Generated-URL column stay visible/readable, and there is **NO
  horizontal PAGE scroll at 1280px**. If width is tight, the review state lives only in the narrow
  badge + popover — never expand it into a multi-column inline block.

**5. Mobile (375px card view) — tappable, in flow, nothing occluded (heed
mobile-sticky-overlay-occludes-tap-targets; CSS-responsive only, no JS viewport detection).** In the
≤640px card view, the per-row review badge joins the card's **top-bar action cluster** (alongside the
select checkbox / Duplicate row / Delete row), ≥44px, icon+label, in normal card flow — no
sticky/pinned anything. Tapping it opens the Approve / Needs-changes / note popover; the popover
**z-stacks ABOVE all cell affordances and any sticky element** (high z-index) so the tap lands on the
control, never a cell behind it, and it renders in/near card flow at constrained width with **no
horizontal scroll**, never squeezing the editable inputs. The roll-up panel spans full width above
the card list, in flow. Verify at 375px with elementFromPoint that each review tap lands on its own
control. Pure CSS breakpoints — the badge/popover exist in both layouts; breakpoint-suffix any shared
`data-testid` (per the dual-mount lesson).

**6. Read-only summary page `/w/<id>/review` — mirrors `/guide` and `/check` (DOCUMENT, not a tool;
NEVER writes).** A separate route rendering the workspace's review state as a single legible,
link-shareable page for a stakeholder who needs to KNOW the sign-off status WITHOUT editing. It is
**TRULY READ-ONLY**: it only GETs the workspace payload (reuse the existing GET, no new
schema/table/credential) and makes **NO PUT/POST, never autosaves, never writes localStorage** (a
read-only page that writes back can clobber the workspace).
- **5-second read:** a stranger landing on `/w/<id>/review` understands within 5s "this is where the
  campaign gets signed off before launch." Lead with an **h1** "Campaign Review — Approval Status" +
  a one-line description, then the same roll-up counts (12 approved · 3 need changes · 5 unreviewed +
  ratio bar / "All N approved — ready to launch"), then a read-only list of EVERY link showing its
  generated URL (truncate/wrap), its state badge, the reviewer name, and the note. NO editable inputs
  anywhere (no buttons that change state, no text boxes).
- **Empty/zero-review state (graceful, never blank):** if no row has been reviewed yet, still render
  the page with the roll-up reading **"0 of N reviewed"** and a friendly line **"No links reviewed
  yet — open the workspace to start the sign-off."** plus the link list (all "Unreviewed"). Never a
  blank page.
- **CTA card:** prominent **"Open the workspace to review →"** linking to `/w/<id>` (the on-ramp).
- **Not-found:** `/w/<bad-id>/review` shows the standard **"Workspace not found"** + link back to the
  builder — mirror `/w/<id>` and `/guide`, never a crash/blank.
- **Mobile (375px):** fully legible top-to-bottom, no horizontal scroll, list rows + badges + notes
  wrap.

**7. Mode-aware privacy copy — review state is SERVER-PERSISTED (heed
server-layer-makes-client-side-privacy-claims-a-trust-bomb).** Review marks live on the shared
workspace server (it's how everyone sees the live roll-up), so NO "client-side only" / "nothing
leaves your browser" wording anywhere on the review roll-up OR the `/w/<id>/review` page. State it
honestly + name the access control: **"Review status is saved on this shared workspace — anyone with
this secret link can see and add reviews."** (The local builder's zero-network prop is untouched —
this copy appears ONLY on `/w/` review surfaces.)

**8. Discoverability of the shareable review page FROM `/w/<id>` (heed added-feature-buried-panel;
share-concept-clutter — don't let it blur with the existing share cluster).** Add a **"Share review
summary (read-only)"** action with sublabel **"a page stakeholders read without editing"** to the
existing `/w/<id>` **share cluster** (alongside "Copy share link (snapshot)" / "Create shared
workspace (live, synced)" / "Share style guide (read-only reference)"), grouped + distinctly labeled
so the four read as distinct members of one group. Clicking COPIES the `/w/<id>/review` link with the
app's **peripherally-unmissable green-fill-in-place "Copied ✓"** confirmation that **survives
re-render** (ref-stable timer, `aria-live="polite"`, execCommand/textarea clipboard fallback) — reuse
the established copy-cue pattern; never a fast-fading corner toast. Verify the cue fires at 375px.

### 5-second check (Workspace Review & Approval)
- **On `/w/<id>` (unchanged above the fold for the builder; this is the workspace surface):** the
  hero/grid loads normally and is editable WITHOUT setting a reviewer name; directly above the grid
  the **"Workspace Review — Approval Status"** roll-up panel is visible by default reading
  **"12 approved · 3 need changes · 5 unreviewed"** with its indigo accent + ratio bar, so anyone
  lands and sees the sign-off state in 5s. Each row carries a compact state badge in the narrow
  leftmost review column (Approved ✓ / Needs changes / Review) — and all 6 editable UTM columns stay
  visible at 1280px.
- **On `/w/<id>/review` (the read-only summary):**
  - **Headline (h1):** "Campaign Review — Approval Status".
  - **Subtitle (one line):** "Where this campaign gets signed off before launch. Read-only summary."
  - **Primary action:** none to perform — the page IS the outcome; the prominent **"Open the workspace
    to review →"** CTA card is the on-ramp, visible near the top.
  - **Pre-filled example:** the first visible content is real workspace data — the live roll-up counts
    + ratio bar and the per-link state badges with reviewer names/notes — never a blank box (empty
    state shows "0 of N reviewed" + the friendly start line).

## Workspace Review & Approval — Round 1 panel fixes (2026-06-14)

Panel R1 = **0/10 at the 9-bar** (Priya 8, Marcus 8, Wen 6, Tomás 8, Dana 7, Jules 7, Aisha 7, Rob 8,
Elena 7, Sam 6). Clarity + value near-unanimous Yes (Elena partial clarity). One dominant blocker
caps every score, plus a few real secondary bugs. Additive / CSS / logic / copy only — do NOT touch
the headline, subhead, lint toggles, grid layout, Presets, Campaigns/UTM-Spec panels, Bulk edit, CSV,
the ≤640px card view, or the ≥640px desktop table. Keep ALL existing invariants: anonymous-first (name
always optional, never blocks editing), NO horizontal overflow at 1280px (Rob confirmed clean — do not
regress), mobile tappable, mode-aware server-persisted copy, distinct "Review/Approve/Needs changes"
verb + indigo accent. Re-tests all 10 (no carry-forward). Each fix maps to a synthesis cause + the
testers behind it.

**Fix A — UNIFY to ONE identity; approvals must NEVER log "by Anonymous" (P0, THE blocker; Cause A —
Priya, Wen, Tomás, Dana, Jules, Aisha, Rob, Elena, Sam = 9/10).** Root problem: a visible "Your name"
/ "Editing as" identity drives edit attribution, but review uses a SEPARATE hidden "Reviewing as"
identity that confuses (two labels), doesn't persist across reload, and never attaches to the
approval — so every approval reads "by Anonymous" on `/w/<id>` and `/w/<id>/review`. Fix:
- **Collapse to ONE canonical identity.** A single **"Your name"** control on `/w/<id>` drives BOTH
  edit attribution AND review attribution — one canonical localStorage identity key. For backward
  compat, READ the old reviewer-name / editor-name keys if present, but WRITE and SHOW exactly one
  name. There is no second "Reviewing as" concept; "Editing as: <name>" and the review attribution are
  the same name. Eliminate the dual-label confusion Dana/Aisha/Rob flagged.
- **It MUST persist across reload.** Read the name from localStorage in an **effect** (not a lazy
  initializer that can race hydration), so a reload never reverts to "Anonymous" and never flickers
  "Editing as: Wen" → "Anonymous" (Wen, Priya, Sam). Name stays sticky.
- **The name MUST bind to the review record.** When a user marks Approved / Needs-changes,
  `ReviewEntry.reviewer = that name`; it shows on the row tooltip/sub-row AND on `/w/<id>/review` —
  never "by Anonymous" once a name is set. Anonymous-first is preserved: an unnamed user can still
  review; the mark just reads "Anonymous".
- **Surface identity AT THE POINT OF ACTION.** Inside the review popover, show **"Reviewing as:
  <name>"** with an **inline name field** so a user with NO name set can name themselves RIGHT THERE
  before confirming Approve / Needs-changes. An approval must never silently log "Anonymous" without
  the user having had the chance to name themselves in the popover. Setting the name here writes the
  same canonical identity (so it persists and back-fills the header label too).

**Fix B — Note must reliably persist + render on `/review` (P1; Cause B — Wen, partly Sam).** The
per-row "Needs changes" NOTE currently has no save (only "✓ Approve") and is dropped on blur+reload,
absent on `/review`. Fix: **autosave the note on commit/blur** (and when a state is chosen) as part of
the same server-persisted review record — no separate save button required, but committing must
reliably write it. After reload the note re-renders in the popover/row sub-row AND on
`/w/<id>/review`. The note is the actionable rejection reason; it must survive.

**Fix C — Review popover open + position (P1; Cause C — Aisha, Jules, echoed Rob).**
- **First-click must open the popover even after using "Your name."** Today the popover won't open if
  you FIRST focus/fill the name field — a first-click-swallowed / focus-blur race (and the UI nudges
  setting a name first, so most users hit it). Render the popover **synchronously on first click**;
  do not let an onBlur / auto-focus handler eat the first click. Verify: fill the name field, then
  click a row's Review badge — popover opens on that single click.
- **Anchor it visible without scrolling (desktop).** The popover currently opens BELOW the row and
  falls under the fold (Jules: Approve ~y1036 on a 900px viewport; Rob: "feels like the click did
  nothing"). Position/flip the popover so Approve / Needs-changes are visible without scrolling — reuse
  the proven viewport-clamped/tethered popover pattern, flipping above the row when below would clip.

**Fix D — `/w/<id>/review` mobile layout at 375px (P1; Cause D — Sam).** The Needs-changes note text
collides with the URL/medium and the URL truncates to "h." Fix the `/review` responsive row layout so
at 375px each link's **URL, medium, status, reviewer, and note are each readable** — STACK them
vertically (label-over-value, full-width, wrapping/selectable URL), never mash note over URL. No
horizontal scroll. (Keep the otherwise-clean `/review` mobile render Dana/Jules/Elena praised.)

**Fix E — Per-row review chip label legible at 1280px (P1; Cause E — Marcus).** The row review chip
truncates to "Needs cha…" at 1280px. Give the chip enough width to read fully, OR use a shorter
label / icon+short-word ("Changes", or warning-glyph + "Needs changes" tooltip) — whichever reads
fully at 1280px WITHOUT re-introducing horizontal overflow (Rob confirmed the grid is clean at
1280/1440px — do not regress that). Keep the indigo review accent and the green "Approved ✓" state.

**Fix F — Consolidate the share cluster into ONE compact "Share ▾" (P2; Cause F — Marcus, Priya,
Aisha).** The `/w/<id>` header now stacks ~5 overlapping Copy/Share buttons (Copy workspace link /
Share style guide / Copy report link / Share review summary / Copy share link). Consolidate them into
**ONE compact "Share ▾" menu/cluster** so the toolbar reads clean and the new "Share review summary"
isn't lost in the noise. Every action stays reachable inside the menu, each with its existing distinct
sublabel. Keep the established **green-fill-in-place "Copied ✓"** cue (ref-stable timer survives
re-render, `aria-live`, execCommand fallback) on each copy action; verify it fires at 375px.

**Fix G — Roll-up copy makes the sign-off purpose obvious (P2; Cause G — Elena, Jules).** A teammate
opening a bare `/w/<id>` link must immediately understand the review/sign-off purpose. Keep review
`/w/<id>`-only BY DESIGN — do NOT add any review surface to cold `/`. The existing above-grid roll-up
panel already helps; tighten its copy so the purpose is obvious at a glance, e.g. a one-line subtitle
under "Workspace Review — Approval Status": **"Mark each link Approved or Needs changes to sign off
before launch."** No new page, no new surface — copy only.

### 5-second check (Round 1 fixes — unchanged above the fold)
- `/w/<id>`: hero/grid loads and is editable WITHOUT a name set; the **"Workspace Review — Approval
  Status"** roll-up (now with the "mark each link… to sign off before launch" subtitle) sits above the
  grid; each row carries a compact, FULLY-LEGIBLE state chip; the header shows ONE clean **"Share ▾"**.
- A review action now logs the user's real name everywhere — the popover shows **"Reviewing as:
  <name>"** with an inline name field, the name persists across reload, and `/w/<id>/review` reads
  **"approved by <name>"**, never "by Anonymous".
