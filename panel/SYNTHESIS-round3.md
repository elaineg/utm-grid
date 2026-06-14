# UTM-Grid — Panel Synthesis, Round 3 (Team Workspace) — FINAL

## 1. Full 10-tester score table

Six testers carry forward their round-2 advocacy of 9 (surfaces untouched by the round-3
fixes). Four holdouts were delta re-tested against their round-2 blockers.

| # | Persona | Clarity | Value | Advocacy | Note |
|---|---------|---------|-------|----------|------|
| 1 | Priya  | Yes | Yes | 9/10 | carried from round 2 |
| 2 | Marcus | Yes | Yes | 9/10 | carried from round 2 |
| 3 | Wen    | Yes | Yes | 9/10 | carried from round 2 |
| 4 | Tomás  | Yes | Yes | **9/10** | re-tested R3 — "Both my prior bugs are gone and it now does what my Excel UTM tab does — a shared, enforced source-of-truth with per-person attribution and clean CSV round-trip" |
| 5 | Dana   | Yes | Yes | **9/10** | re-tested R3 — "The marquee feature now fully works — define allowed values once, enforce them, columns stay visible, all synced — so I can confidently make this my team's UTM source-of-truth" |
| 6 | Jules  | Yes | Yes | 9/10 | carried from round 2 |
| 7 | Aisha  | Yes | Yes | **10/10** | re-tested R3 — "My one craft nit is gone… History+Restore+synced taxonomy make it a trustworthy team source-of-truth, and it now feels considered end to end. I'd bring it up unprompted in a design channel." |
| 8 | Rob    | Yes | Yes | 9/10 | carried from round 2 |
| 9 | Elena  | Yes | Yes | **9/10** | re-tested R3 — "The empty-panel flake that made history read as 'no history' is fixed on first click, so it's now a trustworthy zero-setup team source-of-truth I'd recommend to my reports unprompted" |
| 10 | Sam   | Yes | Yes | 9/10 | carried from round 2 |

## 2. Exit condition

Exit bar: ≥9/10 testers at Advocacy ≥9 AND Clarity=Yes AND Value=Yes.

**MET — 10/10 testers pass.** Every persona Clarity=Yes, Value=Yes; advocacy =
{9,9,9,9,9,9,10,9,9,9}, all ≥9. Re-tested holdouts came back 9 (Tomás), 9 (Dana),
10 (Aisha), 9 (Elena).

Round-over-round arc: **round 1: 1/10 → round 2: 7/10 → round 3: 10/10.**

## 3. Round-2 blockers cleared by the round-3 fixes (the 4 re-tested holdouts)

- **Tomás — first-click panel open + name persistence.** "ONE click on 'Shared UTM taxonomy'
  immediately revealed a per-field '+ add value' input with an Add button (no second click)…
  Name: set 'Editing as: Tomás', reloaded — persists." Both round-2 blockers FIXED.
- **Dana — taxonomy reachable + source columns visible.** "Clicked 'Shared UTM taxonomy ▼'
  ONCE → a per-field editor appeared immediately… SOURCE COLUMNS STILL VISIBLE: taxonomy now
  sits BELOW the grid full-width, so my editable cells stayed on screen (grid did NOT
  collapse)." Enforce confirmed working and synced. Both R2 blockers FIXED.
- **Aisha — first-click panel open (History).** "Clicked 'History' exactly ONCE — the Version
  history panel opened immediately (Restore/Preview present, 0→2 panel tokens). Fixed." No
  second click needed on a cold /w/ load.
- **Elena — first-click panel open (history reads empty) + enforce reachable.** "ONE click on
  'History (1)' rendered the version list immediately… ONE click on 'Shared UTM taxonomy'
  expanded the full panel immediately. Both panels now populate on the first click; the
  'History looks empty' flake is gone."

## 4. Residual non-blocking nits (for friction record / backlog)

- **Tomás — link-security reassurance.** Synced workspace says "anyone with the secret link
  can view and edit" and data hits a private server; wants a word on link entropy / who can
  reach it before putting real company campaign data in.
- **Dana — paste-a-list affordance + repetitive add boxes.** Per-field "+ add value" boxes are
  repetitive and the "Paste a list" shortcut is easy to miss/buried.
- **Aisha — slide-over polish.** History/taxonomy panels stack vertically and push the grid
  down on open; a slide-over would feel tighter. Explicitly "not a flaw."
- **Elena — enforce default-on.** Taxonomy defaults to "Not enforcing — enable in Naming
  rules," so the shared vocabulary is advisory until someone flips enforce; she'd default it on.
