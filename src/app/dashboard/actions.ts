"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type {
  AssetStatus,
  AssetSystemCategory,
  AssetSystemInsert,
  MaintenanceIntervalUnit,
  OwnershipResponsibility,
  PropertyType
} from "@/types/database";

const propertyTypes = [
  "single_family_house",
  "condo",
  "coop",
  "apartment",
  "multi_family",
  "rental",
  "vacation_home",
  "other"
] satisfies PropertyType[];

const assetCategories = [
  "roof",
  "hvac",
  "furnace",
  "boiler",
  "water_heater",
  "appliance",
  "electrical",
  "plumbing",
  "gutters",
  "windows",
  "chimney",
  "foundation",
  "deck",
  "driveway",
  "pool",
  "sump_pump",
  "septic_or_sewer",
  "irrigation",
  "garage",
  "security",
  "other"
] satisfies AssetSystemCategory[];

const estimatedAgeRanges = [
  "zero_to_three_years",
  "four_to_seven_years",
  "eight_to_twelve_years",
  "thirteen_to_twenty_years",
  "over_twenty_years",
  "unknown"
] as const;

const assetConditions = ["excellent", "good", "fair", "poor", "unknown"] as const;
const maintenanceIntervalUnits = ["days", "weeks", "months", "years"] satisfies MaintenanceIntervalUnit[];
const ownershipResponsibilities = [
  "owner",
  "hoa",
  "landlord",
  "tenant",
  "shared",
  "unknown"
] satisfies OwnershipResponsibility[];

function optionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function optionalPositiveInteger(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const parsed = Number.parseInt(text, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function optionalNonNegativeNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const normalized = text.replaceAll(",", "");
  const parsed = Number.parseFloat(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed * 100) / 100;
}

function optionalYear(value: FormDataEntryValue | null) {
  const parsed = optionalPositiveInteger(value);

  if (!parsed) {
    return null;
  }

  if (parsed < 1600 || parsed > 2200) {
    return null;
  }

  return parsed;
}

function optionalDate(value: FormDataEntryValue | null) {
  const text = optionalText(value);

  if (!text || !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return null;
  }

  return text;
}

function parseAssetCategory(value: FormDataEntryValue | null): AssetSystemCategory {
  const candidate = String(value ?? "");

  if (assetCategories.includes(candidate as AssetSystemCategory)) {
    return candidate as AssetSystemCategory;
  }

  return "other";
}

function parsePropertyType(value: FormDataEntryValue | null): PropertyType {
  const candidate = String(value ?? "");

  if (propertyTypes.includes(candidate as PropertyType)) {
    return candidate as PropertyType;
  }

  return "single_family_house";
}

function parseAssetSelection(value: FormDataEntryValue | null) {
  const [category, name] = String(value ?? "").split("::", 2);

  if (!assetCategories.includes(category as AssetSystemCategory) || !name?.trim()) {
    return null;
  }

  return {
    category: category as AssetSystemCategory,
    name: name.trim()
  };
}

function parseEstimatedAgeRange(value: FormDataEntryValue | null) {
  const candidate = String(value ?? "");
  return estimatedAgeRanges.includes(candidate as (typeof estimatedAgeRanges)[number])
    ? (candidate as (typeof estimatedAgeRanges)[number])
    : "unknown";
}

function parseAssetCondition(value: FormDataEntryValue | null) {
  const candidate = String(value ?? "");
  return assetConditions.includes(candidate as (typeof assetConditions)[number])
    ? (candidate as (typeof assetConditions)[number])
    : "unknown";
}

function parseMaintenanceIntervalUnit(value: FormDataEntryValue | null) {
  const candidate = String(value ?? "");
  return maintenanceIntervalUnits.includes(candidate as MaintenanceIntervalUnit)
    ? (candidate as MaintenanceIntervalUnit)
    : null;
}

function parseOwnershipResponsibility(value: FormDataEntryValue | null): OwnershipResponsibility {
  const candidate = String(value ?? "");
  return ownershipResponsibilities.includes(candidate as OwnershipResponsibility)
    ? (candidate as OwnershipResponsibility)
    : "owner";
}

function daysUntil(dateText: string) {
  const today = new Date();
  const dueDate = new Date(`${dateText}T00:00:00`);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return Math.ceil((dueDate.getTime() - todayStart.getTime()) / 86_400_000);
}

function calculateAssetStatus({
  condition,
  estimatedAgeRange,
  estimatedReplacementCost,
  expectedLifespanYears,
  identificationDetails,
  installYear,
  lastServiceDate,
  maintenanceIntervalUnit,
  maintenanceIntervalValue,
  nextServiceDueDate,
  notes
}: {
  condition: (typeof assetConditions)[number];
  estimatedAgeRange: (typeof estimatedAgeRanges)[number];
  estimatedReplacementCost: number | null;
  expectedLifespanYears: number | null;
  identificationDetails: string[];
  installYear: number | null;
  lastServiceDate: string | null;
  maintenanceIntervalUnit: MaintenanceIntervalUnit | null;
  maintenanceIntervalValue: number | null;
  nextServiceDueDate: string | null;
  notes: string | null;
}): AssetStatus {
  const hasUsefulDetails = Boolean(
    installYear ||
      lastServiceDate ||
      nextServiceDueDate ||
      notes ||
      expectedLifespanYears ||
      estimatedReplacementCost !== null ||
      identificationDetails.some(Boolean) ||
      maintenanceIntervalValue ||
      maintenanceIntervalUnit ||
      estimatedAgeRange !== "unknown" ||
      condition !== "unknown"
  );

  if (!hasUsefulDetails) {
    return "missing_info";
  }

  if (condition === "poor") {
    return "needs_attention";
  }

  if (nextServiceDueDate) {
    const dueInDays = daysUntil(nextServiceDueDate);

    if (dueInDays < 0) {
      return "needs_attention";
    }

    if (dueInDays <= 30) {
      return "due_soon";
    }
  }

  if (condition === "fair") {
    return "due_soon";
  }

  return "good";
}

async function requireOwnedProperty(propertyId: string, userId: string) {
  const supabase = await createClient();
  const { data: property, error } = await supabase
    .from("properties")
    .select("id")
    .eq("id", propertyId)
    .eq("user_id", userId)
    .single();

  if (error || !property) {
    redirect("/dashboard?message=Property%20not%20found");
  }

  return { property, supabase };
}

export async function createFirstProperty(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const name = optionalText(formData.get("name"));

  if (!name) {
    redirect("/dashboard?message=Property%20name%20is%20required");
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email ?? null,
    name: user.user_metadata.name ?? null
  });

  const { error } = await supabase.from("properties").insert({
    user_id: user.id,
    name,
    property_type: parsePropertyType(formData.get("property_type")),
    address_line_1: optionalText(formData.get("address_line_1")),
    city: optionalText(formData.get("city")),
    state: optionalText(formData.get("state")),
    postal_code: optionalText(formData.get("postal_code")),
    year_built: optionalPositiveInteger(formData.get("year_built")),
    square_feet: optionalPositiveInteger(formData.get("square_feet")),
    notes: optionalText(formData.get("notes"))
  });

  if (error) {
    const params = new URLSearchParams({
      message: `Could not create property: ${error.message}`
    });
    redirect(`/dashboard?${params.toString()}`);
  }

  redirect("/dashboard");
}

export async function createSelectedAssets(formData: FormData) {
  const user = await requireUser();
  const propertyId = optionalText(formData.get("property_id"));
  const selectedAssets = formData
    .getAll("assets")
    .map(parseAssetSelection)
    .filter((asset): asset is { category: AssetSystemCategory; name: string } => Boolean(asset));

  if (!propertyId) {
    redirect("/dashboard?message=Property%20is%20required");
  }

  if (selectedAssets.length === 0) {
    redirect("/dashboard?message=Select%20at%20least%20one%20asset%20or%20system");
  }

  const { property, supabase } = await requireOwnedProperty(propertyId, user.id);

  const uniqueAssets = Array.from(
    new Map(selectedAssets.map((asset) => [`${asset.category}:${asset.name}`, asset])).values()
  );
  const { data: existingAssets, error: existingAssetsError } = await supabase
    .from("asset_systems")
    .select("category,name")
    .eq("property_id", property.id);

  if (existingAssetsError) {
    const params = new URLSearchParams({
      message: `Could not check existing assets: ${existingAssetsError.message}`
    });
    redirect(`/dashboard?${params.toString()}`);
  }

  const existingAssetKeys = new Set(
    (existingAssets ?? []).map((asset) => `${asset.category}:${asset.name.trim().toLowerCase()}`)
  );

  const newAssets = uniqueAssets.filter(
    (asset) => !existingAssetKeys.has(`${asset.category}:${asset.name.trim().toLowerCase()}`)
  );

  if (newAssets.length === 0) {
    redirect("/dashboard?message=Those%20assets%20already%20exist%20for%20this%20property");
  }

  const inserts: AssetSystemInsert[] = newAssets.map((asset) => ({
    property_id: property.id,
    name: asset.name,
    category: asset.category,
    condition: "unknown",
    estimated_age_range: "unknown",
    status: "missing_info",
    ownership_responsibility: "owner"
  }));

  const { error } = await supabase.from("asset_systems").insert(inserts);

  if (error) {
    if (error.code === "23505") {
      redirect("/dashboard?message=Some%20selected%20assets%20already%20exist%20for%20this%20property");
    }

    const params = new URLSearchParams({
      message: `Could not create assets: ${error.message}`
    });
    redirect(`/dashboard?${params.toString()}`);
  }

  redirect("/dashboard");
}

export async function createCustomAsset(formData: FormData) {
  const user = await requireUser();
  const propertyId = optionalText(formData.get("property_id"));
  const name = optionalText(formData.get("name"));
  const category = parseAssetCategory(formData.get("category"));

  if (!propertyId) {
    redirect("/dashboard?message=Property%20is%20required");
  }

  if (!name) {
    redirect("/dashboard?inventory=1&message=Asset%20name%20is%20required");
  }

  const { property, supabase } = await requireOwnedProperty(propertyId, user.id);

  const { error } = await supabase.from("asset_systems").insert({
    property_id: property.id,
    name,
    category,
    condition: "unknown",
    estimated_age_range: "unknown",
    status: "missing_info",
    ownership_responsibility: "owner"
  });

  if (error) {
    if (error.code === "23505") {
      redirect("/dashboard?inventory=1&message=That%20asset%20already%20exists%20for%20this%20property");
    }

    const params = new URLSearchParams({
      inventory: "1",
      message: `Could not create custom asset: ${error.message}`
    });
    redirect(`/dashboard?${params.toString()}`);
  }

  redirect("/dashboard?message=Custom%20asset%20created");
}

export async function updateAssetDetails(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const assetId = optionalText(formData.get("asset_id"));

  if (!assetId) {
    redirect("/dashboard?message=Asset%20is%20required");
  }

  const { data: asset, error: assetError } = await supabase
    .from("asset_systems")
    .select("id, property_id, properties!inner(user_id)")
    .eq("id", assetId)
    .eq("properties.user_id", user.id)
    .single();

  if (assetError || !asset) {
    redirect("/dashboard?message=Asset%20not%20found");
  }

  const condition = parseAssetCondition(formData.get("condition"));
  const estimatedAgeRange = parseEstimatedAgeRange(formData.get("estimated_age_range"));
  const brand = optionalText(formData.get("brand"));
  const model = optionalText(formData.get("model"));
  const serialNumber = optionalText(formData.get("serial_number"));
  const installYear = optionalYear(formData.get("install_year"));
  const lastServiceDate = optionalDate(formData.get("last_service_date"));
  const parsedMaintenanceIntervalValue = optionalPositiveInteger(formData.get("maintenance_interval_value"));
  const parsedMaintenanceIntervalUnit = parseMaintenanceIntervalUnit(formData.get("maintenance_interval_unit"));
  const maintenanceIntervalValue = parsedMaintenanceIntervalUnit ? parsedMaintenanceIntervalValue : null;
  const maintenanceIntervalUnit = maintenanceIntervalValue ? parsedMaintenanceIntervalUnit : null;
  const nextServiceDueDate = optionalDate(formData.get("next_service_due_date"));
  const expectedLifespanYears = optionalPositiveInteger(formData.get("expected_lifespan_years"));
  const estimatedReplacementCost = optionalNonNegativeNumber(formData.get("estimated_replacement_cost"));
  const ownershipResponsibility = parseOwnershipResponsibility(formData.get("ownership_responsibility"));
  const notes = optionalText(formData.get("notes"));
  const status = calculateAssetStatus({
    condition,
    estimatedAgeRange,
    estimatedReplacementCost,
    expectedLifespanYears,
    identificationDetails: [brand, model, serialNumber].filter((detail): detail is string => Boolean(detail)),
    installYear,
    lastServiceDate,
    maintenanceIntervalUnit,
    maintenanceIntervalValue,
    nextServiceDueDate,
    notes
  });

  const { error } = await supabase
    .from("asset_systems")
    .update({
      brand,
      model,
      serial_number: serialNumber,
      install_year: installYear,
      estimated_age_range: estimatedAgeRange,
      condition,
      last_service_date: lastServiceDate,
      maintenance_interval_value: maintenanceIntervalValue,
      maintenance_interval_unit: maintenanceIntervalValue ? maintenanceIntervalUnit : null,
      next_service_due_date: nextServiceDueDate,
      expected_lifespan_years: expectedLifespanYears,
      estimated_replacement_cost: estimatedReplacementCost,
      ownership_responsibility: ownershipResponsibility,
      notes,
      status
    })
    .eq("id", asset.id);

  if (error) {
    const params = new URLSearchParams({
      message: `Could not update asset: ${error.message}`
    });
    redirect(`/dashboard?${params.toString()}`);
  }

  redirect("/dashboard?message=Asset%20details%20saved");
}

export async function deleteAsset(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const assetId = optionalText(formData.get("asset_id"));
  const confirmed = optionalText(formData.get("confirm_delete")) === "REMOVE";

  if (!assetId) {
    redirect("/dashboard?message=Asset%20is%20required");
  }

  if (!confirmed) {
    redirect("/dashboard?message=Type%20REMOVE%20before%20deleting%20an%20asset");
  }

  const { data: asset, error: assetError } = await supabase
    .from("asset_systems")
    .select("id, property_id, properties!inner(user_id)")
    .eq("id", assetId)
    .eq("properties.user_id", user.id)
    .single();

  if (assetError || !asset) {
    redirect("/dashboard?message=Asset%20not%20found");
  }

  const { error } = await supabase.from("asset_systems").delete().eq("id", asset.id);

  if (error) {
    const params = new URLSearchParams({
      message: `Could not remove asset: ${error.message}`
    });
    redirect(`/dashboard?${params.toString()}`);
  }

  redirect("/dashboard?message=Asset%20removed");
}
