SCORE: 9/10

Persona: Aisha, product designer. I don't build UTMs often; a teammate shared this. I judge
craft — spacing, copy tone, empty states, lint affordances. Tested on desktop, 1280px.

## What I tried (cold)
Landed, opened a row's "QR" → tidy popover (not a heavy modal), Copy + Download PNG/SVG,
shows the exact URL it encodes. Then Tools → found the new QR work. Tools menu is genuinely
considered: sectioned (BUILD & REUSE / GOVERN CONVENTIONS / IMPORT & MOVE) with sub-captions.
Opened "QR Branding", drove fg/bg pickers, contrast guard, logo upload, sizes, ZIP.

## Craft verdict (the things I came to judge)
- QR Branding panel: small-caps section labels, live preview that updates as I type, contrast
  readout "17.7:1 ✓ scannable", "Reset defaults", clear privacy line. Restrained, considered.
- Contrast guard is the highlight. Set fg #dddddd → readout flips amber "1.4:1", the preview QR
  visibly grays out, and a banner appears: "Low contrast — pick a darker foreground or a lighter
  background so scanners can read it." It tells me WHY and HOW, not a bare red error. Clicking
  "Download QR codes" while low-contrast is BLOCKED with an inline note "Fix QR color contrast in
  Branding before downloading." Exactly the lint affordance I advocate for.
- Logo upload: composites into the center live, shows a thumbnail + Change/Remove logo, keeps
  "Logo composited locally — never uploaded." Empty→filled state handled.
- Bulk ZIP works: downloaded utm-qr-codes.zip with HUMAN-READABLE slugged filenames
  (01-spring-sale-2026-newsletter-email.png) PLUS a bonus contact-sheet.png overview. That extra
  is the detail that makes me trust the maker.
- Sizes 512/1024/2048 + PNG/SVG are present and clearly grouped.

## The three questions
1. Advocate: 9/10. I'd bring this up unprompted to our growth team. Free, no-signup, branded
   bulk QR with a real scannability guard is a "wait, this is free?!" moment — remove.bg-tier.
2. Biggest friction: the contrast guard blocks via an AFTER-the-click inline message rather than
   a disabled button + tooltip. The "Download QR codes" item isn't visibly disabled, so the first
   time I clicked it I expected a ZIP and instead got a small text note up by Tools — easy to miss.
   Also: per-row QR popover Download PNG/SVG buttons didn't fire a download in my headless test
   (copy verified visually; blob/clipboard download blocked in test env — NOT reported as a bug;
   the bulk ZIP proved real blob downloads work, and buttons render correctly).
3. Improvement: make the low-contrast state actually DISABLE the download triggers (grey them,
   tooltip "fix contrast first") instead of letting the click happen then explaining — that's the
   considered pattern and removes the one moment the UI surprised me.

QR feature: yes, I'd use it — branded campaign QR for print/decks/events, batched, no Adobe round
trip. The branded bulk + contact sheet + privacy framing is a genuine delight moment.

```json
{"tester": 7, "round": 7, "clarity": "Yes", "value": "Yes", "advocacy": 9,
 "topComplaints": ["low-contrast guard blocks via after-click inline note instead of disabling the download buttons (easy to miss)", "duplicate aria-labels on desktop+mobile row inputs (a11y nit)"],
 "priorConcernsAddressed": "n/a"}
```
