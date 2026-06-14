# utm-grid — Panel SYNTHESIS, Round 2

Run: 20260614-015304-daily

## Score table (R1 → R2)

| Tester | R1 advocacy | R2 advocacy | Clarity | Value | Status |
|--------|-------------|-------------|---------|-------|--------|
| Priya  | 8 | 8        | Yes | Yes | Sub-bar (out-of-scope) |
| Marcus | 7 | 7        | Yes | Yes | Sub-bar (in-scope blocker) |
| Wen    | 9 | 9        | Yes | Yes | At bar |
| Tomás  | 9 | 10       | Yes | Yes | At bar |
| Dana   | 9 | 9        | Yes | Yes | At bar |
| Jules  | 8 | 9        | Yes | Yes | At bar |
| Aisha  | 8 | 9        | Yes | Yes | At bar |
| Rob    | 8 | 9        | Yes | Yes | At bar |
| Elena  | 9 | 10       | Yes | Yes | At bar |
| Sam    | 9 | 9 (carried) | Yes | Yes | At bar |

All testers: clarity = Yes, value = Yes. (Sam carried forward from round 1 at 9 — no
round2-tester10 file.)

## Exit bar

Bar = 9/10 testers at advocacy ≥ 9 + clarity Yes + value Yes.

**Current: 8/10** — Jules, Aisha, Rob, Wen, Tomás, Dana, Elena, Sam.
Sub-bar: Priya 8, Marcus 7.

## What the round-2 fixes resolved

- **Copy/share confirmation cue now unmissable** — button flips green + "Copied ✓"
  with aria-live. Jules (8→9) and Aisha (8→9) confirmed the silent-copy bug is gone;
  Sam had wanted this in round 1.
- **Grid restructured full-width with config panels below** — page horizontal scroll
  and sticky-overlap-on-load both fixed. Rob (8→9) measured zero scroll containers at
  1280/1440/1680px; Marcus independently confirmed page-scroll gone
  (scrollWidth == innerWidth == 1280) and no overlap at the landing scroll position.
- **Share-action disambiguation** — three actions now carry plain one-line sublabels
  (frozen snapshot / live synced / read-only reference) and are spatially grouped.
  Priya, Tomás (9→10), and Elena (9→10) all confirmed the set finally reads coherently.
- **Craft + empty-row + auto-fix column visibility + server-data note** — Aisha's grid
  dead-space gone; Dana confirmed input columns stay visible through Auto-fix (headers
  byte-identical); Tomás confirmed the explicit "stored on the server, secret link is
  the access control" notice, stronger than he asked.
- **No regression to power-user flows** — Wen (sentinel) verified CSV export/import
  round-trip, cross-row GA4 casing lint, Auto-fix, and naming-template hydration all
  intact, zero console errors.

## The ONE remaining in-scope blocker → Round 3

**Marcus (7).** The read-only "Generated URL" column carries a large (~896px) min-width,
so at 1280px the four right-most editable utm columns require in-table horizontal scroll
on cold load — the widest, stickiest element is the field the user doesn't type into,
while the six editable inputs are starved (he sees ~2 at once). Once scrolled, editable
cells slide under the sticky URL slab.

**Fix direction:** ellipsize/truncate the Generated-URL cell and shrink its min-width so
all six editable columns fit at 1280px without in-table scroll. Full URL stays available
via tooltip + the existing per-row copy button. Marcus: get all editable columns visible
at once at 1280 and this is a 9.

## Out-of-scope non-blocker (not a defect)

**Priya (8).** Wants a CLI-speed single-link fast path (paste-base + 3 fields +
keyboard-only + instant copy). This is a bulk grid builder by design, so the request is
deprioritized, not a bug. Priya confirmed all her actual concerns (share disambiguation)
are addressed and withdrew her other flags.

## Round-3 plan

1. Ship the targeted Generated-URL-width fix (ellipsize + reduced min-width + tooltip).
2. Re-test **Marcus** (target).
3. Sentinel-check **Wen** (data-density power user) and **Rob** (column-width sensitive),
   per the CSS-column-sizing-must-sentinel-the-density-user lesson.
4. Carry the other seven at their round-2 scores.
