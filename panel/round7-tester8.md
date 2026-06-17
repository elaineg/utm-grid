SCORE: 8/10

Persona: Rob — freelance brand/visual designer. Compares everything to "I could do this in Photoshop in 4 minutes." Desktop, color-calibrated monitor.

WHAT I TESTED (cold): per-row QR popover, QR Branding panel (fg/bg hex, sizes, SVG), contrast guard, center-logo composite, bulk "Download QR codes" ZIP.

QR feature verdict — would I use it? YES, genuinely. This is the first part of the app that's clearly aimed at me, not just analytics people. The branding panel is properly thought through for a designer:
- fg/bg as HEX (#1d4ed8 took my brand blue fine), live preview updates instantly.
- Contrast readout with a real WCAG-style ratio (17.7:1 ✓ scannable; dropped to 1.2:1 → orange "Low contrast" banner AND the Download PNG/SVG buttons in the row popover go disabled with "fix colors in QR Branding to enable download"). That guard is the part I'd never bother computing by hand — it actually stops me shipping a dead QR. Nice.
- Center logo: composited with a clean white clear-margin, error-correction bumped, still scans, "Logo composited locally — never uploaded." That last line matters to me with client assets.
- 512/1024/2048 + SVG covers print AND web handoff. SVG is the one that beats Photoshop — vector QR I can scale in Illustrator with no re-export.
- Bulk ZIP delivered descriptively-named PNGs (01-spring-sale-2026-newsletter-email.png) PLUS a labeled contact-sheet.png. The contact sheet is a real handoff/proofing artifact I'd actually use.

"This is free?!" moment? PARTLY. Branded bulk QR (logo + brand color + SVG + ZIP, no signup) is a paid feature on QR-code SaaS sites — so yes, the no-paywall framing lands. It's a quiet delight, not a jaw-drop, because the QR stuff is buried.

VALUE vs my workflow: Marginal-to-Yes. For ONE QR I'd still do Photoshop in ~4 min. The win is BULK — 30 branded, contrast-checked, named QRs as a ZIP + contact sheet is genuinely faster than hand-placing logos 30 times. That's the only reason this beats my current habit.

BIGGEST FRICTION: discoverability. The whole branded-QR system lives buried in the "Tools" dropdown ("QR Branding" / "Download QR codes"). I only found branding because I went hunting. The per-row "QR" button opens a popover with NO link to branding, and there's no QR/branding affordance above the fold at all. A designer who came specifically for branded QR codes would bounce thinking it's just plain black QRs. (Also: there's no visible "bulk-op bar" — bulk QR is a menu item, not a contextual bar on selected rows, which I'd expect.)

ONE IMPROVEMENT: surface QR branding from the per-row popover — a "Brand these" / gear link inside the QR popover that opens the branding panel, plus a "Download all QR codes" button visible when rows are selected. Right now the best feature in the app is its most hidden one.

Note: clipboard "Copy" in the popover — verified visually (label/handler fired); did not read clipboard in test env, not reporting as a bug.

```json
{"tester": 8, "round": 7, "clarity": "Yes", "value": "Marginal", "advocacy": 8, "topComplaints": ["QR branding + bulk-QR ZIP are buried in the Tools dropdown with no entry point from the per-row QR popover or above the fold", "No contextual bulk-op bar for selected rows; bulk QR download is a hidden menu item"], "priorConcernsAddressed": "n/a"}
```
