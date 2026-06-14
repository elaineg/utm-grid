import { UtmGrid } from "./components/UtmGrid";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 p-6 overflow-x-hidden">
      {/* Hero — collapsed to data-hero-block so UtmGrid can hide it on shared-link landing.
          Mobile: headline text-xl leading-snug (≤2 lines at 375px), subhead text-sm (≤3 lines),
          total block pt-3 pb-2 ≈ ≤120px so the first grid card is near the fold on a phone. */}
      <header
        id="utm-hero"
        className="pt-3 pb-2 sm:pt-4 sm:pb-3 mb-4 sm:mb-6"
        data-hero-block="true"
      >
        <h1 className="text-xl sm:text-3xl md:text-4xl font-bold leading-snug text-gray-900">
          Clean UTM links for your whole campaign — in one grid.
        </h1>
        <p className="mt-1 text-sm sm:text-base text-gray-500 leading-snug">
          Auto-fix messy casing and typos before they split your Google Analytics. Share one link anyone can open and reuse — no login, nothing leaves your browser.
        </p>
      </header>
      <UtmGrid />
    </main>
  );
}
