import { UtmGrid } from "./components/UtmGrid";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Share one link that enforces your team&apos;s UTM taxonomy — stop policing casing and typos that split your GA4 data.
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Build and tag links in a grid, define your org&apos;s allowed values, fix naming automatically, and export clean CSV — no account.
        </p>
      </header>
      <UtmGrid />
    </main>
  );
}
