import { describe, expect, it } from "vitest";

import {
  calculateAssetStatus,
  calculateHomeHealth,
  calculateInformationCompleteness,
  getAssetHealthExplanation,
  getPilotCalendarDate,
  type AssetHealthInput
} from "./asset-health";

const today = "2026-07-26";

function asset(
  overrides: Partial<AssetHealthInput> = {}
): AssetHealthInput {
  return {
    condition: "unknown",
    nextServiceDueDate: null,
    ...overrides
  };
}

describe("calculateAssetStatus", () => {
  it.each([
    ["excellent", "good"],
    ["good", "good"],
    ["fair", "due_soon"],
    ["poor", "needs_attention"],
    ["unknown", "missing_info"]
  ] as const)("maps %s condition to %s", (condition, expectedStatus) => {
    expect(calculateAssetStatus(asset({ condition }), today)).toBe(
      expectedStatus
    );
  });

  it.each([
    ["2026-07-25", "needs_attention"],
    ["2026-07-26", "due_soon"],
    ["2026-08-25", "due_soon"],
    ["2026-08-26", "good"]
  ] as const)("classifies a %s due date as %s", (dueDate, expectedStatus) => {
    expect(
      calculateAssetStatus(asset({ nextServiceDueDate: dueDate }), today)
    ).toBe(expectedStatus);
  });

  it("lets an overdue date override a good condition", () => {
    expect(
      calculateAssetStatus(
        asset({
          condition: "good",
          nextServiceDueDate: "2026-07-25"
        }),
        today
      )
    ).toBe("needs_attention");
  });

  it("lets poor condition override a distant due date", () => {
    expect(
      calculateAssetStatus(
        asset({
          condition: "poor",
          nextServiceDueDate: "2027-07-26"
        }),
        today
      )
    ).toBe("needs_attention");
  });

  it("ignores an invalid due date safely", () => {
    expect(
      calculateAssetStatus(
        asset({ nextServiceDueDate: "2026-02-31" }),
        today
      )
    ).toBe("missing_info");
  });
});

describe("calculateInformationCompleteness", () => {
  it("counts only known conditions or valid next-service dates as assessed", () => {
    expect(
      calculateInformationCompleteness([
        asset(),
        asset({ condition: "good" }),
        asset({ nextServiceDueDate: "2026-09-01" }),
        asset({ nextServiceDueDate: "not-a-date" })
      ])
    ).toEqual({
      assessedCount: 2,
      percentage: 50,
      totalCount: 4
    });
  });

  it("returns zero coverage for an empty home", () => {
    expect(calculateInformationCompleteness([])).toEqual({
      assessedCount: 0,
      percentage: 0,
      totalCount: 0
    });
  });
});

describe("calculateHomeHealth", () => {
  it("returns no score when the home has no assets", () => {
    expect(calculateHomeHealth([], today)).toMatchObject({
      completeness: {
        assessedCount: 0,
        percentage: 0,
        totalCount: 0
      },
      kind: "insufficient_data",
      reason: "no_assets",
      score: null
    });
  });

  it("returns no score when every asset is missing health evidence", () => {
    expect(calculateHomeHealth([asset(), asset()], today)).toMatchObject({
      completeness: {
        assessedCount: 0,
        percentage: 0,
        totalCount: 2
      },
      kind: "insufficient_data",
      reason: "no_assessable_assets",
      score: null,
      statusCounts: {
        good: 0,
        due_soon: 0,
        needs_attention: 0,
        missing_info: 2
      }
    });
  });

  it("scores only assessed assets and reports coverage separately", () => {
    expect(
      calculateHomeHealth(
        [
          asset({ condition: "good" }),
          asset({ condition: "fair" }),
          asset({ condition: "poor" }),
          asset()
        ],
        today
      )
    ).toEqual({
      completeness: {
        assessedCount: 3,
        percentage: 75,
        totalCount: 4
      },
      kind: "scored",
      score: 68,
      statusCounts: {
        good: 1,
        due_soon: 1,
        needs_attention: 1,
        missing_info: 1
      },
      summaryText: "Some systems need attention now."
    });
  });

  it("prioritizes due-soon messaging when nothing needs attention", () => {
    expect(
      calculateHomeHealth(
        [asset({ condition: "good" }), asset({ condition: "fair" })],
        today
      ).summaryText
    ).toBe("Some maintenance is coming up soon.");
  });

  it("uses positive messaging only when all assessed systems are good", () => {
    expect(
      calculateHomeHealth([asset({ condition: "excellent" })], today)
        .summaryText
    ).toBe("Assessed systems are in good shape.");
  });
});

describe("getAssetHealthExplanation", () => {
  it("distinguishes missing health evidence from missing record details", () => {
    expect(getAssetHealthExplanation(asset(), today)).toEqual({
      nextAction: "Add a condition or next service date",
      status: "missing_info",
      statusReason:
        "Record details are useful, but current health cannot be assessed yet."
    });
  });

  it("uses a specific message when service is due today", () => {
    expect(
      getAssetHealthExplanation(
        asset({ nextServiceDueDate: today }),
        today
      )
    ).toEqual({
      nextAction: `Service due ${today}`,
      status: "due_soon",
      statusReason: "Service is due today."
    });
  });
});

describe("getPilotCalendarDate", () => {
  it.each([
    ["2026-03-08T04:59:59.000Z", "2026-03-07"],
    ["2026-03-08T05:00:00.000Z", "2026-03-08"],
    ["2026-11-01T03:59:59.000Z", "2026-10-31"],
    ["2026-11-01T04:00:00.000Z", "2026-11-01"]
  ])("maps %s to the New York date %s", (instant, expectedDate) => {
    expect(getPilotCalendarDate(new Date(instant))).toBe(expectedDate);
  });
});
