{"name":"Aisha","clarity":"Yes","value":"Yes","advocacy":8}

# utm-grid — Round 1, Tester 7 (Aisha, Product Designer)
A teammate shared this. I don't build UTMs often; I judge craft hard (empty states, copy tone, affordances) and advocate loudly only if it holds up. This round centers on the new **Team UTM Style Guide**.

## What I did
Cold-opened home, filled a row with messy values ("Email", "Spring Launch 2026") — inline lint flagged uppercase + spaces with quoted fixes, "Auto-fix naming" produced "email"/"spring_launch_2026" with a clean "Auto-fixed 2 cells — Undo" toast. Then opened the seeded /guide, opened /w/<id>, and tested "Share style guide".

## Clarity — Yes
H1 + casing/typos subline land in seconds.

## Value — Yes
Today I'd paste a UTM convention into a Notion doc and hope the team/agency follows it. The Style Guide IS that doc, but live and link-shareable — genuinely better than my Notion page because the values come from the actual workspace.

## The Style Guide (this round) — the part that wins me
Considered: centered reading column, gray caps eyebrows over dark body, monospace pills for allowed values, a tinted "WORKED EXAMPLE — q1_email" callout, green-check conventions, and a "WHY UTM TAGS MATTER" intro using an inline `Newsletter` vs `newletter` example to explain the stakes. "Anyone with this secret link can view this page" sets sharing expectations right. This reads like a real internal standard, not a tool screenshot — I would paste it into Slack for our agency. On /w, "Share style guide" sits beside "Copy workspace link" with microcopy distinguishing them ("a read-only page teammates can read without editing") — answers the exact question a teammate asks. Button DID copy the correct /guide URL.

## Friction (what holds it back from 9–10)
1. **P2 — Share-guide button gives no visible confirmation.** Label stays "Share style guide" after click; it copies correctly and aria-live/"copied" nodes exist in the DOM, but I saw nothing on screen, so I'd click twice unsure. Flip label to "Copied ✓".
2. **P2 — Workspace grid dead space.** A single data row renders ~200px tall with a large empty white block below the content — looks like an unhandled empty state / layout bug. First thing I notice in the editor; reads as unfinished. (Not on the guide page.)
3. **P3 — Home toolbar is busy.** Add row / Auto-fix / Import / Paste&Audit / Export / Copy share link / Copy all URLs compete at equal weight; nothing says "start here."

## To reach 9–10
Visible "Copied ✓" on the Share-guide button, fix the tall empty workspace row, lightly group secondary toolbar buttons. The Style Guide page itself is already 9-level craft; fix the surrounding affordances and I'd bring this up unprompted.

```json
{"name":"Aisha","clarity":"Yes","value":"Yes","advocacy":8,"topComplaints":["Share style guide button gives no visible copied confirmation — label never flips","Workspace grid renders a ~200px-tall single row with dead empty space below — looks like an unhandled layout/empty state","Home toolbar buttons all compete at equal weight; no clear starting point"],"priorConcernsAddressed":"n/a"}
```
