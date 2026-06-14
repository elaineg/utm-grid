# Workspace Review & Approval — Panel Round 2 Synthesis

Feature under test: **Workspace Review & Approval** on `/w/<id>` (per-row Approve / Needs-changes
+ note, a unified reviewer name, a live roll-up, and a read-only `/w/<id>/review` summary).

## Result
**Exit bar MET at 9/10** (≥9 of 10 at advocacy ≥9 ∧ clarity=Yes ∧ value=Yes). Only Priya scored
8 — she reproduced one residual (reviewer name not persisted to localStorage across reload/session,
so a fresh session can still log "by Anonymous"). All other nine cleared the bar. Clarity and value
are unanimous **Yes**.

## Score table

| Tester | Persona                      | Clarity | Value | Advocacy | Prior concern addressed |
|--------|------------------------------|---------|-------|----------|-------------------------|
| Priya  | Engineer                     | Yes     | Yes   | 8        | Partial                 |
| Marcus | Frontend engineer (desktop)  | Yes     | Yes   | 9        | All                     |
| Wen    | Marketing data analyst       | Yes     | Yes   | 9        | All                     |
| Tomás  | Ops analyst (Edge)           | Yes     | Yes   | 9        | Yes                     |
| Dana   | Demand-gen marketer          | Yes     | Yes   | 9        | Yes                     |
| Jules  | Content marketer (50/50 mob) | Yes     | Yes   | 9        | All                     |
| Aisha  | Design-ops                   | Yes     | Yes   | 9        | All                     |
| Rob    | Designer                     | Yes     | Yes   | 9        | All                     |
| Elena  | Eng manager (mobile)         | Yes     | Yes   | 9        | All                     |
| Sam    | Product manager (mobile)     | Yes     | Yes   | 9        | All                     |

**Tally: 9/10 at the bar. PASS.**

## Residual / off-a-10 (grouped by theme)

### 1. Empty/device-local reviewer name still records "Anonymous" (RECURRING — 5 testers)
Priya, Wen, Aisha, Elena, Tomás. The unified name now attaches to approvals and survives reload
*when set in-session*, but the name input itself is device-local/optional and (per Priya) not
persisted to localStorage, so a fresh session or a teammate on a clean browser who skips the name
can still log "by Anonymous". This is the only blocker still capping a score (Priya's 8). Several
testers (Priya, Wen, Aisha, Elena) want a required-name prompt before the first review action — the
top candidate next deepen. Honest "name is optional — your device only" disclosure is present and
the silent r1 revert bug is gone.

### 2. Partial share consolidation (RECURRING — 4 testers)
Marcus, Jules, Aisha, Priya. The new "Share ▾" menu is praised, but the toolbar below still carries
standalone "Copy share link" / "Copy all URLs" buttons (frozen-snapshot vs live-link, scoped
differently), so there are two share entry points. Fold or relabel for a clean 10.

### 3. Minor / single-persona
- No "filter to Needs-changes" view to action rejections fast — Dana (also carried from r1). Single.
- No view-only/approver role; name is self-asserted, not authenticated; no pending-reviewer nudge —
  Tomás, Elena. Recurring-ish (2), out of scope for this lightweight sign-off.
- Review popover toggles shut on a second click / can feel finicky to reopen — Dana. Single.
- Attribution shows only on hover tooltip, not inline; "Editing as" label has no obvious re-edit
  affordance — Rob. Single.
- Per-row sign-off needs opening a popover (no inline one-tap Approve); "Share review summary" not
  re-shareable from the /review page itself — Sam. Single.

### Confirmed-fixed (do NOT regress)
Unified identity attaches "by <name>" to approvals + survives reload (Wen, Tomás, Rob, all);
portaled popover opens first-click and fully on-screen at 900px desktop (Aisha, Jules) + 375px
mobile (Jules, Sam); clean "⚠ Changes" chip at 1280px, no truncation, no overflow at 1280/1440px
(Marcus, Rob); note persistence across reload + on /review (Wen); Share ▾ with "✓ Copied!" cue
(Marcus, Sam); /review clean at 375px, full URL no "h." truncation (Sam).
