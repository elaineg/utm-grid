# Round 2 — Tester 5 (Dana, demand-gen marketer)

Cold open still nails my Thursday grind in one scroll. Created a /w/ workspace in one click (clean URL, zero JS errors). "Editing as: Dana" + "last edited by Dana" attribution works; History(2) shows "31s ago by Dana [current]" / "38s ago by Anonymous" with Preview + "Restore this version" and the reassuring line "Every save is kept. Restoring brings a version back without losing the current one." That part feels like a trustworthy team source-of-truth.

PRIOR R1 CONCERN (editable source columns hidden in workspace): PARTIALLY fixed — when the right "Shared UTM taxonomy" panel is closed, all columns (BASE…UTM_CONTENT) show full-width (base input at x=125). But whenever that panel is present it squeezes the grid back to BASE + GENERATED only, re-hiding the source cells. Same wobble, new trigger.

BUG (blocker, repro): On /w/, I could not define a single shared allowed-value. Clicking "NAMING RULES ▼" and "Shared UTM taxonomy ▼" reveals no chip editor (no add-value input appears); clicking "Enforce allowed values" does not check the box and surfaces nothing. The panel only restates "Synced to this workspace — your team's shared allowed values, enforced on every cell" but gives me no way to add one. So I could not test taxonomy sync or enforcement at all — the headline round-2 feature is unreachable in my session.

Value verdict: the History+Restore+attribution half makes a shared grid feel safe; but a "team source of truth" needs the SHARED TAXONOMY to actually be editable+synced, and I couldn't reach it. Half the trust story is missing.

CLARITY: Yes
VALUE: Yes
ADVOCACY: 6/10
REASON: History/Restore/attribution are genuinely trustworthy and the bulk grid still beats my 15-min copy-paste, but the marquee Shared-UTM-taxonomy chips are unreachable (no editor opens, Enforce won't toggle) and the taxonomy panel re-hides my source columns — so I can't yet hand this to my team as the enforced source-of-truth they promised.
