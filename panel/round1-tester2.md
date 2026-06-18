# Marcus — Frontend engineer

Ran cold at 1280px, devtools open, 0 console errors across the session.

## 1. Clarity — YES
H1 "Clean campaign links in a grid" + the subline "Build and tag a whole batch of
30+ campaign links at once — and auto-fix the casing and spacing that splits a
campaign into two in your analytics, then export a clean CSV" told me exactly what
this is and who it's for in ~10s. "No login — nothing leaves your browser" sealed it.
I'd tell a teammate: "batch UTM builder that lints your tags and one-click fixes the
casing/spacing junk that fragments campaigns in GA4, then exports CSV — no signup."

## 2. Value — YES
Today I hand-edit query params in a scratchpad / Notion and copy-paste, and I always
fat-finger a "Spring Sale" vs "spring_sale" split that I only notice weeks later in
GA. The diff panel is the killer feature: I typed "Spring Sale 2026", hit Auto-fix,
and got a literal before→after audit — `Row 2 · utm_campaign: "Spring Sale 2026" →
"spring_sale_2026"` (3 cells), with Undo right there. Verified Undo restores the
exact original string. The always-on rollup flipping "6 issues found" (with jump-to)
→ "All clean ✓" is the trust signal I need before I ship links. Presets (Email, X,
Mastodon) save the source/medium busywork. This genuinely beats my by-hand workflow.

## BURIED-FEATURE CHECK — found all 3 unprompted
- Auto-fix DIFF panel: FOUND on my own. "Auto-fixed 3 cells" panel, strike-through
  before → bold after per row/field, dismiss [x], and Undo. Round-trips correctly.
- Cross-row lint rollup: FOUND. Always-visible "All clean ✓" / "N issues found" with
  jump-to-first; updated live as I dirtied data.
- Cold "what we catch" demo: FOUND. "We catch near-duplicates like spring_sale vs
  Spring-Sale — they split one campaign into two in GA4" with an x to dismiss.

## NITS (didn't downscore much)
- The "three setup panels collapsed by default" claim is only partial: the Campaign
  Naming Template panel renders EXPANDED on cold load (blue-highlighted, full body
  text). Campaigns + UTM Spec are collapsed-with-subtitle. Inconsistent — pick one.
- Two buttons both labeled "Undo" (toolbar + diff panel) is mildly ambiguous; they do
  the same thing but I had to think for a second.
- Cold load already had a sample row pre-filled, so I didn't see a truly empty grid.
- Did not test Team Workspace (DB not provisioned locally — per instructions).

## 3. Advocacy — 8/10
The diff-panel + undo + live lint rollup combo is legitimately better than my manual
flow and I'd drop this in our launch-prep Slack channel today. Not a 9 because: the
inconsistent panel-collapse default reads slightly unfinished to an eye that notices
janky CSS, and I'd want to confirm the lint catches more edge cases (uppercase in
base URL, trailing slashes, encoded spaces) before I tell the whole team to trust the
auto-fix blindly. Polish those and it's a 9.

```json
{"tester": 2, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Naming Template panel renders expanded on cold load while the other two are collapsed — inconsistent default", "Two separate buttons both labeled 'Undo' (toolbar + diff panel) is briefly ambiguous"], "priorConcernsAddressed": "n/a"}
```
