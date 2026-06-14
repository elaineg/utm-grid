# Round 2 — Tester 7: Aisha (Product designer, judges craft hard)

**Prior R1 concerns re-checked:** (1) busy stacked header banners — FIXED: /w/ now shows one clean
"Team Workspace — synced" banner, no stacking, no mid-phrase lint wrapping. (2) grid overflow / clipped
columns at 1280px — MOSTLY FIXED: main page no longer overflows (table 1228 < 1280); /w/ table is wider
(1629) but now lives in an `overflow-x-auto` container, so it scrolls cleanly instead of clipping off-screen.

**New affordances — genuinely considered.** Preview is excellent: amber banner "Previewing version from 2m
ago (by Aisha) — read-only. Cells are locked." with greyed-out (disabled) cells AND both "Restore this
version" + "Back to current" escape hatches. Attribution flows everywhere ("Editing as: Aisha", versions
tagged by-name vs "by Anonymous"). Taxonomy shows "Synced · saved just now". Restore is non-destructive;
copy "Every save is kept. Restoring brings a version back without losing the current one." nails the tone.

**Craft bug (only real ding):** on a COLD page load the History button reads "History" with no count and the
FIRST click is dead — panel stays closed; the SECOND click opens it (label then becomes "History (3)").
Repro: load /w/<id> fresh → click History once (nothing) → click again (opens). A first-impression miss.
Minor: locked preview cell is only faded, not visibly badge-locked.

CLARITY: Yes
VALUE: Yes
ADVOCACY: 9/10
REASON: History + non-destructive Restore + synced taxonomy + per-edit attribution make this a trustworthy
team source-of-truth and the craft now holds up; the dead first-click on History after a cold load is the
one unconsidered detail keeping it off a 10.
