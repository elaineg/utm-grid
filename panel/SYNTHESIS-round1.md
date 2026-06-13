# UTM Grid — Panel Synthesis, Round 1

URL tested: https://utm-grid.vercel.app

## Score table

| # | Persona | Role | Clarity | Value | Advocacy | Pass? |
|---|---------|------|---------|-------|----------|-------|
| 1 | Priya | Sr backend eng | Yes | Yes | 8 | — |
| 2 | Marcus | Frontend eng | Yes | Yes | 7 | — |
| 3 | Wen | Marketing data analyst | Yes | Yes | 9 | ✅ |
| 4 | Tomás | Ops analyst | Yes | Yes | 8 | — |
| 5 | Dana | Demand-gen marketer | Yes | Yes | 8 | — |
| 6 | Jules | Content/community mktr | Yes | Yes | 8 | — |
| 7 | Aisha | Product designer | Yes | No (marginal) | 8 | — |
| 8 | Rob | Brand designer | Yes | Yes | 7 | — |
| 9 | Elena | Eng manager | Yes | No | 6 | — |
| 10 | Sam | Product manager | Yes | Yes | 8 | — |

**Fully passing (adv≥9 + clarity=Yes + value=Yes): 1/10 (Wen).** Need 9/10.

Clarity is unanimous Yes — the headline/subhead and visible lint toggles communicate the
job in ~3–5s. No clarity work needed. The gap is entirely advocacy and two value=No.

## Complaints grouped by cause

### A. Core action incomplete — lint warns but never fixes (RECURS: 8 of 10)
Priya, Marcus, Jules, Rob, Elena, Sam (explicit), + Aisha/Dana (implied). The linter
flags uppercase/spaces/cross-row inconsistency, **but the generated URL and exported CSV
still contain the dirty value** (e.g. `utm_source=Facebook`, `summer%20sale`). Every
persona came specifically to STOP hand-editing query strings; without a fix action they
"still hand-correct every cell — the exact pain I came to avoid." This is THE blocker and
is named as the single thing that moves 8→9 by Priya, Jules, Rob, Sam, Dana-adjacent.
→ Need: per-cell one-click fix + a global "Clean all / Fix all to convention" button that
  lowercases, replaces spaces/separators per the active rules. Must update source cells
  (visibly, non-silently) so the URL+CSV carry clean values.

### B. No seeded/starter channel presets (RECURS: Dana, Marcus, Jules, Sam)
Ships with zero presets, so first use = building every channel from scratch. Dana: "one
click to drop standard linkedin/google/meta/email defaults turns 8 into instant
recommend." Marcus couldn't get a saved preset to populate a new row + no save confirmation.
→ Need: a small set of seeded channel presets (email, paid social/LinkedIn, google/cpc,
  organic social) applyable in one click; fix/confirm preset-apply-to-row reliability.

### C. Mobile: grid scrolls off-screen (RECURS: Jules, Elena, Sam — all mobile-heavy)
Wide grid is rough at ~375px. Half of Jules/Sam/Elena usage is phone.
→ Need: a usable mobile layout (horizontal scroll is acceptable but the primary action —
  fill a row + copy URL — must work and be reachable on a phone).

### D. Import safety + base-URL automap (single but high-stakes: Tomás)
Base URL was the one field that didn't auto-map (his `landing_url` header) → rushed import
silently yields rows with no destination. Import also wipes the current grid, no
append/undo.
→ Need: smarter base-URL header matching (url/landing_url/link/destination), and either
  append-or-replace choice on import or an undo.

### E. Lint visual noise + destructive Del (single, craft: Aisha)
Stacked raw red warning text makes rows tall/noisy; collapse multi-warnings into
icon+tooltip. `Del` at the edge of an overflow grid has no confirm/undo.
→ Need: collapse multiple warnings per cell into an icon + hover/expand; add a lightweight
  confirm or undo on row delete.

### F. Minor/trust polish
- Wen: trailing-space trim on generated URL is undocumented (source cell untouched, so she
  trusts it) — add a one-line note. Optional "block export until required params filled."

## Structural fit note (for synthesis honesty)
Elena (EM) and Aisha (designer) returned value=No because they **personally rarely build
UTMs** — this is a true ICP-edge finding, not a fixable UI gap. UTM Grid's native users are
marketers + analysts + engineers-shipping-launches (Wen, Dana, Jules, Sam, Tomás, Priya,
Marcus, Rob). Fixes A–C can plausibly lift those 8 to ≥9 (several said so explicitly).
Elena/Aisha advocacy may rise on craft, but their value=No is workflow-structural. If after
fixes the panel plateaus at ~8/10 with Elena+Aisha the only holdouts on value, that is the
plateau guard / product-fit ceiling, not a build failure — flag it then.

## Round 2 fix priority
1. **A** — autofix/clean-all (highest leverage, unblocks 8 personas).
2. **B** — seeded presets + reliable apply/save-confirm.
3. **C** — mobile usability.
4. **D** — import base-URL automap + append/undo safety.
5. **E** — lint de-noise + Del confirm.
6. **F** — trailing-trim note.
