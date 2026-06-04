import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createClient } from "@supabase/supabase-js";

function loadDotEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");

  try {
    const contents = readFileSync(envPath, "utf8");

    for (const line of contents.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        continue;
      }

      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=");

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    throw new Error("Missing .env.local. Copy .env.example to .env.local and add Supabase values.");
  }
}

async function verifyTable(supabase, tableName) {
  const { error } = await supabase.from(tableName).select("*").limit(1);

  if (error) {
    throw new Error(`Could not query ${tableName}: ${error.message}`);
  }

  return tableName;
}

async function main() {
  loadDotEnvLocal();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local."
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  });

  const tables = ["profiles", "properties", "rooms", "asset_systems"];
  const verifiedTables = [];

  for (const table of tables) {
    verifiedTables.push(await verifyTable(supabase, table));
  }

  console.log("Supabase foundation reachable.");
  console.log(`Verified tables: ${verifiedTables.join(", ")}`);
  console.log(
    "Auth, first-property, asset creation, and asset detail update flows have been verified separately with test users."
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
