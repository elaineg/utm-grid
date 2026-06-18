# Dana — Round 4 (Demand-gen marketer)

**Prior verdict (R3): 9/10, HELD.** This round shipped a further visual fix: the UTM Spec
panel collapsed state is now pixel-identical to the other two panels.

## Re-check of my own prior concerns
- **Panel equality (my lingering nit): CONFIRMED FIXED.** Measured all three collapsed cards —
  Campaign Naming Template / Campaigns / UTM Spec all read height 73px, width 400px, same top
  (493px), same 1px border, 8px radius, 0 padding. True equal-weight peers now; no
  "afterthought" panel.
- **One-scroll value: NO REGRESSION.** Hero "Clean campaign links in a grid" + subhead naming
  the casing/spacing-splits-a-campaign-in-GA4 pain + "No login — nothing leaves your browser" +
  live grid + presets + lint rollup all above the fold on my MacBook.

## Fresh pass
1. **Clarity — Y.** Cold, I knew exactly what it is and that it's for me: a batch UTM builder
   that auto-cleans the casing/spacing that splits a campaign in analytics. The cold "We catch
   near-duplicates like spring_sale vs Spring-Sale — they split one campaign into two in GA4"
   demo nails the why instantly.
2. **Value — Y.** Today I hand-build 30+ tagged links in a Google Sheet with CONCATENATE every
   Thursday and eyeball for stray caps (the exact thing that bites me in GA4). This does the
   grid AND catches the casing I miss. Lint fired instantly ("1 issue found — jump to first",
   inline "Fix this value"), flipped to "All clean ✓" the moment the row was valid. Auto-fix
   showed a readable before→after diff (utm_medium: "Spring Sale" → "spring_sale") with Undo.
   Copy gave the exact generated URL; Export CSV downloaded utm-grid.csv. Beats my sheet.
3. **Advocacy — 9. HELD.** No regression, and the panel-equality nit that kept me off 10 last
   round is now fixed. Still a 9 (not 10) honestly because the cross-row near-dup catch — the
   single most screenshot-worthy thing — lives only as the cold demo line, not front-and-center
   in the actual build flow. That polish ceiling, not a flaw, is what holds the leap to "I bring
   it up unprompted to every marketer I know."

Team Workspace DB error in this local env was ignored per instructions (test-env limitation).

```json
{"name":"Dana","clarity":"Y","value":"Y","advocacy":9,"why":"Panel-equality fix confirmed — all 3 collapsed cards now pixel-identical (73x400px, same border/radius/top); no regression to one-scroll value. Lint fires instantly, auto-fix before/after diff + Undo is clean, Copy and CSV export both work, beats my Thursday Google Sheet. Held at 9: cross-row near-dup detection is still just a cold demo line rather than surfaced in the build flow, which caps the leap to 10.","priorConcernsAddressed":"all"}
```
