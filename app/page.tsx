import { UtmGrid } from "./components/UtmGrid";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">UTM Grid</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bulk-build campaign URLs in an editable grid with naming-convention
          linting, CSV import/export, and channel presets. No account, fully
          in-browser.
        </p>
      </header>
      <UtmGrid />
    </main>
  );
}
