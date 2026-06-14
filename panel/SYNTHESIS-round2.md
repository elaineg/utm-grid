# UTM Grid — Panel SYNTHESIS, Round 2

Bar: advocacy ≥ 9 AND clarity = Yes AND value = Yes. Target: 9/10 testers passing.
Build under test: mode-aware privacy copy (main=local vs /w/=server-synced), "anyone with
secret link can edit" permission note, server-synced shared taxonomy/spec.

## 1. Score table

| # | Name   | Clarity | Value | Advocacy | R1 adv | Δ   | Passes bar |
|---|--------|---------|-------|----------|--------|-----|------------|
| 1 | Priya  | Yes     | Yes   | 8        | 8      | 0   | No         |
| 2 | Marcus | Yes     | Yes   | 8        | 8      | 0   | No         |
| 3 | Wen    | Yes     | Yes   | 9        | 8      | +1  | Yes        |
| 4 | Tomás  | Yes     | Yes   | 9        | 8      | +1  | Yes        |
| 5 | Dana   | Yes     | Yes   | 9        | 8      | +1  | Yes        |
| 6 | Jules  | Yes     | Yes   | 9        | 8      | +1  | Yes        |
| 7 | Aisha  | Yes     | Yes   | 8        | 6      | +2  | No         |
| 8 | Rob    | Yes     | Yes   | 9        | 8      | +1  | Yes        |
| 9 | Elena  | Yes     | Yes   | 9        | 8      | +1  | Yes        |
| 10| Sam    | Yes     | Yes   | 9        | 8      | +1  | Yes        |

All 10: clarity Yes, value Yes, prior R1 blocker resolved. Lift driven by mode-aware copy +
secret-link permission note + server-synced taxonomy/spec.

## 2. Current pass count vs the bar

**7 / 10 passing** (Wen, Tomás, Dana, Jules, Rob, Elena, Sam) — bar is **9 / 10**. Short by 2.

## 3. Remaining blockers grouped by cause

### A. 1280px grid overflow when a side panel is open — THE FIXABLE GAP (caps 2 of the 3)
At 1280px with a side panel open (Campaigns sidebar / Shared UTM taxonomy panel), the grid
table (scrollWidth ~1469px) overflows its squeezed scroll-area (clientWidth ~958px). The
ACTIONS/Copy and GENERATED URL columns get clipped/pushed off the right edge ("Aut…"/"C…"
fragments) with no clean in-grid horizontal scroll.
- **Marcus (2, adv 8):** "table 1469px in a 958px scroll area — ACTIONS/Copy clipped behind
  the Campaigns panel… fix the 1280px grid width and I'm at 9." → **explicit → 9 on fix.**
- **Aisha (7, adv 8):** "scrollWidth 1469 > 1280, GENERATED URL + ACTIONS clipped off the
  right edge, no clean scroll… fix the 1280px overflow and I'm at 9." → **explicit → 9 on fix.**
- **Priya (1, adv 8):** also flagged it ("side panel overlaps the right edge of GENERATED
  URL/ACTIONS columns") — but it is NOT her ceiling (see B).

### B. Structural persona ceiling — NOT a fixable defect
- **Priya (1, adv 8):** R1 blocker resolved, but tags UTMs too rarely to evangelize
  unprompted ("I tag UTMs too rarely… I'd send it to a teammate, just not spontaneously").
  Also wants lint-on-type / paste-a-URL parsing. This is a persona-fit ceiling, not a
  product defect — fixing the overflow will not move her to 9. Acceptable to leave at 8
  against a 9/10 bar.

### C. Non-blocking polish raised by already-passing testers (do NOT gate round 3)
Enforcement OFF by default in a workspace (Wen); read-only/revoke link (Tomás); multi-week
return-loop unproven (Dana); no X/Twitter/Mastodon preset (Jules); per-workspace naming —
pill reads "Unsaved grid" (Rob); presence / last-write-wins (Marcus, Elena); generated URL
shows dirty values until Auto-fix clicked (Sam). All from 9-scorers, explicitly "not a
blocker" — defer to backlog.

## 4. Round-3 fix list (ONE fix)

**Fix the 1280px grid overflow when a side panel is open** — keep ACTIONS/Copy + GENERATED
URL columns visible/pinned with a clean in-grid horizontal scroll, no clip (responsive
column widths or scope the sidebar so the grid keeps its width). Converts Marcus + Aisha →
9, yielding **9/10**. Priya remains a structural 8 (persona ceiling), acceptable at the bar.
