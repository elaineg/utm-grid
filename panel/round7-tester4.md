SCORE: 8/10

# Tomás — Ops analyst, Edge/Windows, Excel power user (Round 7, QR feature)

Persona note: I build tagged links in Excel; IT blocks installs so a browser tool is gold —
IF it won't mangle my data or leak it. The header "No login — nothing leaves your browser"
and the branding-panel line "All client-side — your logo and links never leave your browser"
directly answered my #1 worry. That earns trust I don't give random sites.

## What I tested
- Per-row QR: opens a modal, renders the encoded UTM URL, Copy + Download PNG/SVG. Works.
- QR Branding panel (Tools menu): 512/1024/2048 PNG sizes, PNG/SVG toggle, fg/bg color
  pickers with a LIVE contrast readout ("17.7:1 ✓ scannable"), live preview. Polished.
- Contrast guard: set fg to #dddddd → "Contrast 1.4:1", yellow banner "Low contrast — pick a
  darker foreground... so scanners can read it", and the per-row modal's Download PNG/SVG
  buttons went genuinely DISABLED with "fix colors in QR Branding to enable download." That's
  the feature I'd actually rely on — it stops me printing a flyer QR that won't scan.
- Center logo: uploaded a PNG, it composited into the QR center, stayed "✓ scannable" (it
  bumps error-correction to level H), got Change/Remove logo. Input correctly accepts PNG/SVG only.
- Bulk "Download QR codes" (ZIP): 36KB zip, one PNG named 01-spring-sale-2026-newsletter-email.png
  (row + campaign — exactly how I'd file campaign assets) PLUS a contact-sheet.png bonus.

## Three questions
1. ADVOCACY: 8/10. I'd bring this up to my marketing counterparts unprompted. Held back from 9
   because QR is a nice add-on, not my core job — and the round-trip-with-my-Excel-sheet promise
   (the thing that sells ME) lives in CSV import, which I didn't stress here. The QR work is
   genuinely above bar though.
2. BIGGEST FRICTION: QR Branding is buried in the Tools dropdown under "BUILD & REUSE." Coming
   from a per-row QR modal that only says "Download PNG/SVG" with no size/color, I'd assume the
   app has no branding until I happened to open Tools. The modal should link to "Brand these →".
   (Separately: CSV import parsed my PNG as "4 data rows" — no file-type guard on the import input.)
3. IMPROVEMENT: surface branding from the QR modal, and let the ZIP filenames/contact-sheet be
   the default brag — show "Download all 30 as branded QR ZIP" right in the bulk bar.

## "Free, no-signup, branded bulk QR" — delight moment?
Yes, genuine. The contrast guard + locally-composited logo + per-campaign-named ZIP is paid-tool
behavior (QR.io / Bitly charge for branded bulk QR). "This is free and runs entirely in my
browser?!" — for someone whose IT blocks installs, that's the hook. I'd use the ZIP for print
collateral every campaign.

```json
{"tester": 4, "round": 7, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["QR Branding hidden in Tools dropdown; per-row QR modal exposes no size/color/logo, so the feature looks absent", "CSV import had no file-type guard (parsed a PNG as 4 data rows)"], "priorConcernsAddressed": "n/a"}
```
