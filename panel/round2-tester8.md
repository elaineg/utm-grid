# Round 2 — Tester 8 (Rob, freelance brand/visual designer) — QR invalid-row fix re-test

Device: desktop, color-calibrated monitor. Tech: medium. Benchmark: "I'd type query
strings by hand in ~4 min" + per-client Google Sheet; for QR I'd otherwise paste each URL
into a free QR site one-by-one or trace one in Illustrator.

## Re-check of my round-1 blocker (invalid-row QR leak) — FIXED
Repro exactly as before: row 1 valid (acme spring-sale, newsletter/email), added row 2 with
ONLY a base URL `https://acme.com/no-utm`, no UTMs (flagged invalid in-grid). Then:
- Per-row QR button on the invalid row is now DISABLED (verified `isDisabled() == true`).
- "Download QR codes" reported: "1 QR code generated, 1 skipped — incomplete or invalid URL".
- ZIP contained ONLY `01-spring-sale-newsletter-email.png` + `contact-sheet.png`. No
  `no-utm` file anywhere (grep found zero matches), no `03.png`.
- Contact sheet shows only `01 · spring-sale · newsletter/email` — the bare untracked URL is
  gone from the sheet entirely.
No untracked QR can reach a client now. The exact liability I flagged is closed.

## SVG still the print-ready vector I liked — confirmed intact
Re-pulled the per-row SVG: `viewBox="0 0 43 43"`, `crispEdges`, QR drawn as `<path>`, ZERO
embedded raster. Encoded URL fully tagged
(`...?utm_source=newsletter&utm_medium=email&utm_campaign=spring-sale`). Drops straight into
Illustrator and prints razor-sharp at any size.

## Still open (acknowledged out of scope this round)
PNG resolution — no DPI/size option; bulk/contact PNGs are still screen-res, so if a client
grabs the PNG for a flyer instead of the SVG it's too small at 300dpi. Not a blocker since
the SVG covers real print, but it's the one thing between this and a 10.

## CLARITY: Yes — same instantly-legible H1 + subhead.
## VALUE: Yes — bulk QR + true vector from the same grid beats one-by-one QR-site pasting,
and I can now TRUST the bulk output blind because invalid rows are skipped with a clear count.
## ADVOCACY: 9 — blocker that capped me at 8 is gone, output is trustworthy, SVG is the real
deal. Held short of 10 only by the screen-res PNG with no DPI choice.

```json
{"name":"Rob","clarity":"Yes","value":"Yes","advocacy":9,"qr_reaction":"The invalid-row leak is fully fixed — per-row QR is disabled on the incomplete row and bulk Download QR codes skips it with a clear '1 skipped — incomplete or invalid URL' note, so no untracked QR lands in the ZIP or contact sheet. The SVG is still a true print-ready vector (path-based, crispEdges, viewBox, zero raster) that drops straight into Illustrator.","prior_concerns_addressed":"fixed — invalid-row QR leak closed (verified ZIP + contact sheet contain only the valid row); PNG DPI still open but acknowledged out of scope this round","likes":["Invalid rows are now skipped from bulk QR with an explicit skipped count, and the per-row QR button is disabled — I can trust the output blind","SVG export is a genuine scalable vector (viewBox 0 0 43 43, crispEdges, <path>, no embedded raster) — prints razor-sharp at any size in Illustrator","Per-row popover shows the exact fully-tagged encoded URL so I can verify before downloading","Auto-named files (01-spring-sale-newsletter-email.png) + contact sheet kill the one-by-one grunt work"],"complaints":["PNG resolution still low with no DPI/size option — if a client grabs the bulk/contact PNG for print instead of the SVG it's too small at 300dpi (acknowledged out of scope this round)"],"verdict_summary":"The blocker that capped me at 8 is genuinely gone — I added a base-URL-only row, hit Download QR codes, and it skipped it with a clear '1 skipped' note; the ZIP and contact sheet only show the tracked row. Combined with the true-vector SVG, this is now the grunt-work killer I wanted and I'd trust it in front of a client. One DPI option on the PNGs is all that's between this and a 10."}
```
