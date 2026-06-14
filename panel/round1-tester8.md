# Round 1 — Tester 8 (Rob, freelance brand/visual designer) — QR feature

Device: desktop, color-calibrated monitor. Tech: medium. Benchmark: "I'd type query
strings by hand in ~4 min" + my per-client Google Sheet; for QR I'd normally paste each
URL into a free QR site one-by-one or trace one in Illustrator.

## What I did
Cold open → tagged 3 client links (acme spring-sale: newsletter/email, instagram/social,
facebook/cpc) → left a 4th row invalid (no source/medium/campaign) → Export CSV → opened
per-row QR popover → downloaded PNG + SVG → ran top-level "Download QR codes" ZIP.

## QR output quality — the part I care about
- SVG is a REAL vector: `viewBox="0 0 43 43"`, `shape-rendering="crispEdges"`, QR modules
  drawn as `<path>` data, ZERO embedded raster. This scales infinitely — I can drop it in
  Illustrator and print it at any size razor-sharp. This is the right call and rare for a
  free tool. Big win.
- PNGs are LOW-RES: single-download = 160x160px, ZIP = 200x200px. At 300dpi that's ~0.5–
  0.67 inch. Fine for screen/Slack, useless if a client wants it on a flyer or poster and
  grabs the PNG instead of the SVG. No size/DPI option.
- Contact sheet (708x276) is a neat idea but tiny/screen-only — not a print-ready sheet.

## Real bug — invalid row NOT skipped
The brief says invalid rows are skipped. My row 4 was flagged in-grid ("utm_source is
required", etc.) yet the ZIP still produced `03.png` encoding the bare
`https://acme.com/no-utm` — a QR with NO tracking. It also appears on the contact sheet
labeled "03 https://acme.com/no-utm…". Repro: add a row with only a base URL, no UTMs →
Download QR codes → invalid row gets a QR anyway. Handing a client an untracked QR to
print is a liability, not a convenience.

## CLARITY: Yes — H1 "Clean UTM links for your whole campaign — in one grid" + subhead is
instantly legible. CSV exported clean (generated_url column present).

## VALUE: Yes — bulk QR from the same grid genuinely beats pasting each URL into a QR site
one at a time; the SVG saves me Illustrator tracing. Marginal-to-yes only because the
low-res PNG and the invalid-row leak mean I can't trust the bulk PNG output blind.

## ADVOCACY: 8 — true-vector SVG + bulk export is exactly the grunt-work killer I want, but
the invalid-row QR leak and 200px PNGs hold it back from a 9. Quote that worries me:
"03 https://acme.com/no-utm" sitting on a print contact sheet.

```json
{"name":"Rob","clarity":"Yes","value":"Yes","advocacy":8,"qr_reaction":"SVG is a genuine print-ready vector (path-based, crispEdges, no embedded raster) which is exactly what I need for client print work; but the PNGs are only 160–200px (screen-res, no DPI option) and the bulk ZIP did NOT skip my invalid row — it shipped a QR for the bare untracked URL.","likes":["SVG export is a true scalable vector, drops straight into Illustrator","Per-row QR popover shows the exact encoded URL so I can verify before downloading","Bulk 'Download QR codes' ZIP + auto-named files (01-spring-2026.png) saves real one-by-one grunt work","Contact sheet is a nice at-a-glance index"],"complaints":["Invalid row NOT skipped: a row with only a base URL (flagged 'utm_source required' in-grid) still produced 03.png encoding the bare https://acme.com/no-utm with no tracking, and it appears on the contact sheet — repro: add base-URL-only row, no UTMs, click Download QR codes","PNG resolution too low for print: single download 160x160, ZIP 200x200, no size/DPI choice — only ~0.5in at 300dpi","Contact sheet is 708x276, screen-only, not a print-ready sheet"],"verdict_summary":"The vector SVG export is genuinely the thing that'd pull me off pasting URLs into a QR site one at a time — that part's excellent for a designer. But I can't trust the bulk PNG output: it handed me a QR for an invalid, untracked row, and the PNGs are screen-res. Fix the invalid-row skip and give me a print-DPI PNG and this is a 9."}
```
