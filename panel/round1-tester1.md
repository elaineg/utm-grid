# Round (re-test) — Tester 1 (Priya, senior backend eng, skeptical, keyboard-first, hates signups)

Context: teammate sent me this instead of a spreadsheet for a side-project launch post. New this round: QR codes.

## Re-check of MY prior complaints (verified live this round)
- "Read-only guide still exposes an editable-workspace button" → STILL NOT FIXED. The
  /w/<id>/guide page literally renders "read-only" AND an "Open the editable workspace" link
  (verified: 1 such link present). Any link-holder can still edit the team standard. Same
  trust contradiction I flagged twice now.
- "Launch Check flags typos only as inconsistent, no near-miss suggestion" → STILL NOT
  FIXED. Entered emial/tiwtter, ran Launch Check: no "did you mean" anywhere on the page.

## QR (new feature) — exercised fully
Row QR modal opens, explicitly shows the URL it ENCODES (good — I don't trust an opaque QR),
PNG + SVG both download (qr-row-1.png verified). Top-level "Download QR codes" ZIP is
genuinely well-built: per-row PNGs named by campaign (01-launch-2026.png, 02-june-drop.png)
+ a printable contact sheet, and it correctly SKIPS the empty/invalid row. Clean network
tab throughout — only GET / loads, nothing POSTs my URLs (the privacy claim holds).

```json
{
  "name": "Priya",
  "clarity": "Yes",
  "value": "Yes",
  "advocacy": 8,
  "qr_reaction": "Discoverable (QR button sits right next to Copy on each row) and surprisingly well-crafted — the modal shows the exact URL it encodes, gives PNG and SVG, and the ZIP names files per-campaign + ships a contact sheet and skips invalid rows. I rarely need QR personally, but for a launch sticker/flyer it's a real win and the craft earns trust.",
  "likes": [
    "Network tab stays clean — only GET / , my URLs never leave the browser; provably true, the one reason a skeptic like me keeps going",
    "Zero signup, I was typing into the grid within ~3s",
    "Auto-fix naming does exactly what it claims (Twitter->twitter, 'Launch 2026'->launch_2026) with a non-destructive 'Auto-fixed N cells — Undo' toast",
    "Copy puts the exact, correctly-encoded generated URL on the clipboard",
    "Inline per-cell lint with one-click Fix beats eyeballing query strings",
    "QR ZIP is thoughtful: per-row PNGs, sensible names, contact sheet, invalid rows skipped"
  ],
  "complaints": [
    "PRIOR, STILL NOT FIXED: /w/<id>/guide says 'read-only' but renders an 'Open the editable workspace' link — any link-holder can edit the team standard. Repro: add row, Create shared workspace, Share style guide, open the /guide link. I will not forward a 'view-only' standard that anyone can rewrite.",
    "PRIOR, STILL NOT FIXED: Launch Check flags emial/tiwtter only as inconsistent, never 'did you mean email/twitter?'. The gap between nice and 'I trust this as my launch gate.'",
    "Toolbar is overloaded for a one-link job — Paste & Audit, Launch Check, shared workspace, Naming Template, Allowed values all crowd above a single empty row; I ignored ~6 features to find the grid",
    "Still no keyboard-first affordance I could find (no Cmd+Enter to copy / new row); Tab between cells works but it's mouse-driven for a keyboard person"
  ],
  "verdict_summary": "Came in ready to bail to vim; it didn't ask me to sign up, doesn't phone home (I checked), and auto-fix + lint caught the casing/space junk I'd have shipped by hand. The new QR ZIP is nicer than I expected. But I'm holding at 8, not raising, because the two things I flagged last round are STILL broken — the 'read-only' guide that anyone can edit is a trust bug I won't forward to a team, and typo near-miss suggestions still aren't there."
}
```
