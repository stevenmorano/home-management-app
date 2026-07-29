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

const maintenanceAsset: FixtureAsset = {
  category: "hvac",
  condition: "unknown",
  name: "Maintenance Test HVAC",
  status: "missing_info"
};

const otherPropertyAsset: FixtureAsset = {
  category: "water_heater",
  condition: "unknown",
  name: "Other Property Water Heater",
  status: "missing_info"
};

test("creates, surfaces, edits, and deletes private maintenance history", async ({
  page
}) => {
  const runtimeErrors = captureRuntimeErrors(page);
  const fixtureContext = await createFixtureContext();
  const fixture = await createPropertyFixture(
    fixtureContext,
    "maintenance",
    [maintenanceAsset]
  );
  const otherFixture = await createPropertyFixture(
    fixtureContext,
    "maintenance-cross-property",
    [otherPropertyAsset]
  );
  const asset = fixture.assets[0];
  const otherAsset = otherFixture.assets[0];

  if (!asset || !otherAsset) {
    throw new Error("Maintenance fixture assets were not created");
  }

  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/dashboard?property=${fixture.propertyId}&tab=home`);
    await page.getByRole("link", { name: "Maintenance", exact: true }).click();

    await expect(page).toHaveURL(/tab=maintenance/);
    const completedDateInput = page.getByLabel("Completed date");
    const completedDate = await completedDateInput.getAttribute("max");

    if (!completedDate) {
      throw new Error("Maintenance form did not provide a maximum completed date");
    }

    await page.getByLabel("What was done?").fill("Annual HVAC service");
    await page.getByLabel("Work type").selectOption("maintenance");
    await completedDateInput.fill(completedDate);
    await page.getByLabel("Asset or system").selectOption(asset.id);
    await page.getByLabel("Who did the work?").selectOption("contractor");
    await page.getByLabel("Provider name").fill("HomeKeep Test Mechanical");
    await page.getByLabel("Cost").fill("189.50");
    await page
      .getByLabel("Description")
      .fill("Inspected the system and replaced the filter.");
    await page.getByRole("button", { name: "Save completed work" }).click();

    await expect(page.getByText("Maintenance record added")).toBeVisible();
    await expect(page.getByText("Annual HVAC service").first()).toBeVisible();
    await expect(page.getByText("$189.50")).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto(`/dashboard?property=${fixture.propertyId}&tab=home`);
    await expect(page.getByText("Recently completed")).toBeVisible();
    await expect(page.getByText("Annual HVAC service")).toBeVisible();

    await page.goto(
      `/dashboard?property=${fixture.propertyId}&tab=systems&asset=${asset.id}`
    );
    await expect(page.getByText("Service history")).toBeVisible();
    await expect(page.getByText("Annual HVAC service")).toBeVisible();

    const { data: servicedAsset, error: servicedAssetError } =
      await fixtureContext.client
        .from("asset_systems")
        .select("last_service_date")
        .eq("id", asset.id)
        .single();

    expect(servicedAssetError).toBeNull();
    expect(servicedAsset?.last_service_date).toBe(completedDate);

    await page.getByRole("link", { name: "Annual HVAC service" }).click();
    await page.getByLabel("What was done?").fill("Annual HVAC service updated");

    const previousDate = new Date(`${completedDate}T12:00:00Z`);
    previousDate.setUTCDate(previousDate.getUTCDate() - 1);
    const olderCompletedDate = previousDate.toISOString().slice(0, 10);
    await page.getByLabel("Completed date").fill(olderCompletedDate);
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText("Maintenance record updated")).toBeVisible();
    await expect(
      page.getByText("Annual HVAC service updated").first()
    ).toBeVisible();

    const { data: assetAfterOlderEdit, error: assetAfterOlderEditError } =
      await fixtureContext.client
        .from("asset_systems")
        .select("last_service_date")
        .eq("id", asset.id)
        .single();

    expect(assetAfterOlderEditError).toBeNull();
    expect(assetAfterOlderEdit?.last_service_date).toBe(completedDate);

    const { error: crossPropertyError } = await fixtureContext.client
      .from("work_records")
      .insert({
        asset_system_id: otherAsset.id,
        completed_date: completedDate,
        performed_by_type: "diy",
        property_id: fixture.propertyId,
        title: "Invalid cross-property link",
        work_type: "maintenance"
      });

    expect(crossPropertyError).not.toBeNull();

    await page
      .getByRole("link", { name: "Edit Annual HVAC service updated" })
      .click();
    await page.getByLabel("Type REMOVE to confirm").fill("REMOVE");
    await page.getByRole("button", { name: "Delete record" }).click();

    await expect(page.getByText("Maintenance record removed")).toBeVisible();
    await expect(page.getByText("Annual HVAC service updated")).toHaveCount(0);

    const { count, error: remainingRecordsError } = await fixtureContext.client
      .from("work_records")
      .select("id", { count: "exact", head: true })
      .eq("property_id", fixture.propertyId);

    expect(remainingRecordsError).toBeNull();
    expect(count).toBe(0);
    await expectNoHorizontalOverflow(page);
    expect(runtimeErrors).toEqual([]);
  } finally {
    await deletePropertyFixture(fixtureContext, fixture.propertyId);
    await deletePropertyFixture(fixtureContext, otherFixture.propertyId);
  }
});
