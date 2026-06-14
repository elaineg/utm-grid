```json
{"name":"Tomás","clarity":"Yes","value":"Yes","advocacy":8,"top_issues":["Two overlapping privacy stories ('nothing leaves your browser' vs workspace 'stored on the server') sit close together — took me a careful read to trust which mode I'm in","'My Workspaces' shows a cryptic auto-name (Workspace 2_deQGNL) — I can't tell my Q2 ops workspace from a test one; let me rename it","Secret-link-as-access-control means anyone with the URL can edit; for company campaign data I'd want at least a read-only option"],"loved":["CSV round-trip is clean: BOM so Excel opens it right, full base URL preserved, casing/spaces auto-fixed — exactly what my sheet needs","Auto-fix naming turned 'Newsletter/Email/Q2 Ops Push' into newsletter/email/q2_ops_push instantly","'no login, nothing leaves your browser' headline answered my IT/privacy worry in 5 seconds","My Workspaces panel: Open/Copy link/Remove all work, and 'saved on THIS device only — not synced' is honest framing"]}
```

I build tagged links in Excel and IT blocks installs, so a no-login browser tool that
round-trips CSV is exactly my lane. Within 30s I could tell a coworker: "paste your campaign
links in a grid, it cleans the UTM casing/typos, exports a clean CSV you drop back into your
sheet." The headline + "nothing leaves your browser" killed my main worry instantly.

VALUE — Yes. The CSV export is clean and Excel-safe (BOM, full URL kept, source/medium
lowercased, spaces->underscore). My sheet does the concatenation today but NOT the
typo/casing normalization or a pre-launch check — that's the real time save. Auto-fix and
the inline "Not a valid http(s) URL" warning caught exactly the kind of mistake that splits
my Tableau/GA reporting.

WORKSPACE FLOW — works end to end. "Create shared workspace" gave a /w/<id> secret link;
home shows "My Workspaces (1)"; Open, Copy link (clipboard had the exact secret URL), and
Remove all function. The "saved on THIS device only — not synced, keep the link" framing is
clear and trustworthy.

HOLDS BACK 9/10: (1) the local-vs-server privacy framing is honest but crowded — I want one
unmistakable line on the workspace screen. (2) Auto-named workspaces are unrecognizable; I'd
want to label "Q2 Ops Push". (3) For company data, "anyone with the link can edit" makes me
hesitate to share the secret link in Teams — a read-only mode would seal it.
