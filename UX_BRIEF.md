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
