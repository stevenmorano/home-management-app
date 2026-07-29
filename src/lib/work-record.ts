import type { PerformedByType, WorkType } from "@/types/database";

export const workTypes = [
  "maintenance",
  "repair",
  "inspection",
  "upgrade",
  "replacement",
  "other"
] as const satisfies readonly WorkType[];

export const performedByTypes = [
  "diy",
  "household_member",
  "contractor",
  "other"
] as const satisfies readonly PerformedByType[];

const MAX_COST_AMOUNT = 9_999_999_999.99;

export type WorkRecordFields = {
  completedDate: string;
  costAmount: number | null;
  description: string | null;
  notes: string | null;
  performedByType: PerformedByType;
  providerName: string | null;
  title: string;
  workType: WorkType;
};

export type WorkRecordFieldInput = {
  completedDate: unknown;
  costAmount: unknown;
  description: unknown;
  notes: unknown;
  performedByType: unknown;
  providerName: unknown;
  title: unknown;
  workType: unknown;
};

export type WorkRecordValidation =
  | { ok: true; value: WorkRecordFields }
  | { message: string; ok: false };

function trimmedText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalLimitedText(value: unknown, label: string, maximumLength: number) {
  const text = trimmedText(value);

  if (!text) {
    return { ok: true as const, value: null };
  }

  if (text.length > maximumLength) {
    return {
      message: `${label} must be ${maximumLength} characters or fewer`,
      ok: false as const
    };
  }

  return { ok: true as const, value: text };
}

function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function parseCostAmount(value: unknown) {
  const text = trimmedText(value);

  if (!text) {
    return { ok: true as const, value: null };
  }

  const normalized = text.replaceAll(",", "");

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return {
      message: "Cost must be a non-negative amount with no more than two decimal places",
      ok: false as const
    };
  }

  const costAmount = Number(normalized);

  if (!Number.isFinite(costAmount) || costAmount > MAX_COST_AMOUNT) {
    return {
      message: "Cost is larger than the supported amount",
      ok: false as const
    };
  }

  return { ok: true as const, value: costAmount };
}

export function parseWorkRecordFields(
  input: WorkRecordFieldInput,
  today: string
): WorkRecordValidation {
  const title = trimmedText(input.title);

  if (!title) {
    return { message: "Work title is required", ok: false };
  }

  if (title.length > 120) {
    return { message: "Work title must be 120 characters or fewer", ok: false };
  }

  const completedDate = trimmedText(input.completedDate);

  if (!isCalendarDate(completedDate)) {
    return { message: "Enter a valid completed date", ok: false };
  }

  if (!isCalendarDate(today)) {
    throw new Error("A valid calendar date is required for work-record validation");
  }

  if (completedDate > today) {
    return { message: "Completed date cannot be in the future", ok: false };
  }

  const workType = trimmedText(input.workType);

  if (!workTypes.includes(workType as WorkType)) {
    return { message: "Choose a valid work type", ok: false };
  }

  const performedByType = trimmedText(input.performedByType);

  if (!performedByTypes.includes(performedByType as PerformedByType)) {
    return { message: "Choose who performed the work", ok: false };
  }

  const providerName = optionalLimitedText(input.providerName, "Provider name", 160);

  if (!providerName.ok) {
    return providerName;
  }

  const description = optionalLimitedText(input.description, "Description", 4000);

  if (!description.ok) {
    return description;
  }

  const notes = optionalLimitedText(input.notes, "Notes", 4000);

  if (!notes.ok) {
    return notes;
  }

  const costAmount = parseCostAmount(input.costAmount);

  if (!costAmount.ok) {
    return costAmount;
  }

  return {
    ok: true,
    value: {
      completedDate,
      costAmount: costAmount.value,
      description: description.value,
      notes: notes.value,
      performedByType: performedByType as PerformedByType,
      providerName: providerName.value,
      title,
      workType: workType as WorkType
    }
  };
}
