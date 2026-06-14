# Round 2 — Tester 2 (Marcus, frontend eng, Chrome + devtools, 1280px)

Re-checked my round-1 nits first. (a) **Preview cells DOM-disabled — FIXED.** Amber banner "Previewing version from Ns ago (by X) — read-only. Cells are locked." and every grid cell is disabled+readonly (verified 6/6, typing blocked). Clean CSS, not janky. (b) **Edit attribution — FIXED.** "Editing as: Marcus" in the header, "last edited by Marcus", and per-version "by Marcus"/"by Anonymous" in History. (c) **Clipped "Copy" button @1280 — FIXED.** Renders full "Copy", fully on-screen (right edge 898 in a 958px area). Residual: the grid still has internal horizontal scroll (table 1356px in 958px area) once all 6 UTM cols + actions show — acceptable for a wide data table, no longer clips controls.

Full flow worked: created /w/ workspace, History(5) snapshotted every save, Previewed an old version (locked), Restored it via a clear non-destructive native confirm ("...becomes the current grid for everyone... your current version is saved in history first, nothing is lost"), grid editable again after with the restored values. Added taxonomy chips (marcus_test_chip, newsletter) to UTM_SOURCE — both **persisted across a brand-new browser session** (server-synced, real team source-of-truth, not localStorage). Grid data synced cross-session too. Zero console/page errors.

Friction/bugs (minor):
- Duplicate `id="utm-spec-add-utm_source"` (+ sibling field ids) in the DOM — invalid HTML, looks like a responsive duplicate of the taxonomy panel. Caught in devtools; no user-facing effect but it's a smell.
- Taxonomy panel collapses on a subtle chevron; first-timers may miss the per-field allowed-value editor.

CLARITY: Yes
VALUE: Yes
ADVOCACY: 9/10
REASON: All three of my round-1 concerns are resolved, and History + non-destructive Restore + server-synced shared taxonomy with editor attribution genuinely make this a trustworthy no-login team UTM source-of-truth — I'd drop it in our launch Slack today. Holding the 10 only on a duplicate-id DOM smell and the easy-to-miss collapsed taxonomy panel: polish, not substance.
