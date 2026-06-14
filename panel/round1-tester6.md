# Round 1 — Tester 6 (Jules, Content & community marketer, 50/50 mobile)

## CLARITY — Yes
Within 30s the H1 "Clean UTM links for your whole campaign — in one grid" plus "no login,
nothing leaves your browser" told me exactly what it is: a bulk UTM builder I don't have to
sign into. The grid + "Presets — fill source/medium in one click" sealed it. This is the
no-account bulk UTM builder I'd bookmark. Zero confusion.

## VALUE — Yes
Today I hand-paste UTMs or keep a Notion table + Buffer link doc, retyping
utm_source/medium per platform every campaign — tedious and typo-prone. This grids it and
auto-fixes casing. The Team Workspace + Review/Approval is genuinely new for me: drop a /w
link in Discord, a teammate marks each link Approved / Needs changes with a note before we
schedule in Buffer. Live roll-up + the read-only /review summary page is exactly the
sign-off step I do by hand in DMs today. Real recurring job (multiple times/week).

## ADVOCACY — 7 (would be 9 without the name bug)
Core review flow WORKS, including on mobile (375px): per-row "Review" control is tappable,
popover is 256px wide and NOT cut off (right edge 297<375), Approve/Needs-changes are big
230x40 targets, roll-up updates live ("2 approved · 0 need changes · 0 unreviewed"), state
persists on reload, and the mobile /review page is genuinely nice (big "All 2 links
approved" badge + per-link cards with notes).

What holds it back: the promised "Reviewing as: <name>" never works. I typed "Jules" into
the "Your name" field (input value confirmed "Jules") and BOTH the header and the review
popover still said "Reviewing as: Anonymous"; every approval logged "by Anonymous." That
name field only drives "Editing as: Jules" for grid edits — it is disconnected from review
attribution, and there is no name input inside the review popover. For a team approval
feature, "who approved this" is the whole point. Minor: on DESKTOP the popover opens below
the row and falls under the fold (Approve at y~1036 on a 900px viewport) so you must scroll.

```json
{"name": "Jules",
 "clarity": "Yes",
 "clarity_reason": "H1 'Clean UTM links for your whole campaign — in one grid' + 'no login, nothing leaves your browser' + Presets made the bulk no-account UTM builder obvious in under 30s.",
 "value": "Yes",
 "value_reason": "Replaces my Notion UTM table + manual retyping per platform; Team Workspace review/approval with notes and a /review summary is the sign-off step I do by hand in Discord/DMs today. Recurring, multiple times/week.",
 "advocacy": 7,
 "advocacy_reason": "Review flow works and is fully usable on mobile (tappable control, popover not occluded, live roll-up, persisted, clean /review page) — but the feature's headline 'Reviewing as: <name>' never attaches: typing a name in 'Your name' leaves review attribution stuck on 'by Anonymous', so you can't tell who approved. Fix that and it's a 9.",
 "top_issues": ["'Reviewing as' stays 'Anonymous' even after typing a name in the 'Your name' field (value confirmed 'Jules'); the name field only feeds 'Editing as' for grid edits, not review attribution, and there's NO name input inside the review popover — every approval logs 'by Anonymous'", "Desktop: review popover opens below the trigger row and falls under the fold (Approve button at ~y1036 on a 900px-tall viewport); you must scroll to reach Approve/Needs-changes. Mobile's stacked layout handles this better."],
 "liked": ["Per-row review control is tappable at 375px and the popover is NOT cut off (256px wide, right edge 297<375) with big 230x40 Approve/Needs-changes targets", "Live roll-up 'N approved · N need changes · N unreviewed' updates instantly and persists on reload", "Mobile /review summary page is genuinely good: 'All 2 links approved' badge, progress bar, per-link cards with notes and CTA back to workspace", "Whole thing is no-login and the /w/<id> + /review secret-link sharing fits dropping a link in Discord exactly how I'd use it"]}
```
