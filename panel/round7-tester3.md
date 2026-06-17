SCORE: 9/10

Persona: Wen, marketing data analyst (GA4/BigQuery/Sheets/Looker). I distrust tools that
transform data invisibly and want CSV in/out plus lint for casing inconsistencies.

## Cold open (30s)
Headline "Clean campaign links in a grid" + subhead about auto-fixing the casing/spacing
that "splits a campaign into two in your analytics" landed instantly — that IS my pain.
"No login — nothing leaves your browser" earns trust before I've clicked anything. Clear.

## QR feature (the round-7 thing)
- Per-row QR popover: works. Encodes the FULL generated UTM URL and SHOWS the encoded
  string under "ENCODES" — so I can eyeball that it matches my row before downloading.
  That visible-encoding detail is exactly what my distrust needs. Copy + Download PNG/SVG.
- Bulk "Download QR codes (3 selected)" in Tools: produced utm-qr-codes.zip with a
  per-link PNG named 01-spring-sale-2026-newsletter-email.png (campaign-source-medium —
  maps straight to my UTM values, files itself) PLUS a contact-sheet.png. Both valid
  1024px PNGs. Rows missing required source/medium were correctly EXCLUDED, not exported
  as broken QRs — good hygiene.
- QR Branding panel: SIZE 512/1024/2048, FORMAT PNG/SVG, fg/bg pickers with a LIVE
  contrast ratio + live preview, center-logo upload. "Logo composited locally — never
  uploaded / All client-side" stated explicitly.
- Contrast guard: REAL, not decorative. Set fg #cccccc → "Contrast: 1.6:1", amber banner
  "Low contrast — pick a darker foreground...", and the per-row Download PNG went DISABLED
  with "Low contrast — fix colors in QR Branding to enable download." It actually stops me
  shipping an unscannable QR. This is the kind of guardrail I wish more tools had.

Verified live: PNG download = real 1024x1024 PNG (27KB); ZIP = 2 valid PNGs; 0 console errors.

## Would I use it? Yes.
Today I'd hand a designer a list and they'd hand-make QRs in some random site, or I'd paste
links into a free QR generator one at a time (and worry it logs my URLs). Bulk + named files
+ visible-encoding + no-signup + client-side genuinely beats that. The "free, no-signup,
branded bulk QR" combo is a mild "wait, this is free?!" for me — not euphoric (I came for the
UTM lint, QR is a bonus), but the contrast guard + privacy framing is what makes it credible.

## Three answers
1. Advocacy: 9/10. I'd bring up the UTM auto-fix unprompted to my marketing team; the bulk
   branded QR is the thing I'd add as "and it does QR too, free." Held back from 10 only
   because QR is adjacent to my core job (lint/CSV is the hook), not because anything broke.
2. Biggest friction: the bulk QR action lives buried in the Tools dropdown under "IMPORT &
   MOVE" — I only found it because I was told to. A floating bulk-op bar with a visible
   "Download QR (N)" button when rows are selected would surface it. Right now nothing
   appears on the grid when I check rows.
3. One improvement: include the cleaned CSV (or a manifest) INSIDE the ZIP mapping each
   filename → full UTM URL. As a data person I want the QR PNG and its exact target URL in
   one downloadable artifact so nothing is "transformed invisibly" between QR and sheet.

```json
{"tester": 3, "round": 7, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["bulk Download-QR action buried in Tools dropdown; no on-grid bulk bar when rows selected", "ZIP has PNGs but no CSV/manifest mapping filename to the exact UTM URL"], "priorConcernsAddressed": "n/a"}
```
