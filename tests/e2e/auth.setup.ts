import { mkdir } from "node:fs/promises";
import path from "node:path";

import { expect, test as setup } from "@playwright/test";

import { getAuthenticatedE2EEnv } from "./support/env";
import {
  cleanupStaleFixtures,
  createFixtureContext
} from "./support/supabase-fixtures";

const authFile = path.resolve("playwright/.auth/user.json");

setup("authenticate the permanent automation user", async ({ page }) => {
  const env = getAuthenticatedE2EEnv();

  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(env.email);
  await page.getByLabel("Password", { exact: true }).fill(env.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);

  const fixtureContext = await createFixtureContext();
  await cleanupStaleFixtures(fixtureContext);

  await mkdir(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
