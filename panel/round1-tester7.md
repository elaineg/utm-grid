# utm-grid — Round 1, Tester 7 (Aisha, Product Designer) — QR feature
A teammate shared this; I judge craft hard (empty states, copy tone, affordances) and advocate loudly only if it holds up. This round I exercised the new QR feature specifically.

## Clarity — Yes
H1 "Clean UTM links for your whole campaign — in one grid." + the casing/typos subline land in seconds. "nothing leaves your browser" is a nice trust touch.

## Value — Yes
I don't build UTMs daily, but the inline lint (uppercase warning with one-click "Fix") already beats the bare Google URL builder a teammate would otherwise use. QR-per-link + ZIP is a real reason to come back.

## QR craft — mostly considered, one rough edge
Verified:
- Per-row QR button DISABLED on an invalid row, tooltip "Add a valid URL to make a QR." — thoughtful.
- Popover: heading "QR Code — Row 1", an ENCODES label with the FULL encoded URL (https://acme.com/launch?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale), a 160px QR, Download PNG / Download SVG. Downloads fire with clean names qr-row-1.png / qr-row-1.svg.
- Toolbar "Download QR codes" → utm-qr-codes.zip with slugified, numbered PNGs (01-spring-sale.png, 02-summer-promo.png) + contact-sheet.png. Result message "1 QR code generated, 1 row skipped — no valid URL" / "4 QR codes generated" — specific and warm, exactly the tone I want.
- Contact sheet: clean QR grid, monospace labels "01 spring_sale". Printable, considered.

## Friction (holds it down from 9)
1. P1 — Per-row popover anchoring looks off. On 1280–1440px the popover's QR image lands at the page's bottom-right overlapping the "Allowed values" panel rather than floating cleanly beside the QR trigger (repro: fill a valid row, click QR, inspect — img rect ~x1127/y810, not adjacent to button). Element renders fine, but it doesn't sit where my eye expects. A clumsy popover is exactly what nags me.
2. P3 — Contact sheet lays QRs in a single non-wrapping row — fine for 4, overflows for a 20-row batch.
3. P3 — "⊞ QR" button reads grey/muted enough to look secondary/disabled even when active.

```json
{"tester": 7, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Per-row QR popover anchoring is off — on 1280–1440px the QR/popover overlaps the lower 'Allowed values' panel area instead of floating cleanly beside its trigger button", "Contact sheet uses a single non-wrapping row of QRs, which will overflow for large batches", "'⊞ QR' button label is muted enough to read as disabled even when active"], "priorConcernsAddressed": "n/a"}
```
