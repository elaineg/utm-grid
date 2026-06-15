import { UtmGrid } from "./components/UtmGrid";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 pt-3 pb-8 overflow-x-hidden">
      {/* Hero — R2-C: short headline + payoff subhead + trust line.
          Mobile: tightened to ≤~150px total hero height so the first grid card
          sits within ~600px on a 375×667 viewport (R2-A).
          data-hero-block allows UtmGrid's share-link useEffect to collapse it to a one-liner. */}
      <header
        id="utm-hero"
        className="pt-1 pb-1.5 mb-2"
        data-hero-block="true"
      >
        {/* R2-C: Short one-line headline — never wraps on desktop */}
        <h1 className="text-lg sm:text-2xl font-bold leading-tight text-gray-900">
          Clean campaign links in a grid
        </h1>
        {/* R2-C / P2-E: Payoff-first subhead — bulk-builder value leads, then auto-fix framing */}
        <p className="mt-0.5 text-xs sm:text-sm text-gray-500 leading-snug">
          Build and tag a whole batch of 30+ campaign links at once — and auto-fix the casing and spacing that splits a campaign into two in your analytics, then export a clean CSV.
        </p>
        {/* R2-C: Trust line — smaller, muted, below subhead (not the lead) */}
        <p className="mt-0.5 text-[11px] text-gray-400">
          No login{" "}—{" "}nothing leaves your browser.
        </p>
      </header>
      <UtmGrid />
    </main>
  );
}
