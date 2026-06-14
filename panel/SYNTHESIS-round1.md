# utm-grid — Panel Round 1 Synthesis (run 20260614-032745-daily, Launch Check / Compliance Report)

## Scores

| Name   | Persona                    | Clarity | Value | Advocacy | At bar |
|--------|----------------------------|---------|-------|----------|--------|
| Priya  | Senior backend SWE         | Yes     | Yes   | 8        | no     |
| Marcus | Frontend engineer          | Yes     | Yes   | 8        | no     |
| Wen    | Marketing data analyst     | Yes     | Yes   | 9        | YES    |
| Tomás  | Ops analyst (Excel)        | Yes     | Yes   | 9        | YES    |
| Dana   | Demand-gen marketer        | Yes     | Yes   | 8        | no     |
| Jules  | Content/community marketer | Yes     | Yes   | 8        | no     |
| Aisha  | Product designer           | Yes     | Yes   | 8        | no     |
| Rob    | Freelance brand designer   | Yes     | Yes   | 9        | YES    |
| Elena  | Engineering manager        | Yes     | Yes   | 8        | no     |
| Sam    | PM                         | Yes     | Yes   | 8        | no     |

Exit bar = 9/10 at advocacy ≥9 + clarity Yes + value Yes. **Currently 3/10** (Wen, Tomás, Rob).
Clarity & value unanimous Yes (10/10) — the gap is pure advocacy craft. The new feature is
discoverable, working, and the report-above-grid placement + visual distinctness landed
(Aisha, Marcus, Rob explicitly; no 1280–1680px overflow). All sub-9s are recoverable.

## Complaints behind every advocacy < 9, grouped by cause

### F1. COPY-SUMMARY CUE PERCEPTUALLY MISSED — recurring, real (copy-confirmation lesson)
The "Copy summary" green flip is too brief/subtle: Jules saw a ~0.7s flash; **Aisha (8)** and
**Sam (8)** clicked and saw NO confirmation (clipboard did receive text). "Share style guide"
copy cue also flagged again (Aisha, Priya). Highest-leverage fix — make the cue peripherally
unmissable, hold ~2s, solid-green fill + check + aria-live, ref-stable across re-render. Apply
to Copy summary AND Share style guide.

### F2. EXPORT BUTTONS BELOW THE FOLD — recurring (Dana, Sam) (added-feature-buried lesson)
- **Dana (8)** — "Download report (CSV)" + "Copy summary" sit below the report body / below
  the fold, so the report's shareability is easy to miss. Move them to the TOP of the report
  panel (header row), always visible when the report opens.

### F3. RUN LAUNCH CHECK BURIED ON MOBILE — (Sam, Elena)
- **Sam (8)** — "Run Launch Check is buried far below the fold on mobile under 6 sections."
- **Elena** — 375px grid sits under a tall button stack. Surface the Pre-launch QA group
  (Run Launch Check) high on ≤640px so it's reachable without scrolling past 6 blocks.

### F4. TWO NEAR-IDENTICAL AUDIT ENTRY POINTS — (Marcus) (same-verb-collision lesson)
- **Marcus (8)** — the UX added an "Audit URLs" shortcut INTO the Pre-launch QA band, which
  duplicates the toolbar's existing "Paste & Audit URLs". Two audit controls read as broken.
  Keep exactly ONE audit entry point (toolbar "Paste & Audit URLs"); the QA band holds only
  "Run Launch Check". Reduce toolbar button clutter / clarify hierarchy where cheap.

### F5. CSV REPORT POLISH — (Wen 9→10, Tomás 9→10; cheap, also de-risks their scores)
- **Tomás** — no UTF-8 BOM → em-dashes in messages mojibake on double-click into Excel on
  Windows. Add a BOM.
- **Wen** — the violation CSV's `base URL` column strips the utm_* params, so a failing row
  can't be joined back to the exact original pasted URL. Add a full-URL column (or keep the
  original line) alongside the stripped base.

### F6. NO SHAREABLE READ-ONLY REPORT LINK — (Elena) — BUILD (loop-aligned)
- **Elena (8)** — "the report has NO shareable URL of its own, only CSV/Copy summary. For
  enforcement I want to paste a link in Slack that shows '3 issues, here they are.'" Build a
  read-only compliance-report route on a workspace (mirror the existing `/w/<id>/guide`
  pattern: reuse `GET /api/workspace/<id>`, recompute lint, render read-only, NO PUT/POST,
  mode-aware copy), plus a "Copy report link" / "Share report" action on `/w/<id>`
  (disambiguated from Share style guide). A live shareable compliance report is a viral
  governance artifact — on-strategy, not just tester appeasement.

## Single-persona / out-of-scope — deprioritize with reason
- **Priya (8) — DESIGNATED SINGLE SUB-BAR TESTER.** Her blocker (the read-only `/guide`
  exposes an "Open the editable workspace" CTA) conflicts with a *deliberate* prior design:
  that CTA IS the documented viral on-ramp turning a non-user recipient into a user, and
  secret-link = capability is the stated access model. Her secondary (typo near-miss "did
  you mean email?" suggestions) is a lint-engine enhancement out of scope for Launch Check.
  Carry at 8. NOTE: F6's new read-only report page must itself be genuinely view-only (no
  prominent edit trap) so it does not inherit this same trust complaint.
- **Rob (9)** — cross-device sync of saved clients = the account layer (RESEND-blocked).
  Out of scope; he's at bar anyway.
- **Jules (8)** — per-row "Fix" chips feel disconnected from Launch Check; X/Mastodon presets.
  The fix-chip relationship is a one-line clarity touch (worth it); presets out of scope.

## Verdict
All-craft, all-recoverable. F1 (copy cue) lifts Aisha+Sam (+reassures Jules); F2/F3 lift
Dana+Sam; F4 lifts Marcus; F6 lifts Elena; F5 secures Wen+Tomás at/above bar. Land F1–F6 and
the panel clears 9/10 with Priya the lone documented sub-bar tester.
