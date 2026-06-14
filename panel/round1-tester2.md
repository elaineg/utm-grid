# Round 1 — Tester 2 (Wen, marketing data analyst; GA4/BigQuery/Sheets, distrusts invisible transforms)

Cold open nails my pain: "Auto-fix messy casing and typos before they split your Google Analytics" + Import/Export CSV.
Auto-fix collapsed Google/CPC/Summer_Sale and google/cpc/"summer sale" into one identical lowercased row — that
dedupe IS my dashboard problem. CSV out is clean: proper headers, lowercased values, generated_url column. Lint
flags casing/space/uppercase. Created /w/ workspace instantly; "Editing as: Wen" propagates into the synced banner
AND each History entry ("just now by Wen [current]", "1m ago by Anonymous"). Preview shows a clear yellow
"...read-only" banner with Back-to-current; a real user can't edit it (cell click intercepted, keyboard typing
ignored, edits never persist server-side). Restore copy + history confirm non-destructive ("brings a version back
without losing the current one"). Per-author audit trail + restore = genuinely trustworthy as a team source-of-truth.

Friction/bugs: (1) Preview cells lack a readonly/disabled attribute — protection is pointer-blocking only; safe for
real users but a power user could mutate via devtools, and as someone who distrusts invisible transforms I'd want the
hard attribute. (2) Lint only catches casing on manual Auto-fix — Import CSV should reject or auto-clean dirty casing
on ingest, not leave it to a button I might forget. No console errors anywhere.

CLARITY: Yes
VALUE: Yes
ADVOCACY: 8/10
REASON: Strict CSV in/out, casing dedupe, and a per-author History/Restore audit trail make this the first shared UTM
tool I'd trust as source-of-truth; not a 9 only because lint isn't enforced at CSV-import time yet.

```json
{"tester": 2, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Import CSV does not enforce/auto-clean casing on ingest — lint only fires on manual Auto-fix", "Preview inputs rely on pointer-blocking, not a readonly/disabled attribute"], "priorConcernsAddressed": "n/a"}
```
