# UTM Grid — Round 6, Tester 5 (Dana, demand-gen marketer)

Persona: launches a campaign weekly, tags 30+ links, ruthless about time. Today does this in a
Google Sheet with a CONCATENATE column. Round-5 advocacy was 8; the SOLE cap was no rename / no
search on saved campaigns ("Duplicate gives me '… copy' and a year of weekly use becomes a wall
of copy copy copy").

## Re-check of my round-5 blocker — BOTH FIXED
- **Rename → FIXED and persists.** Saved a batch as "Spring Launch" → Campaigns (1). Hit
  "Duplicate campaign" → Campaigns (2), copy created as "Spring Launch copy". Hit **Rename** on the
  copy: an inline field appears **pre-filled with "Spring Launch copy"**, I cleared it to
  "Spring Launch W2" and Enter committed in place. Sidebar now shows two clean, distinct cards:
  "Spring Launch" and "Spring Launch W2". Reloaded the page — "Spring Launch W2" is still there.
  This is the EXACT thing I couldn't do before. The wall-of-copy problem is gone.
- **Search/filter → FIXED.** A "Filter campaigns…" box sits at the top of the list. Built 4
  campaigns (Spring Launch, Summer Sale, Black Friday, Webinar June). Typed "summer" → list
  narrowed to just "Summer Sale"; "web" → just "Webinar June" (substring match works); "zzz" → a
  clean "No campaigns match." empty state with an x to clear. Counter stays (4) so I always know
  the true total. Over 52 weeks I can now find "W23" in a second instead of scrolling.

## Weekly loop, fresh
Email preset → newsletter/email, messy "Spring Launch" caught by lint (2 warnings + one-click Fix),
save / duplicate / rename / reload all clean. Zero console errors across every run. Save button
flips green ("Saved!"), the green "In: <name>" pill keeps me oriented.

## Today vs. this app
This now genuinely replaces my Google Sheet for the weekly tag-and-reuse loop: lint catches casing/
spaces CONCATENATE never will, Duplicate clones last week in one click, and Rename + filter keep
the library legible at scale. Local-only (MacBook<->phone no sync) is the only thing left, and
that's an acknowledged future tier — not a bug, and it doesn't block my desk workflow. The minor
row-Copy cramping I noted before is cosmetic and not worth holding the score on.

Moving to **9** — I'd screenshot the filtered sidebar for the team channel and tell people to use
it. It loses the 10th point only on cross-device sync, which I genuinely want for the phone.

```json
{"tester":"Dana","clarity":"Yes","value":"Yes","advocacy":9,"campaigns_verdict":"Rename (inline, pre-filled, Enter-commits, persists on reload) and a substring Filter box are both live — I duplicated 'Spring Launch', relabeled the copy 'Spring Launch W2', and found campaigns by name in a second. The wall-of-copy problem is fully solved and this is now a weekly time-saver.","prior_concerns_addressed":"Yes — both my round-5 caps (no rename, no search) are shipped and working; only cross-device sync remains, which is an acknowledged future tier","likes":["Rename copies in place: inline field pre-filled with the old name, Enter commits, survives reload","Filter campaigns box does substring search (summer/web) with a clean 'No campaigns match.' empty state and an x to clear","One-click Duplicate still clones last week's batch instantly","Lint catches casing/spaces with one-click Fix my spreadsheet can't do; zero console errors"],"complaints":["Local-only, per-browser — library doesn't follow me MacBook<->phone (acknowledged future tier)","Minor: row 'Copy' button still slightly cramped against the Generated URL cell"],"regression":"none"}
```
