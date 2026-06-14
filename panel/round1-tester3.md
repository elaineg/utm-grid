# Re-test — Tester 3 (Wen, marketing data analyst)

## Prior concerns re-checked
- **#1 "Helper copy contradicts sync (no server / localStorage)"** — FIXED. Copy is now context-aware: cold builder still says "nothing leaves your browser / saved in localStorage" (accurate there); inside /w/ it reads "Synced to a private server workspace... Changes are synced to the server workspace automatically." No contradiction.
- **#2 "Allowed-values taxonomy doesn't sync to the team"** — PARTIALLY. The card now lives IN the workspace as "Shared UTM taxonomy — Synced to this workspace, enforced on every cell," with per-field Add + "Paste a list — define once, reuse every week, share it to your team." Great intent — BUT it does NOT actually persist (bug below).

## New blocking bug — taxonomy values don't survive sync (repro)
Create workspace → expand Shared UTM taxonomy → under UTM_SOURCE type "newsletter" + Enter (chip "newsletter ×" appears). Then reload the SAME creator tab: chip is gone. A clean-browser teammate on the /w/ link: chip absent. Grid rows DO sync (verified: rows a/b/c appear for teammate), so it's specifically the taxonomy that isn't written server-side — directly contradicting "Synced to this workspace, enforced on every cell." For my job this is the whole point: a team can't enforce one naming standard if the list evaporates.

## What's genuinely excellent
Cold lint named my exact GA4 pain: "Inconsistent utm_source across rows: 'Google' vs 'google' — these will split campaign data in GA4." Auto-fix normalized casing/spaces with an UNDO toast; footer says source cells left as typed, only trailing spaces trimmed — answers my distrust of invisible transforms. CSV export lossless, standard headers, round-trips. History (autosave snapshots, Preview read-only, "Restore brings a version back without losing the current one" — verified non-destructive) + "Editing as: Wen" flowing into the banner AND per-entry attribution ("by Wen" vs "by Anonymous") make the shared grid auditable and trustworthy.

CLARITY: Yes
VALUE: Yes
ADVOCACY: 7/10
REASON: The grid, lint, lossless CSV, and attributed non-destructive History are exactly the trustworthy source-of-truth I want and I'd happily share it — but the headline team feature, the Shared UTM taxonomy, doesn't actually persist (gone on the creator's own reload, never reaches a teammate) while claiming "enforced on every cell," which is precisely the data-integrity promise I'd be recommending it for; fix that and it's a 9.

```json
{"tester":3,"round":1,"clarity":"Yes","value":"Yes","advocacy":7,"topComplaints":["Shared UTM taxonomy values do NOT persist server-side: 'newsletter' chip added under UTM_SOURCE in a workspace disappears on the creator's own reload and never reaches a teammate, despite the panel claiming 'Synced to this workspace, enforced on every cell' (grid rows DO sync, so it's taxonomy-specific)","Taxonomy/allowed-values card is still collapsed by default and easy to miss"],"priorConcernsAddressed":"some"}
```
