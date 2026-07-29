import type { AssetHealthStatus } from "@/lib/asset-health";

export type AssetStatus = AssetHealthStatus;

export type PropertyType =
  | "single_family_house"
  | "condo"
  | "coop"
  | "apartment"
  | "multi_family"
  | "rental"
  | "vacation_home"
  | "other";

export interface PropertySummary {
  name: string;
  propertyType: PropertyType;
  location: string;
  yearBuilt?: number;
}

export interface AssetSummary {
  name: string;
  category: string;
  status: AssetStatus;
  detail: string;
  nextAction: string;
  statusReason: string;
  duplicateCount?: number;
}
