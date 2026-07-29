import { defineConfig, devices } from "@playwright/test";
import { loadEnvConfig } from "@next/env";

import { hasAuthenticatedE2EEnv } from "./tests/e2e/support/env";

loadEnvConfig(process.cwd());

const authenticatedE2EEnabled = hasAuthenticatedE2EEnv();

export default defineConfig({
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: false,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  retries: process.env.CI ? 1 : 0,
  testDir: "./tests/e2e",
  timeout: 30_000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure"
  },
  projects: [
    {
      name: "public-chromium",
      testMatch: /security\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"]
      }
    },
    ...(authenticatedE2EEnabled
      ? [
          {
            name: "auth-setup",
            testMatch: /auth\.setup\.ts/
          },
          {
            dependencies: ["auth-setup"],
            name: "authenticated-chromium",
            testMatch: /authenticated-.*\.spec\.ts/,
            use: {
              ...devices["Desktop Chrome"],
              storageState: "playwright/.auth/user.json"
            }
          }
        ]
      : [])
  ]
});
