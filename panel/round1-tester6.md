{"name":"Jules","clarity":"Yes","value":"Yes","advocacy":"8","prior_concerns_addressed":"n/a for round 1"}

# Jules — Content & community marketer, 50/50 desktop+mobile

## What I did
Cold-opened on desktop. Headline "Clean campaign links in a grid" + "No login — nothing
leaves your browser" — I got it in ~10 seconds. Opened Tools ▾, found Channel Presets:
built-in presets for **X/Twitter, Mastodon, Paid Social–LinkedIn, Organic Social, Email,
Google/CPC** — literally my exact platform mix. Applied LinkedIn (→ source=linkedin,
medium=paid_social), set "New rows use → X/Twitter" so adding a row pre-fills
source=twitter/medium=social. That's my daily bulk workflow, done in clicks.
Then the round trip: saved a campaign "Jules Q3 Launch" on a desktop context, opened
"Move to another device", exported (Download .json AND Copy code both work, 1.3KB bundle),
then on a FRESH 375px mobile context imported it. Preview showed "1 added · 0 updated ·
0 skipped — Campaigns: 1 added 'Jules Q3 Launch'", hit Confirm import → "merged", reloaded,
campaign persisted ("Campaigns (1)"). Full bookmark-and-carry loop works on phone.

## What worked
- Presets are THE feature for me. Per-platform, one-click, plus a custom "Save preset…".
- "Move to another device" copy is reassuring exactly where I'm twitchy: "This is your own
  local data — nothing is uploaded" and "This manual move is free and always will be." It
  never made me think about a login. Clearly no-account.
- Import is a MERGE with a non-destructive preview ("we never overwrite your saved
  campaigns") — I trust pasting a code from my laptop into my phone now.
- Mobile is real responsive cards, no horizontal scroll, the modal stacks cleanly at 375px.
- Auto-fix + the "splits a campaign into two in your analytics" framing nails the real pain.

## What confused/annoyed me
- The presets live behind Tools ▾ → "Channel Presets", which then expands a separate
  "Presets — fill source/medium" panel above the grid. Two hops to reach the thing I came
  for. On a bookmarked tool I'd want presets visible by default, not buried in a menu.
- "Save preset…" — I clicked it expecting a quick name prompt; it wasn't obvious what got
  captured. Minor, but the preset-creation moment is less polished than apply.
- The toolbar is crowded (Tools/Share/Rules dropdowns + 5 buttons). As a medium-tech user
  I had to hunt; "Audit URLs" vs "Run Launch Check" vs "Rules" blurred together.

## Bug / artifact
No real bug. Note: "Copy code" copied fine in-app (button enabled, bundle present); reading
clipboard back was blocked in my headless test env — copy verified visually, not a regression.

## Single thing most holding back my score
**Discoverability of presets.** The one feature that makes me bookmark this is two menu-hops
deep. Surface platform presets on first load (a visible row of platform chips above the grid)
and I'm at a 9 — I'd post about it unprompted. Right now an 8: I love it, but I'd have to tell
a friend "click Tools, then Channel Presets, then expand the panel," and that caveat is what
keeps it from a clean recommend.

```json
{"tester": 6, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["The killer feature (X/Twitter/LinkedIn/Mastodon presets) is hidden two hops deep behind Tools ▾ → Channel Presets → expand panel, not visible on cold landing", "Toolbar is crowded — 'Audit URLs' vs 'Run Launch Check' vs 'Rules' blur together for a medium-tech user"], "priorConcernsAddressed": "n/a"}
```
