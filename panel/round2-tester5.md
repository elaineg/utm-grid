# Round 2 — Tester 5 (Dana, demand-gen marketer) — governance / UTM Spec re-test

Re-checked the three things I dinged in round 1, then re-ran the full governance flow.

1. Discoverability of UTM Spec — FIXED enough. The lint bar now carries "Enforce your team's
UTM taxonomy" under LINT RULES, an "Enforce UTM Spec" toggle in violet, and an above-the-fold
legend "violet = off-spec | amber = case/space". That legend tells the whole governance story
in one read, right where I actually look. The right-rail UTM Spec panel still starts collapsed
while empty (minor), but auto-opens once it has values/enforce is on. I no longer nearly miss
the headline feature.

2. Two warning styles now distinguishable — FIXED. Off-spec renders violet ("◆ Off-spec —
nearest allowed: linkedin" + violet "Fix to linkedin" pill); case/space renders amber ("⚠
Contains uppercase letters — use lowercase only"). Legend names both. A teammate won't confuse
them now. (Note: my early probe runs threw a phantom "wrong nearest match / Fix-to broken" —
that was MY cell-targeting error; on correctly targeted cells "linkdin" → nearest "linkedin"
and one-click "Fix to linkedin" actually rewrote the cell. Verified clean.)

3. Team sync — still "Saved on this device" + share link, BUT the link is now a real handoff:
opened the share URL fresh and the full spec carried (linkedin/google/newsletter/cpc/email/
social chips all intact) AND Enforce loaded already ON (checked=true). So a teammate clicks my
link and immediately sees governance firing — not a half-measure.

Killer flow end to end: defined spec, enabled enforce, typed "linkdin" → violet off-spec with
correct nearest "linkedin", one-click Fix-to corrected it, lint bar showed "2 cells off-spec".
That off-spec counter is new and is exactly the at-a-glance number I'd screenshot for the team
channel. Zero console errors throughout.

Held below 10: the spec is per-device + per-link with no canonical home — if a teammate edits
the spec there's no single source of truth, just whoever's link is newest. A saved/named
canonical spec link (even read-only) is the one thing between "clever tool I share" and "where
our UTM rules live." Bumping to 9: every governance promise it makes now actually fires.

```json
{"clarity":"Yes","value":"Yes","advocacy":9,"priorConcernsAddressed":"yes","notes":"Discoverability fixed: lint-bar 'Enforce your team's UTM taxonomy' label + violet/amber legend above the fold. Warnings now clearly distinguishable (violet off-spec vs amber case/space). Verified off-spec catch, correct nearest-match (linkdin->linkedin), working one-click Fix-to, 'N cells off-spec' counter, and share link carrying full spec with Enforce already ON on fresh load. Held from 10: spec is per-device/per-link with no canonical shared home — a saved/named canonical spec link would make it a clear 9-10."}
```
