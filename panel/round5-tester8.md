# Round 5 — Tester 8 (Rob, freelance brand/visual designer)

Device: desktop. Tech: medium. Benchmark: "I could do this by hand in 4 minutes" + my per-client Google Sheet.

## Re-checking my round-4 complaints (was advocacy 8)

1. **"Duplicate" was 3 steps, not one (my core monthly-clone use case).** FIXED. The campaign
   card now has a clearly-labeled "Duplicate campaign" button. ONE click took Campaigns (1) →
   Campaigns (2), created a "Client X – Spring copy" card instantly, no prompt, no draft mode,
   no name retype. Verified: after the click the name-input field count is 0 (so I'm not dumped
   into an unsaved draft anymore) and a second persistent library card exists. This is exactly
   the one-click clone I wanted for "set up next month's version of this client."
2. **Cosmetic count scare (original briefly showed 1 link while grid had 2 rows).** FIXED. After
   duplicating, both cards read "2 links · saved just now" — no flicker, original count never
   dropped. Verified in DOM, not just visually.
3. **BONUS — lint warned but didn't auto-fix (had to click "Fix" per cell).** There's now an
   "Auto-fix naming" button up top. One click turned "LinkedIn / Social Media / Spring Sale"
   into "linkedin / social_media / spring_sale" across all cells. This was my other gripe and
   it's gone too.

## What I did this round
Cold-opened, built a 2-row "Client X – Spring" batch (linkedin/social + email/newsletter), saved
it as a named campaign, then clicked "Duplicate campaign" once. Confirmed second card + count up.
Confirmed the grid row now has its own icon-only duplicate (⧉) and trash (🗑) in the ACTIONS
column — clearly separate from the card-level "Duplicate campaign". No confusion between the two.

## Value vs. my workflow
My Google Sheet remembers clients but can't lint or spit a clean CSV; hand-typing query strings
is where the capital-letter splits happen. With one-click campaign duplication AND one-click
auto-fix, this now genuinely beats both my Sheet and doing it by hand for recurring client work.
The "clone last month, tweak, re-export" loop is now ~20 seconds. I'd actually move my client UTM
work here.

## Sanity
Zero console errors across all runs. Grid/presets/CSV/share-link/save/persist all still work.
No regression spotted.

## Advocacy
The two things that capped me at 8 last round are both fixed, plus an auto-fix bonus. It does one
job, does it cleanly, remembers my clients, and the monthly-clone is now a single click. I'd bring
this up unprompted to designer/marketer friends who tag links. Bumping to 9. Not a 10 only because
it's still a single-purpose utility with no cross-device sync (localStorage only) — fine for me,
but "10" would mean my saved clients follow me to my laptop.

```json
{"tester":"Rob","clarity":"Yes","value":"Yes","advocacy":9,"campaigns_verdict":"'Duplicate campaign' is now genuinely one click — it created 'Client X – Spring copy' as a second persistent library card and bumped the count 1→2 with no draft, no rename, no count flicker. The monthly per-client clone is finally a single click and beats my Sheet + hand-typing.","prior_concerns_addressed":"Yes — one-click duplicate, count flicker gone, AND the warns-but-no-autofix lint now has a one-click 'Auto-fix naming'","likes":["'Duplicate campaign' is one click, creates a real second saved card, count increments correctly","Count flicker on the original card is gone — both show '2 links' immediately","One-click 'Auto-fix naming' fixes casing/spaces across all cells (LinkedIn→linkedin, Spring Sale→spring_sale)","Row-level duplicate is now a separate icon-only ⧉ in ACTIONS, no longer confusable with cloning a campaign","Saved campaigns persist across reload, no account"],"complaints":["Still localStorage-only — my saved clients won't follow me to a second machine, which keeps it from being a 10","Row icons (⧉, 🗑) are icon-only with no visible label; fine once you learn them but a tooltip/word would help a first-timer"],"regression":"none"}
```
