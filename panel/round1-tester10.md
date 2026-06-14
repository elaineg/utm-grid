# Round 1 — Tester 10 (Sam, Product Manager, mobile-heavy)

CLARITY: Partially. What I'd tell a teammate: "Grid where you batch-build campaign UTM links,
auto-clean the casing/typos so everyone's tags match, then export a CSV or share one link." I
got there, but past 5s. The H1 — "Share one link that enforces your team's UTM taxonomy — stop
policing casing and typos that split your GA4 data." — is six lines tall on my phone and shoves
the actual tool below the fold; "taxonomy"/"lint rules" are dev words. The subhead ("Build and
tag links in a grid... export clean CSV") is what made it click.

VALUE: Yes. Today I keep a Google Sheet with a UTM formula and still chase people in Slack about
"was it LinkedIn or linkedin." This beats that: on my phone I typed a deliberately messy row
("LinkedIn / Paid Social / Summer Launch 2026"), hit Auto-fix, and it became
"linkedin / paid_social / summer_launch_2026". CSV exported clean with base + each utm field +
the full generated URL per row — drops straight into Notion/Sheets. Presets (Email, Paid Social,
Google/CPC) cut typing. The enforcement is what my Sheet can't do.

ADVOCACY: 7. The core loop (batch + auto-fix + CSV + share link) genuinely works on a phone, and
the shared link reproduced all 3 rows with generated URLs at 375px (recipient even gets a "Loaded
shared grid" toast). What holds it at 7: (1) dense headline costs clarity in the first 5s;
(2) when a teammate opens my share link on their phone they land on the same marketing H1 and must
scroll past the whole toolbar to reach the rows I sent — no "here's the grid Sam shared, 3 links"
summary up top, which is the exact moment that would make me recommend it unprompted; (3) applying
a preset alone leaves utm_campaign blank with a red "required" error while Auto-fix says "Nothing
to fix — all cells are clean" right beside it (mildly contradictory). Fix the share-landing and
I'm at 9.

```
CLARITY (is the purpose clear in 5s): No — dense 6-line headline buries the tool below the fold on mobile; subhead rescues it
VALUE (would it save you real time): Yes — auto-cleaned messy LinkedIn→linkedin and exported a drop-in CSV my UTM Sheet can't match
ADVOCACY (0-10, would you recommend to a peer): 7 — works end-to-end on a phone, but a shared link lands on the marketing headline, not "here's the grid I sent you"
TOP FRICTION: A recipient opening my share link lands on the generic headline + full toolbar and must scroll to find my rows — no "shared grid" summary at top, so it doesn't feel like a clean handoff
```
