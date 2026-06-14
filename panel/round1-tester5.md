```json
{
  "name": "Dana",
  "clarity": "Yes",
  "value": "Yes",
  "advocacy": 8,
  "qr_reaction": "QR per-row + ZIP-with-printable-contact-sheet is genuinely useful for my event/print/social collateral and it works on my phone, but the contact sheet labels every QR with just the campaign name ('summer_sale') so I can't tell the LinkedIn QR from the Google one on a printed page.",
  "likes": [
    "Value lands in one scroll: headline 'Clean UTM links for your whole campaign — in one grid' + 'no login, nothing leaves your browser' is exactly my Thursday pain.",
    "Auto-fix naming fixed 'LinkedIn'->'linkedin', 'Social'->'social', 'Summer Sale'->'summer_sale' and flagged the casing inconsistencies that would split my GA4 data — that's the 15-min grind gone.",
    "QR works and downloads cleanly: per-row PNG/SVG plus a top-level ZIP (utm-qr-codes.zip) containing a PNG per link AND a printable contact sheet. Zero console errors.",
    "Mobile (375px) is fully usable between meetings: the grid becomes a labeled stacked card with the generated URL, and the QR popover with Download PNG/SVG opens fine."
  ],
  "complaints": [
    "QR export does NOT skip invalid rows despite claiming to. Repro: add a row with empty utm_source (grid shows '⚠ utm_source is required'; generated URL = https://acme.com/launch?utm_medium=social&utm_campaign=summer_sale, no source) -> 'Download QR codes' still includes it as 04-summer-sale.png in the ZIP and contact sheet, and the per-row QR button is enabled. I'd unknowingly print a QR pointing to an untracked link.",
    "Contact-sheet QR labels are useless for a batch: four different-channel rows all labeled '01 summer_sale', '02 summer_sale'... only the campaign name. On a printed sheet I cannot tell which QR is LinkedIn vs Google vs newsletter. Labels need source/medium too.",
    "The per-row 'QR' control is a small gray icon-button in the actions column with no tooltip — easy to miss next to the prominent top toolbar 'Download QR codes'."
  ],
  "verdict_summary": "This is the first UTM tool that actually fits my weekly grind — paste a batch, auto-fix the casing landmines, export, and now grab QR codes for event/print collateral, all with no login and even from my phone. I'd screenshot it into the team channel. It's not a 9 yet because the QR export shipped a QR for an invalid (untracked) link instead of skipping it, and the contact-sheet labels don't say which channel each QR is — both things I'd hit on a real Thursday launch."
}
```
