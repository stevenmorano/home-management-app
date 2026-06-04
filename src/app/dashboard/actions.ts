"use server";

import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { PropertyType } from "@/types/database";

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

function parsePropertyType(value: FormDataEntryValue | null): PropertyType {
  const candidate = String(value ?? "");

  if (propertyTypes.includes(candidate as PropertyType)) {
    return candidate as PropertyType;
  }

  return "single_family_house";
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
