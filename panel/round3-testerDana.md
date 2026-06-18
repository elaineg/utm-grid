# Round 3 — Dana (Demand-gen marketer) — Regression Sentinel

**Clarity: Yes.** "Clean campaign links in a grid" + the sub-line "Build and tag a whole
batch of 30+ campaign links at once — and auto-fix the casing and spacing that splits a
campaign into two in your analytics, then export a clean CSV." That's my Thursday in one
sentence. "No login — nothing leaves your browser" seals it. I'd pitch it to my team channel
verbatim.

**Value: Yes.** Today I hand-build 30+ tagged links in a spreadsheet with a fragile CONCAT
formula and eyeball casing — ~15 min and I still ship spring_sale vs Spring-Sale splits.
Here: grid + presets (Paid Social–LinkedIn, Google/CPC, X/Twitter all one click), lint
flags my mess instantly, Export CSV. Real time saved, no behavior change from R2.

**Did the core hold? Yes — no regression.** Cold load:
- Add row → instant row 2, generated URL updates. Good.
- Typed a messy campaign ("Summer Sale 2026") → lint fired immediately: amber cell,
  "2 warnings", "Fix this value", and top rollup "1 issue found — jump to first ↓".
  Warnings were specific: "Contains uppercase letters", "Contains spaces". Diff/lint/CSV
  core I approved is unchanged.
- 0 console errors, 0 page errors across the whole session.

**Value still obvious in one scroll? Yes.** Headline + grid + presets all above the fold; I
never had to scroll to get it.

**The visual fix — confirmed and clean.** All three setup panels (Campaign Naming Template,
Campaigns, UTM Spec / Allowed Values) now read as EQUAL peers: same 1px gray border, all
collapsed on cold load, no teal accent and no extra bloat line on the first one. The naming
panel no longer hijacks attention. Reads as three equal-weight options now, which is right.

**New issue from the change? None.** Nothing visually misaligned, nothing else moved.

**Advocacy: 9.** Holding at 9. I'd screenshot this to the team unprompted. Still not a 10
only because the value columns are visually subtle (my messy text landed a column over
before I noticed) and there's no obvious "tag all rows from one channel template" bulk move
yet — but those are wishes, not defects. The fix did exactly its job.

```json
{"name":"Dana","clarity":"Yes","value":"Yes","advocacy":9}
```
