import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests of the public pages, on a phone (360 px) and a desktop, against a running deployment:
 * `E2E_BASE_URL` (a Vercel preview in CI) and, for protected previews,
 * `VERCEL_AUTOMATION_BYPASS_SECRET`.
 */
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    extraHTTPHeaders: bypass
      ? {
          "x-vercel-protection-bypass": bypass,
          "x-vercel-set-bypass-cookie": "true",
        }
      : undefined,
    trace: "off",
  },
  projects: [
    {
      name: "phone",
      use: { ...devices["Pixel 5"], viewport: { width: 360, height: 780 } },
    },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
});
