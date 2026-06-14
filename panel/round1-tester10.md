# Sam (PM, tester 10) — Round 1

Cold open (laptop, between meetings). Got it in ~10s: build clean UTM links in a grid,
auto-fix casing/typos, export CSV, share a no-login link. Exactly what I need to keep a
launch team's UTMs consistent and look organized.

NEW feature — Campaign Naming Template:
- Found it in the right sidebar under "Allowed values". Title + helper ("The STRUCTURE of
  utm_campaign... Different from Allowed Values, which sets allowed values") made the
  distinction crystal clear. No confusion with UTM Spec / Allowed values.
- Defined quarter_channel_audience, switched separator _ → - (live preview updated),
  toggled "Enforce naming template". Typed an off-template utm_campaign and got a precise
  teal flag: "Off-template — expected 3 segments, found 1" + "1 cell off-template". Genuinely
  useful for policing a team.
- Per-row teal "Build name" composer button appeared on the utm_campaign cell once segments
  existed — good discoverability.
- Density: grid columns NOT crowded — all template UI lives in the sidebar; editable grid
  stayed clean. Generated URL column produced the full correct link. Zero console errors
  across every interaction.

Frictions:
- The "Build name" composer popover opened directly under the cell but its body was clipped
  by the row boundary on my laptop viewport — I saw the button but the segment pickers were
  cut off until I scrolled. On mobile (where I live half the day) this would be worse.
- Template panel is below the fold in the sidebar; I only found it by scrolling. A pointer
  from the "Enforce naming template" toggle up top would help.

Value vs today: today I keep a Google Sheet of UTM conventions and hand-paste links — error
prone and nobody follows the naming rule. This enforces the rule AND exports a clean CSV in
one session. Real time saver.

```json
{"name":"Sam","clarity":"Yes","value":"Yes","advocacy":8,"likes":["Naming template clearly distinct from Allowed Values via inline helper copy","Precise off-template flag: 'expected 3 segments, found 1'","Grid stays uncrowded — template UI lives in sidebar","Clean generated URLs + CSV export, no login"],"frictions":[{"severity":"P2","issue":"'Build name' composer popover is clipped by the row boundary on laptop; pickers cut off until scrolled — likely worse on mobile"},{"severity":"P3","issue":"Naming Template panel sits below the fold in the sidebar; no pointer from the top 'Enforce naming template' toggle to where you define it"}],"verdict_sentence":"A clean, fast UTM grid that now also enforces our campaign naming convention and exports a tidy CSV — I'd share it with my launch team, docked one point only because the Build-name popover gets visually clipped."}
```
