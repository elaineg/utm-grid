# UTM Grid — Panel Synthesis, Round 5 (run 20260613-095144-daily)

Round 4 was **2/10** at the 9-advocacy bar. Round 5: 9 personas re-tested; Wen/tester3
CARRIED from R4 (advocacy 9, flows untouched).

## Round-5 score table

| # | Persona | Role | Clarity | Value | Advocacy | Pass? | Δ from R4 |
|---|---------|------|---------|-------|----------|-------|-----------|
| 1 | Priya | Senior backend SWE | Yes | Yes | 9 | ✅ | 8→9: row/campaign dup confusion fixed, Auto-fix naming bulk fix shipped, pill persists; caps at 9 on fit (tags ~2x/yr) |
| 2 | Marcus | Frontend engineer | Yes | Yes | 9 | ✅ | 6→9: both blockers fixed — Duplicate creates "<name> copy" card +count, no CSS overlap; 1 px box-touch nit |
| 3 | Wen | (carried R4) | Yes | Yes | 9 | ✅ | carried — flows untouched |
| 4 | Tomás | Ops analyst | Yes | Yes | 8 | ❌ | data-loss flinch fixed (Auto-fix naming + Undo); SOLE cap = no campaign RENAME |
| 5 | Dana | Demand-gen marketer | Yes | Yes | 8 | ❌ | Clean-all wipe fear fixed; SOLE cap = no rename/search (52 wks → "copy copy copy"); sync = future tier |
| 6 | Jules | Content marketer | Yes | Yes | 9 | ✅ | 8→9: preset Apply never a no-op, mobile sidebar + visible actions good |
| 7 | Aisha | Product designer | Yes | Yes | 9 | ✅ | 8→9: all 3 craft gaps fixed (collision confirm, always-visible actions, pill persists); native confirm() nit |
| 8 | Rob | Brand/visual designer | Yes | Yes | 9 | ✅ | 8→9: one-click Duplicate campaign clones per-client |
| 9 | Elena | Eng manager | Yes | No | 7 | ❌ | structural — "standardize team" hangs on cross-device/team sync (deferred); polish landed |
| 10 | Sam | Product manager | Yes | Yes | 10 | ✅ | 9→10: mobile card actions now always-visible |

## Fully-passing count: **7/10** (advocacy ≥ 9). Up from 2/10 in R4.

## Remaining blockers — grouped

### A. ONE pass-critical recurring blocker → campaign RENAME
Caps BOTH Tomás (8) and Dana (8) — the only two convertibles sitting below 9, and they
name the identical gap independently:
- **No way to rename a saved/duplicated campaign.** Card actions are Open/Duplicate/Delete
  only. "Duplicate campaign" yields "<name> copy" with no relabel path. Tomás: "to rename I'd
  Duplicate then Delete." Dana: "a year becomes a wall of copy copy copy" — a real scaling
  failure for weekly use. A simple search/filter on the campaign list is the natural companion.
- **This is the single fix that moves the score.** It is recurring, pass-critical, and isolated.

### B. Structural non-pass (NOT fixable in this loop) → Elena, team sync
- Elena: value=**No**, advocacy 7. Her job is "should the TEAM standardize on this," which
  resolves to a shared/cross-device canonical store. That is the **deliberately deferred**
  sync tier. Her individual-lint praise is real, but it's not the question she was sent to
  answer. **Ceiling for Elena is ~9 only with team sync — out of MVP scope; do not chase.**

### C. Non-blocking polish nits (logged, none cap a score)
- Native `confirm()` for overwrite vs. an in-app styled modal (Aisha).
- Campaigns section re-collapses after reload — wants default-open when campaigns exist (Sam).
- Per-row mini-icons (⧉/🗑) cramped, overlap URL text on mobile, fat-finger risk (Sam, Dana, Rob).
- 7px Copy-button box-edge touch — no glyph collision, text clipped (Marcus).
- "saved just now" timestamp doesn't age within a session (Aisha).

## Conversion math
- **Now: 7/10.**
- Elena is a structural value=No → with her excluded, the realistic ceiling is **9/10**.
- Adding **campaign rename** (+ optional simple filter) converts **Tomás 8→9** and
  **Dana 8→9**, both of whom name only that gap → **9/10**.
- **9/10 = exit bar met.** One scoped feature stands between this run and shipping.
- Trajectory: **2 → 7**, improving with no plateau — fix the rename gap and re-run those two.
