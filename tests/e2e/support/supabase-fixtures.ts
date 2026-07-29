import { randomUUID } from "node:crypto";

import {
  createClient,
  type SupabaseClient,
  type User
} from "@supabase/supabase-js";

import type {
  AssetSystemInsert,
  Database
} from "../../../src/types/database";
import { getAuthenticatedE2EEnv } from "./env";

const FIXTURE_PREFIX = "HomeKeep E2E —";

type FixtureClient = SupabaseClient<Database>;

export interface FixtureContext {
  client: FixtureClient;
  user: User;
}

export interface FixtureAsset {
  category: NonNullable<AssetSystemInsert["category"]>;
  condition: NonNullable<AssetSystemInsert["condition"]>;
  name: string;
  status: NonNullable<AssetSystemInsert["status"]>;
}

export interface PropertyFixture {
  assets: Array<{ id: string; name: string }>;
  name: string;
  propertyId: string;
}

function fixtureError(action: string, message?: string) {
  return new Error(`${action} failed${message ? `: ${message}` : "."}`);
}

export async function createFixtureContext(): Promise<FixtureContext> {
  const env = getAuthenticatedE2EEnv();
  const client = createClient<Database>(
    env.supabaseUrl,
    env.supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false
      }
    }
  );
  const { data, error } = await client.auth.signInWithPassword({
    email: env.email,
    password: env.password
  });

  if (error || !data.user) {
    throw fixtureError(
      "Automation-account sign-in",
      error?.message ?? "No authenticated user was returned"
    );
  }

  return {
    client,
    user: data.user
  };
}

export async function cleanupStaleFixtures({
  client,
  user
}: FixtureContext) {
  const { data: staleProperties, error: readError } = await client
    .from("properties")
    .select("id")
    .eq("user_id", user.id)
    .like("name", `${FIXTURE_PREFIX}%`);

  if (readError) {
    throw fixtureError("Stale fixture lookup", readError.message);
  }

  const propertyIds = (staleProperties ?? []).map((property) => property.id);

  if (propertyIds.length === 0) {
    return;
  }

  const { error: deleteError } = await client
    .from("properties")
    .delete()
    .eq("user_id", user.id)
    .in("id", propertyIds);

  if (deleteError) {
    throw fixtureError("Stale fixture cleanup", deleteError.message);
  }
}

export async function createPropertyFixture(
  context: FixtureContext,
  label: string,
  assets: FixtureAsset[]
): Promise<PropertyFixture> {
  const name = `${FIXTURE_PREFIX} ${label} ${randomUUID()}`;
  const { data: property, error: propertyError } = await context.client
    .from("properties")
    .insert({
      city: "Testville",
      name,
      property_type: "single_family_house",
      state: "NY",
      user_id: context.user.id
    })
    .select("id")
    .single();

  if (propertyError || !property) {
    throw fixtureError(
      "Fixture property creation",
      propertyError?.message ?? "No property was returned"
    );
  }

  if (assets.length > 0) {
    const { data: assetRows, error: assetError } = await context.client
      .from("asset_systems")
      .insert(
        assets.map((asset) => ({
          ...asset,
          property_id: property.id
        }))
      )
      .select("id, name");

    if (assetError) {
      await deletePropertyFixture(context, property.id);
      throw fixtureError("Fixture asset creation", assetError.message);
    }

    return {
      assets: assetRows ?? [],
      name,
      propertyId: property.id
    };
  }

  return {
    assets: [],
    name,
    propertyId: property.id
  };
}

export async function deletePropertyFixture(
  context: FixtureContext,
  propertyId: string
) {
  const { error } = await context.client
    .from("properties")
    .delete()
    .eq("id", propertyId)
    .eq("user_id", context.user.id);

  if (error) {
    throw fixtureError("Fixture property cleanup", error.message);
  }
}
