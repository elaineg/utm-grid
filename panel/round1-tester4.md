# Round (QR feature) — Tester 4 (Tomás, Ops analyst, Edge on corporate laptop)

I know this app (prior round I gave a 9). This round the new thing is **QR codes**, and my
job is to confirm QR generation stays on my machine — I won't paste company campaign URLs
into a site that round-trips them to a server.

## What I verified
- CSV round-trip: imported a 3-row Excel-style sheet (messy casing, spaces in campaign,
  a `?ref=q3` base). Column auto-mapping caught all headers; "Import 3 rows" confirmed.
  Data NOT mangled — `Newsletter`/`LinkedIn` casing preserved, existing `?ref=q3` kept and
  UTMs appended with `&`, spaces encoded `%20` in the generated URL. Export CSV round-trips
  cleanly back to Excel.
- QR per-row: popover shows "QR Code — Row 1", the full encoded URL, an inline
  `data:image/png;base64,...` preview, and Download PNG/SVG. Download PNG fires an anchor
  with `href=data:image/png;base64,...` `download="qr-row-1.png"` — pure local, no fetch.
- Top-level "Download QR codes": ZIP (`utm-qr-codes.zip`) with one PNG per valid row +
  `contact-sheet.png` (printable). Invalid/empty rows SKIPPED correctly (empty row 2 absent;
  ZIP kept original numbering 01/03). Contact sheet is a nice touch for ops handoffs.
- **THE privacy check**: across cold load, CSV import, QR popover, all PNG/SVG downloads,
  and the ZIP build — NON-GET network requests = **0**. Nothing uploaded. QR is generated
  100% client-side. This is exactly what lets me use it with company data.

## Holding it down
Same half-point as before: Export/report CSV has **no UTF-8 BOM** — on Edge/Windows a
double-click into Excel can mis-guess the codepage. My ASCII data was fine, but it's the
one rough edge for the Windows-Excel user this courts. Not fixed this round.

```json
{"name":"Tomás","clarity":"Yes","value":"Yes","advocacy":9,"qr_reaction":"QR is fully local — popover renders a base64 data-URI, PNG/SVG download via data-anchors, ZIP+contact-sheet built in-browser with ZERO non-GET requests; exactly what a data-wary ops analyst needs, and it correctly skips invalid rows.","likes":["QR generation 100% client-side — verified 0 uploads across import+QR+ZIP","CSV round-trip preserves my casing/special chars and keeps existing ?ref query param","ZIP ships a printable contact sheet and skips invalid/empty rows automatically","Per-row PNG/SVG + bulk ZIP covers both one-off and batch ops needs"],"complaints":["Export/report CSV still has no UTF-8 BOM, so non-ASCII chars can mojibake on double-click into Excel on Edge/Windows","QR popover's Download PNG/SVG labels collide with the toolbar 'Download QR codes' button by accessible name — minor, but a screen-reader/keyboard user could pick the wrong one"],"verdict_summary":"The QR feature nails my one hard requirement: it never sends my campaign URLs anywhere — all generation is in-browser, confirmed by zero non-GET traffic. CSV round-trips without mangling and the ZIP+contact-sheet is genuinely useful for ops handoffs. Still a 9, held off 10 only by the missing CSV BOM I flagged before."}
```
