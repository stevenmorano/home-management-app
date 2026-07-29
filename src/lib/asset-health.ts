export const PILOT_TIME_ZONE = "America/New_York";

const MILLISECONDS_PER_DAY = 86_400_000;
const DUE_SOON_DAYS = 30;

export type AssetHealthCondition =
  | "excellent"
  | "good"
  | "fair"
  | "poor"
  | "unknown";

export type AssetHealthStatus =
  | "good"
  | "due_soon"
  | "needs_attention"
  | "missing_info";

export interface AssetHealthInput {
  condition: AssetHealthCondition | null | undefined;
  nextServiceDueDate: string | null | undefined;
}

export interface InformationCompleteness {
  assessedCount: number;
  percentage: number;
  totalCount: number;
}

export interface AssetHealthExplanation {
  nextAction: string;
  status: AssetHealthStatus;
  statusReason: string;
}

type AssetStatusCounts = Record<AssetHealthStatus, number>;

interface HomeHealthBase {
  completeness: InformationCompleteness;
  statusCounts: AssetStatusCounts;
  summaryText: string;
}

export type HomeHealthResult =
  | (HomeHealthBase & {
      kind: "insufficient_data";
      reason: "no_assets" | "no_assessable_assets";
      score: null;
    })
  | (HomeHealthBase & {
      kind: "scored";
      score: number;
    });

const statusWeights: Record<Exclude<AssetHealthStatus, "missing_info">, number> = {
  good: 100,
  due_soon: 72,
  needs_attention: 32
};

function toCalendarDay(dateText: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    return null;
  }

  const date = new Date(`${dateText}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateText
  ) {
    return null;
  }

  return Math.floor(date.getTime() / MILLISECONDS_PER_DAY);
}

function daysUntil(dateText: string | null | undefined, today: string) {
  const todayDay = toCalendarDay(today);

  if (todayDay === null) {
    throw new RangeError(`Invalid current calendar date: ${today}`);
  }

  if (!dateText) {
    return null;
  }

  const targetDay = toCalendarDay(dateText);
  return targetDay === null ? null : targetDay - todayDay;
}

function isKnownCondition(
  condition: AssetHealthCondition | null | undefined
): condition is Exclude<AssetHealthCondition, "unknown"> {
  return Boolean(condition && condition !== "unknown");
}

function isAssessable(asset: AssetHealthInput) {
  return (
    isKnownCondition(asset.condition) ||
    Boolean(asset.nextServiceDueDate && toCalendarDay(asset.nextServiceDueDate) !== null)
  );
}

function emptyStatusCounts(): AssetStatusCounts {
  return {
    good: 0,
    due_soon: 0,
    needs_attention: 0,
    missing_info: 0
  };
}

export function getPilotCalendarDate(now: Date) {
  if (Number.isNaN(now.getTime())) {
    throw new RangeError("Cannot create a pilot calendar date from an invalid Date.");
  }

  const dateParts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: PILOT_TIME_ZONE,
    year: "numeric"
  }).formatToParts(now);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    dateParts.find((part) => part.type === type)?.value;
  const year = getPart("year");
  const month = getPart("month");
  const day = getPart("day");

  if (!year || !month || !day) {
    throw new RangeError("Could not resolve the pilot calendar date.");
  }

  return `${year}-${month}-${day}`;
}

export function calculateAssetStatus(
  asset: AssetHealthInput,
  today: string
): AssetHealthStatus {
  const dueInDays = daysUntil(asset.nextServiceDueDate, today);

  if (asset.condition === "poor" || (dueInDays !== null && dueInDays < 0)) {
    return "needs_attention";
  }

  if (
    asset.condition === "fair" ||
    (dueInDays !== null && dueInDays <= DUE_SOON_DAYS)
  ) {
    return "due_soon";
  }

  if (
    asset.condition === "excellent" ||
    asset.condition === "good" ||
    (dueInDays !== null && dueInDays > DUE_SOON_DAYS)
  ) {
    return "good";
  }

  return "missing_info";
}

export function calculateInformationCompleteness(
  assets: AssetHealthInput[]
): InformationCompleteness {
  const totalCount = assets.length;
  const assessedCount = assets.filter(isAssessable).length;

  return {
    assessedCount,
    percentage:
      totalCount === 0 ? 0 : Math.round((assessedCount / totalCount) * 100),
    totalCount
  };
}

export function calculateHomeHealth(
  assets: AssetHealthInput[],
  today: string
): HomeHealthResult {
  const statuses = assets.map((asset) => calculateAssetStatus(asset, today));
  const statusCounts = statuses.reduce((counts, status) => {
    counts[status] += 1;
    return counts;
  }, emptyStatusCounts());
  const completeness = calculateInformationCompleteness(assets);

  if (completeness.totalCount === 0) {
    return {
      completeness,
      kind: "insufficient_data",
      reason: "no_assets",
      score: null,
      statusCounts,
      summaryText: "Add systems to calculate your home health."
    };
  }

  if (completeness.assessedCount === 0) {
    return {
      completeness,
      kind: "insufficient_data",
      reason: "no_assessable_assets",
      score: null,
      statusCounts,
      summaryText: "Add a condition or next service date to assess your home."
    };
  }

  const weightedScore =
    statusCounts.good * statusWeights.good +
    statusCounts.due_soon * statusWeights.due_soon +
    statusCounts.needs_attention * statusWeights.needs_attention;
  const score = Math.round(weightedScore / completeness.assessedCount);
  const summaryText =
    statusCounts.needs_attention > 0
      ? "Some systems need attention now."
      : statusCounts.due_soon > 0
        ? "Some maintenance is coming up soon."
        : "Assessed systems are in good shape.";

  return {
    completeness,
    kind: "scored",
    score,
    statusCounts,
    summaryText
  };
}

export function getAssetHealthExplanation(
  asset: AssetHealthInput,
  today: string
): AssetHealthExplanation {
  const status = calculateAssetStatus(asset, today);
  const dueInDays = daysUntil(asset.nextServiceDueDate, today);

  if (status === "missing_info") {
    return {
      nextAction: "Add a condition or next service date",
      status,
      statusReason:
        "Record details are useful, but current health cannot be assessed yet."
    };
  }

  if (asset.condition === "poor") {
    return {
      nextAction: "Review condition and plan next action",
      status,
      statusReason: "Condition is marked poor."
    };
  }

  if (dueInDays !== null && dueInDays < 0) {
    const overdueDays = Math.abs(dueInDays);

    return {
      nextAction: `Service was due ${asset.nextServiceDueDate}`,
      status,
      statusReason: `Service is overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}.`
    };
  }

  if (dueInDays !== null && dueInDays <= DUE_SOON_DAYS) {
    return {
      nextAction: `Service due ${asset.nextServiceDueDate}`,
      status,
      statusReason:
        dueInDays === 0
          ? "Service is due today."
          : `Service is due in ${dueInDays} day${dueInDays === 1 ? "" : "s"}.`
    };
  }

  if (asset.condition === "fair") {
    return {
      nextAction: "Review condition and schedule maintenance",
      status,
      statusReason: "Condition is fair, so it should stay on the radar."
    };
  }

  if (dueInDays !== null) {
    return {
      nextAction: `Next service due ${asset.nextServiceDueDate}`,
      status,
      statusReason: "No urgent service is due."
    };
  }

  return {
    nextAction: "No urgent action",
    status,
    statusReason: "Condition is recorded and does not need attention."
  };
}
