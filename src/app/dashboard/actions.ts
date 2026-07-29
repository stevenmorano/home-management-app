"use server";

import { redirect } from "next/navigation";

import {
  calculateAssetStatus,
  getPilotCalendarDate
} from "@/lib/asset-health";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { parseWorkRecordFields } from "@/lib/work-record";
import type {
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

function parseOptionalUuid(value: FormDataEntryValue | null) {
  const text = optionalText(value);

  if (!text) {
    return null;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text)
    ? text
    : null;
}

function maintenanceRedirect(
  propertyId: string,
  message: string,
  extraParams?: Record<string, string>
): never {
  const params = new URLSearchParams({
    message,
    property: propertyId,
    tab: "maintenance",
    ...extraParams
  });

  redirect(`/dashboard?${params.toString()}`);
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

async function validateWorkRecordLinks(
  supabase: Awaited<ReturnType<typeof createClient>>,
  propertyId: string,
  assetSystemId: string | null,
  roomId: string | null
) {
  if (assetSystemId) {
    const { data: asset, error } = await supabase
      .from("asset_systems")
      .select("id")
      .eq("id", assetSystemId)
      .eq("property_id", propertyId)
      .maybeSingle();

    if (error || !asset) {
      return "Linked asset was not found for this property";
    }
  }

  if (roomId) {
    const { data: room, error } = await supabase
      .from("rooms")
      .select("id")
      .eq("id", roomId)
      .eq("property_id", propertyId)
      .maybeSingle();

    if (error || !room) {
      return "Linked location was not found for this property";
    }
  }

  return null;
}

async function requireOwnedWorkRecord(recordId: string, userId: string) {
  const supabase = await createClient();
  const { data: record, error } = await supabase
    .from("work_records")
    .select("id, property_id, properties!inner(user_id)")
    .eq("id", recordId)
    .eq("properties.user_id", userId)
    .maybeSingle();

  if (error || !record) {
    redirect("/dashboard?tab=maintenance&message=Maintenance%20record%20not%20found");
  }

  return { record, supabase };
}

export async function createFirstProperty(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const name = optionalText(formData.get("name"));
  const returnTab = String(formData.get("return_tab") ?? "");

  if (!name) {
    redirect("/dashboard?message=Property%20name%20is%20required");
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email ?? null,
    name: user.user_metadata.name ?? null
  });

  const { data: property, error } = await supabase.from("properties").insert({
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
  }).select("id").single();

  if (error) {
    const params = new URLSearchParams({
      message: `Could not create property: ${error.message}`
    });
    redirect(`/dashboard?${params.toString()}`);
  }

  const params = new URLSearchParams();

  if (property?.id) {
    params.set("property", property.id);
  }

  if (returnTab === "more") {
    params.set("tab", "more");
    params.set("message", "Property added");
  }

  redirect(`/dashboard${params.size > 0 ? `?${params.toString()}` : ""}`);
}

export async function updatePropertyDetails(formData: FormData) {
  const user = await requireUser();
  const propertyId = optionalText(formData.get("property_id"));
  const name = optionalText(formData.get("name"));

  if (!propertyId) {
    redirect("/dashboard?message=Property%20is%20required");
  }

  if (!name) {
    redirect(`/dashboard?tab=more&property=${propertyId}&message=Property%20name%20is%20required`);
  }

  const { property, supabase } = await requireOwnedProperty(propertyId, user.id);
  const { error } = await supabase
    .from("properties")
    .update({
      name,
      property_type: parsePropertyType(formData.get("property_type")),
      address_line_1: optionalText(formData.get("address_line_1")),
      address_line_2: optionalText(formData.get("address_line_2")),
      city: optionalText(formData.get("city")),
      state: optionalText(formData.get("state")),
      postal_code: optionalText(formData.get("postal_code")),
      year_built: optionalPositiveInteger(formData.get("year_built")),
      square_feet: optionalPositiveInteger(formData.get("square_feet")),
      notes: optionalText(formData.get("notes"))
    })
    .eq("id", property.id);

  if (error) {
    const params = new URLSearchParams({
      tab: "more",
      property: property.id,
      message: `Could not update property: ${error.message}`
    });
    redirect(`/dashboard?${params.toString()}`);
  }

  redirect(`/dashboard?tab=more&property=${property.id}&message=Property%20details%20saved`);
}

export async function createRoom(formData: FormData) {
  const user = await requireUser();
  const propertyId = optionalText(formData.get("property_id"));
  const name = optionalText(formData.get("name"));

  if (!propertyId) {
    redirect("/dashboard?message=Property%20is%20required");
  }

  if (!name) {
    redirect(`/dashboard?tab=more&property=${propertyId}&message=Location%20name%20is%20required`);
  }

  const { property, supabase } = await requireOwnedProperty(propertyId, user.id);
  const { data: existingRooms, error: existingRoomsError } = await supabase
    .from("rooms")
    .select("name")
    .eq("property_id", property.id);

  if (existingRoomsError) {
    const params = new URLSearchParams({
      tab: "more",
      property: property.id,
      message: `Could not check locations: ${existingRoomsError.message}`
    });
    redirect(`/dashboard?${params.toString()}`);
  }

  if ((existingRooms ?? []).some((room) => room.name.trim().toLowerCase() === name.trim().toLowerCase())) {
    redirect(`/dashboard?tab=more&property=${property.id}&message=That%20location%20already%20exists`);
  }

  const { error } = await supabase.from("rooms").insert({
    property_id: property.id,
    name,
    room_type: optionalText(formData.get("room_type")),
    notes: optionalText(formData.get("notes"))
  });

  if (error) {
    const params = new URLSearchParams({
      tab: "more",
      property: property.id,
      message: `Could not create location: ${error.message}`
    });
    redirect(`/dashboard?${params.toString()}`);
  }

  redirect(`/dashboard?tab=more&property=${property.id}&message=Location%20added`);
}

export async function updateRoom(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const roomId = optionalText(formData.get("room_id"));
  const name = optionalText(formData.get("name"));

  if (!roomId) {
    redirect("/dashboard?tab=more&message=Location%20is%20required");
  }

  if (!name) {
    redirect("/dashboard?tab=more&message=Location%20name%20is%20required");
  }

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, property_id, properties!inner(user_id)")
    .eq("id", roomId)
    .eq("properties.user_id", user.id)
    .single();

  if (roomError || !room) {
    redirect("/dashboard?tab=more&message=Location%20not%20found");
  }

  const { error } = await supabase
    .from("rooms")
    .update({
      name,
      room_type: optionalText(formData.get("room_type")),
      notes: optionalText(formData.get("notes"))
    })
    .eq("id", room.id);

  if (error) {
    const params = new URLSearchParams({
      tab: "more",
      property: room.property_id,
      message: `Could not update location: ${error.message}`
    });
    redirect(`/dashboard?${params.toString()}`);
  }

  redirect(`/dashboard?tab=more&property=${room.property_id}&message=Location%20saved`);
}

export async function deleteRoom(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();
  const roomId = optionalText(formData.get("room_id"));

  if (!roomId) {
    redirect("/dashboard?tab=more&message=Location%20is%20required");
  }

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, property_id, properties!inner(user_id)")
    .eq("id", roomId)
    .eq("properties.user_id", user.id)
    .single();

  if (roomError || !room) {
    redirect("/dashboard?tab=more&message=Location%20not%20found");
  }

  const { error } = await supabase.from("rooms").delete().eq("id", room.id);

  if (error) {
    const params = new URLSearchParams({
      tab: "more",
      property: room.property_id,
      message: `Could not remove location: ${error.message}`
    });
    redirect(`/dashboard?${params.toString()}`);
  }

  redirect(`/dashboard?tab=more&property=${room.property_id}&message=Location%20removed`);
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
    redirect("/dashboard?tab=add&message=Select%20at%20least%20one%20asset%20or%20system");
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
    redirect("/dashboard?tab=add&message=Those%20assets%20already%20exist%20for%20this%20property");
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
      redirect("/dashboard?tab=add&message=Some%20selected%20assets%20already%20exist%20for%20this%20property");
    }

    const params = new URLSearchParams({
      tab: "add",
      message: `Could not create assets: ${error.message}`
    });
    redirect(`/dashboard?${params.toString()}`);
  }

  redirect("/dashboard?tab=systems&message=Selected%20items%20added");
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
    redirect("/dashboard?tab=add&message=Asset%20name%20is%20required");
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
      redirect("/dashboard?tab=add&message=That%20asset%20already%20exists%20for%20this%20property");
    }

    const params = new URLSearchParams({
      tab: "add",
      message: `Could not create custom asset: ${error.message}`
    });
    redirect(`/dashboard?${params.toString()}`);
  }

  redirect("/dashboard?tab=add&message=Item%20added");
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
  const roomId = parseOptionalUuid(formData.get("room_id"));
  const notes = optionalText(formData.get("notes"));
  const status = calculateAssetStatus(
    {
      condition,
      nextServiceDueDate
    },
    getPilotCalendarDate(new Date())
  );

  if (roomId) {
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id")
      .eq("id", roomId)
      .eq("property_id", asset.property_id)
      .single();

    if (roomError || !room) {
      redirect(`/dashboard?tab=systems&asset=${asset.id}&message=Location%20not%20found`);
    }
  }

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
      room_id: roomId,
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

  redirect(`/dashboard?tab=systems&asset=${asset.id}&message=Asset%20details%20saved`);
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

export async function createWorkRecord(formData: FormData) {
  const user = await requireUser();
  const propertyId = optionalText(formData.get("property_id"));

  if (!propertyId) {
    redirect("/dashboard?tab=maintenance&message=Property%20is%20required");
  }

  const { property, supabase } = await requireOwnedProperty(propertyId, user.id);
  const rawAssetSystemId = optionalText(formData.get("asset_system_id"));
  const rawRoomId = optionalText(formData.get("room_id"));
  const assetSystemId = parseOptionalUuid(formData.get("asset_system_id"));
  const roomId = parseOptionalUuid(formData.get("room_id"));

  if (rawAssetSystemId && !assetSystemId) {
    maintenanceRedirect(property.id, "Choose a valid asset");
  }

  if (rawRoomId && !roomId) {
    maintenanceRedirect(property.id, "Choose a valid location");
  }

  const validation = parseWorkRecordFields(
    {
      completedDate: formData.get("completed_date"),
      costAmount: formData.get("cost_amount"),
      description: formData.get("description"),
      notes: formData.get("notes"),
      performedByType: formData.get("performed_by_type"),
      providerName: formData.get("provider_name"),
      title: formData.get("title"),
      workType: formData.get("work_type")
    },
    getPilotCalendarDate(new Date())
  );

  if (!validation.ok) {
    maintenanceRedirect(property.id, validation.message, { mode: "new" });
  }

  const linkError = await validateWorkRecordLinks(
    supabase,
    property.id,
    assetSystemId,
    roomId
  );

  if (linkError) {
    maintenanceRedirect(property.id, linkError, { mode: "new" });
  }

  const { value } = validation;
  const { error } = await supabase.from("work_records").insert({
    asset_system_id: assetSystemId,
    completed_date: value.completedDate,
    cost_amount: value.costAmount,
    cost_currency: "USD",
    description: value.description,
    notes: value.notes,
    performed_by_type: value.performedByType,
    property_id: property.id,
    provider_name: value.providerName,
    room_id: roomId,
    title: value.title,
    work_type: value.workType
  });

  if (error) {
    maintenanceRedirect(
      property.id,
      "Could not save the maintenance record. Please try again.",
      { mode: "new" }
    );
  }

  maintenanceRedirect(property.id, "Maintenance record added");
}

export async function updateWorkRecord(formData: FormData) {
  const user = await requireUser();
  const recordId = parseOptionalUuid(formData.get("record_id"));

  if (!recordId) {
    redirect("/dashboard?tab=maintenance&message=Maintenance%20record%20is%20required");
  }

  const { record, supabase } = await requireOwnedWorkRecord(recordId, user.id);
  const rawAssetSystemId = optionalText(formData.get("asset_system_id"));
  const rawRoomId = optionalText(formData.get("room_id"));
  const assetSystemId = parseOptionalUuid(formData.get("asset_system_id"));
  const roomId = parseOptionalUuid(formData.get("room_id"));
  const editParams = { record: record.id };

  if (rawAssetSystemId && !assetSystemId) {
    maintenanceRedirect(record.property_id, "Choose a valid asset", editParams);
  }

  if (rawRoomId && !roomId) {
    maintenanceRedirect(record.property_id, "Choose a valid location", editParams);
  }

  const validation = parseWorkRecordFields(
    {
      completedDate: formData.get("completed_date"),
      costAmount: formData.get("cost_amount"),
      description: formData.get("description"),
      notes: formData.get("notes"),
      performedByType: formData.get("performed_by_type"),
      providerName: formData.get("provider_name"),
      title: formData.get("title"),
      workType: formData.get("work_type")
    },
    getPilotCalendarDate(new Date())
  );

  if (!validation.ok) {
    maintenanceRedirect(record.property_id, validation.message, editParams);
  }

  const linkError = await validateWorkRecordLinks(
    supabase,
    record.property_id,
    assetSystemId,
    roomId
  );

  if (linkError) {
    maintenanceRedirect(record.property_id, linkError, editParams);
  }

  const { value } = validation;
  const { error } = await supabase
    .from("work_records")
    .update({
      asset_system_id: assetSystemId,
      completed_date: value.completedDate,
      cost_amount: value.costAmount,
      cost_currency: "USD",
      description: value.description,
      notes: value.notes,
      performed_by_type: value.performedByType,
      provider_name: value.providerName,
      room_id: roomId,
      title: value.title,
      work_type: value.workType
    })
    .eq("id", record.id)
    .eq("property_id", record.property_id);

  if (error) {
    maintenanceRedirect(
      record.property_id,
      "Could not update the maintenance record. Please try again.",
      editParams
    );
  }

  maintenanceRedirect(record.property_id, "Maintenance record updated");
}

export async function deleteWorkRecord(formData: FormData) {
  const user = await requireUser();
  const recordId = parseOptionalUuid(formData.get("record_id"));
  const confirmed = optionalText(formData.get("confirm_delete")) === "REMOVE";

  if (!recordId) {
    redirect("/dashboard?tab=maintenance&message=Maintenance%20record%20is%20required");
  }

  const { record, supabase } = await requireOwnedWorkRecord(recordId, user.id);

  if (!confirmed) {
    maintenanceRedirect(
      record.property_id,
      "Type REMOVE before deleting a maintenance record",
      { record: record.id }
    );
  }

  const { error } = await supabase
    .from("work_records")
    .delete()
    .eq("id", record.id)
    .eq("property_id", record.property_id);

  if (error) {
    maintenanceRedirect(
      record.property_id,
      "Could not delete the maintenance record. Please try again.",
      { record: record.id }
    );
  }

  maintenanceRedirect(record.property_id, "Maintenance record removed");
}
