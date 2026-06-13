# Round 4 — Tester 10 (Sam, Product Manager, mobile-heavy)

## Prior concerns (round 3)
Last round my one blocker was live team sharing; the "Copy share link" feature fixed it and
took me 8 -> 9. Re-checked this round: share link still works, button flips to "Link copied!",
and the generated `/#g=...` URL carries the whole grid. Still solid. Addressed: all (held).

## 5-second impression
Same clear headline ("Tag all your campaign links with clean, consistent UTM tags at once").
I instantly know what it is. New "Campaigns" panel sits under Presets with a "(1)" count once
I save. The "Unsaved grid" chip up top is a nice honest status.

## Campaigns library — what I did
- Built a 3-row batch (Newsletter/EMAIL, LinkedIn/social, Google/cpc, all campaign "Q3 Launch").
- "+ Save as campaign" -> inline "Name this campaign" field (NOT a flaky browser prompt — good).
  Saved "Q3 Launch": sidebar shows **"Q3 Launch · 3 links · saved just now"** and header "Campaigns (1)". Link count correct.
- Reloaded the page: campaign AND my grid both persisted. Good — this is the "never rebuild" promise.
- Duplicate -> "Q3 Launch copy", count (2). Delete -> confirm "Delete campaign… This can't be undone.", back to (1). Both work.
- Warn-before-losing-unsaved-work: edited a cell, hit Open -> confirm dialog
  *"Open \"Q3 Launch\"? Your current unsaved grid (3 links) will be replaced. This can't be undone."* This is exactly what saves me from clobbering work. Loved it.
- When a saved campaign is open, the panel offers "Save changes / Save as new…" — smart, matches how I'd reopen Q3 next week and tweak.
- Combined flow: opened the saved campaign, hit Copy share link, got a real shareable URL. The save+reuse+share loop is genuinely the launch workflow I want.

## The real friction (and it's a mobile one — that's me)
On my phone the saved-campaign card shows ONLY the name + "3 links · saved 1m ago". The
**Open / Duplicate / Delete buttons are hidden until you interact** (hover on desktop /
tap-to-reveal on touch). With a real finger they DO appear after a tap, but there is zero
affordance telling me the row is tappable — no chevron, no "···" menu, nothing. First time I
looked I thought Duplicate/Delete didn't exist on mobile. A PM who "won't debug anything"
will assume the feature is desktop-only. Give the card a persistent "···" / overflow menu or
always-show the actions on touch.

## Sanity check
Grid edit, inline lint warnings ("Contains uppercase letters — use lowercase only"), Clean
all ("Cleaned 3 cells" + Undo), CSV export (clean header row + generated_url column), and
share link all still work. No console errors anywhere.

## Verdict
Clarity: yes. Value: yes — this is now a place I'd KEEP my launches, not just a one-off
cleaner. Today I do this in a Google Sheet with a hand-built formula that nobody else can
read; this saves the rebuild and lets me hand a teammate a link. The named library is what
makes me come back weekly. Advocacy held at 9, not 10, purely because the hidden mobile
actions made me briefly think the library was half-broken on the device I use most.

```json
{
  "tester": "Sam",
  "clarity": "Yes",
  "value": "Yes",
  "advocacy": 9,
  "campaigns_verdict": "Saving 'Q3 Launch' as a named campaign with link count, reload persistence, Open/Duplicate/Delete, and the unsaved-work confirm all work — and it composes cleanly with the share link I already loved. This genuinely makes me more likely to run every launch out of here instead of a Sheet, because I never rebuild and I can hand off a link.",
  "likes": [
    "Inline 'Name this campaign' field instead of a fragile browser prompt",
    "Campaign card shows link count + 'saved just now', and header count 'Campaigns (1)'",
    "Reload persisted both grid and saved campaign",
    "Strong unsaved-work guard: 'Your current unsaved grid (3 links) will be replaced. This can't be undone.'",
    "Open-campaign panel switches to 'Save changes / Save as new…' — matches reopen-and-tweak",
    "Save + reuse + Copy share link is the exact launch workflow"
  ],
  "complaints": [
    "On mobile the saved-campaign card only shows the name + '3 links · saved'; Open/Duplicate/Delete are hidden until you hover (desktop) or tap-to-reveal (touch), with no chevron/'···' affordance — first glance looks like the actions don't exist on phone",
    "Two 'Campaigns' sections render in the DOM (a mobile toggle and a sidebar); harmless visually but it's why I had to hunt for the right card"
  ],
  "regression": "none"
}
```
