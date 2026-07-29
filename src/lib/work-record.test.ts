import { describe, expect, it } from "vitest";

import { parseWorkRecordFields } from "./work-record";

const today = "2026-07-28";

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    completedDate: "2026-07-27",
    costAmount: "149.95",
    description: "Seasonal service and filter replacement.",
    notes: "Keep the receipt.",
    performedByType: "contractor",
    providerName: "North Shore Heating",
    title: "Annual AC service",
    workType: "maintenance",
    ...overrides
  };
}

describe("parseWorkRecordFields", () => {
  it("parses a complete work record", () => {
    expect(parseWorkRecordFields(validInput(), today)).toEqual({
      ok: true,
      value: {
        completedDate: "2026-07-27",
        costAmount: 149.95,
        description: "Seasonal service and filter replacement.",
        notes: "Keep the receipt.",
        performedByType: "contractor",
        providerName: "North Shore Heating",
        title: "Annual AC service",
        workType: "maintenance"
      }
    });
  });

  it("trims text and accepts optional blank fields", () => {
    expect(
      parseWorkRecordFields(
        validInput({
          costAmount: "",
          description: " ",
          notes: "",
          providerName: "",
          title: "  Changed filter  "
        }),
        today
      )
    ).toMatchObject({
      ok: true,
      value: {
        costAmount: null,
        description: null,
        notes: null,
        providerName: null,
        title: "Changed filter"
      }
    });
  });

  it("accepts every supported work type", () => {
    for (const workType of [
      "maintenance",
      "repair",
      "inspection",
      "upgrade",
      "replacement",
      "other"
    ]) {
      expect(parseWorkRecordFields(validInput({ workType }), today).ok).toBe(true);
    }
  });

  it("accepts every supported performer type", () => {
    for (const performedByType of [
      "diy",
      "household_member",
      "contractor",
      "other"
    ]) {
      expect(parseWorkRecordFields(validInput({ performedByType }), today).ok).toBe(true);
    }
  });

  it("requires a title", () => {
    expect(parseWorkRecordFields(validInput({ title: " " }), today)).toEqual({
      message: "Work title is required",
      ok: false
    });
  });

  it("limits the title length", () => {
    expect(parseWorkRecordFields(validInput({ title: "x".repeat(121) }), today)).toEqual({
      message: "Work title must be 120 characters or fewer",
      ok: false
    });
  });

  it("rejects invalid calendar dates", () => {
    expect(
      parseWorkRecordFields(validInput({ completedDate: "2026-02-30" }), today)
    ).toEqual({
      message: "Enter a valid completed date",
      ok: false
    });
  });

  it("rejects future completed dates", () => {
    expect(
      parseWorkRecordFields(validInput({ completedDate: "2026-07-29" }), today)
    ).toEqual({
      message: "Completed date cannot be in the future",
      ok: false
    });
  });

  it("rejects unsupported work types", () => {
    expect(parseWorkRecordFields(validInput({ workType: "chore" }), today)).toEqual({
      message: "Choose a valid work type",
      ok: false
    });
  });

  it("rejects unsupported performer types", () => {
    expect(
      parseWorkRecordFields(validInput({ performedByType: "public_contractor" }), today)
    ).toEqual({
      message: "Choose who performed the work",
      ok: false
    });
  });

  it("accepts comma-formatted costs", () => {
    expect(
      parseWorkRecordFields(validInput({ costAmount: "1,234.50" }), today)
    ).toMatchObject({
      ok: true,
      value: { costAmount: 1234.5 }
    });
  });

  it("rejects negative costs", () => {
    expect(parseWorkRecordFields(validInput({ costAmount: "-1" }), today)).toEqual({
      message: "Cost must be a non-negative amount with no more than two decimal places",
      ok: false
    });
  });

  it("rejects costs with excess precision", () => {
    expect(parseWorkRecordFields(validInput({ costAmount: "12.345" }), today)).toEqual({
      message: "Cost must be a non-negative amount with no more than two decimal places",
      ok: false
    });
  });

  it("limits optional provider and narrative fields", () => {
    expect(
      parseWorkRecordFields(validInput({ providerName: "x".repeat(161) }), today)
    ).toEqual({
      message: "Provider name must be 160 characters or fewer",
      ok: false
    });

    expect(
      parseWorkRecordFields(validInput({ description: "x".repeat(4001) }), today)
    ).toEqual({
      message: "Description must be 4000 characters or fewer",
      ok: false
    });

    expect(parseWorkRecordFields(validInput({ notes: "x".repeat(4001) }), today)).toEqual({
      message: "Notes must be 4000 characters or fewer",
      ok: false
    });
  });
});
