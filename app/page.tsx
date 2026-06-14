import { UtmGrid } from "./components/UtmGrid";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 pt-3 pb-8 overflow-x-hidden">
      {/* Hero — one-line value prop, tight padding, so grid is above the fold at 1280px.
          Mobile: text-base leading-snug (≤2 lines at 375px), subhead text-sm (≤3 lines).
          data-hero-block allows UtmGrid's share-link useEffect to collapse it to a one-liner. */}
      <header
        id="utm-hero"
        className="pt-2 pb-2 mb-3"
        data-hero-block="true"
      >
        <h1 className="text-base sm:text-xl font-semibold leading-snug text-gray-900">
          Tag every campaign link with clean, consistent UTM tags in one grid — so a stray capital letter never splits your data in Google Analytics.
        </h1>
        <p className="mt-0.5 text-xs sm:text-sm text-gray-400 leading-snug">
          Edit links in a grid, auto-fix naming, export clean CSV — no login, nothing leaves your browser.
        </p>
      </header>
      <UtmGrid />
    </main>
  );
}
