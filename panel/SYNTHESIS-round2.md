# Bulk QR — Panel Round 2 SYNTHESIS

Re-test of the Round-1 QR fixes (eligibility = no blocking lint error; mobile inline QR;
channel-aware filenames; desktop popover anchoring; CSV BOM + mobile copy cue). Marcus
(tester2) is carried from Round 1 at advocacy 9 — not re-run this round.

## Score table

| Tester  | Clarity | Value | Advocacy | PASS (>=9)? |
|---------|---------|-------|----------|-------------|
| Priya   | Yes     | Yes   | 9        | PASS        |
| Marcus  | Yes     | Yes   | 9 (carried) | PASS     |
| Wen     | Yes     | Yes   | 9        | PASS        |
| Tomás   | Yes     | Yes   | 10       | PASS        |
| Dana    | Yes     | Yes   | 9        | PASS        |
| Jules   | Yes     | Yes   | 9        | PASS        |
| Rob     | Yes     | Yes   | 9        | PASS        |
| Aisha   | Yes     | Yes   | 8        | sub-bar     |
| Elena   | Yes     | Yes   | 8        | sub-bar     |
| Sam     | Yes     | Yes   | 8        | sub-bar     |

**Result: 7/10 passing at the 9-advocacy bar.** Clarity 10/10 Yes, Value 10/10 Yes.

**Trajectory (NOT stalled):** Round 1 = 2/10 → Round 2 = 7/10. The Round-1 fixes landed and
verified across the panel: eligibility-by-blocking-lint (Wen/Dana/Rob/Sam each re-ran their
exact repros and confirmed the inflated count is gone, the untracked-link QR can no longer
ship, per-row QR is disabled on incomplete rows), CSV UTF-8 BOM (Priya/Wen/Tomás verified
`EF BB BF`; Tomás 9 → 10), channel-aware filenames + contact-sheet labels (Dana/Jules), and
mobile inline QR with no scroll-jump (Elena confirmed her value=No blocker is fixed; she
moved 4 → 8). Three testers remain one named fix from 9.

## Remaining sub-bar complaints (grouped)

### Group 1 — Sam (8): mobile card-view download bug (QR-feature bug, fixable)
The per-row **"Download PNG" / "Download SVG"** buttons in the QR popover fire **NO file on
mobile (card view)** — Sam got no download 3/3 tries at 375px (no file, no error, no console
error). The **SAME buttons work on desktop** (table-view popover), where he confirmed
`qr-row-1.png` saved. The blob-download fix from Round 1 landed for the **table-view**
popover instance but **not the card-view** one (the card instance appears to use a stale/
different handler). 375px is exactly where Sam lives (mobile-heavy PM), and it was reported
fixed, so it reads as trust erosion — "I'd hand a teammate a button that does nothing." His
other two Round-1 gripes (bulk untagged-row skip; Launch Check "Copy summary" green
confirmation on mobile) he verified FIXED on his phone.

### Group 2 — Aisha (8): popover craft (caret tether + URL clip)
The Round-1 anchoring blocker is **genuinely fixed** — verified at 1280px and 1440px the
popover clamps/flips and stays in-viewport, never lands at page-bottom, never overlaps the
config panels; chrome is clean. Two craft gaps remain:
1. The popover **floats ~350px above its trigger row** (trigger ~y715, popover ~y361) with
   **NO caret/arrow tethering it**, so the row association is lost.
2. The **ENCODES URL is hard-clipped mid-string** (`white-space:nowrap` + `overflow:clip`,
   scrollWidth 530 vs 222 visible → cut at `…utm_medium=email&ut`) with **no ellipsis, no
   title tooltip, and no copy button** — reads as unfinished.
Aisha stated explicitly: add a caret tether + an ellipsis-or-copy on that URL → **she'd go to
9** ("advocate loudly").

### Group 3 — Elena (8, up from 4): whole-app layout (NOT QR-scoped)
Mobile QR is **FIXED** — she confirmed tapping a row's QR renders a real scannable code
inline in the card with no scroll-jump, plus Download PNG/SVG right there; her value=No
blocker is gone and she moved 4 → 8. Her remaining gap is **app-layout, not QR**:
1. The editable grid + QR sit **a scroll below the headline + ~6 feature cards** — cold-user
   scroll friction to reach the grid on a phone. A **pre-existing app-layout issue**, the
   same family as Marcus's Round-1 "grid buried below feature banners."
2. She wants a **shareable read-only Launch Check link for a cold/anonymous user** (CSV-only
   today unless she spins up a workspace) — needs a server workspace.

## ORCHESTRATOR DECISION

**FIX this round — Groups 1 (Sam) and 2 (Aisha).** Both are QR-scoped, low regression risk,
and each tester gave an explicit "do X → 9":
- **Group 1 (Sam):** make the card-view popover's Download PNG/SVG produce a real file on
  mobile (reuse the working desktop blob path). QR-scoped, isolated handler fix.
- **Group 2 (Aisha):** add a caret/arrow tethering the popover to its trigger row, and show
  the encoded URL with ellipsis/wrap + title tooltip + a small copy affordance. Popover-
  scoped craft.
Lifting Aisha + Sam to 9 takes the panel to **9/10** — clears the bar.

**DEPRIORITIZE this round — Group 3 (Elena's hero/feature-card layout reshuffle).** It is a
**whole-app landing change** (re-ordering the headline + ~6 feature cards above the grid)
that risks **regressing the 7 passing testers**, and the 9/10 bar is reachable by lifting
Aisha + Sam while **carrying Elena's improved value=Yes / advocacy 8** (her QR blocker is
already resolved). Recorded as a candidate for a **future dedicated layout pass** (cold-open
grid-hero promotion + the shareable read-only Launch Check link, which needs a server
workspace). Not actioned now.

## Non-blocking nits from PASSING testers — RECORDED, NOT actioned

- **Wen (9):** the "N generated, M skipped" result is a quiet inline line — could be a more
  prominent/persistent summary (or surfaced in the ZIP contact sheet).
- **Dana (9):** contact-sheet label for row 1 shows raw casing ("Summer Sale · LinkedIn/
  Social") while the filename is the auto-fixed slug ("summer-sale-linkedin-social") — the
  printed label should reflect cleaned values too (cosmetic; she runs Auto-fix first).
- **Tomás (10):** minor a11y — QR popover Download PNG/SVG shares accessible-name space with
  the toolbar "Download QR codes" button (keyboard/SR edge case only).
- **Jules (9):** wants built-in X / Mastodon / Buffer channel presets out of the box (DIY
  "Save preset…" exists; the per-platform-preset pitch isn't delivered for his platforms).
- **Priya (9):** wants a separate read-only share token (hand a truly view-only copy of the
  team standard without also granting edit).
- **Rob (9):** PNG DPI/size option (acknowledged out of scope; the true-vector SVG covers
  real print).

None of these block the bar; do not action them this round.
