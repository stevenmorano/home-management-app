const authenticatedE2EVariables = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "E2E_USER_EMAIL",
  "E2E_USER_PASSWORD"
] as const;

type AuthenticatedE2EVariable = (typeof authenticatedE2EVariables)[number];

export interface AuthenticatedE2EEnv {
  email: string;
  password: string;
  supabaseAnonKey: string;
  supabaseUrl: string;
}

function readVariable(name: AuthenticatedE2EVariable) {
  return String(process.env[name] ?? "").trim();
}

export function hasAuthenticatedE2EEnv() {
  return authenticatedE2EVariables.every((name) => Boolean(readVariable(name)));
}

export function getAuthenticatedE2EEnv(): AuthenticatedE2EEnv {
  const missingVariables = authenticatedE2EVariables.filter(
    (name) => !readVariable(name)
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Authenticated E2E configuration is incomplete. Missing: ${missingVariables.join(", ")}`
    );
  }

  return {
    email: readVariable("E2E_USER_EMAIL"),
    password: readVariable("E2E_USER_PASSWORD"),
    supabaseAnonKey: readVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    supabaseUrl: readVariable("NEXT_PUBLIC_SUPABASE_URL")
  };
}
