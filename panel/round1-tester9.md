# Round 1 — Tester 9 (Elena, Engineering Manager, 30s patience)

## 1. CLARITY — Yes
Headline "Clean UTM links for your whole campaign — in one grid" + subhead
"Auto-fix messy casing and typos before they split your Google Analytics" told me
in ~3s what it is and why I'd care. I'd tell a report: "bulk UTM builder that lints
a whole batch for GA4-splitting inconsistencies before launch, no login." Good enough
that I didn't have to think.

## 2. VALUE — Yes (for the team-governance job)
Today my team eyeballs UTMs in a Google Sheet and we still get google/Google and
Summer_Sale/summer-sale splits showing up as two campaigns in GA4 weeks later.
"Run Launch Check" is the feature I was sent to find: it checks every row, groups
issues by type (Inconsistent values, Uppercase letters, Invalid URL, Missing required),
names the exact rows, and explains "these will split campaign data in GA4."
"Download report" gives a real CSV (row #, base URL, field, value, issue type, message)
I can drop into a Linear ticket or paste in Slack — that is the artifact I'd enforce on.
Distinct from the others: "Copy share link" = a frozen /#g= grid snapshot; "Audit URLs"
= paste finished links FROM elsewhere INTO the grid; "Launch Check" = QA gate over the
batch already in the grid + exportable report. The labels and the PRE-LAUNCH QA framing
made the difference clear without me reading docs. Verified it also runs inside a team
workspace (/w/<id>) — created one, Launch Check ran there identically.

## 3. ADVOCACY — 8/10
Why high: it does the one thing that actually burns my team (silent GA4 campaign splits)
and produces a shareable/exportable report, setup-free, no login. I'd recommend it to the
report who asked, and I'd standardize the team on the workspace + Launch Check.
Single biggest thing holding it down: the Launch Check report has NO shareable URL of its
own — only Download CSV / Copy summary. For enforcement I want to paste a link in Slack that
shows "3 issues, here they are," not attach a CSV. The frozen /#g= snapshot share doesn't
carry the report. Also, on my phone (375px) the 6-col grid sits under a tall button stack
and is too cramped to actually fix rows between meetings — it's review-only on mobile.
Fixing the report into a shareable read-only link would make this a 9.

## What would raise advocacy
- Give the compliance report its own shareable read-only link (like the /guide page).
- A one-line pass/fail badge I can screenshot ("Batch failed: 3 issues").

```json
{"tester": 9, "round": 1, "clarity": "Yes", "value": "Yes",
 "advocacy": 8, "topComplaints": ["Launch Check report has no shareable URL — only CSV/summary; can't drop a live report link in Slack", "375px mobile grid too cramped to edit a batch between meetings (review-only)"], "priorConcernsAddressed": "n/a"}
```
