# Round 1 — Tester 1 (Marcus, frontend eng, 2yr, Chrome+devtools)

## What I did
Landed cold for a product-launch tagging job. Built 3 rows (email/Twitter/blog -> acme.com/launch),
hit **Auto-fix naming** (correctly lowercased `Email`->`email`), confirmed generated URLs are clean.
Clicked **Create shared workspace** -> got a `/w/<id>` link, link auto-copied, grid synced ("All changes
saved"). Set **Editing as: Marcus**, edited a campaign value (spring->summer-launch), waited for autosave.
Opened **History**: two snapshots, correctly attributed "by Marcus [current]" + "by Anonymous", banner
flipped to "last edited by Marcus". Hit **Preview** on the old version -> clear yellow
"Previewing version from 57s ago (by Anonymous) - read-only" banner with Restore / Back-to-current, grid
showed the old values. Reloaded fresh: current state persisted correctly (Marcus's summer-launch), history
intact at 2 with attribution. Zero console/page errors across the whole flow.

## Friction / nits (I notice this stuff)
- Minor: in Preview mode the cells say "read-only" but the inputs aren't DOM-disabled (still editable at
  the field level). Banner + "Back to current" make intent obvious, so it's polish, not a bug.
- Restore copy is reassuring ("Restoring brings a version back without losing the current one") - good.
- No janky CSS; the synced banner, history list, and grid all line up cleanly.

## Verdict
This nails the trust property a team UTM grid needs: every edit is snapshotted, attributed to a name,
and previewable + restorable non-destructively. Clarity is immediate; the History feature explains itself.

CLARITY: Yes
VALUE: Yes
ADVOCACY: 9/10
REASON: Beats hand-fiddling query params, the auto-fix catches the casing typos that silently split my
GA reports, and the attributed version-history makes a shared grid feel safe as a team source-of-truth -
I'd drop this in our team Slack. Not a 10 only because Preview cells aren't truly locked.

```json
{"tester": 1, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 9, "topComplaints": ["Preview mode labeled read-only but input cells remain editable at DOM level (polish gap)"], "priorConcernsAddressed": "n/a"}
```
