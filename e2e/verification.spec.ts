/**
 * Independent verifier checks, run against the deployed preview
 * (BASE_URL=https://... npm run test:e2e). Covers spec edge cases not
 * exercised by utm-grid.spec.ts. Locators use stable aria-labels only.
 */
import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs/promises";

// Both table and card layouts are always in DOM; use .first() to avoid strict-mode violations.
const cell = (page: Page, field: string, rowNum: number) =>
  page.getByLabel(`${field} row ${rowNum}`, { exact: true }).first();

test("base URL with existing query and fragment: params appended correctly", async ({
  page,
}) => {
  await page.goto("/");
  await cell(page, "Base URL", 1).fill("https://example.com/p?ref=1#section");
  await cell(page, "utm_source", 1).fill("newsletter");
  await expect(cell(page, "Generated URL", 1)).toHaveText(
    "https://example.com/p?ref=1&utm_source=newsletter#section"
  );
});

test("special characters in UTM values are URL-encoded in generated URL", async ({
  page,
}) => {
  await page.goto("/");
  await cell(page, "Base URL", 1).fill("https://example.com");
  await cell(page, "utm_campaign", 1).fill("50% off & more");
  await expect(cell(page, "Generated URL", 1)).toHaveText(
    "https://example.com?utm_campaign=50%25%20off%20%26%20more"
  );
});

test("page has no login or signup", async ({ page }) => {
  await page.goto("/");
  // No password fields (definitive auth signal)
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  // No login/sign-in/sign-up buttons or links (not body text which says "no login")
  await expect(
    page.getByRole("button", { name: /log\s?in|sign\s?up|sign\s?in/i })
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: /log\s?in|sign\s?up|sign\s?in/i })
  ).toHaveCount(0);
});

test("lint-rule toggles persist in localStorage across reload", async ({
  page,
}) => {
  await page.goto("/");
  // Open the Rules ▾ popover (lint-rules now live inside Rules ▾ dropdown)
  const rulesBtn = page.locator('[data-testid="rules-menu-btn"]');
  await expect(rulesBtn).toBeVisible({ timeout: 5000 });
  await rulesBtn.click();
  const lowercase = page.getByRole("checkbox", { name: "Lowercase only" });
  await expect(lowercase).toBeVisible({ timeout: 3000 });
  await expect(lowercase).toBeChecked();
  await lowercase.uncheck();
  // Close the popover before reload
  await page.keyboard.press("Escape");
  await page.reload();
  // Re-open Rules ▾ after reload to check persisted toggle state
  const rulesBtn2 = page.locator('[data-testid="rules-menu-btn"]');
  await expect(rulesBtn2).toBeVisible({ timeout: 5000 });
  await rulesBtn2.click();
  await expect(
    page.getByRole("checkbox", { name: "Lowercase only" })
  ).not.toBeChecked();
  // Close the popover before typing in the grid
  await page.keyboard.press("Escape");
  // With the rule off, uppercase no longer warns (still flags the space).
  await cell(page, "utm_campaign", 1).fill("Spring Sale");
  await expect(
    page.getByRole("alert").filter({ hasText: "uppercase" })
  ).toHaveCount(0);
  await expect(
    page.getByRole("alert").filter({ hasText: "spaces" })
  ).toBeVisible();
});

test("no network requests during editing, CSV import, and export", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const requests: string[] = [];
  page.on("request", (req) => {
    if (!req.url().startsWith("blob:")) requests.push(req.url());
  });

  // Edit
  await cell(page, "Base URL", 1).fill("https://example.com/sale");
  await cell(page, "utm_source", 1).fill("newsletter");

  // Import (file upload is local; parsing must be in-browser)
  const csv =
    "url,source,medium,campaign\nhttps://example.com/x,facebook,paid_social,spring_sale\n";
  await page
    .getByLabel("CSV file")
    .setInputFiles({ name: "in.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
  await expect(page.getByText("Map CSV columns")).toBeVisible();
  await page.getByRole("radio", { name: "Replace" }).click();
  await page.getByRole("button", { name: "Import 1 row", exact: true }).click();
  await expect(cell(page, "utm_source", 1)).toHaveValue("facebook");

  // Export
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  await downloadPromise;

  expect(requests).toEqual([]);
});

test("export CSV has one data row per grid row with all columns populated", async ({
  page,
}) => {
  await page.goto("/");
  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_source", 1).fill("s1");
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 2).fill("https://example.com/b");
  await cell(page, "utm_source", 2).fill("s2");
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 3).fill("https://example.com/c");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const download = await downloadPromise;
  const csv = await fs.readFile((await download.path())!, "utf8");
  const lines = csv.trim().split("\n");
  expect(lines).toHaveLength(4); // header + 3 grid rows
  expect(lines[0]).toBe(
    "base_url,utm_source,utm_medium,utm_campaign,utm_term,utm_content,generated_url"
  );
  expect(lines[1]).toBe(
    "https://example.com/a,s1,,,,,https://example.com/a?utm_source=s1"
  );
  expect(lines[3]).toBe("https://example.com/c,,,,,,https://example.com/c");
});

test("copy-all copies every generated URL to the clipboard", async ({
  page,
  context,
  baseURL,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: baseURL,
  });
  await page.goto("/");
  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_source", 1).fill("s1");
  await page.getByRole("button", { name: "Add row" }).click();
  await cell(page, "Base URL", 2).fill("https://example.com/b");

  await page.getByRole("button", { name: "Copy all URLs" }).click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe(
    "https://example.com/a?utm_source=s1\nhttps://example.com/b"
  );
});

test("row copy button copies that row's generated URL", async ({
  page,
  context,
  baseURL,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: baseURL,
  });
  await page.goto("/");
  await cell(page, "Base URL", 1).fill("https://example.com/sale");
  await cell(page, "utm_source", 1).fill("newsletter");
  await page.getByLabel("Copy URL row 1", { exact: true }).first().click();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toBe("https://example.com/sale?utm_source=newsletter");
});

test("duplicate and delete row work", async ({ page }) => {
  await page.goto("/");
  await cell(page, "Base URL", 1).fill("https://example.com/a");
  await cell(page, "utm_source", 1).fill("s1");
  await page.getByLabel("Duplicate row 1", { exact: true }).first().click();
  await expect(cell(page, "Base URL", 2)).toHaveValue("https://example.com/a");
  await expect(cell(page, "utm_source", 2)).toHaveValue("s1");
  await page.getByLabel("Delete row 1", { exact: true }).first().click();
  await expect(cell(page, "Base URL", 1)).toHaveValue("https://example.com/a");
  await expect(cell(page, "Base URL", 2)).toHaveCount(0);
});

test("AUTOFIX spot-check: Facebook -> Auto-fix naming -> utm_source=facebook in generated URL", async ({ page }) => {
  await page.goto("/");
  await cell(page, "Base URL", 1).fill("https://example.com");
  await cell(page, "utm_source", 1).fill("Facebook");
  await cell(page, "utm_medium", 1).fill("paid_social");
  await cell(page, "utm_campaign", 1).fill("spring");

  await page.locator('[data-testid="auto-fix-naming-btn"]').click();

  // utm_source should be lowercased to "facebook"
  await expect(cell(page, "utm_source", 1)).toHaveValue("facebook");
  // Generated URL must contain utm_source=facebook (not Facebook)
  await expect(cell(page, "Generated URL", 1)).toHaveText(
    "https://example.com?utm_source=facebook&utm_medium=paid_social&utm_campaign=spring"
  );
});
