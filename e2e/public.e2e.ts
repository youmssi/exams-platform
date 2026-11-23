import { expect, type Page, test } from "@playwright/test";

/** No page may scroll sideways, at any width. */
async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

test("landing explains the service and leads to sign-in", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("#faq")).toBeAttached();
  await expectNoHorizontalScroll(page);
});

test("sign-in offers the email code", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByRole("textbox").first()).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test("legal pages are reachable without an account", async ({ page }) => {
  for (const path of ["/terms", "/privacy", "/en/terms", "/en/privacy"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("app pages ask to sign in first", async ({ page }) => {
  await page.goto("/requests");
  await expect(page).toHaveURL(/\/sign-in\?next=%2Frequests/);
});

test("the consent page explains an invalid link", async ({ page }) => {
  await page.goto("/consent?token=not-a-real-token-value-xxxx");
  await expect(page.getByText(/invalide|invalid/i).first()).toBeVisible();
});

test("the share image is generated", async ({ request }) => {
  const response = await request.get("/fr/opengraph-image");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/png");
});
