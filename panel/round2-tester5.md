```json
{
  "name": "Dana",
  "clarity": "Yes",
  "value": "Yes",
  "advocacy": 9,
  "qr_reaction": "I rebuilt my exact round-1 batch (LinkedIn/google/newsletter + one row with empty utm_source) and the ZIP now contains exactly 3 QRs — the untracked row was skipped, with a clear '3 QR codes generated, 1 skipped — incomplete or invalid URL' banner. Filenames AND the printable contact-sheet labels now carry the channel ('01 · Summer Sale · LinkedIn/Social', '02 · summer_sale · google/cpc', '03 · summer_sale · newsletter/email'), so on a printed sheet I can finally tell which QR is which.",
  "prior_concerns_addressed": "fixed — both shipped exactly as described: invalid rows are excluded from the QR export (no more QR for an untracked link), and labels/filenames include source/medium. Bonus: the per-row QR button now has aria-label 'QR code for row 1' instead of a mystery gray icon.",
  "likes": [
    "QR export now skips incomplete rows and tells me how many it dropped — I won't unknowingly print a QR pointing at an untracked link on a real Thursday.",
    "Contact sheet + filenames both label by channel (linkedin-social / google-cpc / newsletter-email) — usable on actual printed/event collateral now.",
    "Verified end-to-end on my phone between meetings: per-row QR popover (PNG/SVG) and the bulk 'Download QR codes' ZIP both work at iPhone width, zero console errors.",
    "Still the one-scroll value: auto-fix casing, no login, nothing leaves the browser."
  ],
  "complaints": [
    "Minor inconsistency: the contact-sheet label for row 1 shows raw casing 'Summer Sale · LinkedIn/Social' while its filename is the auto-fixed 'summer-sale-linkedin-social' — not a blocker since I run Auto-fix first, but the printed label should reflect the cleaned values too.",
    "Nitpick: 'Download QR codes' lives in the top toolbar far from the rows; on a long grid I scroll past my data to reach it."
  ],
  "verdict_summary": "Both things I dinged last round are genuinely fixed — I reran my exact scenario and the invalid row was skipped with a count, and every QR is now channel-labeled in the filename and on the printable sheet. This is now the first UTM tool that survives a real weekly launch including print/event QR collateral, works from my phone, and I'd screenshot it into the team channel unprompted. Holding back the last point only on the cosmetic raw-vs-cleaned label mismatch on the contact sheet."
}
```
