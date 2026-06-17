SCORE: 9/10

Persona: Sam, PM, mobile-heavy between meetings. Today I hand-build UTMs in a Sheet + paste
into Bitly for QR codes, then screenshot them into decks. Tested cold on a 375px viewport.

## The three questions
1. **Advocate? 9/10.** I'd bring this up in our launch Slack channel unprompted. The combo of
   bulk UTM building + branded QR + clean CSV is exactly the "look organized" workflow I live
   in, and "free, no login, nothing leaves your browser" is a real "wait, this is free?!"
   moment for me. Held back from 10 only by the QR feature being slightly buried (see #2).
2. **Biggest friction:** discoverability. The headline + grid sell UTM building, not QR. The
   per-row "⊞ QR" icon and the "QR Branding" / "Download QR codes" items live under a "Tools ▼"
   menu — a PM skimming between meetings won't know branded bulk QR exists unless they hunt. I
   nearly missed the whole feature I was sent to test. Surface it above the fold or in an
   empty-state hint.
3. **One improvement:** put a visible "QR codes" affordance on the toolbar (not hidden in
   Tools), and label the bulk button "Download all QR codes (ZIP)" with the count, e.g.
   "Download 30 QR codes (ZIP)" so I trust it grabbed the whole batch.

## QR feature — yes, I'd use this, and it delights
- Per-row QR preview is clean: shows the QR, "ENCODES" the full tagged URL, with Copy /
  Download PNG / Download SVG. Confirmed PNG downloaded as `qr-row-1.png` (1024x1024) and a
  real scalable `qr-row-1.svg`.
- Bulk ZIP works and is thoughtful: `utm-qr-codes.zip` contained
  `01-spring-sale-2026-newsletter-email.png` (descriptive filename I can drop straight into a
  deck) PLUS a `contact-sheet.png` overview. The contact sheet is a genuine delight — that's
  the artifact I'd paste into a launch doc.
- Branding panel nails my "look organized" need: SIZE 512/1024/2048, PNG/SVG, fg/bg color
  pickers, and a logo upload that composited our mark into the QR center with a live preview.
- Scannability guard is the trust-builder: at good contrast it shows "Contrast: 17.7:1 ✓
  scannable"; when I pushed fg to near-white it flipped to orange "Contrast: 1.1:1", faded the
  preview, and warned "Low contrast — pick a darker foreground or a lighter background so
  scanners can read it." That stops me shipping a dead QR — exactly the debugging I refuse to do.
- Reassurance copy ("Logo composited locally — never uploaded", "All client-side") matters to
  me before I drop a brand asset in.

Notes: a couple of buttons share the same icon/label ("QR Branding" vs row "⊞ QR") which made
the feature harder to find; not a bug. Copy verified visually; clipboard read blocked in test
env. No console/page errors observed across all flows.

```json
{"tester": 10, "round": 7, "clarity": "Yes", "value": "Yes", "advocacy": 9,
 "topComplaints": ["Branded bulk QR is buried under a Tools menu; nearly missed it cold", "Bulk ZIP button lacks a count/'all' label so I don't trust it grabbed the whole batch"],
 "priorConcernsAddressed": "n/a"}
```
