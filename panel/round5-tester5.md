# UTM Grid — Round 5, Tester 5 (Dana, demand-gen marketer)

Persona: launches a campaign weekly, tags 30+ links, ruthless about time. Today does this in
a Google Sheet with a CONCATENATE column. Round-4 advocacy was 8; the one thing keeping it off
a 9 was the destructive-looking "Clean all" button.

## Re-check of my round-4 blocker
**"Clean all" with no confirmation → ADDRESSED.** The button is now labeled **"Auto-fix naming"**
and its tooltip reads "Lowercase + normalize all flagged cells." I clicked it on a populated
3-row grid: rows before/after = 3/3 (nothing wiped), and it just normalized "Spring Launch" →
"spring_launch". So it's clearly non-destructive AND clearly named — I no longer fear a mis-click
nuking my grid. My single 9-blocker from last round is gone.

## Cold open — value in one scroll?
Yes. Same strong headline naming the exact pain. Toolbar, presets, grid and Campaigns sidebar all
above the fold. "Saved on this device" + "Save as campaign" make the reuse loop obvious immediately.

## Weekly loop — built / saved / duplicated / reloaded
- Built a batch (Email preset → newsletter/email, campaign "Spring Launch"), lint flagged the
  capital+space with a one-click **Fix** (2 warnings shown). This is still the core reason I'd
  leave my sheet — CONCATENATE never catches casing/spaces.
- Saved as "Spring Launch W1" → top pill flips to green **"In: Spring Launch W1 · Saved!"**,
  counter reads **Campaigns (1)**, card shows "1 link · saved just now" with Open/Duplicate/Delete.
- **Duplicate campaign** → created "Spring Launch W1 copy", counter → **(2)**. This is exactly my
  Monday move: clone last week, rename, tweak. One click vs. ~15-min sheet rebuild.
- Reload → counter still (2), "In: <name>" pill persisted, grid restored from localStorage. Solid.
- Zero console errors across the whole session.

## Still holding it back (why not a 9/10)
- **No rename / no search-filter on saved campaigns.** Duplicate gives me "… copy" and I can't
  rename it to "Spring Launch W2" — so over 52 weeks the sidebar becomes a wall of "copy copy copy".
  This is now my #1 gripe and it's a real scaling problem for someone tagging weekly.
- **Local-only, per-browser.** I'm on a MacBook and my phone between meetings; the library won't
  follow me. I know cross-device sync is a future tier — fair — but it caps how hard I lean on it.
- Minor: the row **Copy** button still sits cramped against the Generated URL cell at default width.

## Today vs. this app
Still beats my Google Sheet on lint and on the one-click clone. The reuse loop genuinely saves time
week-over-week even local-only. Screenshot-worthy for the team channel — yes, I'd post the sidebar.
The rename gap is the only thing stopping me from saying "this replaces my sheet forever."

```json
{"tester":"Dana","clarity":"Yes","value":"Yes","advocacy":8,"campaigns_verdict":"Save/Duplicate/reload all work and persist with a clear green 'In: <name>' pill — the weekly clone-last-week loop is a real time-saver. Held to an 8 because I can't rename a duplicated campaign, so it won't stay legible over a year of weekly use.","prior_concerns_addressed":"Partly — the 'Clean all' data-loss fear is fully fixed (now 'Auto-fix naming', non-destructive, tooltip-clear); rename/search and cross-device sync still open (sync acknowledged as future tier)","likes":["'Clean all' renamed to non-destructive 'Auto-fix naming' with a clear tooltip — mis-click fear gone","One-click Duplicate campaign clones last week's batch; counter and green 'In: <name> · Saved!' pill make state obvious","Lint flags casing/spaces with a one-click Fix my spreadsheet can't do","Persists across reload with no console errors"],"complaints":["Can't rename a saved/duplicated campaign or search-filter — 'Spring Launch W1 copy' won't scale to 52/year","Local-only library doesn't sync MacBook<->phone","Row 'Copy' button still visually cramped against the Generated URL cell"],"regression":"none"}
```
