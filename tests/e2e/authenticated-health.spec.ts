import { expect, test, type Page } from "@playwright/test";

import {
  createFixtureContext,
  createPropertyFixture,
  deletePropertyFixture,
  type FixtureAsset
} from "./support/supabase-fixtures";

test.describe.configure({ mode: "serial" });

function captureRuntimeErrors(page: Page) {
  const errors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));

  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth
  );

  expect(hasHorizontalOverflow).toBe(false);
}

const missingAssets: FixtureAsset[] = [
  {
    category: "roof",
    condition: "unknown",
    name: "Unknown roof",
    status: "missing_info"
  },
  {
    category: "hvac",
    condition: "unknown",
    name: "Unknown HVAC",
    status: "missing_info"
  }
];

const mixedAssets: FixtureAsset[] = [
  {
    category: "roof",
    condition: "good",
    name: "Good roof",
    status: "good"
  },
  {
    category: "hvac",
    condition: "fair",
    name: "Fair HVAC",
    status: "due_soon"
  },
  {
    category: "water_heater",
    condition: "poor",
    name: "Poor water heater",
    status: "needs_attention"
  },
  {
    category: "deck",
    condition: "unknown",
    name: "Unknown deck",
    status: "missing_info"
  }
];

test("shows unavailable health separately from coverage on mobile", async ({
  page
}) => {
  const runtimeErrors = captureRuntimeErrors(page);
  const fixtureContext = await createFixtureContext();
  const fixture = await createPropertyFixture(
    fixtureContext,
    "insufficient",
    missingAssets
  );

  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/dashboard?property=${fixture.propertyId}&tab=home`);

    await expect(
      page.getByLabel("Home health score unavailable")
    ).toBeVisible();
    await expect(
      page.getByText("Add a condition or next service date to assess your home.")
    ).toBeVisible();
    await expect(
      page.getByText("0 of 2 systems assessed (0% coverage).")
    ).toBeVisible();
    await expect(
      page.getByText(
        "0 good, 0 due soon, 0 need attention, 2 missing info."
      )
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(runtimeErrors).toEqual([]);
  } finally {
    await deletePropertyFixture(fixtureContext, fixture.propertyId);
  }
});

test("shows the assessed score and priority message on desktop", async ({
  page
}) => {
  const runtimeErrors = captureRuntimeErrors(page);
  const fixtureContext = await createFixtureContext();
  const fixture = await createPropertyFixture(
    fixtureContext,
    "mixed-health",
    mixedAssets
  );

  try {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/dashboard?property=${fixture.propertyId}&tab=home`);

    await expect(
      page.getByLabel("Home health score 68 out of 100")
    ).toBeVisible();
    await expect(
      page.getByText("Some systems need attention now.")
    ).toBeVisible();
    await expect(
      page.getByText("3 of 4 systems assessed (75% coverage).")
    ).toBeVisible();
    await expect(
      page.getByText(
        "1 good, 1 due soon, 1 need attention, 1 missing info."
      )
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(runtimeErrors).toEqual([]);
  } finally {
    await deletePropertyFixture(fixtureContext, fixture.propertyId);
  }
});
