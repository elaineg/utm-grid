# Wen — Round 2
CLARITY: Yes — Headline + "Edit links in a grid, fix naming automatically, export clean CSV — no account" and visible LINT RULES toggles still tell me the job in <5s.
VALUE: Yes — Lossless CSV round-trip is intact AND the new import column-mapping + Append/Replace dialog makes me trust bulk import; cross-row GA4-split lint is still the feature I came for.
ADVOCACY: 9/10 — Same core strength, now with safer import and documented trimming; held back only because lint is still all-soft (no block-on-missing-required).
PRIOR_CONCERN_ADDRESSED: Partly — Trailing-trim note (a) is now documented; export-blocking on required params (b) is still not enforced.
LIKES:
- ROUND-TRIP STILL EXACT: re-imported my adversarial export and re-exported byte-for-byte identical — "  Spring-Sale  " spaces, comma-in-value, "key""word" all preserved. Import does NOT trim or mutate cells.
- Import now opens a "Map CSV columns" dialog: shows row count, pre-maps matching headers, lets me remap, and the derived generated_url column is NOT in the mapping list — confirms it's ignored on import (my round-1 complaint b about derived columns: resolved).
- Append vs Replace is labeled in plain English ("add rows" / "wipe current grid") with "Either way you can Undo immediately." Default Append is the safe, non-surprising choice — it does NOT wipe my grid.
- Clean all / autofix is fully transparent and reversible: toasts say "Cleaned 1 cell", changed cells highlight green, and Undo restored my exact original values incl. boundary spaces. My distrust of invisible transforms is satisfied.
- Trailing-trim is now documented inline: "Generated URLs are trimmed of trailing spaces; your source cells are left as typed." Closes my last round-1 doubt.
COMPLAINTS (ranked):
- Still no "error" severity: Export CSV and Copy all URLs stay enabled even with required utm_source/medium/campaign blank — I want to block (or at least confirm) export until required params are filled. Unchanged from round 1.
- Clean all converts boundary spaces to literal underscores: "  Spring-Sale  " -> "_spring_sale_" rather than trimming, leaving leading/trailing underscores. Defensible under "No spaces" but a small surprise; trim-then-clean would read cleaner.
- No dedupe lint for full source+medium+campaign combos (only campaign casing) — accidental duplicate links still slip through.
VERDICT_BLOCK: {"id":3,"name":"Wen","clarity":"Yes","value":"Yes","advocacy":9,"prior_addressed":"Partly"}
