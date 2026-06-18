# Jules — Round 4 (Content & community marketer, 50/50 desktop+mobile)

**Prior concern (R3, I held at 8):** the three collapsed setup panels weren't visual equals
— the UTM Spec / Allowed Values panel had a blue/indigo border tint, sat ~12px lower,
rendered shorter, and had an inline (not right-aligned) chevron. I said "make all three
genuinely identical and I'm back to 9."

**Did they fix it? YES — verified with computed styles (devtools).** All three collapsed
`<aside>` cards on cold load are now byte-identical:
- Border: all `lab(91.62 ...)` = `border-gray-200` neutral grey. The blue/indigo tint is GONE.
- Border width: all `1px`; background: all `rgb(255,255,255)` white.
- Top offset: all `top:493` — baseline aligned, no more 12px drop.
- Height: all `73px` — no more short/broken render.
- className identical: `flex flex-col w-full rounded-lg border border-gray-200 bg-white`.
- Header `justify-content: space-between` on all three → chevron right-aligned in every one.
They read as true identical peers now. My cap is cleared.

**Cold open:** Headline "Clean campaign links in a grid" + "Build and tag a whole batch of
30+ campaign links at once... export a clean CSV. No login — nothing leaves your browser."
Instantly legible. The "All clean / we catch near-duplicates like spring_sale vs Spring-Sale
— they split one campaign into two in GA4" rollup is a great cold demo of the why.

**Exercised:** Applied a preset, built a row → generated
`...?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale_2026`. Copy button put
the full link on the clipboard (read it back — works). Export CSV present. Auto-fix + diff
present. Expanded/collapsed all three setup panels — smooth. Mobile (375px) stacks into clean
cards, no h-scroll, demo banner up top. Zero console errors throughout.

1. **Clarity: Y** — understood it in well under 30s. Headline + subhead + no-login line nail it.
2. **Value: Y** — I juggle links across X, LinkedIn, Mastodon and Buffer daily and hate
   logging in for a small job. Per-platform presets + bulk grid + no account = bookmark
   material. Today I hand-type UTMs or paste into Google's clunky single-link builder; this
   beats both for batches.
3. **Advocacy: 9** — I'd bring this up unprompted in a marketing Discord. The panel-parity
   nit that held me at 8 is genuinely fixed. Not a 10 only because a 10 for me means I've
   used it across a few real campaigns and trusted the CSV export into GA4 over time — that's
   earned with mileage, not a defect. Nothing on screen confuses me anymore.

```json
{"name":"Jules","clarity":"Y","value":"Y","advocacy":9,"why":"Prior R3 cap fully fixed — all three collapsed setup panels now byte-identical (border-gray-200, white bg, top:493, height:73, right-aligned chevron, verified via computed styles). No-login bulk UTM grid with per-platform presets is exactly my daily pain; copy/export work, zero console errors, clean mobile. Not a 10 only because that needs real-campaign mileage, not because of any defect."}
```
