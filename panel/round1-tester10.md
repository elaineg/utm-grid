{"name":"Sam","clarity":"Yes","value":"Yes","advocacy":8,"top_fix":"On mobile the grid is buried below a tall hero + 3 accordions + a Select-all bar — the first input sits ~700px down, so on a phone the cold-open shows no grid at all. Make the grid the hero on mobile too."}

# Sam — PM, mobile-heavy between meetings (grid-first landing redesign)

## Prior gripe re-check (last time: tall jargon hero + ~6 stacked banners buried the grid)
- **Desktop: fixed.** Toolbar + the real grid (BASE URL / UTM_SOURCE / UTM_MEDIUM headers) sit right at the top — grid IS the hero. The old 6 banners collapsed into 3 tidy accordion cards below the grid. Big improvement.
- **Mobile: only half-fixed.** Still a 4-line hero paragraph, then the toolbar, then 3 accordion cards (Campaign Naming Template / Campaigns / Allowed values), then a "Select all" bar — and only THEN row #1. On my 667px-tall phone the first BASE URL field is ~700px down. Cold open on mobile I scroll past everything before I see a single field. The grid is NOT the hero on mobile.

## 1. CLARITY — Yes
Within 30s I get it: a grid for tagging campaign links with consistent UTMs, export a clean CSV, share a link, no login. Subhead "Edit links in a grid, auto-fix naming, export clean CSV — no login, nothing leaves your browser" nails it. The H1 about "a stray capital letter never splits your data in Google Analytics" is my exact pain. Column headers + toolbar buttons (Export CSV, Copy share link, Create workspace) are all legible. This is for me.

## 2. VALUE — Yes
Today: a shared Google Sheet with a CONCAT formula nobody maintains, where someone types "Email" vs "email" and splits the data in GA/Amplitude. This app's **Auto-fix actually fixed it** in one tap: `Email`→`email`, `Spring Launch`→`spring_launch`. Export gave `utm-grid.csv` with a real header row, Excel-safe BOM, and a fully-built `generated_url` per row — drop-in for the team. Copy share link produced a self-contained `/#g=...` URL that **restored the whole batch in a fresh browser** (verified). That's "build a batch → export → share → look organized" with zero debugging. Beats my spreadsheet.

## 3. ADVOCACY — 8
I'd recommend it to my growth/marketing channel unprompted — recurring, annoying coordination pain, and it makes me look organized. Not a 9 because **I live on my phone between meetings and the mobile cold-open hides the grid** behind hero + 3 accordions + Select-all bar. A teammate I send the link to on mobile might bounce thinking it's a marketing page, not a tool. Get one editable row above the fold on mobile (push the 3 accordion cards below the grid by default) and this is a 9.

Verified clean on a 375px viewport: 0 console/page errors; Auto-fix, Export CSV, Copy share link, and share-link restore all worked.
