# Round 2 — Tester 1 (Priya, senior backend eng, skeptical, keyboard-first, hates signups)

Re-test of the new build. Re-exercised core grid, auto-fix, copy, QR (row + bulk), CSV, and
re-checked my two round-1 complaints with the design context provided.

## Re-check of MY prior complaints (verified live)
- "Read-only guide exposes an editable-workspace button" → MISREAD, now I agree it's by design.
  The /guide URL and the workspace URL carry the SAME secret token; anyone who can click
  "Open the editable workspace" already holds the editable secret link. The guide is the
  view-only *render*, not a separate weaker grant. Copy is explicit: workspace says "anyone
  with this secret link can view and edit — the secret link is the access control"; guide says
  "Read-only reference. Anyone with this secret link can view this page." Not a trust bug.
  Residual nit (feature gap, not blocker): no separate read-only token, so I can't hand a
  truly view-only standard to someone I don't trust with edit. Minor.
- "Launch Check has no 'did you mean'" → MISREAD of scope. Near-miss naming keys off
  *allowed values*; with none defined, tiwtter/emial pass as internally consistent (correct).
  The general typo-suggestion I wanted isn't in this build by design. Fine.

## QR (re-exercised)
Per-row QR is correctly DISABLED on an incomplete row and ENABLES the moment the row is valid
(verified disabled=true→false). Modal anchors beside the row, shows the EXACT encoded URL
(twitter/social_post/launch_2026), PNG+SVG+download. Bulk "Download QR codes" now reports
"1 QR code generated, 1 skipped — incomplete or invalid URL" and the ZIP contains only the
valid PNG with a channel-aware name (01-launch-2026-twitter-social.png) + contact-sheet.png.
CSV export now starts with EF BB BF (UTF-8 BOM) — Excel-safe. Zero non-GET requests across the
whole session; my URLs never left the browser.

```json
{
 "name":"Priya","clarity":"Yes","value":"Yes","advocacy":9,
 "qr_reaction":"Tight now: per-row QR is disabled until the row is valid then enables, the modal shows the exact URL it encodes (I don't trust opaque QR), and bulk download explicitly reports skipped invalid rows and names files by channel/campaign. More careful than I expected for a launch-sticker feature.",
 "prior_concerns_addressed":"Both round-1 complaints were misreads on my part, confirmed by re-testing: the /guide 'editable workspace' link is the same secret-token grant (not a privilege leak), and Launch Check near-miss is scoped to defined allowed values. The QR fixes I'd want (skip invalid rows, disable incomplete-row QR, anchored popover) are all live, plus CSV now has a UTF-8 BOM.",
 "likes":["Network tab stays clean — only GET /, URLs never POST anywhere; the one thing that keeps a skeptic going","Zero signup, typing into the grid in ~3s","Auto-fix Twitter->twitter, 'Launch 2026'->launch_2026 with non-destructive undo","Copy puts the exact correctly-encoded URL on the clipboard","Per-row QR gated on row validity + bulk QR skips/reports invalid rows; channel-aware filenames","CSV now UTF-8 BOM so Excel won't mangle it"],
 "complaints":["No separate read-only share token — I can't give someone a view-only copy of the team standard without also granting edit; fine for a trusting team, awkward otherwise","Toolbar still busy for a one-link job (Paste & Audit, Launch Check, Naming Template, Allowed values, shared workspace) crowd above a single empty row","Still mouse-driven for a keyboard person — no Cmd+Enter to copy/add-row that I could find; Tab between cells works but that's it"],
 "verdict_summary":"I came in holding an 8 over two 'broken' complaints — re-testing showed both were my misreads, and the QR feature is genuinely careful: it gates on validity, shows the encoded URL, and skips junk rows instead of silently shipping a bad QR. It doesn't phone home, doesn't ask me to sign up, and the CSV is now Excel-safe. Raising to 9; the only real gap is no view-only share token and it's still not keyboard-first."
}
```
