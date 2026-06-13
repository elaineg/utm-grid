import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs/promises";

const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true });

async function fillRow(
  page: Page,
  rowNum: number,
  values: Record<string, string>
) {
  for (const [field, value] of Object.entries(values)) {
    await cell(page, field, rowNum).fill(value);
  }
}

test("generated URL updates live (spec example)", async ({ page }) => {
  await page.goto("/");
  await fillRow(page, 1, {
    "Base URL": "https://example.com/sale",
    utm_source: "newsletter",
    utm_medium: "email",
    utm_campaign: "spring_sale",
  });
  await expect(cell(page, "Generated URL", 1)).toHaveText(
    "https://example.com/sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale"
  );
});

test("missing required param warns; warning clears when filled", async ({
  page,
}) => {
  await page.goto("/");
  await fillRow(page, 1, {
    "Base URL": "https://example.com/sale",
    utm_source: "newsletter",
    utm_campaign: "spring_sale",
  });
  const warning = page.getByRole("alert").filter({ hasText: "utm_medium is required" });
  await expect(warning).toBeVisible();
  await cell(page, "utm_medium", 1).fill("email");
  await expect(warning).toHaveCount(0);
});

test("uppercase and spaces are flagged", async ({ page }) => {
  await page.goto("/");
  await cell(page, "utm_campaign", 1).fill("Spring Sale");
  await expect(
    page.getByRole("alert").filter({ hasText: "uppercase" })
  ).toBeVisible();
  await expect(
    page.getByRole("alert").filter({ hasText: "spaces" })
  ).toBeVisible();
});

test("cross-row inconsistency flags both cells, naming variants, and clears", async ({
  page,
}) => {
  await page.goto("/");
  await cell(page, "utm_campaign", 1).fill("spring_sale");
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "utm_campaign", 2).fill("Spring-Sale");

  const inconsistency = page
    .getByRole("alert")
    .filter({ hasText: '"spring_sale" vs "Spring-Sale"' });
  await expect(inconsistency).toHaveCount(2);

  await cell(page, "utm_campaign", 2).fill("spring_sale");
  await expect(inconsistency).toHaveCount(0);
});

test("CSV export -> import round-trips the grid exactly", async ({ page }) => {
  await page.goto("/");
  await fillRow(page, 1, {
    "Base URL": "https://example.com/sale",
    utm_source: "newsletter",
    utm_medium: "email",
    utm_campaign: "spring_sale",
  });
  await page.getByRole("button", { name: "Add row" }).click();
  await fillRow(page, 2, {
    "Base URL": "https://example.com/a,b",
    utm_source: 'quo"ted',
    utm_medium: "paid social",
  });

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const csv = await fs.readFile(path, "utf8");
  expect(csv.split("\n")[0]).toBe(
    "base_url,utm_source,utm_medium,utm_campaign,utm_term,utm_content,generated_url"
  );

  // Wipe row values so we can tell the import really restored them.
  await cell(page, "utm_source", 1).fill("changed");

  await page
    .getByLabel("CSV file")
    .setInputFiles({ name: "utm-grid.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
  await expect(page.getByText("Map CSV columns")).toBeVisible();
  // Headers match export names, so everything is pre-mapped.
  await expect(page.getByLabel("CSV column for Base URL")).toHaveValue("0");
  // Select Replace so the import overwrites the modified row 1 (default is Append).
  await page.getByRole("radio", { name: "Replace" }).click();
  await page.getByRole("button", { name: "Import 2 rows" }).click();

  await expect(cell(page, "Base URL", 1)).toHaveValue("https://example.com/sale");
  await expect(cell(page, "utm_source", 1)).toHaveValue("newsletter");
  await expect(cell(page, "Base URL", 2)).toHaveValue("https://example.com/a,b");
  await expect(cell(page, "utm_source", 2)).toHaveValue('quo"ted');
  await expect(cell(page, "utm_medium", 2)).toHaveValue("paid social");
});

test("import with short headers url,source,medium,campaign pre-maps and lints", async ({
  page,
}) => {
  await page.goto("/");
  const csv =
    "url,source,medium,campaign\n" +
    "https://example.com/sale,newsletter,email,Spring Sale\n" +
    "https://example.com/promo,facebook,paid_social,spring_sale\n";
  await page
    .getByLabel("CSV file")
    .setInputFiles({ name: "sheet.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });

  await expect(page.getByText("Map CSV columns")).toBeVisible();
  await expect(page.getByLabel("CSV column for Base URL")).toHaveValue("0");
  await expect(page.getByLabel("CSV column for utm_source")).toHaveValue("1");
  await expect(page.getByLabel("CSV column for utm_medium")).toHaveValue("2");
  await expect(page.getByLabel("CSV column for utm_campaign")).toHaveValue("3");
  await page.getByRole("button", { name: "Import 2 rows" }).click();

  await expect(cell(page, "utm_campaign", 1)).toHaveValue("Spring Sale");
  // Imported rows are linted immediately: uppercase/space + cross-row variants.
  await expect(
    page.getByRole("alert").filter({ hasText: "uppercase" })
  ).toBeVisible();
  await expect(
    page.getByRole("alert").filter({ hasText: '"Spring Sale" vs "spring_sale"' })
  ).toHaveCount(2);
});

test("presets persist across reload and apply to a row", async ({ page }) => {
  await page.goto("/");
  // Put the values on row 1, select it, save as preset.
  await fillRow(page, 1, { utm_source: "facebook", utm_medium: "paid_social" });
  await cell(page, "utm_source", 1).click();
  await page.getByRole("button", { name: "Save preset…" }).click();
  await page.getByPlaceholder("Paid Social").fill("Paid Social");
  await expect(page.getByLabel("Preset value for utm_source")).toHaveValue("facebook");
  await page.getByRole("button", { name: "Save preset", exact: true }).click();

  await page.reload();
  // Preset chip survives the reload (it also appears in the "new rows" select).
  await expect(
    page.getByText("Paid Social", { exact: true }).first()
  ).toBeVisible();

  // Rows persist across reload too — clear row 1 so Apply provably fills it.
  await cell(page, "utm_source", 1).fill("");
  await cell(page, "utm_medium", 1).fill("");
  // Select row 1 via the row-number button in the grid (aria-label "Select row 1").
  await page.getByLabel("Select row 1", { exact: true }).click();
  // Apply the "Paid Social" preset — scope to its chip to avoid ambiguity with other Apply buttons.
  await page.getByText("Paid Social", { exact: true }).first().locator("..").getByRole("button", { name: "Apply" }).click();
  await expect(cell(page, "utm_source", 1)).toHaveValue("facebook");
  await expect(cell(page, "utm_medium", 1)).toHaveValue("paid_social");
});

test("grid rows persist across reload; first visit shows one empty row", async ({
  page,
}) => {
  await page.goto("/");
  // First visit: a single empty starter row.
  await expect(cell(page, "Base URL", 1)).toHaveValue("");
  await expect(cell(page, "Base URL", 2)).toHaveCount(0);

  await fillRow(page, 1, {
    "Base URL": "https://example.com/x",
    utm_source: "newsletter",
  });
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 2).fill("https://example.com/y");

  await page.reload();
  await expect(cell(page, "Base URL", 1)).toHaveValue("https://example.com/x");
  await expect(cell(page, "utm_source", 1)).toHaveValue("newsletter");
  await expect(cell(page, "Base URL", 2)).toHaveValue("https://example.com/y");

  // New rows added after a restore get non-colliding ids (row count grows).
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 3).fill("https://example.com/z");
  await expect(cell(page, "Base URL", 3)).toHaveValue("https://example.com/z");
});

test("base URL already containing a utm param warns and is replaced, not duplicated", async ({
  page,
}) => {
  await page.goto("/");
  await fillRow(page, 1, {
    "Base URL": "https://example.com/p?utm_source=old",
    utm_source: "src",
    utm_medium: "email",
    utm_campaign: "camp",
  });
  await expect(
    page.getByRole("alert").filter({ hasText: "already contains utm_source" })
  ).toBeVisible();
  await expect(cell(page, "Generated URL", 1)).toHaveText(
    "https://example.com/p?utm_source=src&utm_medium=email&utm_campaign=camp"
  );
});

test("empty CSV shows a no-rows message; headers-only CSV disables import", async ({
  page,
}) => {
  await page.goto("/");
  await cell(page, "Base URL", 1).fill("https://example.com/keep-me");

  await page
    .getByLabel("CSV file")
    .setInputFiles({ name: "empty.csv", mimeType: "text/csv", buffer: Buffer.from("") });
  await expect(
    page.getByRole("alert").filter({ hasText: "No rows found" })
  ).toBeVisible();

  await page.getByLabel("CSV file").setInputFiles({
    name: "headers-only.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("url,source,medium,campaign\n"),
  });
  await expect(page.getByText("Map CSV columns")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Import 0 rows" })
  ).toBeDisabled();
  await page.getByRole("button", { name: "Cancel" }).click();

  // The populated grid was never wiped.
  await expect(cell(page, "Base URL", 1)).toHaveValue("https://example.com/keep-me");
});

test("no network requests after page load while editing and exporting", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const requests: string[] = [];
  page.on("request", (req) => {
    if (!req.url().startsWith("blob:")) requests.push(req.url());
  });

  await fillRow(page, 1, {
    "Base URL": "https://example.com/sale",
    utm_source: "newsletter",
    utm_medium: "email",
    utm_campaign: "spring_sale",
  });
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  await downloadPromise;

  expect(requests).toEqual([]);
});
