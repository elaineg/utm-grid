# Round 8 — Tester 4: Tomás (Ops analyst, Excel power user, Edge, wary of pasting company data)

**1. Would you use this? — YES.**
This is built for exactly my workflow. I build tagged links for ops campaigns in Excel, IT
blocks installs, and this is a browser tool that round-trips my CSV without mangling it. I
imported a sheet I'd actually build (LinkedIn / Paid Social / Q3 Launch, plus a base_url with
a `?ref=x` already on it) and the "Map CSV columns" dialog auto-mapped my headers, let me
adjust each one, and gave me Append vs **Replace ("— wipe current grid")** with an Undo
promise. It did NOT silently lowercase or rewrite my values — it imported them verbatim and
then flagged the casing/spacing with inline warnings + a one-click "Fix this value." That
warn-don't-mangle behavior is the whole reason I'd trust it. Auto-fix turned "  Newsletter "
→ `newsletter` and "Spring Sale 2026" → `spring_sale_2026` correctly. Export CSV came back
clean with a header row + a `generated_url` column. The "No login — nothing leaves your
browser" line addresses my data-paranoia directly, and the QR logo note repeats "never
uploaded." Excel can't catch the casing-splits-your-analytics problem; this does.

**2. Is the purpose / how-to clear? — YES.**
H1 "Clean campaign links in a grid" + subhead "Build and tag a whole batch of 30+ campaign
links at once — and auto-fix the casing and spacing that splits a campaign into two in your
analytics, then export a clean CSV" told me what it is and who it's for in ~10 seconds. The
grid with UTM_SOURCE/MEDIUM/CAMPAIGN columns and an example row made it self-explanatory.
Presets (Email, Paid Social–LinkedIn, etc.) are a nice Excel-template analog. Nothing
confused me. Minor: "Campaign Naming Template" vs "Allowed values" overlap needed a second to
parse, but the inline "Different from Allowed Values" note resolved it.

**3. Advocacy: 8/10.**
I'd bring this up unprompted to the other two analysts on my team who fight UTM hygiene in
spreadsheets — the CSV round-trip + casing warnings + all-client-side story is a genuine
"why are we paying / hand-cleaning for this" moment. Not a 9/10 only because I haven't
pressure-tested it on a real 200-row campaign export with my company's weirder columns, and
I'd want to confirm it survives the odd quoted/comma-in-field cell before I tell people it's
bulletproof. But it cleared every "will it mangle my data" fear I walked in with.

**Clarity: Y**

**QR discoverability (honest, unprompted):** YES — I noticed it on cold load on my own. The
"⊞ QR codes" button sits in the top toolbar and is the ONE button with a teal/cyan outline
while Import/Export/Tools are plain grey, so it visually pops. There's also a per-row "QR" in
the Actions column. What I would NOT have guessed without clicking is the *branded bulk* depth:
clicking reveals "Bulk download + branding controls", a "Download QR codes (ZIP)" button,
PNG/SVG + size (512/1024/2048), foreground/background color pickers with a live "Contrast
17.7:1 ✓ scannable" check, and a logo upload composited locally. The ZIP worked — 3 sensibly
named PNGs (e.g. `01-q3-launch-linkedin-paid-social.png`) plus a `contact-sheet.png`. So the
*entry point* is discoverable; the *richness* (logo + color + ZIP) is one click in, which is
fine — the button label "QR codes" is honest but undersells the branding power.

```json
{"tester": 4, "round": 8, "clarity": "Yes", "value": "Yes", "advocacy": 8, "topComplaints": ["haven't verified it survives a real 200-row export with quoted/comma-in-field cells", "QR button label undersells the branded/logo/ZIP depth hidden one click in"], "priorConcernsAddressed": "n/a"}
```
