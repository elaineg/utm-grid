# UTM Grid

A no-account, fully client-side bulk UTM campaign URL builder. Edit links in a
spreadsheet-style grid with lint-as-you-type naming-convention checks
(including cross-row consistency that catches GA4 data-splitting variants like
`spring_sale` vs `Spring-Sale`), CSV import with column mapping, CSV export,
and channel presets saved in localStorage.

See `APP_SPEC.md` for the full spec.

## Develop

```bash
npm run dev        # dev server
npm test           # unit tests (vitest, lib/)
npm run test:e2e   # e2e tests (playwright, starts its own dev server)
npm run lint       # eslint
npm run build      # production build
```

No environment variables, no database, no API routes — everything runs in the
browser.
