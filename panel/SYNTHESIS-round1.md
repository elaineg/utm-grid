# utm-grid — Panel Round 1 Synthesis (Bulk QR codes)

Feature under test: per-row QR popover + bulk "Download QR codes" (UX_BRIEF "Bulk QR codes for tagged links", added 2026-06-14).

## Score table

| # | Name | Clarity | Value | Advocacy | PASS (adv≥9 ∧ clarity=Y ∧ value=Y) |
|---|------|---------|-------|----------|------|
| 1 | Priya | Yes | Yes | 8 | No |
| 2 | Marcus | Yes | Yes | 9 | **PASS** |
| 3 | Wen | Yes | Yes | 8 | No |
| 4 | Tomás | Yes | Yes | 9 | **PASS** |
| 5 | Dana | Yes | Yes | 8 | No |
| 6 | Jules | Yes | Yes | 8 | No |
| 7 | Aisha | Yes | Yes | 8 | No |
| 8 | Rob | Yes | Yes | 8 | No |
| 9 | Elena | Yes | **No** | 4 | No |
| 10 | Sam | Yes | Yes | 8 | No |

**Passing: 2/10 (Marcus, Tomás).** Clarity 10/10 Yes; Value 9/10 Yes (Elena the lone value=No,
caused entirely by mobile QR being broken). Comprehension and value land; the gap is craft —
and one real data-integrity bug recurring across four testers. Advocacy ceiling is clearly 9/10
once the groups below are fixed (no structural holdout — even Elena reaches 9 if mobile QR works).

## Complaints grouped by cause (every advocacy<9 / non-Yes)

### Group 1 — QR invalid-row leak (Wen, Dana, Rob, Sam) — HIGHEST IMPACT, 4 testers, recurring
Bulk "Download QR codes" only skips blank/unparseable generated URLs; it still generates a QR for
rows the grid lint flags INCOMPLETE (missing required utm_source/medium/campaign). So "N generated"
overcounts and a printed QR can point to an UNTRACKED link. The per-row QR button is also enabled on
these rows.
- **Wen:** "2 QR codes generated, 1 row skipped" — but the skipped one was the empty row; the
  incomplete row (medium only; lint says "utm_source/utm_campaign required") was COUNTED as generated.
  For a data person an inflated "all good" count is worse than no count. "'generated' != 'valid'."
- **Dana:** row with empty utm_source ("⚠ utm_source is required") still ships as `04-summer-sale.png`
  in the ZIP + contact sheet, per-row QR button enabled. "I'd unknowingly print a QR pointing to an untracked link."
- **Rob:** row 4 flagged in-grid still produced `03.png` encoding the bare `https://acme.com/no-utm`
  — a QR with NO tracking, on the printed contact sheet. "Handing a client an untracked QR to print is a liability."
- **Sam:** "Skips invalid rows" only drops blank-base-URL rows; a row with a real URL but ZERO utm
  tags still gets a QR (labeled by raw URL) into the ZIP. "An untagged link can slip into a handoff."

### Group 2 — Mobile QR broken (Elena=4, the score outlier; Sam) — the value=No driver
Per-row QR on a phone scroll-jumps to page top and renders NO visible QR image (only a toast);
per-row Download PNG/SVG fire no file on mobile.
- **Elena (value=No, adv 4, dropped from 8):** tapping per-row "QR" jumped the page from scrollY 1508
  to ~63 (top) and showed only a tiny "1 QR code generated" note — "no QR graphic anywhere in the DOM"
  (0 svg/canvas/img >40px). "Felt broken." Bulk gives a `.zip` that is "dead weight on a phone — I
  can't open or use it from iOS." "No usable mobile path at all." Her value=No is entirely this.
- **Sam:** the per-row "Download PNG"/"Download SVG" buttons inside the popover "fired no file and no
  error" on his phone (the ZIP downloaded fine in the same session, so the single-row buttons look dead).

### Group 3 — Channel-blind labels (Dana, Jules) — recurring across 2 testers
QR PNG filenames + contact-sheet labels use utm_campaign ONLY, so multiple rows of one campaign
across channels (newsletter/x/mastodon) are indistinguishable on a printed sheet.
- **Dana:** four different-channel rows all labeled "01 summer_sale", "02 summer_sale"… "I cannot tell
  which QR is LinkedIn vs Google vs newsletter. Labels need source/medium too."
- **Jules:** one campaign across LinkedIn/X/Mastodon downloads as `01-spring / 02-spring / 03-spring`
  — "I can't tell which is which without scanning. Source-named QR files… and this is a 9 I'd tweet about."

### Group 4 — Desktop popover anchoring (Aisha, Jules) — recurring across 2 testers
The per-row QR popover lands at page bottom-right overlapping the Allowed-values panel / below the
fold instead of beside its trigger.
- **Aisha (P1):** on 1280–1440px the popover's QR img lands at page bottom-right (rect ~x1127/y810),
  overlapping the "Allowed values" panel rather than beside the trigger. "A clumsy popover is exactly what nags me."
- **Jules:** on 1280×900 the QR preview + Download buttons sit at y~760–1085, so clicking row "QR"
  "looks like nothing happens until you scroll. Felt broken on first click."

### Group 5 — Cheap carried (non-QR), specified elsewhere too
- **CSV export lacks a UTF-8 BOM** (Wen, Tomás) — `xxd` shows no `EF BB BF`; non-ASCII campaign names
  mojibake on double-click into Excel on Windows/Edge. Both hold off 10 partly on this.
- **Launch Check "Copy summary" no visible confirmation on mobile** (Sam) — clipboard fills but the
  button never changes; he clicks twice unsure it worked. Two rounds running.

## Recurring (real) vs single-persona

- **RECURRING / REAL (build):** Group 1 (4 testers), Group 3 (2), Group 4 (2), CSV BOM (2). Group 2 is
  ~1.5 testers but is the value=No / score-outlier driver — fix it.
- **The QR craft itself tested WELL and earns trust — do NOT regress:** zero-network/client-side
  verified by Priya, Marcus, Tomás (clean network tab, no POST of URLs); true-vector SVG praised by
  Rob; printable contact sheet praised by Sam, Dana, Tomás, Priya; popover shows the exact encoded URL
  (verified before downloading) praised broadly.

## Deprioritized (with reasoning — do NOT build this round)

- **Priya — "/w/<id>/guide editable link" (read-only guide exposes "Open the editable workspace"):**
  this is the BY-DESIGN viral on-ramp — the workspace secret-link IS the access-control capability.
  Not a bug; do NOT remove the on-ramp. (Standing design stance, already recorded in the Style Guide section.)
- **Priya — Launch Check "did-you-mean" typo near-miss suggestion:** out-of-scope feature request for
  this run (QR is under test). Backlog.
- **Rob — PNG DPI / print-resolution option:** out-of-scope feature request for this run. The true-vector
  SVG (his own praise) covers the print path; a DPI picker is a separate future feature. Backlog.
- **Marcus — "busy toolbar / grid buried under feature banners":** longstanding separate concern, not
  QR; Marcus PASSES at 9. Note, do not act this round.
- **Single-persona quirks, not 9-bar blockers (address only if free):** Aisha — contact-sheet single-row
  layout overflows for 20-row batches (P3); the "⊞ QR" muted styling reads disabled (P3). Tomás —
  Download PNG/SVG accessible-name collides with toolbar "Download QR codes" (minor a11y). Jules —
  generic presets / no X/Mastodon (separate presets concern).

## Ordered fix list (drives Round-2 brief)

1. **QR eligibility = no blocking lint** (Wen, Dana, Rob, Sam) — biggest lever, 4 testers.
2. **Mobile per-row QR: inline visible QR, no scroll-jump, real file downloads** (Elena, Sam) — the value=No fix.
3. **Channel-aware filenames + contact-sheet labels** (Dana, Jules).
4. **Desktop popover anchored beside trigger, clamped in viewport** (Aisha, Jules).
5. **CSV UTF-8 BOM + Launch Check "Copy summary" mobile confirmation** (Wen, Tomás, Sam) — cheap carried.
