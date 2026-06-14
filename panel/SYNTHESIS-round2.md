# utm-grid — Panel Round 2 Synthesis (run 20260614-032745-daily, Launch Check)

## Scores (R1 → R2)

| Tester | R1 | R2 | At bar | Note |
|--------|----|----|--------|------|
| Priya  | 8  | 8 (carried) | no | Designated sub-bar; /guide edit-CTA (by-design) + typo-suggestion (out of scope) |
| Marcus | 8  | 9  | YES | Audit dedup RESOLVED. Remaining: toolbar visual grouping (polish) |
| Wen    | 9  | 10 | YES | CSV full-URL column RESOLVED |
| Tomás  | 9  | 10 | YES | CSV UTF-8 BOM RESOLVED |
| Dana   | 8  | 9  | YES | Export buttons at top RESOLVED. Remaining: batch fix-all from report |
| Jules  | 8  | **7** | NO | **Copy-summary green cue NOT firing for him** (conditional) |
| Aisha  | 8  | 9  | YES | Copy cue (summary + style guide) RESOLVED — saw green pill ~2s |
| Rob    | 9  | 9  | YES | No regression at 1280–1680px |
| Elena  | 8  | 9  | YES | Shareable /w/<id>/check report link RESOLVED. Remaining: "checked at <ts>" |
| Sam    | 8  | 9  | YES | Copy cue + mobile surfacing RESOLVED |

**8/10 at bar.** Clarity & value unanimous Yes. Need one more: Jules.

## The one blocker — Copy-summary cue conditional bug
- **Jules (7)** polled the "Copy summary" button innerText every 25ms for 2.5s: label stayed
  "Copy summary", NO green state; clipboard DID receive 634 chars. He explicitly contrasts:
  "Copy share link" and "Copy all URLs" DO flash green — so "Copy summary" specifically misses it.
- **CONTRADICTION:** Aisha (9) saw "Copy summary" flip to a solid-green "✓ Copied!" pill (~2s,
  copied 441 chars); Sam (9) saw the same solid-green "✓ Copied!". Same build, same button,
  opposite observations → a CONDITIONAL bug (tester-contradiction-locates-conditional-bug
  lesson). Most likely the F2 dual-render: there are now TWO "Copy summary" instances (report
  header + bottom row); the green state fires on one instance but not the one Jules clicked,
  OR the Copy-summary button uses a different/older cue path than the proven "Copy share link".

## Fix (round 3) — single targeted change
Make the "Copy summary" button use the EXACT cue mechanism the working "Copy share link"
button uses (everyone agrees that one flashes green), and ensure BOTH the header and bottom
"Copy summary" instances show the solid-green "Copied!" state reliably when either is clicked
(resolve any dual-instance state ambiguity — e.g. shared boolean state both instances read).
The verifier must confirm the cue VISUALLY (computed background-color/class change) on BOTH
instances, not just innerText (copy-confirmation-survives-tick-rerender lesson).

## Deprioritized (at-bar testers' remaining nits — not blockers)
- Marcus: toolbar grouping/hierarchy polish. Aisha: clearer "start here" primary among ~7
  controls. Elena: "checked at <timestamp>" on /check (staleness signal). Sam: long mobile
  scroll (collapse advanced stack). Dana: one-click batch fix-all from inside the report.
  Jules secondary: X/Mastodon presets (out of scope). None block 9/10; note for future deepen.
