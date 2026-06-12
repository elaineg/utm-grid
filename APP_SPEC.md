# UTM Grid
Purpose: a no-account, fully client-side bulk UTM campaign URL builder for marketers — edit 20–50 links in a spreadsheet-style grid with naming-convention linting and CSV round-trip.
Problem: A demand-gen / lifecycle marketer launching a campaign each week must tag 20–50 links with consistent UTM parameters across channels (email, paid social, organic social, partners), and a single casing/spelling inconsistency silently splits campaign data in GA4 — discovered only weeks later during reporting.
Beats alternative: Teamcamp UTM Bulk Link Creator (free, no account) — the best free bulk tool — requires hand-typed pipe-delimited per-row overrides, has no CSV import (links already live in a campaign planning sheet), no required-param or cross-row consistency linting (only a lowercase checkbox), and no presets. UTM Grid replaces pipe syntax with an editable grid, adds CSV import AND export for round-tripping with the existing campaign sheet, lints conventions as you type — including flagging near-duplicate values across rows (e.g. `spring_sale` vs `Spring-Sale`), the GA4 data-splitting failure no existing free tool catches — and saves channel presets in localStorage. Cuts a weekly 30-link batch from ~15 min to ~5 min.

Core flows:
1. **Edit links in a grid with lint-as-you-type.** The page opens on an editable spreadsheet-style grid: one row per link, columns for base URL, utm_source, utm_medium, utm_campaign, utm_term, utm_content, and a read-only generated-URL column that updates live. Rows can be added, duplicated, and deleted. Linting runs on every edit and marks offending cells with a visible warning (icon/color + hover or inline message): (a) required params missing — utm_source, utm_medium, utm_campaign required by default, toggleable; (b) case/space rules — lowercase-only and no-spaces on by default, each toggleable; (c) cross-row consistency — values in the same UTM column that match after normalizing case and separators (`-`, `_`, space) but differ literally are flagged on every affected cell, naming the conflicting variants. A copy button per row copies the generated URL; a copy-all button copies all generated URLs.
2. **CSV round-trip with an existing campaign sheet.** An Import CSV button accepts a file upload, parses it in the browser, shows a column-mapping step (map CSV headers to base URL and each utm_* field; headers matching field names are pre-mapped), and populates the grid — lint warnings apply immediately to imported rows. An Export CSV button downloads a file with one row per grid row containing the base URL, every utm_* column, and the full generated URL. Exporting and re-importing the same file reproduces the grid exactly.
3. **Named channel presets in localStorage.** The user can save the current values of any subset of UTM fields (e.g. utm_source=facebook, utm_medium=paid_social) as a named preset ("Paid Social"), then apply a preset to a selected row or to new rows so weekly batches start pre-filled. Presets, lint-rule toggles, and the grid rows themselves persist in localStorage across reloads (a refresh mid-edit never loses the batch). No accounts, no server storage.

Success checks:
- Entering base URL `https://example.com/sale`, utm_source `newsletter`, utm_medium `email`, utm_campaign `spring_sale` in a row shows `https://example.com/sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale` in that row's generated-URL column.
- Clearing utm_medium in a row (with default rules) shows a visible missing-required-param warning on that cell, and the warning disappears when a value is entered.
- Typing `Spring Sale` in utm_campaign (default rules) shows a lint warning on that cell mentioning uppercase and/or spaces.
- Entering `Spring-Sale` in utm_campaign when another row already has `spring_sale` shows a cross-row consistency warning on BOTH cells that names the conflicting variants; making the values identical clears the warning on both.
- Clicking Export CSV downloads a CSV containing one row per grid row with columns for the base URL, each utm_* parameter, and the full generated URL.
- Importing a CSV with headers `url,source,medium,campaign` opens a column-mapping step; after mapping, the grid contains one row per CSV data row with those values, and lint warnings appear on any imported values that violate the rules.
- Exporting the grid to CSV and importing that file back reproduces the same rows and values (round-trip).
- Saving a preset named `Paid Social` with utm_source `facebook` and utm_medium `paid_social`, reloading the page, and applying it to an empty row fills utm_source and utm_medium with those values.
- Filling rows and reloading the page restores the same rows (grid edits persist in localStorage); a first visit shows a single empty starter row.
- Entering base URL `https://example.com/p?utm_source=old` with utm_source `src` shows a lint warning on the Base URL cell naming `utm_source`, and the generated URL contains `utm_source=src` exactly once — the grid value replaces the pre-existing param instead of appending a duplicate.
- The page has no login or signup, and editing, importing, and exporting trigger no network requests (verifiable in the browser DevTools Network tab after initial page load).

Out of scope:
- Accounts, auth, payments, or any server-side storage (no Turso, no API routes — fully client-side).
- Team-shared convention configs (the utm.io/Terminus pay feature — localStorage only for MVP).
- Link shortening, click tracking, QR codes, or analytics integrations (no GA4 API).
- Direct Google Sheets / Excel integration (CSV files only).
- Single-base-URL parameter-matrix expansion (the Groot Solutions bulk mode).
- Destination-URL reachability checks (basic URL format validation only).

Production URL: TBD
