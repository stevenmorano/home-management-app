import { expect, test } from "@playwright/test";

test("protects the dashboard from unauthenticated users", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", {
      name: "Sign in to your private property command center."
    })
  ).toBeVisible();
});

test("contains untrusted auth callback redirects", async ({ request }) => {
  const response = await request.get(
    "/auth/callback?next=https://attacker.example/steal-session",
    {
      maxRedirects: 0
    }
  );
  const location = response.headers().location;

  expect(response.status()).toBe(307);
  expect(location).toBeTruthy();

  const redirectUrl = new URL(location!);
  expect(["127.0.0.1", "localhost"]).toContain(redirectUrl.hostname);
  expect(redirectUrl.pathname).toBe("/login");
});

for (const viewport of [
  { label: "mobile", width: 390, height: 844 },
  { label: "desktop", width: 1440, height: 1000 }
]) {
  test(`keeps the login page usable at the ${viewport.label} viewport`, async ({
    page
  }) => {
    const runtimeErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") {
        runtimeErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => runtimeErrors.push(error.message));

    await page.setViewportSize(viewport);
    await page.goto("/login");

    const hasHorizontalOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
    );

    expect(hasHorizontalOverflow).toBe(false);
    expect(runtimeErrors).toEqual([]);
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });
}
