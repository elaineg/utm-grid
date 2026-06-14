# Round 2 — Tomás (ops analyst, Excel power user, data-wary)

Cold open reassured me: "no login, nothing leaves your browser." Created a workspace (/w/<id>), set "Tomás (Ops)" — header then showed **"Editing as: Tomás (Ops)"** and **"last edited by Tomás (Ops)"**. Edits logged into **History (3)** with per-author attribution, a "current" badge, and "Every save is kept. Restoring brings a version back without losing the current one." **Preview banner: "Previewing version from 2m ago — read-only. Cells are locked"** and cells are visibly greyed (verified disabled + cursor:not-allowed). Restore worked non-destructively. Named the workspace "Q3 Ops Campaigns"; it stuck across reload. Generated URLs are clean.

PRIOR CONCERNS (both addressed): (a) Preview cells now clearly greyed/locked with an explicit banner; (b) name nudge prompts on a fresh workspace and "Editing as" shows my name once set.

Friction/bugs:
- **Shared UTM taxonomy panel would not open.** Repro: open /w/<id>, click "Shared UTM taxonomy ▼" in the right panel — it toggles but no chip/value-entry field appears (visible inputs actually dropped 19→18 on click). I could not add an allowed-value chip, so I couldn't confirm chips sync. This is the team source-of-truth feature I most needed, so it's a real gap for my use case.
- Minor: "Editing as" reverts to **Anonymous** after a page reload (name is device-local, not re-applied), so attribution isn't durable on refresh.

CLARITY: Yes
VALUE: Yes
ADVOCACY: 8/10
REASON: History/Preview/Restore plus a named, no-login server workspace genuinely beats my shared Excel tab and the privacy copy earns my trust; held at 8 because the Shared-taxonomy editor never opened for me (the enforcement feature I most need) and "Editing as" forgets my name on reload.
