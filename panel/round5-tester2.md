# Round 5 — Tester 2 (Marcus, frontend engineer, 2 yrs, desktop Chrome + devtools)

## Re-check of my two round-4 blockers (I rated this a 6, lowest on the panel)

**Blocker 1 — "Duplicate campaign is broken" → FIXED (and it was partly my mistake).**
Saved "Spring Launch" (header → `Campaigns (1)`, one Open button). Clicked the card's
**"Duplicate campaign"** button → header flips to `Campaigns (2)`, a second card titled
**"Spring Launch copy"** appears ("1 link · saved just now"), Open-button count 1→2.
Measured, not eyeballed. This is exactly the library-grows-with-you behavior I wanted.
The round-4 root cause holds up: there used to be two buttons both reading "Dup" and I hit
the grid-ROW one. That's gone now — see blocker 2.

**Blocker 2 — janky CSS, row buttons overlapping the Generated URL text → FIXED.**
Built a row with a deliberately long base URL (140 chars,
`...spring-product-launch/very-long-path-segment/index.html?ref=newsletter-q2-blast`).
Measured the DOM, not the eye:
- GEN URL cell computed style: `white-space:nowrap; overflow:hidden; text-overflow:ellipsis`,
  clientW=224 vs scrollW=1420 → text truncates to `https://www.example-marketi…` and CANNOT
  spill into the actions column.
- Actions live in a fixed column to the RIGHT: Copy x=868–914, Duplicate-row x=918–942,
  Delete-row x=946–975. The duplicate/delete buttons sit 43px and 71px clear of the URL
  cell's right edge. (Bounding-box math flags a 7px td-edge overlap for the Copy button,
  but that's the cell boxes touching — the URL *text* is clipped at clientW so zero glyphs
  render under any button. Confirmed in screenshot: clean ellipsis, buttons clearly to the
  side.) No overlap at any URL length. My #1 visual complaint is gone.

## Row-vs-campaign duplicate confusability → RESOLVED
- Grid-row buttons are now icon-only: `⧉` with `title="Duplicate row"` /
  `aria-label="Duplicate row 1"`, and `🗑` `title="Delete row"`. In a fixed actions column.
- Campaign card button spells out **"Duplicate campaign"**. Different label, different place.
  No way to confuse them anymore — the exact trap I fell into in round 4 is designed out.

## Fresh pass (everything else still good)
- Cold open: 0 console errors, no layout shift, headline still nails the what+who.
- Save flow: inline name field, green "Saved!" pill, "In: Spring Launch · Saved!" header tag.
- Accessibility nicety I now notice with devtools open: every row control has an aria-label
  ("Select row 1", "Copy URL row 1", etc.) — that's more polish than I expected.
- 0 console errors across save + duplicate + long-URL render.

## Verdict — is this an unprompted Slack share now? Yes.
Both things that held me at 6 are genuinely fixed, verified by measurement, not vibes. The
duplicate works, the count increments, the "copy" card is real, and the long-URL layout is
clean with proper ellipsis truncation and a fixed actions column. The icon-only row buttons
with tooltips are the right call. I'd drop this in our launch-prep Slack channel today.
Holding it one notch below a 10 only because I haven't lived a full launch week on it yet —
but there's no defect or jank left that I can point at. Moving 6 → 9.

```json
{"tester":"Marcus","clarity":"Yes","value":"Yes","advocacy":9,"campaigns_verdict":"Duplicate campaign now works exactly as expected — header went Campaigns(1)→(2), a 'Spring Launch copy' card appeared, Open-button count 1→2. The row-vs-campaign confusion is designed out: row buttons are icon-only (⧉/🗑 with 'Duplicate/Delete row' tooltips) while the card button spells 'Duplicate campaign'.","prior_concerns_addressed":"Yes — both: (1) campaign Duplicate verified creating a new '<name> copy' card with count+1; (2) long-URL layout fixed — GEN cell truncates with text-overflow:ellipsis (clientW 224 vs scrollW 1420), action buttons sit 43–71px clear in a fixed column, zero text under any button","likes":["Duplicate campaign produces a real 'Spring Launch copy' card and increments the count","Long base URL truncates cleanly with ellipsis; fixed-width actions column never overlaps the URL text (measured, not eyeballed)","Row buttons are icon-only with aria-labels/tooltips ('Duplicate row'/'Delete row') — no longer confusable with the campaign card's 'Duplicate campaign'","0 console errors across save/duplicate/long-URL; full aria-labels on row controls"],"complaints":["Only nit: the 'Copy URL' row button sits ~7px into the GEN-URL td's box edge — no visual collision because the text is clipped, but a frontend dev with devtools open will notice the touching boxes; tightening that gap would make it pixel-perfect"],"regression":"none"}
```
