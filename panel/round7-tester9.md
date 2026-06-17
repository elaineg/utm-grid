SCORE: 6/10

# Round 7 — Tester 9 (Elena, Eng Manager, 30-sec patience)

Tested cold on laptop. I am NOT the buyer here — I manage engineers, I don't build campaign
links. One of my reports asked if this is worth standardizing on, so I skimmed it as a sanity check.

## The QR feature actually works (I checked)
- Per-row "QR" button: instant scannable QR, encoded URL, Copy, Download PNG/SVG. Clean.
- QR Branding (in Tools): SIZE 512/1024/2048, PNG/SVG, fg/bg color pickers with a LIVE
  contrast readout ("17.7:1 ✓ scannable").
- Low-contrast guard: dropped to 1.0:1 → orange warning + the per-row Download PNG/SVG
  buttons went DISABLED with "Low contrast — fix colors in QR Branding to enable download."
  Bulk ZIP also refused. That's a genuinely thoughtful guardrail — most tools let you ship a
  dead QR.
- Logo upload: "Logo composited locally — never uploaded" + bumps error-correction to H. Worked.
- Bulk "Download QR codes" → real 36KB utm-qr-codes.zip with a sensibly-named file
  (01-spring-sale-2026-newsletter-email.png) PLUS a contact-sheet.png. That contact sheet is a
  nice touch. Zero console errors throughout.

## Q1 — Advocate? 6/10
For the people I'd recommend it to (marketers), this is a tidy, no-signup, free QR-on-top-of-UTM
tool and the contrast guard shows care. But I'm scoring as ME: it's not in my workflow, I'd never
bring it up unprompted, and the branded-QR depth is past what I can vouch for to a report in 30
seconds. A 6, not a polite 7 — I can confirm it works, not that it's the one to standardize on.

## Q2 — Biggest friction
The bulk QR ZIP and QR Branding are buried inside the "Tools ▼" dropdown. I checked a row
expecting a "1 selected → Download QR codes" action bar to appear; nothing surfaced. For a
30-second skimmer the headline feature (BULK QR) is invisible until you open a menu. The QR
popover also has NO size/branding controls — those only live in the separate Tools panel, so it's
not obvious the per-row QR even respects your branding.

## Q3 — One improvement
Surface bulk QR where the eye already is: when rows are selected, pop a "N selected — Download QR
codes (ZIP)" bar inline instead of hiding it in Tools. And put a "Branding" link inside the per-row
QR popover so the two halves of the feature connect.

## "Free, no-signup, branded bulk QR" a "this is free?!" moment?
Mildly. The contrast guard + contact sheet + local-logo privacy are nicer than I expected for free.
But "wow, free?!" requires me to need it — for a marketer drowning in QR-code-generator paywalls,
yes; for me, it's "neat, not for me." I'd use the per-row QR maybe once for a Zoom/Notion link, not
the bulk pipeline.

```json
{"tester": 9, "round": 7, "clarity": "Yes", "value": "Marginal", "advocacy": 6, "topComplaints": ["bulk QR & branding buried in Tools dropdown — no inline selected-rows action bar, invisible to a 30-sec skimmer", "per-row QR popover has no size/branding controls, so the two halves of the feature feel disconnected"], "priorConcernsAddressed": "n/a"}
```
