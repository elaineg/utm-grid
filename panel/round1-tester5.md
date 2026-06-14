# Round 1 — Tester 5 (Dana, demand-gen marketer)

Cold open headline "Clean UTM links for your whole campaign — in one grid" + visible grid and
"Create shared workspace" CTA = value clear in one scroll. Built links, created /w/ workspace,
ran the review loop, opened /w/<id>/review, copied the share link, checked mobile.

What worked: review badge per row opens a note popover with Approve / Needs changes; roll-up
"N approved · N need changes · N unreviewed" updates instantly with a progress bar; the read-only
/review page is genuinely screenshot-able (status pill, per-link list, the note, CTA) and renders
clean at 375px. "Share review summary" copies the read-only /review URL — exactly the Slack-paste
I'd want before a Thursday launch.

The gap that bugs me: there are TWO identity labels and they don't line up. The "Your name" field
sets "Editing as: Dana Reyes" but the approval on the summary STILL shows "by Anonymous" and the
top label stays "Reviewing as: Anonymous" no matter what I type. For a sign-off page the whole point
is "who approved this" — Anonymous defeats it. I'd be embarrassed to forward a sign-off that says a
colleague approved it "by Anonymous." That's the one thing keeping me from sharing it as-is.

```json
{
  "name": "Dana",
  "clarity": "Yes",
  "clarity_reason": "Headline + grid + 'Create shared workspace' make the job obvious in one scroll; review roll-up label is self-explanatory.",
  "value": "Yes",
  "value_reason": "I tag 30+ links weekly and chase sign-off in Slack/email threads; per-link Approve + a shareable read-only /review page replaces the back-and-forth. The reviewer-name bug knocks it from a slam-dunk to a strong yes.",
  "advocacy": 7,
  "advocacy_reason": "Loop is real and the /review page is share-ready, but approvals showing 'by Anonymous' despite setting my name breaks the core 'who signed off' value. Fix that (attach the typed name to the review, unify 'Editing as'/'Reviewing as') and this is a 9 I'd post in my team channel unprompted.",
  "top_issues": [
    "Approvals show 'by Anonymous' even after typing my name — 'Your name' sets 'Editing as' but not the review attribution or 'Reviewing as' label; defeats sign-off accountability",
    "Two separate identity labels ('Editing as' vs 'Reviewing as') is confusing — unclear which one the reviewer should set",
    "No way to filter the grid to just 'needs changes' rows to action them fast before launch"
  ],
  "liked": [
    "Read-only /review summary is genuinely screenshot/share-ready and works at 375px mobile",
    "'Share review summary' copies a clean read-only link — perfect for Slack",
    "Roll-up + progress bar update instantly when a row is approved",
    "Whole review loop with zero signup on a synced shared link"
  ]
}
```
