# Round (Review & Approval) — Tester 4 (Tomás, Ops analyst, Edge on corporate laptop)

I know this app (prior rounds I gave 9). This round's new feature is **Workspace Review &
Approval** on a shared /w/<id>: per-row Approve / Needs-changes + note, a reviewer name, a
roll-up, and a read-only /w/<id>/review summary.

## Prior concerns re-checked
- **CSV missing UTF-8 BOM (my standing half-point across rounds): FIXED.** Export CSV now
  starts with bytes EF BB BF — it'll open in the right codepage on Excel/Edge/Windows. This
  is the thing I dinged twice; good to see it resolved.

## What I tested this round
Built a 2-row ops grid, created a shared workspace, set my name "Tomas R.", approved row 1,
marked row 2 Needs-changes with a note, watched the roll-up, opened /review as a teammate.
- Roll-up updates live and correctly: "1 approved · 1 need changes · 0 unreviewed" with a
  green/orange progress bar. Per-row chips ("Approved" / "Needs changes") are clear.
- /review summary page is genuinely good: read-only (0 editable inputs), per-link status,
  my note quoted verbatim, and an honest banner "Review state is server-persisted... anyone
  with this secret link can view this page."
- **Data trust: handled honestly.** Builder still says nothing leaves the browser; the
  workspace explicitly warns review state IS stored server-side and the secret link is the
  access control. That upfront disclosure is exactly why I'll use it for campaign URLs.

## Holding it down
- **Reviewer name doesn't attach to the approval.** I typed "Tomas R." but the /review page
  shows both rows "by Anonymous" — the name is "saved on this device" only, not bound to the
  review record teammates see. For sign-off the entire point is accountability ("who
  approved this?"). This is the main thing stopping a 9.
- Secret link grants full view+edit to anyone holding it; no view-only/approver role, so I
  can't separate a reviewer from an editor.

```json
{"name":"Tomás","clarity":"Yes","value":"Yes","advocacy":8,"clarity_reason":"Headline + 'no login, nothing leaves your browser' answered the job and my data worry in ~10s; REVIEW STATUS roll-up and per-row Review chips are self-explanatory, and live-sync vs frozen-snapshot is clearly labeled.","value_reason":"Real weekly ops job: I build tagged links in Excel and chase sign-off in Teams with no record. Shared per-link Approve/Needs-changes + notes + a clean read-only /review page beats a spreadsheet+Teams thread, needs zero install, and the BOM fix means CSV round-trips into Excel cleanly now.","advocacy_reason":"Solves a real recurring pain with honest data disclosure, no install, and my prior CSV BOM gripe is fixed — but the reviewer name shows 'by Anonymous' on the summary, undercutting the accountability sign-off is for; that's the gap from a 9.","top_issues":["Reviewer name is local-only ('saved on this device') and does NOT attach to the review record — /review shows 'by Anonymous' even after I entered 'Tomas R.', defeating sign-off accountability","Secret link = full view+edit for anyone who has it; no view-only/approver-only role to separate reviewers from editors","No real auth on the workspace link, so I'd still never paste confidential URLs"],"liked":["Prior complaint fixed: Export CSV now has UTF-8 BOM (EF BB BF) so it opens correctly in Excel on Windows/Edge","Live, correct roll-up with progress bar + clear per-row Approved/Needs-changes chips","Clean read-only /review summary with the note quoted verbatim — an artifact I'd attach to a sign-off ticket","Honest, upfront disclosure that review state is server-persisted and the secret link is the access control","Auto-fix caught my uppercase 'Email' medium with a clear inline lowercase prompt"],"priorConcernsAddressed":"all"}
```
