# Round 3 — Tester 5 (Dana, demand-gen marketer) — grid-layout re-check (desktop)

**Layout change verdict: minor regression, not a blocker.** The new fixed-layout table clips hard: UTM input cells are ~87px and show only ~6-7 chars ("paid_sc", "spring_", "linkedi"), and the GENERATED URL column reads "https://acme.com…". So I CANNOT eyeball-verify a value or a final URL inline anymore — I have to click into a cell or hit Copy. At 30-50 rows that's real friction. BUT: per-row **Copy puts the full, correct URL on the clipboard** (verified: `...?utm_source=linkedin&utm_medium=paid_social&utm_campaign=spring_launch_2026`), and **Copy all URLs** dumped all rows clean. Verification still works — just by copy, not by sight. Typing is fine; reading-back is the cost.
**Bulk Set column works** — set utm_source=linkedin across all 4 rows in one click; find&replace present. Grid stayed fast, 0 console errors.
**Round-2 wins all hold:** distinct "Copy share link" vs "LIVE TEAM WORKSPACE / Create shared workspace" (frozen vs live cleanly separated), mode-aware sync copy, per-row Copy. Nothing I flagged before regressed.

**Clarity: Yes.** Same headline nailed my Thursday grind in one scroll.
**Value: Yes.** Still kills the 15-min grind; bulk Set is exactly my batch workflow.
**Advocacy: 8.** Down one, honestly: the cell/URL truncation means I can't scan the grid to sanity-check values before export — I trust Copy, but editing 40 rows I want to SEE the campaign string and the generated URL without clicking each cell. Give the GENERATED URL column hover-to-expand or wider min-width and I'm back to 9.

```json
{"tester":5,"name":"Dana","clarity":"Yes","value":"Yes","advocacy":8,"prior_blocker_resolved":true,"top_problems":["Fixed-layout clips UTM cells (~87px, ~6 chars) and GENERATED URL column ('https://acme.com…') — can't eyeball-verify values/final URLs inline at 30-50 rows; must click in or Copy","No hover/expand on truncated generated-URL cell to confirm the full link by sight"],"likes":["Bulk Set column applied across all rows in one click — matches my weekly batch","Per-row Copy and Copy all URLs deliver full correct URLs despite visual truncation","Round-2 wins intact: distinct share vs live-workspace buttons, mode-aware sync copy, no regression"]}
```
