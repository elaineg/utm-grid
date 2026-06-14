# Round 2 — Tester 5 (Dana, demand-gen marketer)

PRIOR CONCERN (round-1 advocacy 7): I typed my name but approvals showed "by Anonymous" —
"Your name" only set "Editing as", not review attribution. RESOLVED. One "Your name" field
now drives everything: top bar reads "Editing as: Dana Reyes", the review popover has an
inline "Reviewing as" field, and after I approved row 1 the row shows "✓ Approved by Dana
Reyes" with my note "Approved for Thursday launch — Dana". No "Anonymous" anywhere. Best
part: I opened /w/<id>/review in a FRESH browser (the colleague's view, no name set) and it
still rendered "Approved by Dana Reyes" + "Needs changes by Dana Reyes" with both notes and
"1 of 2 approved" — server-persisted, so a sign-off I forward actually names who signed it.

The /review page is exactly the Slack-paste I wanted before a Thursday launch: "Review
Summary" header, "1 of 2 approved" pill, roll-up + progress bar, per-link cards each with
status badge, "by <name>", the URL, the utm tags, and the reviewer's note in quotes. Clean
at 375px so I can screenshot it from my phone between meetings.

My round-1 secondary asks: the two confusing identity labels are unified now (one source).
Still no one-click "filter to just Needs-changes rows" to action them fast before launch —
minor, the roll-up count + per-row badges get me most of the way.

```json
{
  "name": "Dana",
  "clarity": "Yes",
  "clarity_reason": "Headline + grid + 'Create shared workspace' make the job obvious in one scroll; REVIEW STATUS roll-up and per-row Review badges are self-explanatory.",
  "value": "Yes",
  "value_reason": "I tag 30+ links/week and chase sign-off in Slack/email threads. Per-link Approve/Needs-changes with attached reviewer name + a server-persisted, screenshot-ready /review page that names who signed off replaces the back-and-forth. With attribution fixed it now does the one thing the sign-off page is for.",
  "advocacy": 9,
  "advocacy_reason": "The attribution bug that capped me at 7 is gone and verified persistent across a fresh browser — approvals carry the reviewer's name on the row and the shareable /review page. Real loop, zero signup, mobile-clean share. Not a 10 only because there's no 'filter to Needs-changes rows' to action fast, and the review popover toggles closed if you click it twice (minor). I'd post this in my team channel.",
  "prior_concern_addressed": "yes",
  "top_issues": [
    "No one-click filter to show only 'Needs changes' rows to action them before launch (carried from R1, minor)",
    "Review popover toggles shut on a second click / can feel finicky to reopen — easy to think it 'didn't open'"
  ],
  "liked": [
    "Approval now reads 'Approved by Dana Reyes' on the row AND on /review — Anonymous gone",
    "/review attribution is server-persisted: a fresh colleague browser still shows who signed off",
    "/review page is genuinely Slack-paste/screenshot ready and clean at 375px",
    "Unified 'Your name' drives both 'Editing as' and 'Reviewing as' — no more confusing dual labels",
    "Whole approval loop with zero signup on a synced shared link"
  ]
}
```
