{"name":"Rob","clarity":"Yes","value":"Yes","advocacy":"7","prior_concerns_addressed":"n/a for round 1"}

# Rob — freelance brand/visual designer, desktop, medium tech

## What I did
Cold-opened, read the hero, then worked it: filled two client-promo rows, hit **Auto-fix**
(normalized "Newsletter"→newsletter, "Summer Sale 2026"→summer_sale_2026, flashed the 3 changed
cells green, threw an "Auto-fixed 3 cells — Undo" toast), saved the grid as a campaign
"ClientAcme — Summer", exported CSV, then ran the full **Move to another device** round-trip:
Copy code on device A → pasted into a CLEAN second browser (device B) → Preview import → Confirm.

## 1. CLARITY — Yes
Got it in ~10s. "Clean campaign links in a grid" + subhead about casing/spacing splitting a
campaign in two in analytics + "export a clean CSV that drops straight into your sheet" told me
exactly what it is and who it's for. The "No login — nothing leaves your browser" line is a plus.
Nothing confused me.

## 2. VALUE — Yes (for the core flow)
Today I hand-type query strings or copy an old link and swap words, always telling myself "I
could do this in Photoshop... err, by hand in 4 minutes." Reality: by hand I fat-finger casing.
Auto-fix instantly killed the casing-split I can't catch by eye, with Undo so I trust it, and the
CSV came out with a BOM + clean generated_url column — opens straight in Excel to forward a
client. For a *batch* that genuinely beats hand-typing. Zero console errors throughout.

## The new "Move to another device" feature — honest take
It works flawlessly. Export gave a 1432-char code via "Copy code" (clipboard read worked in my
test env); on a clean device the **Preview** showed "1 added · 0 updated · 0 skipped — Campaigns:
1 added 'ClientAcme — Summer'", Confirm merged it, end-state read "Import complete! Your setup has
been merged." The reassurance "We merge into what's already here — we never overwrite your saved
campaigns" is exactly what I'd want before pasting a code. Solid engineering.
BUT for ME it's a **vitamin, not a painkiller.** I tag links occasionally and live in Figma/PS,
not here — I won't accumulate a per-client campaign library worth carrying between my laptop and
desktop. The "Coming soon: accounts sync automatically" note basically concedes this manual
export/import is the clunky interim. Great for a daily UTM-heavy marketer; for occasional-me it's
a button I clicked once out of curiosity.
Minor nit: import adds the campaign to the *library* but doesn't load it into the active grid — I
briefly expected my two rows to appear; a "imported — click Open to load it" hint would help.

## 3. ADVOCACY — 7/10
Well-built, clear, and the move feature round-trips perfectly. But my honest comparison is "I tag
links twice a month and could hand-type a string in 4 minutes." Auto-fix + clean CSV beats that
for a batch, earning real points — yet it's not weekly for me, and the headline new feature solves
a cross-device problem occasional-me doesn't have. I'd mention it to a marketer friend who lives in
UTMs, not bring it up unprompted to designer peers. A real 7, not a polite one.

## Single thing most holding back the score
**Recurrence for my persona, not quality.** Nothing's broken — the app is good. It's that the new
cross-device move targets the heavy daily user, and for an occasional link-tagger like me there's
no habit loop. Make the *occasional* user's single session feel indispensable (the auto-fix/CSV
payoff) over chasing cross-device power-user depth, and I'd push it higher.

```json
{"tester": 8, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 7, "topComplaints": ["'Move to another device' is a vitamin for an occasional link-tagger — I won't build a campaign library worth carrying between machines; it targets daily power users", "Import adds a campaign to the library but doesn't load it into the active grid; momentarily expected my rows to appear — a 'click Open to load it' hint would help"], "priorConcernsAddressed": "n/a"}
```
