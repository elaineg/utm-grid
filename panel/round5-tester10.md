# Round 5 — Tester 10 (Sam, Product Manager, mobile-heavy)

## Re-check of my round-4 blocker (the only thing capping me at 9)
Last round, on my phone the saved-campaign card showed ONLY the name + "1 link · saved",
with Open/Duplicate/Delete hidden behind hover/tap-to-reveal and zero affordance — I assumed
the library was desktop-only.

**FIXED.** On a 375px touch viewport the "Q3 Launch" card now shows a persistent action row
right under it: **Open · Duplicate campaign · Delete campaign**, all plainly visible, full-size,
opacity 1, no hover and no tap required. After Duplicate, the second card "Q3 Launch copy"
shows the exact same always-visible row. This is the device I actually use, so this is the
difference between "half-broken" and "I run launches out of here." Addressed: Yes.

## Re-ran my whole loop on mobile (375px, touch)
- Built Q3 Launch row (newsletter / email / Q3 Launch on https://example.com/launch).
- "+ Save as campaign" -> inline "Name this campaign" field -> "Q3 Launch". Saved: pill flips
  to **"In: Q3 Launch · Saved!"**, header shows **Campaigns (1)**, card "Q3 Launch · 1 link ·
  saved just now". Correct.
- **Reload**: pill persisted as **"In: Q3 Launch"**, Campaigns (1) persisted, grid row still
  there. The never-rebuild promise holds across a refresh. (Saved! pill correctly relaxes to
  "unsaved changes" with an amber dot once I edit a cell — honest status, I like it.)
- **Duplicate campaign** -> "Q3 Launch copy", header now **Campaigns (2)**. Works.
- **Copy share link** -> clipboard got a real URL: `…/#g=N4IgTg9g7…` carrying the whole grid.
  Button stayed labeled but the link genuinely landed in my clipboard (verified by reading it
  back). No server, link built in-browser as advertised.
- Zero console/page errors across the entire run.

## What still nags (minor, not blocking)
- The Campaigns section re-collapses to a chevron after reload, so each session I tap once to
  expand before I see my library. Small, but for a "won't debug" PM I'd default it open when
  there are saved campaigns.
- The mobile row-level "duplicate" icon in the GENERATED URL table sits right next to a tiny
  trash icon and they're cramped/overlapping with the URL text — easy to fat-finger. The
  campaign-card buttons are great; it's the per-row mini-icons that are fiddly on a phone.
- Still appears to render a mobile + sidebar Campaigns block in the DOM; harmless now that
  actions are visible, but it's clutter.

## Verdict
Clarity: Yes — headline + "Edit links in a grid, fix naming automatically, export clean CSV —
no account" tells me what and who in 5 seconds. Value: Yes — today I keep a hand-built Google
Sheet formula nobody else can read; this saves the rebuild, persists across reloads, and lets
me hand a teammate a link. The named, reusable library is exactly why I come back weekly.
Advocacy: **10.** The one thing holding me at 9 — believing the library was desktop-only — is
gone. I'd now bring this up unprompted to other PMs coordinating launches. The two nags above
are polish, not reasons to withhold a recommendation.

```json
{"tester":"Sam","clarity":"Yes","value":"Yes","advocacy":10,"campaigns_verdict":"Saved-campaign card actions (Open/Duplicate campaign/Delete campaign) are now a persistent, always-visible row on mobile — no hover, no tap-to-reveal — on both Q3 Launch and its duplicate. Save, reload-persist ('In: Q3 Launch'), Duplicate to Campaigns (2), and Copy share link all work cleanly on a 375px touch viewport.","prior_concerns_addressed":"Yes — the hidden mobile card actions that capped me at 9 are now always visible with full affordance","likes":["Campaign card now shows Open/Duplicate/Delete in a persistent row on mobile, no hover needed","'In: Q3 Launch' pill persists across reload; relaxes to 'unsaved changes' + amber dot honestly when I edit","Duplicate campaign bumps header to Campaigns (2) and clones to 'Q3 Launch copy'","Copy share link puts a real grid-carrying URL in the clipboard, all client-side","Save+reuse+share is the exact launch workflow, now fully usable on the phone I live in"],"complaints":["Campaigns section re-collapses to a chevron after reload — would default open when campaigns exist","Per-row duplicate/trash mini-icons in the GENERATED URL table are cramped/overlapping with the URL text and easy to fat-finger on mobile","Still renders a duplicate mobile+sidebar Campaigns block in the DOM (harmless now)"],"regression":"none"}
```
