# Round 2 — Tester 4 (Tomás, Ops analyst, Edge on corporate Windows laptop)

I gave a 9 last round, held off 10 only by the missing UTF-8 BOM on Export CSV. That
was the single thing blocking me. Re-checked it first.

## Re-check of my prior complaint (CSV BOM)
FIXED. Downloaded Export CSV with non-ASCII data (`promoción`, `Boletín`, `Año Nuevo
2026`). First three bytes are `EF BB BF` — a proper UTF-8 BOM. In my Edge/Windows-Excel
mental model that means a double-click opens it in the right codepage, no mojibake. The
accented chars survive the round-trip intact in the CSV, my existing `?ref=q3` is
preserved, and UTMs are appended with `&` and %-encoded in the generated URL. This was my
exact ask and it's done right.

## Re-confirmed this round
- Privacy: across cold load, data entry, and Export CSV — NON-GET requests = 0. Nothing
  uploaded. Still the thing that lets me use it with company campaign data.
- Round-trip integrity: casing and special chars preserved, no mangling.
- QR: skips incomplete rows (didn't deep-test again; was solid round 1).

## Remaining
Honestly nothing blocking. Minor: the QR popover's "Download PNG/SVG" still shares an
accessible name space with the toolbar "Download QR codes" — a keyboard/SR edge case, not
a dealbreaker. With the BOM fixed I have no reason to dock a point.

```json
{"name":"Tomás","clarity":"Yes","value":"Yes","advocacy":10,"qr_reaction":"QR generation is fully client-side and now correctly skips incomplete rows; verified zero uploads, exactly what a data-wary ops analyst needs.","prior_concerns_addressed":"fixed","likes":["Export CSV now ships a UTF-8 BOM (EF BB BF) — opens cleanly in Windows Excel, no mojibake","Non-ASCII campaign data (promoción, Boletín, Año Nuevo) round-trips intact","Zero non-GET requests across import/entry/export — nothing leaves my browser","Existing ?ref query param preserved, UTMs appended with & and properly %-encoded"],"complaints":["Minor a11y: QR popover Download PNG/SVG shares accessible-name space with toolbar 'Download QR codes' button — keyboard/screen-reader edge case only"],"verdict_summary":"My one held-back half-point is gone: Export CSV now has a real UTF-8 BOM and my accented ops data opens cleanly in Windows Excel with no mangling, and nothing ever leaves the browser. CSV round-trips perfectly and QR is fully local. This is now a tool I'd actually drop into my workflow — a 10."}
```
