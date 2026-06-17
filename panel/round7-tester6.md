SCORE: 9/10

# Jules — Content & community marketer (round 7, QR feature)

## Cold open (30s)
Clear instantly. "Clean campaign links in a grid" + "Build and tag a whole batch of 30+
campaign links at once" + "No login — nothing leaves your browser" tells me exactly what it
is and that I won't have to sign in for a 2-minute job. Presets row literally has **X/Twitter**
and **Mastodon** next to Email/LinkedIn — that's my exact stack, felt built for me.

## QR feature — what I tried
- Per-row **⊞ QR** popover: shows QR, the encoded URL, Copy, Download PNG, Download SVG. Works.
- **QR Branding** panel (Tools): SIZE 512/1024/2048, PNG/SVG toggle, fg/bg color pickers with a
  live **Contrast: 17.7:1 ✓ scannable** readout that updates live.
- **Low-contrast guard**: set fg to #ddd → readout went amber "Contrast: 1.4:1" and a banner
  fired: "Low contrast — pick a darker foreground or a lighter background so scanners can read
  it." Preview QR faded gray. Exactly the guardrail I'd want before I print 200 stickers.
- **Center logo**: uploaded a PNG, it composited dead-center into a brand-blue (#1d4ed8) QR,
  contrast recalced to 6.7:1, "Remove/Change logo" appeared. Note reassured "Logo composited
  locally — never uploaded." That line is why I'd trust it.
- **Bulk ZIP** (Tools → Download QR codes): produced `utm-qr-codes.zip` with one PNG per row,
  smartly NAMED `01-spring-sale-2026-newsletter-email.png` etc. PLUS a labeled `contact-sheet.png`
  of all three. Zero console errors anywhere. The contact sheet was the genuine "oh nice" moment.
- Mobile (375px): clean per-card layout, QR button present, opened fine. I'm 50/50 mobile so this matters.

## Three answers
1. **Advocate: 9/10.** I'd bring this up unprompted in my marketing Discord. Branded bulk QR,
   free, no login, runs in-browser — yes this is a "wait, this is free?!" moment. I currently
   pay-adjacent for this: QR Monkey free tier nags + watermarks branded/bulk, and Bitly gates
   QR behind a paid plan. Doing it bulk + branded + named-files + contact sheet, no account,
   beats both.
2. **Biggest friction:** the bulk QR ZIP lives in the **Tools** dropdown labeled "Download QR
   codes", but the test brief (and my instinct) expected a "Download QR codes (ZIP)" button in
   a bulk-op bar when I select rows — I checked all 3 rows and **no bulk bar appeared**, so I
   nearly missed the batch export. It's buried a menu-level deeper than it should be.
3. **One improvement:** surface "Download QR codes (ZIP)" as a button in the selection/bulk
   bar (or right next to Export CSV) — and let me pick a default brand color once and have it
   stick per saved campaign, so my X vs LinkedIn QRs can carry different brand colors.

## Why not a 10
The batch QR being only reachable via the Tools menu cost it. Make bulk QR as obvious as
Export CSV and this is a 10 I bookmark today.

```json
{"tester": 6, "round": 7, "clarity": "Yes", "value": "Yes", "advocacy": 9,
 "topComplaints": ["Bulk QR ZIP hidden in Tools menu; selecting rows shows no bulk-op bar with a 'Download QR codes (ZIP)' button", "Brand color/logo is global, not per-platform/per-saved-campaign"],
 "priorConcernsAddressed": "n/a"}
```
