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
