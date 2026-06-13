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
