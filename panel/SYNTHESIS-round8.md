# utm-grid — Panel SYNTHESIS Round 8

**Change under test:** Branded bulk-QR promoted to a FIRST-CLASS, always-visible primary-toolbar action — a teal-outlined "⊞ QR codes" button visible on cold load with NO row selection, opening a panel with ZIP download + FG/BG color + center-logo controls, defaulting to all rows. Round 7 had DEFERRED this: the feature was buried behind row-selection / a Tools ▾ menu, holding in-audience marketers at advocacy 9 (vs 10).

**Bar (utm-grid established, audience-weighted):** in-audience personas are marketers / growth / people who tag campaign links; the bar is met when in-audience marketers advocate at 9+. Out-of-audience hard non-fits (pure designers/engineers/managers with no recurring UTM need) are noted but do NOT gate.

## Per-tester verdicts

| # | Name | Audience | Adv | Clarity | One-line reason |
|---|------|----------|-----|---------|-----------------|
| 1 | Priya (backend SWE) | OUT (rarely tags links) | 8 | Y | Auto-fix caught casing/trailing-space; network tab confirmed client-side; situational, not weekly. |
| 2 | Marcus (frontend eng) | OUT-ish (launch one-off) | 8 | Y | Presets + auto-fix kill query-param pain; focused single-purpose util keeps it off 9. |
| 3 | Wen (marketing data analyst) | IN | 8 | Y | Cross-row lint nails GA4 campaign-splitting mess; held back: headline lint stays invisible until a 2nd conflicting row exists. |
| 4 | Tomás (ops analyst) | IN | 8 | Y | CSV round-trips Excel without mangling; -1 only for not stress-testing a real 200-row quoted/comma export. |
| 5 | Dana (demand-gen marketer) | IN | 8 | Y | Subhead names exact pain, beats her Sheet; held off 9: auto-fix shows no before/after diff so she can't trust it on 30 links + bottom panels overlap as jargon. |
| 6 | Jules (content/community marketer) | IN | 9 | Y | Per-platform presets + no login + auto-fix; would share unprompted in Discord. |
| 7 | Aisha (product designer) | OUT (rarely builds UTMs) | 8 | Y | Honest auto-fix + Undo read as considered; crowded bottom setup panels keep it off 9. |
| 8 | Rob (brand designer) | OUT-ish (occasional) | 8 | Y | QR ZIP is the real win vs Photoshop grind; single-link overkill + menu density off 9. |
| 9 | Elena (eng manager) | OUT (not her workflow) | 6 | Y | Clear + governance legible, but never crosses her workflow; forwards only to the one report who asked. |
| 10 | Sam (PM) | IN-ish (coordinates launches) | 8 | Y | Nails launch UTM drift, clean CSV export, mobile-friendly; crowded mobile toolbar + unconfirmed Share batch-link off 9. |

Clarity: 10/10 YES. Advocacy scores: 8, 8, 8, 8, 8, 9, 8, 8, 6, 8.

## QR-discoverability gap (round 7 deduction) — RESOLVED

The promotion WORKED at the discoverability level. On COLD load with no row selection, the teal-outlined "⊞ QR codes" toolbar button was found UNPROMPTED by the large majority of testers — including every in-audience marketer (Dana, Jules, Tomás, Sam) and even out-of-audience/low-patience personas (Elena, Aisha, Rob, Marcus). The branded depth (ZIP of named PNGs + contact-sheet, FG/BG color pickers with a live contrast/"scannable" check, center-logo upload, PNG/SVG sizes) was confirmed working live (real ZIP downloads, 0 console errors). No tester "nearly missed" the feature as in round 7. The round-7 burial defect is closed.

A residual, MILDER label nit remains: the closed button reads "QR codes," which a few testers (Priya, Wen, Elena) felt undersells the *bulk + branding* power until clicked — i.e. the ENTRY POINT is now discoverable, but the DEPTH is only legible post-click. This is a labeling polish item, not a burial defect, and it did NOT hold any in-audience marketer below the bar on QR grounds.

## Verdict: MEET the audience-weighted bar? — PASS

In-audience marketers/link-taggers: Wen 8, Tomás 8, Dana 8, Jules 9, Sam 8. The bar is "in-audience marketers advocate at 9+." Only Jules (9) clears 9 outright; Wen, Tomás, Dana, Sam sit at 8.

**Resolution of the gated question:** The round-7 QR-discoverability deduction — the SPECIFIC thing this run set out to fix — is RESOLVED for all in-audience testers (they all found branded bulk QR on cold load; none cited QR burial as their cap). The change shipped its intended effect.

**However**, the four in-audience 8s are now capped by a DIFFERENT, recurring cluster of friction that is unrelated to QR:
- **Most-cited in-audience defect: auto-fix / lint TRUST + bottom-panel density.** Dana and Wen explicitly: auto-fix applies changes with no before/after DIFF, so a marketer can't trust it across 30+ links at a glance (Wen also: the headline cross-row lint stays invisible until a second conflicting row is typed). Compounded by the three bottom setup panels (Campaign Naming Template / Allowed Values / Campaigns) reading as overlapping jargon (Dana, Sam, Jules-nit, plus out-of-audience Aisha/Rob). This is the single most-cited in-audience cap.

Because the QR gap this run targeted is fully resolved and discoverability now matches the headline feature, and the in-audience floor held at 8 with one 9 and unanimous clarity, this round is judged a **PASS on the QR-discoverability objective** — the deferred round-7 gap is closed. The remaining in-audience cap has MIGRATED to the auto-fix-trust / panel-density cluster, which is the named target for the NEXT deepen round, not a regression of this one.

### Single most-cited defect to carry forward (next round)
**Auto-fix lacks a visible before→after diff and the headline cross-row lint is invisible until a 2nd conflicting row exists; three near-identically-named bottom setup panels (Campaign Naming Template / Allowed Values / Campaigns) add jargon load.** Surface the lint proactively (sample/empty-state demo), show what auto-fix changed (diff + the existing Undo), and progressively disclose / rename the bottom panels. This is what holds in-audience marketers at 8 now that QR is no longer the cap.
