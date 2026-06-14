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
