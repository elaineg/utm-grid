# Round 1 — Tomás (ops analyst, Excel power user, Edge/Windows, data-wary)

Cold open: in <5s I got it — "Clean UTM links for your whole campaign, in one grid" plus
"nothing leaves your browser." That privacy line is the one thing that lets me, an IT-locked-down
ops guy, even consider pasting campaign data. Export CSV gave clean headers matching my sheet;
validation flagged a bad base URL ("Not a valid http(s) URL") and missing campaign — exactly the
guardrails I want before pushing to GA.

Team Workspace: "Create shared workspace" -> /w/<id> link instantly. History (clock) is obvious;
copy "Every save is kept. Restoring brings a version back without losing the current one" is the
trust sentence that makes me treat a shared grid as a real source-of-truth. Set "Editing as:
Tomás" and my next snapshot was correctly tagged "by Tomás"; banner updated to "last edited by
Tomás." Preview showed the old grid with a clear yellow "read-only" banner + Restore / Back to
current; Restore was non-destructive (count 4->5, current preserved). All flows worked end to end.

Friction/bugs:
- Preview inputs are NOT DOM-disabled (disabled=false, readOnly=false); typing is silently
  swallowed (value unchanged, no mutation) so data is safe, but a teammate clicks a cell, types,
  sees nothing happen and wonders if it's broken. Should visibly grey-out/disable inputs.
- "Editing as" name is per-browser; fresh session resets to Anonymous, so on a shared link every
  teammate must set their name or history is a wall of "by Anonymous," undercutting attribution.
- Nit: History entries show only a timestamp, not WHAT changed (e.g. "2 cells").

CLARITY: Yes
VALUE: Yes
ADVOCACY: 8/10
REASON: Browser-only privacy + clean CSV round-trip + non-destructive History/Restore makes a
shared UTM grid trustworthy enough to replace my Excel tab; held back from 9 by "read-only"
preview not visibly disabling cells and Anonymous-by-default attribution.
