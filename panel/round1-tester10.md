# Sam (PM, mobile-heavy between meetings) — Re-test: UTM Spec + shareable enforcement

## Prior concern re-checked
- Last round (advocacy 7) my blocker was: on a 375px phone the sticky Generated-URL column
  overlapped the row-select / select-all checkboxes, so subset selection was un-tappable.
  RE-CHECKED at mobile width: with rows visible at their natural scroll position, the row-1
  checkbox is the topmost element at its center, a real tap toggles it, and select-all goes
  indeterminate correctly. Subset selection works on my phone now. **Fixed.**

## 1. CLARITY — Yes
Cold open on mobile, ~10s to get it: headline "Tag all your campaign links with clean,
consistent UTM tags... so one stray capital letter never splits your data in Google
Analytics." The new "UTM Spec" panel reads itself: "Your team's allowed values — enforced on
every cell." I'd tell a teammate: "No-login grid where you bulk-tag launch links to ONE
shared UTM convention, then send everyone a link that enforces it." Minor confusion: the
"Enforce UTM Spec" toggle shows up twice (top lint bar + inside the panel) and I wasn't sure
they were the same switch; and "lint rules" is mild dev jargon for a PM.

## 2. VALUE — Yes
Today I keep our UTM convention in a Notion doc + a Sheets builder tab, and nobody follows
the Notion doc, so Amplitude/GA4 still arrives fragmented. Here I added allowed values
(newsletter, paid-social / email, cpc), flipped Enforce, typed a typo "newslettr," and it
flagged "Off-spec — nearest allowed: newsletter" with a one-tap "Fix to newsletter" button
that corrected the cell. That enforcement is the thing my Notion doc can never do. Real win.

## 3. THE SHARE-LINK STORY LANDED — this is what moves me
Copied the share link, opened it in a CLEAN browser: banner "Loaded shared grid (1 link)
including this team's UTM Spec," all my allowed-value chips present, Enforce still ON. So I
send ONE link to Paid, Lifecycle, and Social and they each type inside the guardrails —
that's the cross-team coordination job exactly, and it makes me look organized, which is why
I share. Mobile rendered the chips, the off-spec flag, and the Fix button cleanly.

## ADVOCACY — 8 (up from 7; mobile blocker fixed, spec feature is strong)
A real 8, not a polite one. What keeps it off a 9: (1) the duplicate Enforce toggle is
genuinely confusing. (2) The spec only lives in localStorage + whatever share link is
freshest — there's no central "team source of truth," so if a teammate edits their copy my
canonical taxonomy can't sync back; I'd want the spec to live somewhere I own, not in the
last link sent. (3) No top-level "X cells off-spec" counter to gauge launch-readiness before
I export. Fix the toggle ambiguity and give me an off-spec count and I'd bring this up
unprompted in every launch kickoff.

(Share-link clipboard read succeeded this run; verified the link both as a string and by
loading it fresh — spec rode along correctly.)

```json
{"tester": 10, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["'Enforce UTM Spec' toggle appears twice (top lint bar + panel) — unclear they are the same switch", "Spec only travels via share link / localStorage — no central source of truth, so a teammate's edits can't sync back to my canonical taxonomy", "No top-level 'X cells off-spec' counter for at-a-glance launch readiness; 'lint rules' is mild dev jargon for a PM"], "priorConcernsAddressed": "all"}
```
