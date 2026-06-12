import { defineConfig, devices } from "@playwright/test";

const PORT = 3811;

// Point e2e at a deployed URL with: BASE_URL=https://... npm run test:e2e
// Without BASE_URL, a local dev server is started automatically.
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: true,
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npm run dev -- --port ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
