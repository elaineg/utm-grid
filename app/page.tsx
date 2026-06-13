import { UtmGrid } from "./components/UtmGrid";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Tag all your campaign links with clean, consistent UTM tags at once — so one stray capital letter never splits your data in Google Analytics.
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Edit links in a grid, fix naming automatically, export clean CSV — no account.
        </p>
      </header>
      <UtmGrid />
    </main>
  );
}
