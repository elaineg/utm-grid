# Round 2 — Tester 4 (Tomás, Ops analyst, Edge on corporate Windows laptop)

This round tests Workspace Review & Approval. My standing round-1 complaint on that feature:
the reviewer name was local-only and didn't attach — /w/<id>/review showed both rows
"by Anonymous" even after I entered "Tomas R.", defeating sign-off accountability.

## Re-check of my prior complaint (reviewer attribution)
RESOLVED. I created /w/0Uyd9ut_uEWH7j6XnTy45gAA, set "Tomas R." (header now reads
"Editing as: Tomas R."), and each row's Review popover pre-fills a "Reviewing as: Tomas R."
field. I approved row 1, opened /w/<id>/review, and it shows **"#1 ✓ Approved by Tomas R."**
— NOT Anonymous. Hard-reloaded /review: still "by Tomas R.", zero "Anonymous" on the page.
The exact accountability gap that held me at 8 is closed and it's server-persisted.

## Remaining
- No view-only/approver role: the single secret link grants full view+edit to anyone who
  holds it, and the name is self-asserted, not authenticated. Fine for an internal
  trust-based ops team; not enough to paste truly confidential URLs or for cross-org sign-off.
- Popover copy "Name is optional — your device only, never required to review" reads
  ambiguous next to the now-correct server-side attribution; took a test to confirm it
  actually attaches. Tighten that wording.

```json
{"name":"Tomás","clarity":"Yes","clarity_reason":"Headline 'Clean UTM links for your whole campaign — in one grid' + 'no login, nothing leaves your browser' explained the job and eased my data worry in ~10s; the REVIEW STATUS roll-up and the read-only /review 'PER-LINK APPROVAL STATUS' are self-explanatory.","value":"Yes","value_reason":"My weekly job is building tagged ops links in Excel and chasing sign-off in Teams with no record. Now /review is an artifact I can attach to a ticket showing 'Approved by Tomas R.' — named, server-persisted sign-off beats a spreadsheet+Teams thread, needs zero install (IT blocks installs), and Export CSV's UTF-8 BOM opens clean in Windows Excel.","advocacy":9,"advocacy_reason":"My one blocking complaint (reviewer name didn't attach — /review said Anonymous) is fixed and survives reload, so accountable, install-free sign-off now actually works. Not a 10 because there's no approver-vs-editor role and the name is self-asserted, so I'd still never paste truly confidential URLs and can't fully trust attribution across orgs.","prior_concern_addressed":"yes","top_issues":["No view-only/approver role — single secret link = full view+edit for anyone holding it; reviewer name is self-asserted, not authenticated","Popover copy 'Name is optional — your device only' reads ambiguous next to the now-correct server-side attribution"],"liked":["FIXED: /review shows '✓ Approved by Tomas R.' (not Anonymous) and persists across hard reload — real accountability for sign-off","'Reviewing as: Tomas R.' pre-filled inline in each row's review popover; 'Editing as: Tomas R.' shown in the workspace header","Clean read-only /review summary with live roll-up + progress bar — an artifact I'd attach to a sign-off ticket","Honest disclosure that review state is server-persisted and the secret link is the access control"]}
```
