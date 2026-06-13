# Round 5 — Tester 1 (Priya, senior backend SWE, keyboard-first, hates signups)

## Re-check of my exact round-4 complaints

1. **Row vs campaign Duplicate/Delete collision — FIXED.** Grid-row actions are now
   icon-only in a fixed ACTIONS column: `Copy`, `⧉` (title "Duplicate row"), `🗑` (title
   "Delete row"). The campaign card now reads `Open` / `Duplicate campaign` /
   `Delete campaign` — full, unambiguous verbs scoped with the word "campaign". There is no
   longer a "Dup/Del" text button anywhere near the card. I deliberately tried to repeat my
   mistake and couldn't — the row icons read as row-level and the card buttons say
   "campaign". Collision gone.

2. **Per-cell Fix only — FIXED.** Filled two rows with dirty values (Twitter, "Social
   Media", "Summer Launch"). Saw 4 inline `Fix` buttons. One click on **Auto-fix naming**
   normalized everything: `Twitter→twitter`, `Social Media→social_media`,
   `Summer Launch→summer_launch`, and the per-cell Fix count dropped from 4 to 0. This is
   exactly the bulk fix I asked for. The button is also visually distinct (amber outline).

## Other flows re-exercised
- Save as campaign → inline name field → saved "Summer Promo", card shows
  `2 links · saved just now`, header pill `In: Summer Promo`. Card actions always visible
  (no hover-to-reveal).
- **Reload → pill persists** as `In: Summer Promo`. Confirmed via fresh page load.
- Card actions after save are correct: `Save changes` / `Save as new…` plus per-campaign
  `Open` / `Duplicate campaign` / `Delete campaign`.
- Zero console errors across fill, auto-fix, save, and reload. Still fully client-side
  ("no network requests after page load" claim holds; share link is a fragment).

## Verdict
All four shipped fixes landed and resolve my friction cleanly — this is a tight, correct
iteration. Quality is now genuinely 9-grade for the workflow it targets. What still caps
*my* personal advocacy is unchanged and honest: I tag links ~twice a year, so the
accumulation library isn't a weekly hook for me. The lint + Auto-fix + clean CSV is the
part I'd actually use, and it's excellent. I'd send this to a marketer unprompted now —
the row/campaign confusion that made me hesitate last round is gone, so I'm moving from 8
to 9. It's not a 10 only because nothing about a UTM tagger is something I personally reach
for often enough to evangelize from my own use.

```json
{"tester":"Priya","clarity":"Yes","value":"Yes","advocacy":9,"campaigns_verdict":"Save/open/duplicate/delete + the 'In: <name>' pill all persist across reload via localStorage and read with clear campaign-scoped verbs; genuinely sticky for a weekly marketer, nice-to-have for my twice-a-year cadence.","prior_concerns_addressed":"Yes — both: row actions are now icon-only with 'Duplicate row'/'Delete row' tooltips in a fixed column while the card says 'Duplicate campaign'/'Delete campaign' (collision gone), and 'Auto-fix naming' bulk-normalized all 4 flagged cells in one click.","likes":["Auto-fix naming clears every flagged cell in one click — fixed 4 cells, per-cell Fix count went 4→0","Row vs campaign action collision fully resolved: icon-only row buttons + 'campaign'-scoped card buttons, couldn't reproduce my old mistake","'In: Summer Promo' pill survives reload; card actions always visible","Still 100% client-side, zero console errors across every operation"],"complaints":["Fit only: a UTM tagger isn't something I personally use weekly, so the accumulation loop is aimed past me — not a quality issue"],"regression":"none"}
```
