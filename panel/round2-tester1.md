# Round 2 — Tester 1 (Priya, senior backend SWE, network-tab skeptic)

My side-project launch post needed UTMs; a teammate sent this instead of a spreadsheet.
Cold open is legible in <5s: H1 + "Auto-fix messy casing before they split your Google Analytics."
Created a workspace, got a /w/ link, set "Editing as: Priya". Edited spring->summer-launch;
History snapshotted it attributed to me, with the prior version "by Anonymous". Round-1 panel's
one gripe (Preview cells not truly locked) is FIXED: Preview now DOM-disables + greys cells and
banner reads "read-only. Cells are locked." Restore non-destructively brought back the old value.
Added "newsletter" to UTM_SOURCE taxonomy -> persisted across reload and synced to the workspace;
named it "Acme Launch Q3" -> stuck. No console/network errors; nothing leaves the browser pre-share.

Friction: on a 1400px desktop the UTM_SOURCE/MEDIUM/CAMPAIGN columns are pushed off-screen in
the synced grid — only BASE URL + GENERATED URL show without horizontal scroll (cells are still
editable, just hidden). Minor: taxonomy says "Not enforcing — enable in Naming rules", a small
two-step before chips actually block bad values.

CLARITY: Yes
VALUE: Yes
ADVOCACY: 9/10
REASON: Faster than hand-editing query strings and the attributed History+Restore+synced taxonomy
make a shared grid trustworthy as a team source-of-truth; not a 10 because the source columns hide
off-screen on a normal desktop and enforcement needs an extra toggle.
