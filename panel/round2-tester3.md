```json
{
 "name":"Wen",
 "clarity":"Yes",
 "value":"Yes",
 "advocacy":9,
 "qr_reaction":"Re-ran my exact repro (row1 valid, row2 missing utm_source, row3 empty): the bulk download now reports '1 QR code generated, 2 skipped — incomplete or invalid URL' and the per-row QR button is DISABLED on the incomplete row, enabled only on the valid one. 'Generated' now means 'valid' — the inflated count is gone, exactly what I needed.",
 "prior_concerns_addressed":"fixed — both. (1) QR no longer overcounts: a row missing required utm_source is skipped AND counted, per-row QR disabled when lint blocks, verified live. (2) Export CSV now begins with the UTF-8 BOM (xxd shows EF BB BF before base_url); a non-ASCII campaign (été_naïve_café) round-trips clean and is correctly percent-encoded in generated_url — Excel-safe.",
 "likes":[
   "QR eligibility is now data-honest: incomplete/invalid rows skipped + counted, per-row QR disabled when lint blocks — no QR ships for a tool-flagged-invalid URL",
   "Export CSV carries the UTF-8 BOM; accented campaign names open clean in Excel and generated_url is properly percent-encoded — no invisible transforms",
   "Lint still catches casing/space inconsistencies per-field with the exact offending value; one-click Auto-fix naming normalizes them",
   "Lossless CSV round-trip with explicit column mapping, plus Launch Check to QA a whole batch against naming rules pre-launch"
 ],
 "complaints":[
   "Minor: the '1 generated, 2 skipped' result is a quiet inline line I had to hunt for in the body after the ZIP downloaded — a data person wants that count as a prominent, persistent summary (or in the ZIP contact sheet), not a transient note."
 ],
 "verdict_summary":"They fixed both things I flagged and fixed them correctly — I re-ran my exact repro and the QR count now treats a required-field-missing row as 'skipped', not 'generated', and the CSV finally carries a UTF-8 BOM so my accented campaign names don't mangle in Excel. This nails my whole data-hygiene loop with zero silent transforms. Only thing keeping it off a 10 is that the skip/generate count is a quiet inline note rather than a prominent persistent summary."
}
```
