import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const requiredVariables = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "E2E_USER_EMAIL",
  "E2E_USER_PASSWORD"
];

const missingVariables = requiredVariables.filter(
  (name) => !String(process.env[name] ?? "").trim()
);

if (missingVariables.length > 0) {
  console.error(
    [
      "Authenticated E2E configuration is incomplete.",
      "Add these GitHub repository secrets and map them into the browser job:",
      ...missingVariables.map((name) => `- ${name}`)
    ].join("\n")
  );
  process.exitCode = 1;
} else {
  console.log("Authenticated E2E environment is configured.");
}
