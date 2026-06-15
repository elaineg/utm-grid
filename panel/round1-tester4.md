```json
{"name":"Tomás","clarity":"Yes","value":"Yes","advocacy":"8","prior_concerns_addressed":"n/a for round 1"}
```

**Who I am:** Ops analyst, Excel power user, Edge on a locked-down corporate laptop (no installs). I build tagged links in a spreadsheet today and I'm paranoid about pasting company data into random web tools.

**What I did:** Cold-opened. Typed messy data the way a real sheet has it ("Newsletter ", "E Mail", "Spring Sale 2026!"), hit Auto-fix. Exported CSV, re-imported it. Saved a campaign, then exercised the new Tools ▾ → "Move to another device": copied the code, opened a FRESH browser (my "home laptop"), pasted, previewed, merged. Re-imported the same code to check for duplicates.

**What worked (and won me over):**
- 30-sec clarity is real. "Clean campaign links in a grid" + "drops straight into your sheet" + "No login — nothing leaves your browser" told me what it is and that it respects my data. I'd tell a coworker: "browser UTM builder that round-trips CSV with Excel and never phones home."
- Auto-fix is the trust-builder. Cleaned "E Mail"→`e_mail`, killed the trailing space, highlighted the 3 changed cells green, and gave an **Auto-fixed 3 cells — Undo** toast. It tells me what it touched and lets me revert — the opposite of "mangling my data."
- **CSV round-trip is exact.** Export → re-import returned my row byte-for-byte ("https://acme.com/Spring Sale", space and all). Import opens a "Map CSV columns" dialog that PRE-MAPPED my headers correctly and made me pick Append vs "Replace — wipe current grid", with "you can Undo immediately." No silent overwrite. This is the whole reason I'd use it over my sheet's CONCATENATE.
- **Move to another device:** the privacy story lands. "This is your own local data — nothing is uploaded... this bundle just carries the secret links back," and import says "we never overwrite your saved campaigns." The fresh-window preview showed a real diff — "1 added · 0 updated · 0 skipped — Q3 Ops Launch" — before I committed. Re-importing the same code correctly showed "0 added · 1 skipped" (no duplicate). Code is base64'd JSON, so I decoded it and saw it isn't doing anything sneaky. Zero console errors every step. I'd actually use this to move work→home.

**What annoyed / mild friction:**
- Export code is a wall of base64. I trust it because I decoded it; a less-technical teammate sees gibberish and gets nervous. A one-line "what's in this code" summary would help.
- "Save as campaign" needs a name + an extra Save click — I expected one click.
- It's clearly built for many rows; with one row the "in a grid" value is understated. Fine for me.

**Single thing holding back the score:** It's still my word against the marketing that "nothing leaves your browser." As a wary corporate user I'd want proof I can hand IT/security — a verifiable "0 network requests" claim or an explicit "works fully offline" note. Until I can give security a reason it's safe, I'd quietly use it myself but hesitate to push it company-wide. That caps me at 8, not 9.

```json
{"tester": 4, "round": 1, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["Can't prove to IT/security that 'nothing leaves your browser' — no verifiable claim or offline note", "Export code is opaque base64; non-technical teammates won't trust pasting/importing it"], "priorConcernsAddressed": "n/a"}
```
