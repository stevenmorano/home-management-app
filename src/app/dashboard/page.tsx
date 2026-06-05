import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Camera,
  ChevronRight,
  CheckCircle2,
  Droplet,
  FileText,
  Flame,
  Gauge,
  Grid2X2,
  HomeIcon,
  Info,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Snowflake,
  Trash2,
  Wrench,
  Zap
} from "lucide-react";
import Link from "next/link";

import {
  createCustomAsset,
  createFirstProperty,
  createSelectedAssets,
  deleteAsset,
  updateAssetDetails
} from "@/app/dashboard/actions";
import { signOut } from "@/app/auth/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AssetSystemCategory, AssetSystemRow, PropertyRow, PropertyType } from "@/types/database";
import type { AssetStatus, AssetSummary, PropertySummary } from "@/types/home";

export const dynamic = "force-dynamic";

const statusMeta: Record<
  AssetStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    badge: "success" | "warning" | "danger" | "outline";
    ring: string;
    ledger: string;
    explanation: string;
  }
> = {
  good: {
    label: "Good",
    icon: CheckCircle2,
    badge: "success",
    ring: "ring-emerald-100",
    ledger: "border-[var(--status-good)] bg-[var(--status-good-soft)] text-[var(--status-good)]",
    explanation: "Recorded and not due."
  },
  due_soon: {
    label: "Due Soon",
    icon: CalendarDays,
    badge: "warning",
    ring: "ring-amber-100",
    ledger: "border-[var(--status-warning)] bg-[var(--status-warning-soft)] text-[var(--status-warning)]",
    explanation: "Coming up or fair condition."
  },
  needs_attention: {
    label: "Needs Attention",
    icon: AlertTriangle,
    badge: "danger",
    ring: "ring-rose-100",
    ledger: "border-[var(--status-danger)] bg-[var(--status-danger-soft)] text-[var(--status-danger)]",
    explanation: "Overdue or poor condition."
  },
  missing_info: {
    label: "Missing Info",
    icon: Info,
    badge: "outline",
    ring: "ring-slate-100",
    ledger: "border-[var(--status-missing)] bg-[var(--status-missing-soft)] text-[var(--status-missing)]",
    explanation: "Needs useful details."
  }
};

interface DashboardPageProps {
  searchParams?: Promise<{
    inventory?: string;
    message?: string;
  }>;
}

const propertyTypeOptions: Array<{ value: PropertyType; label: string }> = [
  { value: "single_family_house", label: "Single-family house" },
  { value: "condo", label: "Condo" },
  { value: "coop", label: "Co-op" },
  { value: "apartment", label: "Apartment" },
  { value: "multi_family", label: "Multi-family" },
  { value: "rental", label: "Rental" },
  { value: "vacation_home", label: "Vacation home" },
  { value: "other", label: "Other" }
];

const commonAssetOptions: Record<
  PropertyType,
  Array<{ category: AssetSystemCategory; name: string; description: string }>
> = {
  single_family_house: [
    { category: "roof", name: "Roof", description: "Age, material, inspections, and replacement planning." },
    { category: "gutters", name: "Gutters", description: "Cleaning cadence, repairs, and drainage concerns." },
    { category: "hvac", name: "HVAC", description: "Cooling system, filters, service dates, and seasonal checks." },
    { category: "furnace", name: "Furnace", description: "Heating equipment, age, service, and safety checks." },
    { category: "water_heater", name: "Water heater", description: "Age, condition, warranty, and replacement window." },
    { category: "electrical", name: "Electrical panel", description: "Panel details, upgrades, and inspection records." },
    { category: "plumbing", name: "Plumbing", description: "Known issues, shutoffs, sewer/septic context, and repairs." },
    { category: "windows", name: "Windows", description: "Age, leaks, drafts, and replacement planning." },
    { category: "driveway", name: "Driveway", description: "Surface condition, sealing, drainage, and repairs." },
    { category: "deck", name: "Deck", description: "Material, age, staining, inspections, and repairs." },
    { category: "sump_pump", name: "Sump pump", description: "Testing cadence, backup power, and replacement age." },
    { category: "appliance", name: "Refrigerator", description: "Kitchen appliance, age, warranty, and service notes." },
    { category: "appliance", name: "Dishwasher", description: "Kitchen appliance, age, leaks, warranty, and repairs." },
    { category: "appliance", name: "Range or oven", description: "Cooking appliance, age, service, and warranty details." },
    { category: "appliance", name: "Washer", description: "Laundry appliance, age, hoses, warranty, and repairs." },
    { category: "appliance", name: "Dryer", description: "Laundry appliance, vent cleaning, age, and repairs." }
  ],
  condo: [
    { category: "hvac", name: "HVAC", description: "Owned units, filters, and service records." },
    { category: "water_heater", name: "Water heater", description: "Owned equipment, age, and replacement planning." },
    { category: "appliance", name: "Refrigerator", description: "Kitchen appliance, age, warranty, and service notes." },
    { category: "appliance", name: "Dishwasher", description: "Kitchen appliance, age, leaks, warranty, and repairs." },
    { category: "appliance", name: "Range or oven", description: "Cooking appliance, age, service, and warranty details." },
    { category: "appliance", name: "Washer", description: "Laundry appliance, age, hoses, warranty, and repairs." },
    { category: "appliance", name: "Dryer", description: "Laundry appliance, vent cleaning, age, and repairs." },
    { category: "electrical", name: "Electrical panel", description: "Panel location, capacity, and inspection notes." },
    { category: "plumbing", name: "Plumbing fixtures", description: "Fixtures, shutoffs, leaks, and responsibility notes." },
    { category: "windows", name: "Windows", description: "Age, drafts, HOA responsibility, and repairs." },
    { category: "security", name: "Smoke and safety systems", description: "Detectors, alarms, and testing cadence." }
  ],
  coop: [
    { category: "hvac", name: "HVAC", description: "Owned or building-provided heating/cooling context." },
    { category: "appliance", name: "Refrigerator", description: "Kitchen appliance, age, warranty, and service notes." },
    { category: "appliance", name: "Dishwasher", description: "Kitchen appliance, age, leaks, warranty, and repairs." },
    { category: "appliance", name: "Range or oven", description: "Cooking appliance, age, service, and warranty details." },
    { category: "appliance", name: "Washer", description: "Laundry appliance, age, hoses, warranty, and repairs." },
    { category: "appliance", name: "Dryer", description: "Laundry appliance, vent cleaning, age, and repairs." },
    { category: "electrical", name: "Electrical panel", description: "Panel location and upgrade/inspection notes." },
    { category: "plumbing", name: "Plumbing fixtures", description: "Fixtures, shutoffs, leaks, and building responsibility." },
    { category: "windows", name: "Windows", description: "Age, drafts, and co-op responsibility." },
    { category: "security", name: "Smoke and safety systems", description: "Detectors, alarms, and testing cadence." }
  ],
  apartment: [
    { category: "appliance", name: "Refrigerator", description: "Owned appliance, warranty, and service notes." },
    { category: "appliance", name: "Dishwasher", description: "Owned appliance, age, leaks, warranty, and repairs." },
    { category: "appliance", name: "Range or oven", description: "Owned cooking appliance and warranty details." },
    { category: "hvac", name: "HVAC", description: "Unit filters, service access, and responsibility." },
    { category: "plumbing", name: "Plumbing fixtures", description: "Fixtures, shutoffs, and maintenance responsibility." },
    { category: "electrical", name: "Electrical panel", description: "Panel location and safety notes." },
    { category: "security", name: "Smoke and safety systems", description: "Detectors, alarms, and testing cadence." }
  ],
  multi_family: [
    { category: "roof", name: "Roof", description: "Age, material, inspections, and replacement planning." },
    { category: "hvac", name: "HVAC systems", description: "Shared or unit-specific systems and service cadence." },
    { category: "water_heater", name: "Water heaters", description: "Shared or unit-specific equipment and age." },
    { category: "electrical", name: "Electrical panels", description: "Main and unit panels, upgrades, and inspections." },
    { category: "plumbing", name: "Plumbing", description: "Main lines, shutoffs, fixtures, and known issues." },
    { category: "gutters", name: "Gutters", description: "Cleaning cadence and drainage concerns." },
    { category: "appliance", name: "Refrigerator", description: "Unit appliance, age, warranty, and responsibility." },
    { category: "appliance", name: "Dishwasher", description: "Unit appliance, age, leaks, and responsibility." },
    { category: "appliance", name: "Range or oven", description: "Unit cooking appliance and responsibility." },
    { category: "appliance", name: "Washer", description: "Unit laundry appliance, age, and responsibility." },
    { category: "appliance", name: "Dryer", description: "Unit laundry appliance, vent cleaning, and responsibility." }
  ],
  rental: [
    { category: "hvac", name: "HVAC", description: "Service cadence and tenant/owner responsibility." },
    { category: "water_heater", name: "Water heater", description: "Age, condition, and replacement planning." },
    { category: "appliance", name: "Refrigerator", description: "Included appliance, warranty, and repair records." },
    { category: "appliance", name: "Dishwasher", description: "Included appliance, leaks, warranty, and repairs." },
    { category: "appliance", name: "Range or oven", description: "Included cooking appliance and repair records." },
    { category: "plumbing", name: "Plumbing", description: "Known issues, shutoffs, and repair history." },
    { category: "electrical", name: "Electrical panel", description: "Panel details and safety notes." },
    { category: "security", name: "Smoke and safety systems", description: "Detectors, alarms, and compliance checks." }
  ],
  vacation_home: [
    { category: "roof", name: "Roof", description: "Age, inspections, weather exposure, and replacement planning." },
    { category: "hvac", name: "HVAC", description: "Seasonal service and remote-property reliability." },
    { category: "water_heater", name: "Water heater", description: "Age, winterization, and replacement planning." },
    { category: "plumbing", name: "Plumbing", description: "Winterization, shutoffs, and leak prevention." },
    { category: "security", name: "Security system", description: "Monitoring, cameras, alarms, and access." },
    { category: "appliance", name: "Refrigerator", description: "Appliance age, warranty, and repair history." },
    { category: "appliance", name: "Dishwasher", description: "Appliance age, leaks, warranty, and repairs." },
    { category: "appliance", name: "Range or oven", description: "Cooking appliance age, warranty, and repairs." },
    { category: "pool", name: "Pool", description: "Opening, closing, equipment, and service records." },
    { category: "septic_or_sewer", name: "Septic or sewer", description: "Pumping, inspections, and responsibility." }
  ],
  other: [
    { category: "hvac", name: "HVAC", description: "Heating/cooling system, filters, and service records." },
    { category: "water_heater", name: "Water heater", description: "Age, condition, warranty, and replacement window." },
    { category: "electrical", name: "Electrical", description: "Panel details, upgrades, and inspection records." },
    { category: "plumbing", name: "Plumbing", description: "Known issues, shutoffs, and repairs." },
    { category: "appliance", name: "Refrigerator", description: "Equipment age, manual, and warranty." },
    { category: "appliance", name: "Dishwasher", description: "Equipment age, leaks, manual, and warranty." },
    { category: "appliance", name: "Range or oven", description: "Cooking equipment age, manual, and warranty." },
    { category: "other", name: "Other important system", description: "Anything costly or maintenance-relevant." }
  ]
};

const assetCategoryOptions: Array<{ value: AssetSystemCategory; label: string }> = [
  { value: "roof", label: "Roof" },
  { value: "hvac", label: "HVAC" },
  { value: "furnace", label: "Furnace" },
  { value: "boiler", label: "Boiler" },
  { value: "water_heater", label: "Water heater" },
  { value: "appliance", label: "Appliance" },
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "gutters", label: "Gutters" },
  { value: "windows", label: "Windows" },
  { value: "chimney", label: "Chimney" },
  { value: "foundation", label: "Foundation" },
  { value: "deck", label: "Deck" },
  { value: "driveway", label: "Driveway" },
  { value: "pool", label: "Pool" },
  { value: "sump_pump", label: "Sump pump" },
  { value: "septic_or_sewer", label: "Septic or sewer" },
  { value: "irrigation", label: "Irrigation" },
  { value: "garage", label: "Garage" },
  { value: "security", label: "Security" },
  { value: "other", label: "Other" }
];

const repeatableAssetTemplates: Array<{
  category: AssetSystemCategory;
  description: string;
  name: string;
  placeholder: string;
}> = [
  {
    category: "appliance",
    description: "For kitchens, garages, basements, or extra units.",
    name: "Refrigerator",
    placeholder: "Garage refrigerator"
  },
  {
    category: "appliance",
    description: "For a second kitchen, bar, pantry, or rental unit.",
    name: "Dishwasher",
    placeholder: "Butler pantry dishwasher"
  },
  {
    category: "hvac",
    description: "Track separate floors, zones, or outdoor units.",
    name: "HVAC system",
    placeholder: "Upstairs HVAC"
  },
  {
    category: "deck",
    description: "Track each deck, porch, or outdoor platform separately.",
    name: "Deck",
    placeholder: "Back deck"
  },
  {
    category: "water_heater",
    description: "Useful for larger homes, rentals, or multi-family units.",
    name: "Water heater",
    placeholder: "Basement water heater"
  },
  {
    category: "other",
    description: "Anything important that is not on the starter list.",
    name: "Custom item",
    placeholder: "Generator, EV charger, well pump"
  }
];

const ownershipResponsibilityOptions = [
  { value: "owner", label: "Owner" },
  { value: "hoa", label: "HOA" },
  { value: "landlord", label: "Landlord" },
  { value: "tenant", label: "Tenant" },
  { value: "shared", label: "Shared" },
  { value: "unknown", label: "Unknown" }
] as const;

const fieldClassName =
  "h-9 w-full rounded-md border border-[var(--ledger-line)] bg-white px-3 text-sm font-normal outline-none focus:border-[var(--foreground)] focus:ring-2 focus:ring-[var(--paper-muted)]";
const tallFieldClassName =
  "h-10 w-full rounded-md border border-[var(--ledger-line)] bg-white px-3 text-sm font-normal outline-none focus:border-[var(--foreground)] focus:ring-2 focus:ring-[var(--paper-muted)]";
const textareaClassName =
  "min-h-24 w-full rounded-md border border-[var(--ledger-line)] bg-white px-3 py-2 text-sm font-normal outline-none focus:border-[var(--foreground)] focus:ring-2 focus:ring-[var(--paper-muted)]";

const categoryIcons: Partial<Record<AssetSystemCategory, typeof HomeIcon>> = {
  appliance: Grid2X2,
  deck: HomeIcon,
  electrical: Zap,
  furnace: Flame,
  gutters: Droplet,
  hvac: Snowflake,
  plumbing: Droplet,
  roof: HomeIcon,
  security: ShieldCheck,
  water_heater: Droplet
};

function getCategoryIcon(category: AssetSystemCategory) {
  return categoryIcons[category] ?? Wrench;
}

function getCategoryVisual(category: AssetSystemCategory) {
  const visuals: Partial<Record<AssetSystemCategory, { bg: string; text: string }>> = {
    appliance: { bg: "bg-sky-50", text: "text-sky-600" },
    deck: { bg: "bg-orange-50", text: "text-orange-600" },
    electrical: { bg: "bg-amber-50", text: "text-amber-600" },
    furnace: { bg: "bg-orange-50", text: "text-orange-600" },
    gutters: { bg: "bg-cyan-50", text: "text-cyan-600" },
    hvac: { bg: "bg-blue-50", text: "text-blue-600" },
    plumbing: { bg: "bg-cyan-50", text: "text-cyan-600" },
    roof: { bg: "bg-slate-100", text: "text-slate-600" },
    security: { bg: "bg-emerald-50", text: "text-emerald-600" },
    water_heater: { bg: "bg-indigo-50", text: "text-indigo-600" },
    windows: { bg: "bg-sky-50", text: "text-sky-600" }
  };

  return visuals[category] ?? { bg: "bg-blue-50", text: "text-blue-600" };
}

function getServiceDisplay(value: string | null, fallback: string) {
  return value ?? fallback;
}

function getSuggestedNameExamples(category: AssetSystemCategory) {
  const examples: Partial<Record<AssetSystemCategory, string>> = {
    appliance: "Kitchen refrigerator, washer, dryer",
    deck: "Back deck, front porch, pool deck",
    hvac: "Upstairs HVAC, downstairs HVAC",
    water_heater: "Basement water heater",
    other: "Generator, EV charger, well pump"
  };

  return examples[category] ?? "Use the name people in your home would recognize";
}

function formatPropertyType(value: PropertyType) {
  return propertyTypeOptions.find((option) => option.value === value)?.label ?? "Property";
}

function formatAssetCategory(value: AssetSystemCategory) {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getPropertyLocation(property: PropertyRow) {
  const location = [property.city, property.state].filter(Boolean).join(", ");
  return location || property.address_line_1 || "Location not added";
}

function toPropertySummary(property: PropertyRow): PropertySummary {
  return {
    name: property.name,
    propertyType: property.property_type,
    location: getPropertyLocation(property),
    yearBuilt: property.year_built ?? undefined
  };
}

function getAssetDetail(asset: AssetSystemRow) {
  const identification = [asset.brand, asset.model].filter(Boolean).join(" ");

  if (identification) {
    return identification;
  }

  if (asset.last_service_date) {
    return `Last serviced ${asset.last_service_date}`;
  }

  if (asset.install_year) {
    return `Installed or replaced in ${asset.install_year}`;
  }

  if (asset.estimated_age_range && asset.estimated_age_range !== "unknown") {
    return `Estimated age: ${asset.estimated_age_range.replaceAll("_", " ")}`;
  }

  return "Key details still missing";
}

function daysUntil(dateText: string) {
  const today = new Date();
  const dueDate = new Date(`${dateText}T00:00:00`);
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return Math.ceil((dueDate.getTime() - todayStart.getTime()) / 86_400_000);
}

function getCalculatedAssetStatus(asset: AssetSystemRow): AssetStatus {
  const hasUsefulDetails = Boolean(
    asset.install_year ||
      asset.last_service_date ||
      asset.next_service_due_date ||
      asset.notes ||
      asset.brand ||
      asset.model ||
      asset.serial_number ||
      asset.expected_lifespan_years ||
      asset.estimated_replacement_cost !== null ||
      asset.maintenance_interval_value ||
      asset.maintenance_interval_unit ||
      (asset.estimated_age_range && asset.estimated_age_range !== "unknown") ||
      asset.condition !== "unknown"
  );

  if (!hasUsefulDetails) {
    return "missing_info";
  }

  if (asset.condition === "poor") {
    return "needs_attention";
  }

  if (asset.next_service_due_date) {
    const dueInDays = daysUntil(asset.next_service_due_date);

    if (dueInDays < 0) {
      return "needs_attention";
    }

    if (dueInDays <= 30) {
      return "due_soon";
    }
  }

  if (asset.condition === "fair") {
    return "due_soon";
  }

  return "good";
}

function getAssetNextAction(asset: AssetSystemRow, status: AssetStatus) {
  if (asset.next_service_due_date) {
    const dueInDays = daysUntil(asset.next_service_due_date);

    if (dueInDays < 0) {
      return `Service was due ${asset.next_service_due_date}`;
    }

    if (dueInDays <= 30) {
      return `Service due ${asset.next_service_due_date}`;
    }

    return `Next service due ${asset.next_service_due_date}`;
  }

  if (status === "missing_info") {
    return "Add age, service date, condition, or notes";
  }

  if (status === "needs_attention") {
    return "Review and plan next action";
  }

  if (status === "due_soon") {
    return "Schedule upcoming maintenance";
  }

  return "No urgent action";
}

function getAssetStatusReason(asset: AssetSystemRow, status: AssetStatus) {
  if (status === "missing_info") {
    return "Add one or two details to make this record useful.";
  }

  if (asset.condition === "poor") {
    return "Condition is marked poor.";
  }

  if (asset.next_service_due_date) {
    const dueInDays = daysUntil(asset.next_service_due_date);

    if (dueInDays < 0) {
      return `Service is overdue by ${Math.abs(dueInDays)} day${Math.abs(dueInDays) === 1 ? "" : "s"}.`;
    }

    if (dueInDays <= 30) {
      return `Service is due in ${dueInDays} day${dueInDays === 1 ? "" : "s"}.`;
    }
  }

  if (asset.condition === "fair") {
    return "Condition is fair, so it should stay on the radar.";
  }

  return "Details are recorded and no urgent service is due.";
}

function toAssetSummary(asset: AssetSystemRow): AssetSummary {
  const status = getCalculatedAssetStatus(asset);

  return {
    name: asset.name,
    category: formatAssetCategory(asset.category),
    status,
    detail: getAssetDetail(asset),
    nextAction: getAssetNextAction(asset, status),
    statusReason: getAssetStatusReason(asset, status)
  };
}

function toUniqueAssets(assetRows: AssetSystemRow[]) {
  const groupedAssets = new Map<string, { asset: AssetSystemRow; duplicateCount: number }>();

  for (const asset of assetRows) {
    const key = `${asset.category}:${asset.name.trim().toLowerCase()}`;
    const existing = groupedAssets.get(key);

    if (existing) {
      existing.duplicateCount += 1;
      continue;
    }

    groupedAssets.set(key, {
      asset,
      duplicateCount: 1
    });
  }

  return Array.from(groupedAssets.values()).map(({ asset, duplicateCount }) => ({
    asset,
    summary: {
      ...toAssetSummary(asset),
      duplicateCount
    },
    duplicateCount
  }));
}

function getStatusCounts(assetSummaries: AssetSummary[]) {
  return assetSummaries.reduce(
    (counts, asset) => {
      counts[asset.status] += 1;
      return counts;
    },
    {
      good: 0,
      due_soon: 0,
      needs_attention: 0,
      missing_info: 0
    } satisfies Record<AssetStatus, number>
  );
}

function getHomeHealthScore(statusCounts: Record<AssetStatus, number>) {
  const total =
    statusCounts.good + statusCounts.due_soon + statusCounts.needs_attention + statusCounts.missing_info;

  if (total === 0) {
    return 0;
  }

  const weighted =
    statusCounts.good * 100 +
    statusCounts.due_soon * 72 +
    statusCounts.missing_info * 58 +
    statusCounts.needs_attention * 32;

  return Math.round(weighted / total);
}

function getUserFirstName(email: string) {
  const localPart = email.split("@")[0] ?? "there";
  const firstToken = localPart.split(/[._-]/)[0] ?? "there";
  return firstToken.charAt(0).toUpperCase() + firstToken.slice(1);
}

async function getFirstProperty(userId: string) {
  const supabase = await createClient();

  await supabase.from("profiles").upsert({
    id: userId
  });

  return supabase
    .from("properties")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
}

async function getAssetSystems(propertyId: string) {
  const supabase = await createClient();

  return supabase
    .from("asset_systems")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: true });
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requireUser();
  const resolvedSearchParams = await searchParams;
  const { data: firstProperty, error } = await getFirstProperty(user.id);

  if (error) {
    return (
      <DashboardShell userEmail={user.email ?? "Signed in"}>
        <Card>
          <CardHeader>
            <CardTitle>Supabase Schema Needed</CardTitle>
            <CardDescription>
              The app can authenticate, but the initial database schema is not available yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--ink-soft)]">
            <p>
              Apply `supabase/migrations/202606040001_initial_home_schema.sql` to your Supabase project,
              then refresh this page.
            </p>
            <p className="rounded-md border border-[var(--ledger-line)] bg-white/60 p-3 text-[var(--foreground)]">
              {error.message}
            </p>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  if (!firstProperty) {
    return (
      <DashboardShell userEmail={user.email ?? "Signed in"}>
        <FirstPropertySetup message={resolvedSearchParams?.message} />
      </DashboardShell>
    );
  }

  const property = toPropertySummary(firstProperty);
  const { data: assetRows, error: assetError } = await getAssetSystems(firstProperty.id);

  if (assetError) {
    return (
      <DashboardShell
        propertyName={property.name}
        propertyMeta={`${formatPropertyType(property.propertyType)} - ${property.location}`}
        userEmail={user.email ?? "Signed in"}
      >
        <Card>
          <CardHeader>
            <CardTitle>Asset Data Unavailable</CardTitle>
            <CardDescription>
              The property loaded, but asset/system records could not be read.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="rounded-md border border-[var(--ledger-line)] bg-white/60 p-3 text-sm text-[var(--foreground)]">
              {assetError.message}
            </p>
          </CardContent>
        </Card>
      </DashboardShell>
    );
  }

  const uniqueAssets = toUniqueAssets(assetRows ?? []);
  const assetSummaries = uniqueAssets.map(({ summary }) => summary);
  const statusCounts = getStatusCounts(assetSummaries);
  const healthScore = getHomeHealthScore(statusCounts);
  const userFirstName = getUserFirstName(user.email ?? "there");
  const showInventoryChecklist = resolvedSearchParams?.inventory === "1" || uniqueAssets.length === 0;

  return (
    <DashboardShell
      propertyName={property.name}
      propertyMeta={`${formatPropertyType(property.propertyType)} - ${property.location}`}
      userEmail={user.email ?? "Signed in"}
    >
      {resolvedSearchParams?.message ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {resolvedSearchParams.message}
        </div>
      ) : null}
        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-2">
              <p className="text-sm font-medium text-[var(--ink-soft)]">{property.location}</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
                    Good morning, {userFirstName}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    Here is what is happening with {property.name}.
                  </p>
                </div>
                <Button asChild className="w-full rounded-xl bg-[var(--brand)] shadow-lg shadow-blue-200/60 hover:bg-[var(--brand-strong)] sm:w-fit">
                  <Link href="/dashboard?inventory=1">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add item
                  </Link>
                </Button>
              </div>
            </section>

            <HomeHealthCard healthScore={healthScore} statusCounts={statusCounts} />

            <UpcomingMaintenance assets={uniqueAssets} />

            <QuickActions />

            {showInventoryChecklist ? (
              <GuidedAssetChecklist existingAssets={uniqueAssets.map(({ asset }) => asset)} property={firstProperty} />
            ) : null}
          </div>

          <aside className="flex flex-col gap-4">
            <HomeSystemsPanel assets={uniqueAssets} />
          </aside>
        </section>
    </DashboardShell>
  );
}

function HomeHealthCard({
  healthScore,
  statusCounts
}: {
  healthScore: number;
  statusCounts: Record<AssetStatus, number>;
}) {
  const scoreColor =
    healthScore >= 80
      ? "var(--status-good)"
      : healthScore >= 60
        ? "var(--status-warning)"
        : "var(--status-danger)";
  const summaryText =
    healthScore === 0
      ? "Add systems to calculate your home health."
      : healthScore >= 80
        ? "Great job. Your home is in good shape."
        : healthScore >= 60
          ? "A few systems need attention soon."
          : "Some systems need attention now.";

  return (
    <section className="rounded-3xl border border-white/80 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-5 shadow-xl shadow-blue-100/70">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div
          aria-label={`Home health score ${healthScore} out of 100`}
          className="grid h-36 w-36 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(${scoreColor} ${healthScore * 3.6}deg, #dce8f7 0deg)`
          }}
        >
          <div className="grid h-28 w-28 place-items-center rounded-full bg-white shadow-inner">
            <div className="text-center">
              <p className="text-4xl font-bold text-[var(--foreground)]">{healthScore}</p>
              <p className="-mt-1 text-xs font-semibold text-[var(--ink-soft)]">/100</p>
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
            <h3 className="text-lg font-bold text-[var(--foreground)]">Home Health</h3>
          </div>
          <p className="mt-3 text-xl font-bold text-[var(--foreground)]">{summaryText}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
            {statusCounts.good} good, {statusCounts.due_soon} due soon,{" "}
            {statusCounts.needs_attention} need attention, {statusCounts.missing_info} missing info.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(statusMeta) as AssetStatus[]).map((status) => {
              const meta = statusMeta[status];
              return (
                <div className={`rounded-2xl border px-3 py-2 text-center ${meta.ledger}`} key={status}>
                  <p className="text-lg font-bold">{statusCounts[status]}</p>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-wide">{meta.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function UpcomingMaintenance({
  assets
}: {
  assets: Array<{ asset: AssetSystemRow; summary: AssetSummary; duplicateCount: number }>;
}) {
  const upcomingAssets = assets
    .filter(({ summary }) => summary.status === "needs_attention" || summary.status === "due_soon")
    .slice(0, 3);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[var(--foreground)]">Upcoming Maintenance</h3>
        <Button size="sm" variant="ghost">View all</Button>
      </div>
      <div className="space-y-3">
        {upcomingAssets.length > 0 ? (
          upcomingAssets.map(({ asset, summary }) => {
            const meta = statusMeta[summary.status];
            const Icon = getCategoryIcon(asset.category);

            return (
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--ledger-line)] bg-white p-3 shadow-sm" key={asset.id}>
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--foreground)]">{summary.name}</p>
                  <p className="mt-0.5 text-sm text-[var(--ink-soft)]">{summary.nextAction}</p>
                </div>
                <Badge className="shrink-0" variant={meta.badge}>{meta.label}</Badge>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-[var(--ledger-line)] bg-white p-4 text-sm text-[var(--ink-soft)] shadow-sm">
            No upcoming maintenance yet. Add service dates to start building the calendar.
          </div>
        )}
      </div>
    </section>
  );
}

function QuickActions() {
  const actions = [
    { label: "Add item", icon: Plus, href: "/dashboard?inventory=1" },
    { label: "Note", icon: FileText, href: null },
    { label: "Maintenance", icon: Wrench, href: null },
    { label: "Photo", icon: Camera, href: null }
  ];

  return (
    <section>
      <h3 className="text-lg font-bold text-[var(--foreground)]">Quick Add</h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;
          const content = (
            <>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand)] text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              {action.label}
            </>
          );

          if (action.href) {
            return (
              <Link
                className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--ledger-line)] bg-white p-3 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                href={action.href}
                key={action.label}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--ledger-line)] bg-white p-3 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
              key={action.label}
              type="button"
            >
              {content}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function HomeSystemsPanel({
  assets
}: {
  assets: Array<{ asset: AssetSystemRow; summary: AssetSummary; duplicateCount: number }>;
}) {
  return (
    <section className="rounded-3xl border border-[var(--ledger-line)] bg-white p-4 shadow-xl shadow-blue-100/60">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--ink-soft)]">All Systems</p>
          <h3 className="text-2xl font-bold text-[var(--foreground)]">Home Systems</h3>
        </div>
        <div className="flex gap-2">
          <button className="grid h-10 w-10 place-items-center rounded-full border border-[var(--ledger-line)] text-[var(--foreground)]" type="button">
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[var(--paper-muted)] p-1 text-sm font-semibold">
        <button className="rounded-xl bg-[var(--brand)] px-3 py-2 text-white shadow-sm" type="button">
          All Systems
        </button>
        <button className="rounded-xl px-3 py-2 text-[var(--ink-soft)]" type="button">
          By Location
        </button>
      </div>

      {assets.length > 0 ? (
        <AssetCards assets={assets} />
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-[var(--ledger-line)] bg-[var(--paper-muted)] p-5 text-sm text-[var(--ink-soft)]">
          Add systems to start building your home dashboard.
        </div>
      )}
    </section>
  );
}

function AssetCards({
  assets
}: {
  assets: Array<{ asset: AssetSystemRow; summary: AssetSummary; duplicateCount: number }>;
}) {
  return (
    <section className="mt-4 space-y-3">
      {assets.map(({ asset, summary }) => {
        const meta = statusMeta[summary.status];
        const Icon = meta.icon;
        const CategoryIcon = getCategoryIcon(asset.category);
        const categoryVisual = getCategoryVisual(asset.category);
        const lastService = getServiceDisplay(asset.last_service_date, "Add service date");
        const nextCheck = getServiceDisplay(asset.next_service_due_date, "Add next check");

        return (
          <Card className="overflow-hidden rounded-3xl border-white bg-white shadow-lg shadow-blue-100/50 transition hover:-translate-y-0.5 hover:shadow-xl" key={asset.id}>
            <CardHeader className="border-b border-[var(--ledger-line)] bg-gradient-to-r from-white to-[var(--paper-muted)] p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-3xl ${categoryVisual.bg} ${categoryVisual.text}`}>
                  <CategoryIcon className="h-8 w-8" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="truncate text-base font-bold sm:text-lg">{summary.name}</CardTitle>
                    <Badge className="sm:hidden" variant={meta.badge}>{meta.label}</Badge>
                  </div>
                  <CardDescription>{summary.category}</CardDescription>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[var(--ink-soft)]">
                    <div className="rounded-2xl bg-white/80 px-3 py-2">
                      <p className="font-semibold text-[var(--foreground)]">Last service</p>
                      <p className={asset.last_service_date ? "" : "font-medium text-[var(--brand)]"}>{lastService}</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 px-3 py-2">
                      <p className="font-semibold text-[var(--foreground)]">Next check</p>
                      <p className={asset.next_service_due_date ? "" : "font-medium text-[var(--brand)]"}>{nextCheck}</p>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge className="hidden sm:inline-flex" variant={meta.badge}>{meta.label}</Badge>
                  {summary.duplicateCount && summary.duplicateCount > 1 ? (
                    <Badge variant="secondary">{summary.duplicateCount - 1} duplicate hidden</Badge>
                  ) : null}
                  <ChevronRight className="h-5 w-5 text-[var(--ink-soft)]" aria-hidden="true" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex gap-3 rounded-2xl bg-[var(--paper-muted)] p-3 text-sm">
                <span className={`mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-full ${meta.ledger}`}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-[var(--foreground)]">{summary.nextAction}</p>
                  <p className="mt-1 text-[var(--ink-soft)]">{summary.statusReason}</p>
                  <p className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-[var(--ink-soft)]">
                    {summary.detail}
                  </p>
                </div>
              </div>
              <details className="group mt-5 border-t border-[var(--ledger-line)] pt-4">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-2xl border border-[var(--ledger-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--paper-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                  <span>Open details</span>
                  <span className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)] group-open:hidden">
                    Edit
                  </span>
                  <span className="hidden text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)] group-open:inline">
                    Close
                  </span>
                </summary>
                <div className="mt-4 rounded-3xl bg-gradient-to-br from-[var(--paper-muted)] to-white p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl ${categoryVisual.bg} ${categoryVisual.text}`}>
                      <CategoryIcon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-[var(--foreground)]">{summary.name}</p>
                      <p className="text-sm text-[var(--ink-soft)]">
                        {asset.brand || asset.model ? [asset.brand, asset.model].filter(Boolean).join(" ") : "Add details to make this record useful."}
                      </p>
                    </div>
                  </div>
                <form action={updateAssetDetails} className="grid gap-4 sm:grid-cols-2">
                <input name="asset_id" type="hidden" value={asset.id} />
                <div className="rounded-2xl bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)] shadow-sm sm:col-span-2">
                  Identity
                </div>
                <label className="space-y-1 text-sm font-medium">
                  Brand
                  <input
                    className={fieldClassName}
                    defaultValue={asset.brand ?? ""}
                    name="brand"
                    placeholder="Trane"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Model
                  <input
                    className={fieldClassName}
                    defaultValue={asset.model ?? ""}
                    name="model"
                    placeholder="XR14"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium sm:col-span-2">
                  Serial number
                  <input
                    className={fieldClassName}
                    defaultValue={asset.serial_number ?? ""}
                    name="serial_number"
                    placeholder="Optional equipment identifier"
                  />
                </label>
                <div className="rounded-2xl bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)] shadow-sm sm:col-span-2">
                  Age and maintenance
                </div>
                <label className="space-y-1 text-sm font-medium">
                  Install year
                  <input
                    className={fieldClassName}
                    defaultValue={asset.install_year ?? ""}
                    inputMode="numeric"
                    name="install_year"
                    placeholder="2018"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Last service
                  <input
                    className={fieldClassName}
                    defaultValue={asset.last_service_date ?? ""}
                    name="last_service_date"
                    type="date"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Next due
                  <input
                    className={fieldClassName}
                    defaultValue={asset.next_service_due_date ?? ""}
                    name="next_service_due_date"
                    type="date"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Estimated age
                  <select
                    className={fieldClassName}
                    defaultValue={asset.estimated_age_range ?? "unknown"}
                    name="estimated_age_range"
                  >
                    <option value="unknown">Unknown</option>
                    <option value="zero_to_three_years">0-3 years</option>
                    <option value="four_to_seven_years">4-7 years</option>
                    <option value="eight_to_twelve_years">8-12 years</option>
                    <option value="thirteen_to_twenty_years">13-20 years</option>
                    <option value="over_twenty_years">20+ years</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Condition
                  <select
                    className={fieldClassName}
                    defaultValue={asset.condition}
                    name="condition"
                  >
                    <option value="unknown">Unknown</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Interval value
                  <input
                    className={fieldClassName}
                    defaultValue={asset.maintenance_interval_value ?? ""}
                    inputMode="numeric"
                    name="maintenance_interval_value"
                    placeholder="6"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Interval unit
                  <select
                    className={fieldClassName}
                    defaultValue={asset.maintenance_interval_unit ?? ""}
                    name="maintenance_interval_unit"
                  >
                    <option value="">No interval</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </label>
                <div className="rounded-2xl bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)] shadow-sm sm:col-span-2">
                  Planning
                </div>
                <label className="space-y-1 text-sm font-medium">
                  Expected lifespan
                  <input
                    className={fieldClassName}
                    defaultValue={asset.expected_lifespan_years ?? ""}
                    inputMode="numeric"
                    name="expected_lifespan_years"
                    placeholder="15"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Replacement cost
                  <input
                    className={fieldClassName}
                    defaultValue={asset.estimated_replacement_cost ?? ""}
                    inputMode="decimal"
                    name="estimated_replacement_cost"
                    placeholder="8500"
                  />
                </label>
                <div className="rounded-2xl bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)] shadow-sm sm:col-span-2">
                  Responsibility and notes
                </div>
                <label className="space-y-1 text-sm font-medium sm:col-span-2">
                  Responsibility
                  <select
                    className={fieldClassName}
                    defaultValue={asset.ownership_responsibility}
                    name="ownership_responsibility"
                  >
                    {ownershipResponsibilityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1 text-sm font-medium sm:col-span-2">
                  Notes
                  <textarea
                    className={textareaClassName}
                    defaultValue={asset.notes ?? ""}
                    name="notes"
                    placeholder="Service provider, model hints, location, or anything known."
                  />
                </label>
                <div className="sm:col-span-2">
                  <Button className="w-full rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-strong)] sm:w-fit" size="sm" type="submit">
                    Save details
                  </Button>
                </div>
                </form>
                <form action={deleteAsset} className="mt-4 flex flex-col gap-3 rounded-2xl border border-[var(--status-danger)] bg-[var(--status-danger-soft)] p-3 text-sm text-[var(--status-danger)]">
                <input name="asset_id" type="hidden" value={asset.id} />
                <label className="space-y-1 font-medium">
                  Type REMOVE to delete this asset
                  <input
                    className="h-9 w-full max-w-xs rounded-md border border-[var(--status-danger)] bg-white px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-[var(--status-danger-soft)]"
                    name="confirm_delete"
                    placeholder="REMOVE"
                  />
                </label>
                <Button className="w-fit text-[var(--status-danger)]" size="sm" type="submit" variant="outline">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove asset
                </Button>
                </form>
                </div>
              </details>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

function GuidedAssetChecklist({
  existingAssets,
  property
}: {
  existingAssets: AssetSystemRow[];
  property: PropertyRow;
}) {
  const options = commonAssetOptions[property.property_type];
  const existingAssetKeys = new Set(
    existingAssets.map((asset) => `${asset.category}:${asset.name.trim().toLowerCase()}`)
  );
  const hasAvailableOptions = options.some(
    (option) => !existingAssetKeys.has(`${option.category}:${option.name.trim().toLowerCase()}`)
  );

  return (
    <Card className="rounded-3xl border-white bg-white shadow-xl shadow-blue-100/60">
      <CardHeader>
        <Badge variant="warning" className="w-fit">Guided Add</Badge>
        <CardTitle className="text-2xl font-black">Add a system or appliance</CardTitle>
        <CardDescription>
          Pick real things people in your home recognize. You can add another HVAC, deck, or appliance any time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createSelectedAssets} className="space-y-5">
          <input name="property_id" type="hidden" value={property.id} />
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {options.map((option) => {
              const optionKey = `${option.category}:${option.name.trim().toLowerCase()}`;
              const isExisting = existingAssetKeys.has(optionKey);
              const OptionIcon = getCategoryIcon(option.category);
              const optionVisual = getCategoryVisual(option.category);

              return (
                <label
                  className={`group flex min-h-32 flex-col justify-between rounded-3xl border p-4 transition ${
                    isExisting
                      ? "border-[var(--ledger-line)] bg-[var(--paper-muted)] text-[var(--ink-soft)] opacity-75"
                      : "cursor-pointer border-white bg-gradient-to-br from-white to-[var(--paper-muted)] shadow-sm hover:-translate-y-0.5 hover:shadow-lg"
                  }`}
                  key={`${option.category}-${option.name}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`grid h-12 w-12 place-items-center rounded-2xl ${optionVisual.bg} ${optionVisual.text}`}>
                      <OptionIcon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <input
                      className="mt-1 h-4 w-4 accent-[var(--brand)]"
                      disabled={isExisting}
                      name="assets"
                      type="checkbox"
                      value={`${option.category}::${option.name}`}
                    />
                  </div>
                  <span className="mt-4">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--foreground)]">
                      {option.name}
                      {isExisting ? <Badge variant="secondary">Already added</Badge> : null}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-[var(--ink-soft)]">
                      {option.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <div className="flex flex-col gap-3 rounded-3xl bg-[var(--paper-muted)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--ink-soft)]">
              Not sure about dates yet? Add the item now and fill details later.
            </p>
            <Button className="w-full rounded-xl bg-[var(--brand)] hover:bg-[var(--brand-strong)] sm:w-fit" disabled={!hasAvailableOptions} type="submit">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add selected
            </Button>
          </div>
        </form>
        <section className="mt-6 rounded-3xl bg-gradient-to-br from-blue-50 to-white p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h4 className="text-base font-black text-[var(--foreground)]">Add another common item</h4>
              <p className="text-sm text-[var(--ink-soft)]">
                Use a specific name so each record is easy to recognize later.
              </p>
            </div>
            <Badge className="w-fit" variant="secondary">Multiples supported</Badge>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {repeatableAssetTemplates.map((template) => {
              const TemplateIcon = getCategoryIcon(template.category);
              const templateVisual = getCategoryVisual(template.category);
              const templateInputId = `repeatable-${template.category}-${template.name
                .toLowerCase()
                .replaceAll(" ", "-")}`;

              return (
                <form
                  action={createCustomAsset}
                  className="rounded-3xl border border-white bg-white p-4 shadow-sm"
                  key={`${template.category}-${template.name}`}
                >
                  <input name="property_id" type="hidden" value={property.id} />
                  <input name="category" type="hidden" value={template.category} />
                  <div className="flex gap-3">
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${templateVisual.bg} ${templateVisual.text}`}>
                      <TemplateIcon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[var(--foreground)]">Another {template.name}</p>
                      <p className="mt-1 text-sm leading-5 text-[var(--ink-soft)]">{template.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                    <label className="sr-only" htmlFor={templateInputId}>
                      Specific name
                    </label>
                    <input
                      className={tallFieldClassName}
                      id={templateInputId}
                      name="name"
                      placeholder={template.placeholder}
                    />
                    <Button className="rounded-xl" type="submit">
                      Add
                    </Button>
                  </div>
                </form>
              );
            })}
          </div>
        </section>

        <form action={createCustomAsset} className="mt-6 rounded-3xl border border-dashed border-[var(--ledger-line)] bg-white p-4">
          <input name="property_id" type="hidden" value={property.id} />
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="space-y-1 text-sm font-medium">
              Add anything else
              <input
                className={tallFieldClassName}
                name="name"
                placeholder="Wine fridge, sauna, well pump, shed roof"
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Type
              <select
                className={tallFieldClassName}
                defaultValue="other"
                name="category"
              >
                {assetCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <Button className="w-full rounded-xl sm:w-fit" type="submit">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add item
            </Button>
          </div>
          <p className="mt-3 text-xs leading-5 text-[var(--ink-soft)]">
            Examples: {getSuggestedNameExamples("deck")}; {getSuggestedNameExamples("hvac")};{" "}
            {getSuggestedNameExamples("appliance")}.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function DashboardShell({
  children,
  propertyMeta,
  propertyName = "First property setup",
  userEmail
}: {
  children: React.ReactNode;
  propertyMeta?: string;
  propertyName?: string;
  userEmail: string;
}) {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-3xl border border-white/80 bg-white/90 px-4 py-3 shadow-xl shadow-blue-100/60 backdrop-blur">
          <div className="flex items-center gap-3">
            <button className="grid h-10 w-10 place-items-center rounded-full text-[var(--foreground)] sm:hidden" type="button">
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Open menu</span>
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand)] to-cyan-400 text-white shadow-lg shadow-blue-200">
              <HomeIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-black tracking-tight text-[var(--foreground)]">HomeKeep</p>
              <p className="hidden text-sm font-medium text-[var(--ink-soft)] sm:block">{propertyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {propertyMeta ? <Badge className="hidden md:inline-flex" variant="secondary">{propertyMeta}</Badge> : null}
            <Badge className="hidden lg:inline-flex" variant="secondary">{userEmail}</Badge>
            <Button className="hidden sm:inline-flex" variant="outline" size="sm">
              Switch property
            </Button>
            <button className="grid h-10 w-10 place-items-center rounded-full border border-[var(--ledger-line)] text-[var(--foreground)]" type="button">
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Notifications</span>
            </button>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}

function FirstPropertySetup({ message }: { message?: string }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col justify-center rounded-md border border-[var(--ledger-line)] bg-[var(--paper)] p-6 shadow-sm">
        <Badge variant="success" className="w-fit">
          First Property
        </Badge>
        <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight">
          Start with the home you want to protect first.
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
          The dashboard is property-centered. Once this first record exists, the app can
          attach rooms, systems, maintenance history, reminders, and documents to the right home.
        </p>
      </div>

      <Card className="border-[var(--ledger-line)] bg-[var(--paper)]">
        <CardHeader>
          <CardTitle>Create First Property</CardTitle>
          <CardDescription>
            Keep it lightweight. Unknown details can become Missing Info later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {message}
            </div>
          ) : null}
          <form action={createFirstProperty} className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium sm:col-span-2">
              Property name
              <input
                className={tallFieldClassName}
                name="name"
                placeholder="Primary Home"
                required
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Property type
              <select
                className={tallFieldClassName}
                name="property_type"
                defaultValue="single_family_house"
              >
                {propertyTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium">
              Year built
              <input
                className={tallFieldClassName}
                inputMode="numeric"
                name="year_built"
                placeholder="1987"
              />
            </label>

            <label className="space-y-2 text-sm font-medium sm:col-span-2">
              Address line
              <input
                className={tallFieldClassName}
                name="address_line_1"
                placeholder="Optional for pilot setup"
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              City
              <input
                className={tallFieldClassName}
                name="city"
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              State
              <input
                className={tallFieldClassName}
                name="state"
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Postal code
              <input
                className={tallFieldClassName}
                name="postal_code"
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Square feet
              <input
                className={tallFieldClassName}
                inputMode="numeric"
                name="square_feet"
              />
            </label>

            <label className="space-y-2 text-sm font-medium sm:col-span-2">
              Notes
              <textarea
                className={textareaClassName}
                name="notes"
                placeholder="Anything useful about ownership, age, or maintenance context."
              />
            </label>

            <div className="sm:col-span-2">
              <Button type="submit">Create property</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
