# UTM Grid — Panel Synthesis, Round 1 (grid-first landing-layout pass)

**Verdict: 4/10 at the 9-advocacy bar.** The grid-first redesign is landing on DESKTOP —
every persona confirmed their prior "grid buried behind banners" complaint is fixed, the
consolidated Tools ▾ / Rules ▾ toolbar scans cleanly, and the core (cross-row lint, faithful
CSV round-trip with BOM, client-side/no-login, friendly-named workspaces) is trusted. The
sub-bar holdouts cluster on **four causes, two of them recurring across personas**: (1) the
mobile (375px) cold-open is NOT grid-first — the dominant blocker; (2) the cold open shows
empty fields instead of one worked example with a visible generated URL; (3) hero copy is a
two-line run-on sentence that leads with GA jargon, not the payoff; (4) residual share
ambiguity (3 verbs side by side) + a silent empty-grid no-op + a few polish gaps.

## Score table

| Name   | Persona                     | Clarity   | Value | Advocacy | Top fix |
|--------|-----------------------------|-----------|-------|----------|---------|
| Marcus | Frontend eng (desktop)      | Yes       | Yes   | **9**    | Consolidate the 3 side-by-side share verbs into one labeled control |
| Wen    | Marketing data analyst      | Yes       | Yes   | **9**    | One-click "standardize column to <value>" on the inconsistency warning (DEFER) |
| Dana   | Demand-gen marketer         | Yes       | Yes   | **9**    | Mobile 375px: hero + 3 cards push grid below fold |
| Jules  | Content/community marketer  | Yes       | Yes   | **9**    | Headline leads GA-analyst framing; surface platform preset chips |
| Priya  | Senior backend eng          | Yes       | Yes   | 8        | Inline per-cell Fix unreliable; Generated URL truncated, no expand |
| Tomás  | Ops analyst, Excel power     | Yes       | Yes   | 8        | Apply Auto-fix during CSV import (DEFER) |
| Aisha  | Product designer (craft)     | Yes       | Yes   | 8        | Tighten hero — run-on 2-line sentence reads like a tooltip |
| Rob    | Freelance brand designer    | Yes       | Yes   | 8        | Subhead should lead with time-saved/clean-CSV payoff, not "no login" |
| Sam    | PM, mobile-heavy            | Yes       | Yes   | 8        | Mobile: grid buried ~700px down behind hero + 3 accordions + Select-all |
| Elena  | Eng manager, phone skim     | Partially | **No**| 5        | Phone cold-open: ONE pre-filled example row w/ green generated URL above fold |

## Complaints grouped by cause (every advocacy<9 / non-Yes)

### C1 — Mobile (375px) is not grid-first  [RECURRING: Dana, Sam, Elena — the dominant blocker]
At 375px the 3-4 line hero paragraph + the full toolbar + three accordion cards (Campaign
Naming Template / Campaigns / Allowed values) + a "Select all" bar push the first editable
field ~700px down; cold mobile open shows NO grid. Sam: first BASE URL field ~700px down on a
667px-tall phone. Dana: "on my phone in a hallway I'd scroll, not type." Elena (value=No): the
device where she actually uses it still buries the grid, so the value never lands in her 30s
skim. Desktop grid-first is already good and must NOT regress. **Highest-leverage fix: it
gates Elena's value=No and both mobile personas' 8→9.**

### C2 — Cold open shows empty fields, not a worked result  [CONVERGENT: Elena, Sam; also VALIDATION P3]
Elena: "shows empty fields not a working result… I won't move 8 people off a sheet I had to
scroll and poke to understand." The build ships an empty grid even though UX_BRIEF §2/§6
already promised a pre-filled worked-example row — VALIDATION.md P3 flagged the same unbuilt
promise. A pre-filled example row with its generated URL visible above the fold makes
"messy in → clean tagged link out" land in ~5s on BOTH desktop and mobile.

### C3 — Hero copy: run-on sentence + wrong lead  [RECURRING (craft): Aisha, Rob, Jules; nit from Tomás]
The current H1 is a two-line run-on explainer sentence that "reads like a promoted tooltip"
(Aisha, the one thing 8→9). It leads with GA-analyst framing — Jules "almost read it as a GA
tool, not for me," and the multi-platform preset hook (her real reason) is undersold. Rob
(8→9): lead the subhead with the payoff (auto-fix prevents a casing-split report; clean CSV
drops into a sheet), keep "no login / nothing leaves your browser" as a trust line, not the
lead. Must stay legible to a marketer AND an engineer.

### C4 — Share ambiguity  [RECURRING: Marcus (off-10), Elena; partial for Jules, Aisha]
The main builder shows 3 share verbs side by side — Copy share link (frozen snapshot),
Create workspace (live /w/<id>), Copy all URLs — forcing the user to reason about which shares
the live editable state. Marcus: the one thing keeping it off 10. Elena: still ambiguous, no
snapshot-vs-live caption.

### Single-persona quirks / polish
- **Empty-grid silent no-op** (Elena): Create workspace on an empty grid did nothing, no error
  — a dead button that also blocked her from verifying the workspace fixes.
- **Generated-URL truncated, no expand** (Priya): "...ut…" with no hover to read the full
  string before copying.
- **Inline per-cell "Fix" affordance confusing** (Priya, Dana): clicked inline Fix, only one
  field changed, then hunted for global Auto-fix. Per-cell-by-design is fine but illegible;
  make it legible + make global Auto-fix discoverable. Do NOT change Auto-fix behavior.

### DEFER — logged, not built this pass (feature enhancements, out of scope for the landing pass)
- **Wen** — one-click "standardize column to <chosen value>" from the inconsistency warning
  (reconcile a true value mismatch fb vs facebook, not just lowercasing). Backlog feature.
- **Tomás** — apply Auto-fix during CSV import ("clean as I import"). Backlog feature. Tomás
  may remain the single sub-bar holdout at 8; acceptable against a 9/10 bar.
- **Rob** — his own usage is occasional (weak personal recurrence); not a fixable UX defect.

## Round-2 direction
Land C1–C4 plus the three polish items in the layout/copy pass; the two DEFER items go to
backlog. C1 (mobile grid-first) and C2 (worked-example row) together unblock the only
value=No (Elena) and both mobile 8s; C3 unblocks Aisha/Rob and de-risks Jules; C4 unblocks
Marcus's 10 and Elena's share ambiguity. That projects the four current 9s holding plus
Priya/Aisha/Rob/Sam/Elena rising — comfortably past the 9/10 bar.
