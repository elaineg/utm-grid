# Round 1 — Tester 7 (Rob, freelance brand/visual designer, medium-tech, price-sensitive)

I tag client campaign links a few times a month and otherwise hand-type query strings; my bar is "I could do this in 4 minutes by hand." Cold open was instantly legible: "Clean UTM links for your whole campaign — in one grid," auto-fix messy casing/typos, CSV in/out, no login. I typed a sloppy source/medium ("CPC ", spaces); Auto-fix naming lowercased + trimmed them ("Auto-fixed 2 cells — Undo" toast) and the generated URL was clean. For one link that's marginal vs. doing it by hand; for a multi-row campaign sheet the grid clearly wins.

Team Workspace is the standout. "Create shared workspace" gave a /w/ link; the page reads "Team Workspace — synced · All changes saved", an "Editing as:" field I set to "Rob," and a History button. History panel: "Every save is kept. Restoring brings a version back without losing the current one" — timestamped snapshots (just now / 6s / 2m), each "by [name]." Preview shows a yellow "Previewing version from 2m ago — read-only" banner, swaps the grid to that snapshot, and offers "Restore this version" / "Back to current." Restore is non-destructive (current stays its own entry). That makes a shared grid feel like a real source-of-truth a client can't silently wreck. No console errors, no broken buttons.

I specifically re-checked the privacy copy: on the synced /w/ page it now correctly says "Synced to a private server workspace — changes save automatically" and NO longer claims "nothing is sent to any server." Good — that would've been a trust-killer.

Friction (minor): "Editing as" name is per-browser localStorage, so a fresh session shows entries "by Anonymous" instead of my name; in a real freelance/client handoff, attribution won't carry unless each person sets it, which softens the "who changed what" audit trail. Not a blocker.

CLARITY: Yes
VALUE: Yes
ADVOCACY: 8/10
REASON: Real time-saver on multi-row campaigns, and History/Restore makes a shared team grid genuinely trustworthy — I'd recommend it to other freelancers and the PMs I work with. Not a 9 only because per-session "Editing as" attribution doesn't persist across people, so the audit trail is softer than the History UI implies.

```json
{"tester":7,"name":"Rob","clarity":"Yes","value":"Yes","advocacy":8,"top_problems":["'Editing as' name is per-browser localStorage; fresh sessions log entries as 'by Anonymous', weakening the who-changed-what audit trail in a real multi-person handoff","Auto-fix value is marginal for single-link tagging vs. hand-typing — payoff only shows on multi-row grids"],"likes":["History panel is trustworthy: timestamped snapshots, read-only Preview with clear yellow banner, non-destructive Restore that keeps the current version","Workspace privacy copy now correct — synced page says 'synced to a private server', no contradictory 'nothing leaves your browser' text","Auto-fix naming with reversible 'Undo' toast and clean generated URLs"]}
```
