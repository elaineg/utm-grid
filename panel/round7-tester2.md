SCORE: 9/10

# Marcus — Frontend engineer (2y), desktop Chrome + devtools. Round 7, QR feature.

**Cold open (30s):** Title "Clean campaign links in a grid" + "No login — nothing leaves
your browser" told me exactly what it is. I'd pitch it to a friend as "bulk UTM builder,
free, no signup — now it spits out branded QR codes too." Clarity: Yes.

**Value vs today:** I currently hand-edit query params per channel and paste each URL into
a random QR site (qr-code-generator, which paywalls SVG + logo + size). UTM Grid does the
UTM-cleaning AND the QR in one place, client-side, free. That genuinely saves me the
URL→QR-site round trip per link. For a multi-channel launch (email/Twitter/blog) the bulk
ZIP is real time saved.

## QR feature — does it work? Yes, and it's well-built.
- Per-row QR popover: encodes full UTM URL, Copy / Download PNG / Download SVG. SVG output
  is valid `<svg>` markup (verified). PNG sizes 512/1024/2048 in the branding panel.
- QR Branding panel (Tools menu): fg/bg color pickers with hex, **live contrast ratio**
  ("17.7:1 ✓ scannable"). I set #eee on #fff → it dropped to "1.2:1", showed "Low
  contrast — pick a darker foreground…", AND greyed out Download PNG/SVG in the row modal
  with "Low contrast — fix colors in QR Branding to enable download." That guard is exactly
  right; it stops you shipping a dead QR. Best part of the feature.
- Center logo: composites a knockout in the QR center, bumps error-correction to H, with
  "Logo composited locally — never uploaded." Remove/Change controls present. Solid.
- Bulk ZIP: "Download QR codes (N selected)" → real `utm-qr-codes.zip` (70KB, "2 QR codes
  generated"). Works.

## Biggest friction
The bulk ZIP button is BURIED in the Tools dropdown. Checking row checkboxes (aria-label
"Select row N for bulk edit") surfaces **no inline bulk-action bar** — I selected all rows
and nothing appeared near the grid; I only found "Download QR codes (2 selected)" by
opening Tools. The label even tracks the count, so the wiring exists — it's just hidden
where I'd never look mid-task. I expected a bulk bar to slide in over the grid.

Secondary nit (devtools eye): the "ENCODES" URL input in the row popover visually bleeds
~130px past the card's right edge instead of clipping/ellipsing inside it. Minor, but I
noticed instantly. Also: two file inputs exist and I accidentally fed my logo to the CSV
importer first — a clearer logo-only affordance would help.

## One improvement
Surface a sticky inline bulk-action bar the moment rows are selected ("3 selected · Download
QR ZIP · Export CSV · Delete"). That single change turns the marquee feature from
hidden-in-a-menu into obvious.

## "Free, no-signup, branded bulk QR" — delight moment?
Yes, mild "wait, this is free?!" — branded QR + SVG + logo are exactly what the QR sites
paywall. The contrast guard pushed it from "neat" to "I'd actually trust this for a launch."
I'd drop it in team Slack. Held back from 10 only by the hidden bulk entry point.

```json
{"tester": 2, "round": 7, "clarity": "Yes", "value": "Yes",
 "advocacy": 9, "topComplaints": ["bulk ZIP buried in Tools menu — selecting rows shows no inline bulk-action bar", "ENCODES URL input visually overflows past the QR popover's right edge"], "priorConcernsAddressed": "n/a"}
```
