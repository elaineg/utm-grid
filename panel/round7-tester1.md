SCORE: 8/10

Persona: Priya — senior backend eng, keyboard-first, hates signups, abandons anything slower than a CLI. Tagging a side-project launch post; a teammate sent this instead of a spreadsheet.

## Cold open (30s)
**Clarity: Yes.** "Clean campaign links in a grid" + "No login — nothing leaves your browser" told me exactly what it is and that it won't waste my time with auth. Grid layout reads like a spreadsheet I already trust. I'd tell a friend: "bulk UTM builder, runs entirely in your browser, no account."

## QR feature — what I tried
- Per-row ⊞ QR popover: instant, shows encoded URL + Copy + Download PNG/SVG. Good.
- QR Branding panel (under Tools): SIZE 512/1024/2048, PNG/SVG, fg/bg color pickers, live preview, "Contrast: 17.7:1 ✓ scannable". This is the part that earned trust.
- Low-contrast guard: set fg #eeeeee on white → "Contrast 1.2:1", preview greyed out, yellow "Low contrast — pick a darker foreground…" banner, AND the per-row popover dropped its Download buttons (only Copy left). The guard genuinely blocks bad output. Respect.
- Logo upload present with honest copy: "We bump error-correction to level H… Logo composited locally — never uploaded."
- Bulk ZIP: works. `utm-qr-codes.zip` → `01-spring-sale-2026-newsletter-email.png` (1024×1024, real scannable QR, named from UTM values) + a `contact-sheet.png`. The auto-naming from UTM values is the detail a spreadsheet+remove.bg-style tool never gives me. Zero console errors, no network calls — client-side as claimed.

## The three questions
1. **Advocate: 8/10.** I'd recommend it to the marketer on my team unprompted; for myself it's a "save the link, use it twice a year" tool so not a 9. The contrast guard + client-side + sane file naming are what push it past a polite 7 — it's actually well-built, not a toy.
2. **Biggest friction:** the bulk QR ZIP is buried in the **Tools** dropdown. I selected all my rows expecting a contextual action bar ("3 selected → Download QR codes") and NOTHING appeared — selecting rows surfaces no bulk-op bar at all. I only found the ZIP by opening Tools and reading every item. A CLI-brain expects the action to live where the selection is.
3. **One improvement:** when rows are checked, show a bulk-action bar with "Download QR codes (ZIP)" right there. Bonus: the QR Branding panel had no keyboard shortcut and lives two clicks deep — surface contrast/size inline next to the per-row QR too.

## "Free, no-signup, branded bulk QR" — delight moment?
**Mild delight, not a gasp.** The "this is free?!" trigger for ME is the no-login + client-side proof (logo never uploaded, contrast guard) — that's genuinely better than the QR generators that paywall logo/SVG. But branded bulk QR for UTMs is a marketer's recurring need, not mine; I'd use the bulk CSV + plain QR maybe twice a year. For the marketer I'd forward it to, this is an easy 9.

## Value
Today I hand-edit query strings in the terminal or paste into a throwaway QR site. This is faster for a batch and the contrast/scannability guard removes the "is this even readable?" guesswork — net time-saver for multi-link launches. **Value: Marginal for me, Yes for the marketer audience.**

```json
{"tester": 1, "round": 7, "clarity": "Yes", "value": "Marginal", "advocacy": 8, "topComplaints": ["Bulk QR ZIP is buried in Tools dropdown; selecting rows shows no bulk-op action bar", "QR Branding panel is two clicks deep with no keyboard path / no inline contrast feedback per row"], "priorConcernsAddressed": "n/a"}
```
