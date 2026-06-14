```json
{
 "name": "Wen",
 "clarity": "Yes",
 "value": "Yes",
 "advocacy": 8,
 "qr_reaction": "QR encodes the EXACT URL-encoded tagged link (a&b in content -> %26/%20, so no fake params), and ZIP gives real per-campaign PNGs plus a contact sheet. But the skip/count is misleading: a row missing REQUIRED utm_source got a QR counted as 'generated' while only the empty row was 'skipped'.",
 "likes": [
   "Lint catches uppercase AND spaces per-field with the exact offending value, and flags required-field misses",
   "Auto-fix naming normalizes Google->google, 'CPC '->cpc, 'Summer Sale'->summer_sale in one click",
   "CSV round-trip is lossless with an explicit column-mapping dialog (auto-matched headers, Append/Replace, Undo) — no invisible transforms",
   "QR popover shows the correctly URL-encoded tagged URL; ZIP names files by campaign (01-q3-launch.png)"
 ],
 "complaints": [
   "DATA-INTEGRITY: ZIP says '2 QR codes generated, 1 row skipped — no valid URL', but the skipped one was the empty row; the incomplete row (example.com/two?utm_medium=email, lint says 'utm_source is required' + 'utm_campaign is required') was COUNTED as generated. Repro: row1 full+valid, row2 base+medium only (no source), row3 empty -> Download QR codes -> message counts row2 as generated. 'generated' != 'valid', so the reassuring count can let a QR ship for a tool-flagged-invalid URL.",
   "Export CSV has no UTF-8 BOM (xxd of export.csv starts at 'base_url', no EF BB BF) — non-ASCII campaign names can mangle when opened in Excel."
 ],
 "verdict_summary": "This nails my core data-hygiene loop: real lint, one-click auto-fix, and a lossless CSV round-trip with zero silent transforms — and the QR genuinely encodes the exact tagged URL. What stops me at an 8 is the skip/count message: it labels a row missing a REQUIRED field as 'generated' rather than 'skipped', and for a data person an inflated 'all good' number is worse than no number. Make 'generated' mean 'valid' and add a CSV BOM and it's a 9-10."
}
```
