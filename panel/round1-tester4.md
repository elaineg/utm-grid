{"name":"Tomás","clarity":"Yes","value":"Yes","advocacy":9}

I'm Tomás, ops analyst on a locked-down Windows/Edge laptop — I build tagged links in Excel because IT blocks installs, and I'm wary of pasting company data into random sites.

WHAT I DID
- Cold open: hero "Clean UTM links for your whole campaign — in one grid" + "no login, nothing leaves your browser" answered my two biggest questions in 5 seconds.
- Filled a grid with my kind of messy Excel data ("Google", "CPC", "Summer Sale 2026", a base URL with an existing ?id=5 param). Auto-fix naming correctly lowercased and turned spaces into underscores; it did NOT touch my domain/path.
- The ?id=5 link generated as ...?id=5&utm_source=... — appended with & instead of overwriting. That's the "won't mangle my data" test, and it passed.
- Export CSV → re-imported the same file. Got a "Map CSV columns" dialog: auto-mapped every header, said "2 data rows", offered Append/Replace + "you can Undo immediately." Imported back identical, including the ?id=5 row. Clean round-trip — this slots straight into my Excel workflow.
- Style guide (/w/.../guide): legible, well-structured — Why tags matter, Allowed values per field (chips), naming template with ordered segments, a WORKED EXAMPLE (q1_email), ✓ conventions. "Share style guide" on /w/ copied the /guide link (label flipped to "Copied!"; clipboard verified = the guide URL; one empty read earlier was a test-env timing artifact, not a bug). I'd genuinely paste this into Teams for our agency.

FRICTION
- Four share-ish actions: "Copy share link", "Create shared workspace", "Copy workspace link", "Share style guide". The inline note helps, but it took a beat to know which freezes a snapshot vs syncs vs sends the read-only guide.
- Privacy claim is for the local grid; the moment I create a shared workspace or share a guide, my taxonomy lives on a server behind a secret link. For company data I'd want that distinction explicit on the workspace screen.
- Guide is read-only and pretty but no "Download CSV/PDF" — my agency works outside this tool, so a copyable allowed-values table beats a link I hope they keep.

TO GET TO 10: one-line privacy note on the workspace/guide ("shared data lives on our server behind this secret link"), an export of the allowed-values table, and consolidating/labeling the four share buttons so a non-power-user picks the right one first try.
