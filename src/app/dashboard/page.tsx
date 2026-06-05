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
import { createElement } from "react";

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
    asset?: string;
    inventory?: string;
    message?: string;
    starter?: string;
    tab?: string;
  }>;
}

type DashboardTab = "home" | "systems" | "add" | "more";
type AssetStarterOption = {
  category: AssetSystemCategory;
  description: string;
  name: string;
  shortName?: string;
};

const dashboardTabs: Array<{
  href: string;
  icon: typeof HomeIcon;
  label: string;
  value: DashboardTab;
}> = [
  { value: "home", label: "Home", href: "/dashboard?tab=home", icon: HomeIcon },
  { value: "systems", label: "Systems", href: "/dashboard?tab=systems", icon: Grid2X2 },
  { value: "add", label: "Add", href: "/dashboard?tab=add", icon: Plus },
  { value: "more", label: "More", href: "/dashboard?tab=more", icon: Menu }
];

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

const commonAssetOptions: Record<PropertyType, AssetStarterOption[]> = {
  single_family_house: [
    { category: "roof", name: "Roof", description: "Age, material, inspections, and replacement planning." },
    { category: "gutters", name: "Gutters", description: "Cleaning cadence, repairs, and drainage concerns." },
    { category: "hvac", name: "Central AC", shortName: "Central AC", description: "Outdoor condenser, air handler, filters, and service dates." },
    { category: "hvac", name: "Heat pump", description: "Heating/cooling equipment, filters, service, and seasonal checks." },
    { category: "hvac", name: "Mini-split", description: "Ductless heating/cooling heads and outdoor units." },
    { category: "hvac", name: "Window AC", description: "Room air conditioner, age, filter cleaning, and storage." },
    { category: "hvac", name: "Wall AC", description: "Through-wall air conditioner, age, filters, and service." },
    { category: "furnace", name: "Furnace", description: "Heating equipment, age, service, and safety checks." },
    { category: "boiler", name: "Boiler", description: "Hydronic heating, service records, age, and safety checks." },
    { category: "chimney", name: "Fireplace", shortName: "Fireplace", description: "Firebox, chimney, inspections, cleaning, and safety." },
    { category: "hvac", name: "Thermostat", shortName: "Thermo", description: "Controls, smart thermostat setup, and replacement notes." },
    { category: "water_heater", name: "Water heater", description: "Age, condition, warranty, and replacement window." },
    { category: "electrical", name: "Electrical panel", shortName: "Elec panel", description: "Panel details, upgrades, and inspection records." },
    { category: "plumbing", name: "Plumbing", description: "Known issues, shutoffs, sewer/septic context, and repairs." },
    { category: "windows", name: "Windows", description: "Age, leaks, drafts, and replacement planning." },
    { category: "driveway", name: "Driveway", description: "Surface condition, sealing, drainage, and repairs." },
    { category: "deck", name: "Deck", description: "Material, age, staining, inspections, and repairs." },
    { category: "sump_pump", name: "Sump pump", description: "Testing cadence, backup power, and replacement age." },
    { category: "appliance", name: "Refrigerator", shortName: "Fridge", description: "Kitchen appliance, age, warranty, and service notes." },
    { category: "appliance", name: "Dishwasher", shortName: "Dishwasher", description: "Kitchen appliance, age, leaks, warranty, and repairs." },
    { category: "appliance", name: "Range or oven", description: "Cooking appliance, age, service, and warranty details." },
    { category: "appliance", name: "Washer", description: "Laundry appliance, age, hoses, warranty, and repairs." },
    { category: "appliance", name: "Dryer", description: "Laundry appliance, vent cleaning, age, and repairs." }
  ],
  condo: [
    { category: "hvac", name: "Central AC", description: "Owned unit, filters, and service records." },
    { category: "hvac", name: "Heat pump", description: "Owned heating/cooling equipment and service records." },
    { category: "hvac", name: "Mini-split", description: "Ductless heads, outdoor unit, and service records." },
    { category: "hvac", name: "Window AC", description: "Room air conditioner, age, and filter cleaning." },
    { category: "hvac", name: "Wall AC", description: "Through-wall air conditioner, age, filters, and service." },
    { category: "furnace", name: "Furnace", description: "Owned heating equipment and service records." },
    { category: "boiler", name: "Boiler", description: "Owned hydronic heating equipment and service records." },
    { category: "hvac", name: "Thermostat", description: "Controls, smart thermostat setup, and replacement notes." },
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
    { category: "hvac", name: "Central AC", description: "Owned or building-provided cooling context." },
    { category: "hvac", name: "Heat pump", description: "Owned heating/cooling equipment and service context." },
    { category: "hvac", name: "Mini-split", description: "Ductless heads, outdoor unit, and service context." },
    { category: "hvac", name: "Window AC", description: "Room air conditioner, age, and filter cleaning." },
    { category: "hvac", name: "Wall AC", description: "Through-wall air conditioner, age, filters, and service." },
    { category: "furnace", name: "Furnace", description: "Owned or building heating equipment context." },
    { category: "boiler", name: "Boiler", description: "Owned or building hydronic heating context." },
    { category: "hvac", name: "Thermostat", description: "Controls, smart thermostat setup, and replacement notes." },
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
    { category: "hvac", name: "Central AC", description: "Unit filters, service access, and responsibility." },
    { category: "hvac", name: "Heat pump", description: "Heating/cooling unit, filters, and responsibility." },
    { category: "hvac", name: "Mini-split", description: "Ductless heads, filters, and responsibility." },
    { category: "hvac", name: "Window AC", description: "Room air conditioner, age, and filter cleaning." },
    { category: "hvac", name: "Wall AC", description: "Through-wall air conditioner, age, and filters." },
    { category: "hvac", name: "Thermostat", description: "Controls, smart thermostat setup, and replacement notes." },
    { category: "plumbing", name: "Plumbing fixtures", description: "Fixtures, shutoffs, and maintenance responsibility." },
    { category: "electrical", name: "Electrical panel", description: "Panel location and safety notes." },
    { category: "security", name: "Smoke and safety systems", description: "Detectors, alarms, and testing cadence." }
  ],
  multi_family: [
    { category: "roof", name: "Roof", description: "Age, material, inspections, and replacement planning." },
    { category: "hvac", name: "Central AC", description: "Shared or unit-specific cooling equipment and service cadence." },
    { category: "hvac", name: "Heat pump", description: "Shared or unit-specific heating/cooling equipment." },
    { category: "hvac", name: "Mini-split", description: "Ductless heads, outdoor units, and service cadence." },
    { category: "furnace", name: "Furnace", description: "Shared or unit-specific heating equipment." },
    { category: "boiler", name: "Boiler", description: "Shared or unit-specific hydronic heating equipment." },
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
    { category: "hvac", name: "Central AC", description: "Service cadence and tenant/owner responsibility." },
    { category: "hvac", name: "Heat pump", description: "Heating/cooling service and responsibility." },
    { category: "hvac", name: "Mini-split", description: "Ductless heads, filters, and responsibility." },
    { category: "furnace", name: "Furnace", description: "Heating equipment service and responsibility." },
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
    { category: "hvac", name: "Central AC", description: "Seasonal service and remote-property reliability." },
    { category: "hvac", name: "Heat pump", description: "Heating/cooling reliability and seasonal service." },
    { category: "hvac", name: "Mini-split", description: "Ductless heads, outdoor units, and seasonal service." },
    { category: "furnace", name: "Furnace", description: "Heating equipment, service, and winter reliability." },
    { category: "boiler", name: "Boiler", description: "Hydronic heating, service, and winter reliability." },
    { category: "chimney", name: "Fireplace", description: "Firebox, chimney, inspections, cleaning, and safety." },
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
    { category: "hvac", name: "Central AC", description: "Cooling system, filters, and service records." },
    { category: "hvac", name: "Heat pump", description: "Heating/cooling equipment and service records." },
    { category: "furnace", name: "Furnace", description: "Heating equipment and service records." },
    { category: "boiler", name: "Boiler", description: "Hydronic heating equipment and service records." },
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

function formatSelectValue(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function getStarterNamePlaceholder(option: { category: AssetSystemCategory; name: string }) {
  const key = option.name.toLowerCase();

  if (key.includes("central ac")) {
    return "Main floor AC, upstairs AC";
  }

  if (key.includes("heat pump")) {
    return "Main heat pump, upstairs heat pump";
  }

  if (key.includes("mini-split")) {
    return "Bedroom mini-split, garage mini-split";
  }

  if (key.includes("window ac")) {
    return "Bedroom window AC";
  }

  if (key.includes("wall ac")) {
    return "Living room wall AC";
  }

  if (key.includes("furnace")) {
    return "Basement furnace, attic furnace";
  }

  if (key.includes("boiler")) {
    return "Main boiler";
  }

  if (key.includes("fireplace")) {
    return "Living room fireplace";
  }

  if (key.includes("thermostat")) {
    return "Main thermostat, upstairs thermostat";
  }

  if (key.includes("refrigerator")) {
    return "Kitchen refrigerator, basement fridge";
  }

  if (key.includes("dishwasher")) {
    return "Kitchen dishwasher, pantry dishwasher";
  }

  if (key.includes("hvac")) {
    return "Main floor HVAC, upstairs HVAC";
  }

  if (key.includes("deck")) {
    return "Back deck, pool deck";
  }

  if (key.includes("water heater")) {
    return "Basement water heater";
  }

  return getSuggestedNameExamples(option.category);
}

function getStarterDisplayName(option: AssetStarterOption) {
  if (option.shortName) {
    return option.shortName;
  }

  const compactNames: Record<string, string> = {
    "dishwasher": "Dishwasher",
    "electrical panel": "Elec panel",
    "fireplace": "Fireplace",
    "plumbing fixtures": "Plumbing",
    "range or oven": "Range",
    "refrigerator": "Fridge",
    "smoke and safety systems": "Safety",
    "thermostat": "Thermo",
    "water heater": "Water heater"
  };

  return compactNames[option.name.toLowerCase()] ?? option.name;
}

function getNextStarterName(optionName: string, exactCount: number) {
  return exactCount > 0 ? `${optionName} ${exactCount + 1}` : optionName;
}

function getPriorityStarterOptions(options: AssetStarterOption[]) {
  const priorityNames = new Set([
    "roof",
    "gutters",
    "central ac",
    "furnace",
    "heat pump",
    "mini-split",
    "fireplace",
    "water heater",
    "refrigerator",
    "dishwasher",
    "washer",
    "dryer",
    "deck",
    "electrical panel",
    "plumbing",
    "windows",
    "thermostat"
  ]);
  const priorityOptions = options.filter((option) => priorityNames.has(option.name.toLowerCase()));

  return priorityOptions.length > 0 ? priorityOptions.slice(0, 20) : options.slice(0, 20);
}

function getMoreStarterOptions(options: AssetStarterOption[], priorityOptions: AssetStarterOption[]) {
  const priorityKeys = new Set(priorityOptions.map((option) => `${option.category}:${option.name}`));

  return options.filter((option) => !priorityKeys.has(`${option.category}:${option.name}`));
}

function getStarterKey(option: AssetStarterOption) {
  return `${option.category}:${option.name}`;
}

function getStarterHref(option: AssetStarterOption) {
  const params = new URLSearchParams({
    starter: getStarterKey(option),
    tab: "add"
  });

  return `/dashboard?${params.toString()}`;
}

function getSelectedStarterOption(options: AssetStarterOption[], starterKey?: string) {
  if (!starterKey) {
    return null;
  }

  return options.find((option) => getStarterKey(option) === starterKey) ?? null;
}

function getDashboardTab(searchParams?: { inventory?: string; tab?: string }, assetCount = 0): DashboardTab {
  if (searchParams?.inventory === "1") {
    return "add";
  }

  if (searchParams?.tab === "systems" || searchParams?.tab === "add" || searchParams?.tab === "more") {
    return searchParams.tab;
  }

  if (assetCount === 0 && searchParams?.tab !== "home") {
    return "add";
  }

  return "home";
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
  const activeTab = getDashboardTab(resolvedSearchParams, uniqueAssets.length);
  const selectedAsset = uniqueAssets.find(({ asset }) => asset.id === resolvedSearchParams?.asset);

  return (
    <DashboardShell
      activeTab={activeTab}
      propertyName={property.name}
      propertyMeta={`${formatPropertyType(property.propertyType)} - ${property.location}`}
      userEmail={user.email ?? "Signed in"}
    >
      {resolvedSearchParams?.message ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {resolvedSearchParams.message}
        </div>
      ) : null}
      <DashboardTabNav activeTab={activeTab} />

      {activeTab === "home" ? (
        <DashboardHomeView
          assets={uniqueAssets}
          healthScore={healthScore}
          property={property}
          statusCounts={statusCounts}
          userFirstName={userFirstName}
        />
      ) : null}

      {activeTab === "systems" && selectedAsset ? (
        <AssetDetailView asset={selectedAsset.asset} summary={selectedAsset.summary} />
      ) : null}

      {activeTab === "systems" && !selectedAsset ? (
        <HomeSystemsPanel assets={uniqueAssets} />
      ) : null}

      {activeTab === "add" ? (
        <GuidedAssetChecklist
          existingAssets={uniqueAssets.map(({ asset }) => asset)}
          property={firstProperty}
          selectedStarterKey={resolvedSearchParams?.starter}
        />
      ) : null}

      {activeTab === "more" ? (
        <MoreView
          property={property}
          propertyType={formatPropertyType(property.propertyType)}
          statusCounts={statusCounts}
          userEmail={user.email ?? "Signed in"}
        />
      ) : null}
    </DashboardShell>
  );
}

function DashboardHomeView({
  assets,
  healthScore,
  property,
  statusCounts,
  userFirstName
}: {
  assets: Array<{ asset: AssetSystemRow; summary: AssetSummary; duplicateCount: number }>;
  healthScore: number;
  property: PropertySummary;
  statusCounts: Record<AssetStatus, number>;
  userFirstName: string;
}) {
  return (
    <section className="grid min-w-0 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="min-w-0 flex flex-col gap-4 sm:gap-6">
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
              <Link href="/dashboard?tab=add">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add item
              </Link>
            </Button>
          </div>
        </section>

        <HomeHealthCard healthScore={healthScore} statusCounts={statusCounts} />

        <UpcomingMaintenance assets={assets} />
      </div>

      <aside className="flex flex-col gap-4">
        <QuickActions />
        <SystemsPreview assets={assets} />
      </aside>
    </section>
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
    <section className="w-full max-w-full overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4 shadow-xl shadow-blue-100/70 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <div
          aria-label={`Home health score ${healthScore} out of 100`}
          className="grid h-28 w-28 shrink-0 place-items-center self-center rounded-full sm:h-36 sm:w-36 sm:self-auto"
          style={{
            background: `conic-gradient(${scoreColor} ${healthScore * 3.6}deg, #dce8f7 0deg)`
          }}
        >
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white shadow-inner sm:h-28 sm:w-28">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--foreground)] sm:text-4xl">{healthScore}</p>
              <p className="-mt-1 text-xs font-semibold text-[var(--ink-soft)]">/100</p>
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
            <h3 className="text-lg font-bold text-[var(--foreground)]">Home Health</h3>
          </div>
          <p className="mt-2 text-base font-bold leading-snug text-[var(--foreground)] sm:mt-3 sm:text-xl">{summaryText}</p>
          <p className="mt-1 max-w-[24rem] text-sm leading-5 text-[var(--ink-soft)] sm:mt-2 sm:leading-6">
            {statusCounts.good} good, {statusCounts.due_soon} due soon,{" "}
            {statusCounts.needs_attention} need attention, {statusCounts.missing_info} missing info.
          </p>
        </div>
      </div>
      <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-4">
        {(Object.keys(statusMeta) as AssetStatus[]).map((status) => {
          const meta = statusMeta[status];
          const mobileLabel = status === "needs_attention" ? "Attention" : status === "missing_info" ? "Missing" : meta.label;
          return (
            <div className={`min-w-0 rounded-2xl border px-2 py-1.5 text-center sm:px-3 sm:py-2 ${meta.ledger}`} key={status}>
              <p className="text-base font-bold sm:text-lg">{statusCounts[status]}</p>
              <p className="text-[0.68rem] font-semibold uppercase tracking-wide sm:hidden">{mobileLabel}</p>
              <p className="hidden text-[0.68rem] font-semibold uppercase tracking-wide sm:block">{meta.label}</p>
            </div>
          );
        })}
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
          <div className="min-w-0 rounded-2xl border border-[var(--ledger-line)] bg-white p-4 text-sm text-[var(--ink-soft)] shadow-sm">
            <p className="max-w-[24rem] leading-6">No upcoming maintenance yet. Add service dates to start building the calendar.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function QuickActions() {
  const actions = [
    { label: "Add item", icon: Plus, href: "/dashboard?tab=add" },
    { label: "Note", icon: FileText, href: null },
    { label: "Maintenance", icon: Wrench, href: null },
    { label: "Photo", icon: Camera, href: null }
  ];

  return (
    <section>
      <h3 className="text-lg font-bold text-[var(--foreground)]">Quick Add</h3>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
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
                className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--ledger-line)] bg-white p-2 text-xs font-semibold text-[var(--foreground)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] sm:min-h-24 sm:p-3 sm:text-sm"
                href={action.href}
                key={action.label}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--ledger-line)] bg-white p-2 text-xs font-semibold text-[var(--foreground)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] sm:min-h-24 sm:p-3 sm:text-sm"
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

function SystemsPreview({
  assets
}: {
  assets: Array<{ asset: AssetSystemRow; summary: AssetSummary; duplicateCount: number }>;
}) {
  const previewAssets = assets.slice(0, 5);

  return (
    <section className="rounded-3xl border border-[var(--ledger-line)] bg-white p-4 shadow-xl shadow-blue-100/60">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--ink-soft)]">Home Systems</p>
          <h3 className="text-2xl font-bold text-[var(--foreground)]">Your main records</h3>
        </div>
        <Button asChild size="sm" variant="ghost">
          <Link href="/dashboard?tab=systems">View all</Link>
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {previewAssets.length > 0 ? (
          previewAssets.map(({ asset, summary }) => {
            const meta = statusMeta[summary.status];
            const CategoryIcon = getCategoryIcon(asset.category);
            const categoryVisual = getCategoryVisual(asset.category);

            return (
              <Link
                className="flex items-center gap-3 rounded-2xl border border-[var(--ledger-line)] bg-gradient-to-r from-white to-[var(--paper-muted)] p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                href="/dashboard?tab=systems"
                key={asset.id}
              >
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${categoryVisual.bg} ${categoryVisual.text}`}>
                  <CategoryIcon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-[var(--foreground)]">{summary.name}</span>
                  <span className="mt-0.5 block truncate text-sm text-[var(--ink-soft)]">{summary.nextAction}</span>
                </span>
                <Badge className="shrink-0" variant={meta.badge}>{meta.label}</Badge>
              </Link>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--ledger-line)] bg-[var(--paper-muted)] p-5 text-sm text-[var(--ink-soft)]">
            Add the first few systems to turn this into a home dashboard.
          </div>
        )}
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
    <section className="mt-4 space-y-2 sm:space-y-3">
      {assets.map(({ asset, summary }) => {
        const meta = statusMeta[summary.status];
        const CategoryIcon = getCategoryIcon(asset.category);
        const categoryVisual = getCategoryVisual(asset.category);
        const lastService = getServiceDisplay(asset.last_service_date, "Add service date");
        const nextCheck = getServiceDisplay(asset.next_service_due_date, "Add next check");
        const detailHref = `/dashboard?tab=systems&asset=${asset.id}`;

        return (
          <Card className="overflow-hidden rounded-3xl border-white bg-white shadow-lg shadow-blue-100/50 transition hover:-translate-y-0.5 hover:shadow-xl" key={asset.id}>
            <Link className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-white" href={detailHref}>
              <CardHeader className="bg-gradient-to-r from-white to-[var(--paper-muted)] p-3 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl sm:h-16 sm:w-16 sm:rounded-3xl ${categoryVisual.bg} ${categoryVisual.text}`}>
                    <CategoryIcon className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="truncate text-base font-bold sm:text-lg">{summary.name}</CardTitle>
                      <Badge variant={meta.badge}>{meta.label}</Badge>
                    </div>
                    <CardDescription>{summary.category}</CardDescription>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[var(--ink-soft)]">
                      <div className="rounded-2xl bg-white/80 px-3 py-2">
                        <p className="font-semibold text-[var(--foreground)]">Last service</p>
                        <p className={asset.last_service_date ? "" : "font-medium text-[var(--brand)]"}>{lastService}</p>
                      </div>
                      <div className="rounded-2xl bg-white/80 px-3 py-2">
                        <p className="font-semibold text-[var(--foreground)]">Next check</p>
                        <p className={asset.next_service_due_date ? "" : "font-medium text-[var(--brand)]"}>{nextCheck}</p>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-medium text-[var(--ink-soft)]">
                      {summary.nextAction}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {summary.duplicateCount && summary.duplicateCount > 1 ? (
                      <Badge className="hidden sm:inline-flex" variant="secondary">{summary.duplicateCount - 1} duplicate hidden</Badge>
                    ) : null}
                    <ChevronRight className="h-5 w-5 text-[var(--ink-soft)]" aria-hidden="true" />
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        );
      })}
    </section>
  );
}

function AssetDetailView({
  asset,
  summary
}: {
  asset: AssetSystemRow;
  summary: AssetSummary;
}) {
  const meta = statusMeta[summary.status];
  const Icon = meta.icon;
  const CategoryIcon = getCategoryIcon(asset.category);
  const lastService = getServiceDisplay(asset.last_service_date, "Add service date");
  const nextCheck = getServiceDisplay(asset.next_service_due_date, "Add next check");
  const installedText = asset.install_year ? `${asset.install_year}` : "Add install year";
  const conditionText = formatSelectValue(asset.condition);
  const identityText =
    asset.brand || asset.model
      ? [asset.brand, asset.model].filter(Boolean).join(" ")
      : "Add brand, model, notes, and service details.";

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <Button asChild className="w-fit rounded-xl" variant="ghost" size="sm">
        <Link href="/dashboard?tab=systems">
          <ChevronRight className="h-4 w-4 rotate-180" aria-hidden="true" />
          Back to systems
        </Link>
      </Button>

      <section className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-2xl shadow-blue-100/70">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-[var(--brand)] to-cyan-500 p-5 text-white sm:p-6">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-cyan-200/20 blur-3xl" aria-hidden="true" />

          <div className="relative flex flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex min-w-0 gap-3 sm:gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[1.25rem] bg-white/20 text-white shadow-2xl shadow-blue-900/20 ring-1 ring-white/25 sm:h-24 sm:w-24 sm:rounded-[1.6rem]">
                  {createElement(CategoryIcon, { className: "h-11 w-11", "aria-hidden": true })}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">Service Passport</p>
                  <h2 className="mt-1 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {summary.name}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-white/75">{summary.category}</p>
                </div>
              </div>
              <Badge className="w-fit shrink-0 border-white/30 bg-white/15 text-white" variant="outline">{meta.label}</Badge>
            </div>

            <div className="rounded-[1.75rem] bg-white/15 p-4 ring-1 ring-white/20 backdrop-blur">
              <p className="text-sm leading-6 text-white/85">{identityText}</p>
              <p className="mt-3 text-lg font-black leading-7 text-white">{summary.nextAction}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <AssetMetricCard
                icon={CalendarDays}
                isMissing={!asset.next_service_due_date}
                label="Next service"
                value={nextCheck}
              />
              <AssetMetricCard
                icon={Wrench}
                isMissing={!asset.last_service_date}
                label="Last service"
                value={lastService}
              />
              <AssetMetricCard
                icon={Info}
                isMissing={!asset.install_year}
                label="Installed"
                value={installedText}
              />
              <AssetMetricCard
                icon={Icon}
                isMissing={asset.condition === "unknown"}
                label="Condition"
                value={conditionText}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 bg-gradient-to-br from-white to-blue-50/70 p-4 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-3">
            <div className={`rounded-[1.75rem] border p-4 ${meta.ledger}`}>
              <p className="flex items-center gap-2 text-sm font-black">
                <Icon className="h-4 w-4" aria-hidden="true" />
                What this means
              </p>
              <p className="mt-2 text-sm leading-6">{summary.statusReason}</p>
              <p className="mt-3 rounded-2xl bg-white/70 px-3 py-2 text-sm">{summary.detail}</p>
            </div>
            <div className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-blue-100">
              <p className="text-sm font-black text-[var(--foreground)]">Notes</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                {asset.notes || "No notes yet. Add service provider details, location hints, or anything useful below."}
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-[var(--paper-muted)] p-4">
              <p className="text-sm font-black text-[var(--foreground)]">Record profile</p>
              <div className="mt-3 grid gap-2 text-sm text-[var(--ink-soft)]">
                <p className="flex justify-between gap-3">
                  <span>Responsibility</span>
                  <span className="font-bold text-[var(--foreground)]">{formatSelectValue(asset.ownership_responsibility)}</span>
                </p>
                <p className="flex justify-between gap-3">
                  <span>Expected life</span>
                  <span className="font-bold text-[var(--foreground)]">{asset.expected_lifespan_years ? `${asset.expected_lifespan_years} years` : "Not added"}</span>
                </p>
                <p className="flex justify-between gap-3">
                  <span>Replacement</span>
                  <span className="font-bold text-[var(--foreground)]">{asset.estimated_replacement_cost ? `$${asset.estimated_replacement_cost}` : "Not added"}</span>
                </p>
              </div>
            </div>
          </aside>

          <div className="rounded-[1.75rem] bg-white p-4 shadow-xl shadow-blue-100/60">
            <AssetDetailForm asset={asset} />
          </div>
        </div>
      </section>
    </section>
  );
}

function AssetMetricCard({
  icon,
  isMissing,
  label,
  value
}: {
  icon: typeof CalendarDays;
  isMissing: boolean;
  label: string;
  value: string;
}) {
  const Icon = icon;

  return (
    <div className="rounded-[1.35rem] bg-white/92 p-3 text-[var(--foreground)] shadow-lg shadow-blue-900/10">
      <p className="flex items-center gap-2 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[var(--ink-soft)]">
        <Icon className="h-4 w-4 text-[var(--brand)]" aria-hidden="true" />
        {label}
      </p>
      <p className={`mt-2 line-clamp-2 text-sm font-black leading-5 ${isMissing ? "text-[var(--brand)]" : "text-[var(--foreground)]"}`}>
        {value}
      </p>
    </div>
  );
}

function AssetDetailForm({ asset }: { asset: AssetSystemRow }) {
  return (
    <>
      <div className="mb-4 flex flex-col gap-1">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand)]">Edit details</p>
        <h3 className="text-2xl font-black text-[var(--foreground)]">Keep the record useful</h3>
        <p className="text-sm leading-6 text-[var(--ink-soft)]">Add only what you know. Missing details can stay blank.</p>
      </div>
      <form action={updateAssetDetails} className="grid gap-3 sm:grid-cols-2">
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
    </>
  );
}

function GuidedAssetChecklist({
  existingAssets,
  property,
  selectedStarterKey
}: {
  existingAssets: AssetSystemRow[];
  property: PropertyRow;
  selectedStarterKey?: string;
}) {
  const options = commonAssetOptions[property.property_type];
  const priorityOptions = getPriorityStarterOptions(options);
  const moreOptions = getMoreStarterOptions(options, priorityOptions);
  const selectedOption = getSelectedStarterOption(options, selectedStarterKey);
  const existingStarterCounts = new Map<string, number>();

  existingAssets.forEach((asset) => {
    const key = `${asset.category}:${asset.name.trim().toLowerCase()}`;
    existingStarterCounts.set(key, (existingStarterCounts.get(key) ?? 0) + 1);
  });

  return (
    <section className="grid gap-4 xl:grid-cols-[0.94fr_1.06fr]">
      <Card className="order-2 rounded-3xl border-white bg-white shadow-xl shadow-blue-100/60 xl:order-1">
        <CardHeader className="pb-3">
          <Badge variant="warning" className="w-fit">Guided Add</Badge>
          <CardTitle className="text-2xl font-black">Pick what you want to track</CardTitle>
          <CardDescription>
            Tap a home item first. Then name the exact thing in your home, like Basement fridge or Back deck.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createSelectedAssets} className="rounded-[2rem] bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-3 sm:p-4">
            <input name="property_id" type="hidden" value={property.id} />
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-black text-[var(--foreground)]">Popular picks</h4>
                <p className="text-sm text-[var(--ink-soft)]">Select everything you have. You can rename and add more later.</p>
              </div>
              <Badge className="shrink-0" variant="secondary">Multi-select</Badge>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6 xl:grid-cols-7">
              {priorityOptions.map((option) => (
                <StarterCheckboxTile
                  existingStarterCounts={existingStarterCounts}
                  key={`priority-${option.category}-${option.name}`}
                  option={option}
                />
              ))}
            </div>
            <Button className="mt-4 h-11 w-full rounded-2xl bg-[var(--brand)] font-black hover:bg-[var(--brand-strong)]" type="submit">
              Add selected
            </Button>
          </form>

          <details className="group mt-4 rounded-[2rem] border border-[var(--ledger-line)] bg-white p-3">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-3xl px-2 text-sm font-black text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]">
            <span>
              More home items
              <span className="ml-2 font-medium text-[var(--ink-soft)]">({moreOptions.length})</span>
            </span>
              <span className="rounded-full bg-[var(--paper-muted)] px-3 py-1 text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)] group-open:hidden">
                Open
              </span>
              <span className="hidden rounded-full bg-[var(--paper-muted)] px-3 py-1 text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)] group-open:inline">
                Close
              </span>
            </summary>
            <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6 2xl:grid-cols-7">
              {moreOptions.map((option) => (
                <StarterObjectTile
                  existingStarterCounts={existingStarterCounts}
                  isSelected={selectedOption ? getStarterKey(selectedOption) === getStarterKey(option) : false}
                  key={`more-${option.category}-${option.name}`}
                  option={option}
                />
              ))}
            </div>
          </details>
        </CardContent>
      </Card>

      <div className="order-1 space-y-4 xl:sticky xl:top-5 xl:order-2 xl:self-start">
        {selectedOption ? (
          <StarterAddPanel
            existingStarterCounts={existingStarterCounts}
            option={selectedOption}
            propertyId={property.id}
          />
        ) : null}
        <div className={selectedOption ? "" : "hidden xl:block"}>
          <CustomAssetPanel propertyId={property.id} />
        </div>
      </div>
      <div className="order-3 xl:hidden">
        <CustomAssetPanel propertyId={property.id} />
      </div>
    </section>
  );
}

function StarterCheckboxTile({
  existingStarterCounts,
  option
}: {
  existingStarterCounts: Map<string, number>;
  option: AssetStarterOption;
}) {
  const optionKey = `${option.category}:${option.name.trim().toLowerCase()}`;
  const exactCount = existingStarterCounts.get(optionKey) ?? 0;
  const OptionIcon = getCategoryIcon(option.category);
  const optionVisual = getCategoryVisual(option.category);
  const inputId = `starter-check-${option.category}-${option.name.toLowerCase().replaceAll(" ", "-")}`;
  const value = `${option.category}::${option.name}`;
  const displayName = getStarterDisplayName(option);

  return (
    <label
      className="group relative flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-white bg-white/85 p-1.5 text-center shadow-sm transition has-[:checked]:border-[var(--brand)] has-[:checked]:bg-[var(--brand)] has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--brand)]"
      htmlFor={inputId}
    >
      <input className="peer sr-only" id={inputId} name="assets" type="checkbox" value={value} />
      <span className={`grid h-8 w-8 place-items-center rounded-2xl transition peer-checked:bg-white/20 peer-checked:text-white ${optionVisual.bg} ${optionVisual.text}`}>
        {createElement(OptionIcon, { className: "h-4 w-4", "aria-hidden": true })}
      </span>
      <span className="min-w-0 text-[0.62rem] font-black leading-3">{displayName}</span>
      {exactCount > 0 ? (
        <span className="absolute right-1 top-1 rounded-full bg-white px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-wide text-[var(--ink-soft)] peer-checked:bg-white/20 peer-checked:text-white">
          {exactCount}
        </span>
      ) : null}
    </label>
  );
}

function StarterObjectTile({
  existingStarterCounts,
  isSelected,
  option
}: {
  existingStarterCounts: Map<string, number>;
  isSelected: boolean;
  option: AssetStarterOption;
}) {
  const optionKey = `${option.category}:${option.name.trim().toLowerCase()}`;
  const exactCount = existingStarterCounts.get(optionKey) ?? 0;
  const OptionIcon = getCategoryIcon(option.category);
  const optionVisual = getCategoryVisual(option.category);
  const displayName = getStarterDisplayName(option);

  return (
    <Link
      className={`group flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border p-1.5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${
        isSelected
          ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-lg shadow-blue-200/70"
          : "border-white bg-gradient-to-br from-white to-[var(--paper-muted)] text-[var(--foreground)]"
      }`}
      href={getStarterHref(option)}
    >
      <div className="relative">
        <span className={`grid h-8 w-8 place-items-center rounded-2xl ${isSelected ? "bg-white/20 text-white" : `${optionVisual.bg} ${optionVisual.text}`}`}>
          {createElement(OptionIcon, { className: "h-4 w-4", "aria-hidden": true })}
        </span>
        {exactCount > 0 ? (
          <span className={`absolute -right-2 -top-2 rounded-full px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-wide ${isSelected ? "bg-white/20 text-white" : "bg-white text-[var(--ink-soft)]"}`}>
            {exactCount}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 text-[0.62rem] font-black leading-3">{displayName}</div>
    </Link>
  );
}

function StarterAddPanel({
  existingStarterCounts,
  option,
  propertyId
}: {
  existingStarterCounts: Map<string, number>;
  option: AssetStarterOption;
  propertyId: string;
}) {
  const optionKey = `${option.category}:${option.name.trim().toLowerCase()}`;
  const exactCount = existingStarterCounts.get(optionKey) ?? 0;
  const OptionIcon = getCategoryIcon(option.category);
  const optionVisual = getCategoryVisual(option.category);
  const inputId = `selected-starter-${option.category}-${option.name.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <Card className="overflow-hidden rounded-[2rem] border-white bg-white shadow-2xl shadow-blue-100/70">
      <CardHeader className="bg-gradient-to-br from-blue-600 via-[var(--brand)] to-cyan-500 text-white">
        <div className="flex items-start gap-3">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 text-white">
            {createElement(OptionIcon, { className: "h-7 w-7", "aria-hidden": true })}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white/75">Name this item</p>
            <CardTitle className="mt-1 text-2xl font-black text-white">{option.name}</CardTitle>
            <CardDescription className="mt-1 text-white/80">
              Make it specific so anyone in the home knows which one it is.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <form action={createCustomAsset} className="space-y-4">
          <input name="property_id" type="hidden" value={propertyId} />
          <input name="category" type="hidden" value={option.category} />
          <label className="space-y-2 text-sm font-bold text-[var(--foreground)]" htmlFor={inputId}>
            Name in your home
            <input
              className="h-14 w-full rounded-2xl border border-[var(--ledger-line)] bg-white px-4 text-base font-bold outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-blue-100"
              defaultValue={getNextStarterName(option.name, exactCount)}
              id={inputId}
              name="name"
              placeholder={getStarterNamePlaceholder(option)}
            />
          </label>
          <div className="rounded-2xl bg-[var(--paper-muted)] p-3 text-sm leading-6 text-[var(--ink-soft)]">
            Try names like <span className="font-semibold text-[var(--foreground)]">{getStarterNamePlaceholder(option)}</span>.
          </div>
          <Button className="h-12 w-full rounded-2xl bg-[var(--brand)] text-base font-black hover:bg-[var(--brand-strong)]" type="submit">
            <Plus className="h-5 w-5" aria-hidden="true" />
            {exactCount > 0 ? "Add another" : "Add item"}
          </Button>
        </form>
        <div className={`rounded-2xl px-3 py-2 text-xs leading-5 ${optionVisual.bg} ${optionVisual.text}`}>
          {option.description}
        </div>
      </CardContent>
    </Card>
  );
}

function CustomAssetPanel({ propertyId }: { propertyId: string }) {
  return (
    <details className="group rounded-[2rem] border border-dashed border-[var(--ledger-line)] bg-white p-3 shadow-lg shadow-blue-100/40">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-3xl px-2 text-sm font-black text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]">
        <span>Add something custom</span>
        <span className="rounded-full bg-[var(--paper-muted)] px-3 py-1 text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)] group-open:hidden">
          Open
        </span>
        <span className="hidden rounded-full bg-[var(--paper-muted)] px-3 py-1 text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)] group-open:inline">
          Close
        </span>
      </summary>
      <form action={createCustomAsset} className="mt-3 grid gap-3">
        <input name="property_id" type="hidden" value={propertyId} />
        <label className="space-y-1 text-sm font-medium">
          Item name
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
        <Button className="h-11 w-full rounded-xl" type="submit">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add custom item
        </Button>
      </form>
    </details>
  );
}

function DashboardTabNav({ activeTab }: { activeTab: DashboardTab }) {
  return (
    <nav aria-label="Dashboard sections" className="hidden rounded-3xl border border-white/80 bg-white/90 p-1 shadow-lg shadow-blue-100/50 backdrop-blur sm:grid sm:grid-cols-4">
      {dashboardTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.value === activeTab;

        return (
          <Link
            className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 text-sm font-bold transition ${
              isActive
                ? "bg-[var(--brand)] text-white shadow-md shadow-blue-200/70"
                : "text-[var(--ink-soft)] hover:bg-[var(--paper-muted)] hover:text-[var(--foreground)]"
            }`}
            href={tab.href}
            key={tab.value}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileDashboardTabNav({ activeTab }: { activeTab: DashboardTab }) {
  return (
    <nav aria-label="Dashboard sections" className="shrink-0 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 sm:hidden">
      <div className="grid grid-cols-4 rounded-[1.35rem] border border-white/80 bg-white/95 p-1 shadow-2xl shadow-blue-200/80 backdrop-blur">
        {dashboardTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.value === activeTab;

          return (
            <Link
              className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl text-[0.68rem] font-bold transition ${
                isActive
                  ? "bg-[var(--brand)] text-white shadow-md shadow-blue-200/70"
                  : "text-[var(--ink-soft)]"
              }`}
              href={tab.href}
              key={tab.value}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function MoreView({
  property,
  propertyType,
  statusCounts,
  userEmail
}: {
  property: PropertySummary;
  propertyType: string;
  statusCounts: Record<AssetStatus, number>;
  userEmail: string;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="rounded-3xl border-white bg-white shadow-xl shadow-blue-100/60">
        <CardHeader>
          <Badge className="w-fit" variant="secondary">Property</Badge>
          <CardTitle className="text-2xl font-black">{property.name}</CardTitle>
          <CardDescription>{propertyType} - {property.location}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-[var(--ink-soft)]">
          <div className="rounded-2xl bg-[var(--paper-muted)] p-4">
            Signed in as <span className="font-semibold text-[var(--foreground)]">{userEmail}</span>
          </div>
          <form action={signOut}>
            <Button className="w-full rounded-xl" variant="outline" type="submit">
              Sign out
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-white bg-white shadow-xl shadow-blue-100/60">
        <CardHeader>
          <CardTitle className="text-2xl font-black">Status snapshot</CardTitle>
          <CardDescription>A quick read on what needs details or attention.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {(Object.keys(statusMeta) as AssetStatus[]).map((status) => {
            const meta = statusMeta[status];

            return (
              <div className={`rounded-2xl border px-4 py-3 ${meta.ledger}`} key={status}>
                <p className="text-2xl font-black">{statusCounts[status]}</p>
                <p className="text-xs font-bold uppercase tracking-wide">{meta.label}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}

function DashboardShell({
  activeTab,
  children,
  propertyMeta,
  propertyName = "First property setup",
  userEmail
}: {
  activeTab?: DashboardTab;
  children: React.ReactNode;
  propertyMeta?: string;
  propertyName?: string;
  userEmail: string;
}) {
  return (
    <main className="h-dvh overflow-hidden bg-[var(--background)] text-[var(--foreground)] sm:h-auto sm:min-h-screen sm:overflow-visible">
      <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-4 px-4 pt-5 sm:h-auto sm:min-h-screen sm:gap-6 sm:px-6 sm:pb-8 lg:px-8">
        <header className="shrink-0 flex items-center justify-between rounded-3xl border border-white/80 bg-white/90 px-4 py-3 shadow-xl shadow-blue-100/60 backdrop-blur">
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
              <Button className="hidden sm:inline-flex" variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </header>
        {activeTab ? <div className="sr-only">Current section: {activeTab}</div> : null}
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pb-4 sm:min-h-0 sm:flex-none sm:overflow-visible sm:pb-0" data-dashboard-content>
          {children}
        </div>
        {activeTab ? <MobileDashboardTabNav activeTab={activeTab} /> : null}
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
