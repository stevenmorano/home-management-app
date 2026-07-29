import { describe, expect, it } from "vitest";

import { getSafeRedirectUrl } from "./auth-redirect";

const requestUrl = new URL("https://homekeep.example/auth/callback");

describe("getSafeRedirectUrl", () => {
  it("uses the dashboard fallback when the value is absent", () => {
    expect(getSafeRedirectUrl(requestUrl, null).href).toBe(
      "https://homekeep.example/dashboard"
    );
  });

  it("preserves safe application paths, queries, and fragments", () => {
    expect(
      getSafeRedirectUrl(requestUrl, "/dashboard?tab=systems#details").href
    ).toBe("https://homekeep.example/dashboard?tab=systems#details");
  });

  it.each([
    "https://attacker.example/steal-session",
    "//attacker.example/steal-session",
    "/\\attacker.example/steal-session",
    "dashboard",
    "mailto:attacker@example.com"
  ])("rejects an unsafe redirect value: %s", (value) => {
    expect(getSafeRedirectUrl(requestUrl, value).href).toBe(
      "https://homekeep.example/dashboard"
    );
  });

  it("uses the default when both the value and custom fallback are unsafe", () => {
    expect(
      getSafeRedirectUrl(
        requestUrl,
        "https://attacker.example/primary",
        "//attacker.example/fallback"
      ).href
    ).toBe("https://homekeep.example/dashboard");
  });
});
