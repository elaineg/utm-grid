# UTM Grid — Panel SYNTHESIS Round 2 (cross-device feature; craft/IA fix pass)

**6/10 pass the bar, up from 1/10.** The Tools-menu de-densification + craft fixes worked.

## Score table (Δ vs round 1)
| Tester | clarity | value | advocacy | pass? | note |
|--------|---------|-------|----------|-------|------|
| Wen    | Yes | Yes | **10** (↑9) | YES | "Show what's inside" JSON + offline claim resolved both gaps |
| Tomás  | Yes | Yes | **9** (↑8) | YES | offline-zero-network line + JSON view → can show IT |
| Dana   | Yes | Yes | **9** (↑8) | YES | subhead now leads with bulk value |
| Aisha  | Yes | Yes | **9** (↑8) | YES | copy-cue fix resolved her blocker; value back to Yes |
| Elena  | Yes | Yes | **9** (↑8) | YES | "GOVERN CONVENTIONS" label surfaced team value |
| Sam    | Yes | Yes | **9** (↑8) | YES | reliable copy + clean mobile menu |
| Priya  | Yes | Yes | 8 (↑7) | no | menu grouping fixed; wants a "just the grid" landing (governance cards too present for occasional use) |
| Marcus | Yes | Yes | **7 (↓8)** | no | **REAL CSS bug: ACTIONS cell now has 4 icons; the trash icon is clipped ~12px past the cell edge @1280px (174px content in 162px cell)** |
| Jules  | Yes | Yes | 8 | no | wants platform preset chips on COLD LOAD (or auto-expand presets on first visit); menu-surfacing didn't touch her landing-chips ask |
| Rob    | Yes | Yes | 8 | no | self-described personal recurrence ("a me-problem, not an app defect"); concrete post-import gap WAS fixed |

## Holdout analysis → round-3 plan
- **Marcus (must-fix, definite +1):** FIX-2 widened ACTIONS 148→160 but a 4th per-row icon (duplicate) was added; trash now clips ~12px. Widen ACTIONS to fit all 4 icons (~+18-20px, taken from the Generated-URL slab) so every icon is fully visible at 1280px with no cell/page overflow. Zero regression risk; flips Marcus 7→9.
- **Priya (de-densify landing):** she sees "three persistent governance cards around a one-row grid" and wants a "just the grid" default. Aisha (R1) also flagged "home side-cards duplicating Tools/Rules entry points." Collapse/remove any persistent landing cards that DUPLICATE the menu entries so the cold landing is grid-first with the launchers, nothing more. Reinforces Elena/Dana's clean-landing approval (low regression risk — removing clutter).
- **Jules (surface presets, low-density):** her ask (chips on cold load) conflicts with grid-first / the "no above-grid banner" rule and risks regressing Dana (friction: optional-ui-gated... an always-on above-grid element regressed Dana 9→8 before). LOWER-RISK alternative she herself offered: auto-expand the Presets bar on a FIRST-EVER visit only (empty grid anyway), and/or make Tools ▾ → Channel Presets open straight to apply-able chips (cut her "three hops" to one). Try that, not landing chips.
- **Rob (structural):** occasional user by his own account; gave 9 in the prior PASS, so re-test after polish but treat as the allowed 1 miss if he holds at 8.

## Bar math
Need 9/10. The 6 passers hold (carry Wen/Tomás/Aisha/Sam — surfaces untouched; sentinel-retest Dana/Elena since the landing changes). Flipping Marcus + Priya + Jules → 9/10 with Rob as the allowed miss. Re-test R3: Marcus, Priya, Jules, Rob + sentinels Dana, Elena.
