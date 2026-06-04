import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  HomeIcon,
  Info,
  Plus,
  Wrench
} from "lucide-react";
import Link from "next/link";

import { createFirstProperty, createSelectedAssets, updateAssetDetails } from "@/app/dashboard/actions";
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
  }
> = {
  good: {
    label: "Good",
    icon: CheckCircle2,
    badge: "success",
    ring: "ring-emerald-100"
  },
  due_soon: {
    label: "Due Soon",
    icon: CalendarDays,
    badge: "warning",
    ring: "ring-amber-100"
  },
  needs_attention: {
    label: "Needs Attention",
    icon: AlertTriangle,
    badge: "danger",
    ring: "ring-rose-100"
  },
  missing_info: {
    label: "Missing Info",
    icon: Info,
    badge: "outline",
    ring: "ring-slate-100"
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
    { category: "appliance", name: "Major appliances", description: "Kitchen/laundry equipment, age, manuals, and warranties." }
  ],
  condo: [
    { category: "hvac", name: "HVAC", description: "Owned units, filters, and service records." },
    { category: "water_heater", name: "Water heater", description: "Owned equipment, age, and replacement planning." },
    { category: "appliance", name: "Major appliances", description: "Kitchen/laundry equipment, age, manuals, and warranties." },
    { category: "electrical", name: "Electrical panel", description: "Panel location, capacity, and inspection notes." },
    { category: "plumbing", name: "Plumbing fixtures", description: "Fixtures, shutoffs, leaks, and responsibility notes." },
    { category: "windows", name: "Windows", description: "Age, drafts, HOA responsibility, and repairs." },
    { category: "security", name: "Smoke and safety systems", description: "Detectors, alarms, and testing cadence." }
  ],
  coop: [
    { category: "hvac", name: "HVAC", description: "Owned or building-provided heating/cooling context." },
    { category: "appliance", name: "Major appliances", description: "Kitchen/laundry equipment, age, manuals, and warranties." },
    { category: "electrical", name: "Electrical panel", description: "Panel location and upgrade/inspection notes." },
    { category: "plumbing", name: "Plumbing fixtures", description: "Fixtures, shutoffs, leaks, and building responsibility." },
    { category: "windows", name: "Windows", description: "Age, drafts, and co-op responsibility." },
    { category: "security", name: "Smoke and safety systems", description: "Detectors, alarms, and testing cadence." }
  ],
  apartment: [
    { category: "appliance", name: "Major appliances", description: "Owned appliances, warranties, and service notes." },
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
    { category: "appliance", name: "Major appliances", description: "Unit appliances, age, and responsibility." }
  ],
  rental: [
    { category: "hvac", name: "HVAC", description: "Service cadence and tenant/owner responsibility." },
    { category: "water_heater", name: "Water heater", description: "Age, condition, and replacement planning." },
    { category: "appliance", name: "Major appliances", description: "Included appliances, warranties, and repair records." },
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
    { category: "appliance", name: "Major appliances", description: "Appliance age, warranties, and repair history." },
    { category: "pool", name: "Pool", description: "Opening, closing, equipment, and service records." },
    { category: "septic_or_sewer", name: "Septic or sewer", description: "Pumping, inspections, and responsibility." }
  ],
  other: [
    { category: "hvac", name: "HVAC", description: "Heating/cooling system, filters, and service records." },
    { category: "water_heater", name: "Water heater", description: "Age, condition, warranty, and replacement window." },
    { category: "electrical", name: "Electrical", description: "Panel details, upgrades, and inspection records." },
    { category: "plumbing", name: "Plumbing", description: "Known issues, shutoffs, and repairs." },
    { category: "appliance", name: "Major appliances", description: "Equipment, age, manuals, and warranties." },
    { category: "other", name: "Other important system", description: "Anything costly or maintenance-relevant." }
  ]
};

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

function getAssetNextAction(asset: AssetSystemRow) {
  if (asset.next_service_due_date) {
    return `Next service due ${asset.next_service_due_date}`;
  }

  if (asset.status === "missing_info") {
    return "Add age, service date, condition, or notes";
  }

  if (asset.status === "needs_attention") {
    return "Review and plan next action";
  }

  if (asset.status === "due_soon") {
    return "Schedule upcoming maintenance";
  }

  return "No urgent action";
}

function toAssetSummary(asset: AssetSystemRow): AssetSummary {
  return {
    name: asset.name,
    category: formatAssetCategory(asset.category),
    status: asset.status,
    detail: getAssetDetail(asset),
    nextAction: getAssetNextAction(asset)
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
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              Apply `supabase/migrations/202606040001_initial_home_schema.sql` to your Supabase project,
              then refresh this page.
            </p>
            <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-slate-700">
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
            <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
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
        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="flex flex-col gap-6">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <Badge variant="success">Property Health Command Center</Badge>
                  <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight">
                    See what is healthy, what is due, and what needs better records.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                    This dashboard now reads your property and asset inventory from Supabase.
                    Missing details stay visible so setup can keep moving.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/dashboard?inventory=1">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add more systems
                  </Link>
                </Button>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {(Object.keys(statusMeta) as AssetStatus[]).map((status) => {
                const meta = statusMeta[status];
                const Icon = meta.icon;

                return (
                  <Card key={status} className={`ring-4 ${meta.ring}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardDescription>{meta.label}</CardDescription>
                        <Icon className="h-4 w-4 text-slate-500" aria-hidden="true" />
                      </div>
                      <CardTitle className="text-3xl">{statusCounts[status]}</CardTitle>
                    </CardHeader>
                  </Card>
                );
              })}
            </section>

            {showInventoryChecklist ? (
              <GuidedAssetChecklist existingAssets={uniqueAssets.map(({ asset }) => asset)} property={firstProperty} />
            ) : null}

            {uniqueAssets.length > 0 ? (
              <AssetCards assets={uniqueAssets} />
            ) : (
              null
            )}
          </div>

          <aside className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Guided Setup</CardTitle>
                <CardDescription>
                  Suggested first prototype steps from the implementation plan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Create first property",
                  "Select property type",
                  "Choose common systems",
                  "Fill known structured fields",
                  "Review missing info later"
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-md bg-slate-50 p-3 text-sm">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-500">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Work</CardTitle>
                <CardDescription>Calendar sync stays server-side when implemented.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-slate-500" aria-hidden="true" />
                  <div className="text-sm">
                    <p className="font-medium">HVAC service</p>
                    <p className="text-slate-500">Due in 30 days</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Wrench className="mt-0.5 h-4 w-4 text-slate-500" aria-hidden="true" />
                  <div className="text-sm">
                    <p className="font-medium">Water heater review</p>
                    <p className="text-slate-500">Replacement planning recommended</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ClipboardList className="mt-0.5 h-4 w-4 text-slate-500" aria-hidden="true" />
                  <div className="text-sm">
                    <p className="font-medium">Roof details</p>
                    <p className="text-slate-500">Add install year or inspection record</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </section>
    </DashboardShell>
  );
}

function AssetCards({
  assets
}: {
  assets: Array<{ asset: AssetSystemRow; summary: AssetSummary; duplicateCount: number }>;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {assets.map(({ asset, summary }) => {
        const meta = statusMeta[summary.status];
        const Icon = meta.icon;

        return (
          <Card key={asset.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{summary.name}</CardTitle>
                  <CardDescription>{summary.category}</CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={meta.badge}>{meta.label}</Badge>
                  {summary.duplicateCount && summary.duplicateCount > 1 ? (
                    <Badge variant="secondary">{summary.duplicateCount - 1} duplicate hidden</Badge>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 text-sm">
                <Icon className="mt-0.5 h-4 w-4 flex-none text-slate-500" aria-hidden="true" />
                <div>
                  <p className="font-medium">{summary.nextAction}</p>
                  <p className="mt-1 text-slate-500">{summary.detail}</p>
                </div>
              </div>
              <form action={updateAssetDetails} className="mt-5 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
                <input name="asset_id" type="hidden" value={asset.id} />
                <label className="space-y-1 text-sm font-medium">
                  Install year
                  <input
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    defaultValue={asset.install_year ?? ""}
                    inputMode="numeric"
                    name="install_year"
                    placeholder="2018"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Last service
                  <input
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    defaultValue={asset.last_service_date ?? ""}
                    name="last_service_date"
                    type="date"
                  />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  Estimated age
                  <select
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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
                <label className="space-y-1 text-sm font-medium sm:col-span-2">
                  Notes
                  <textarea
                    className="min-h-20 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    defaultValue={asset.notes ?? ""}
                    name="notes"
                    placeholder="Service provider, model hints, location, or anything known."
                  />
                </label>
                <div className="sm:col-span-2">
                  <Button size="sm" type="submit">
                    Save details
                  </Button>
                </div>
              </form>
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
    <Card>
      <CardHeader>
        <Badge variant="warning" className="w-fit">
          Guided Inventory
        </Badge>
        <CardTitle className="text-2xl">Choose the systems this property depends on.</CardTitle>
        <CardDescription>
          Start broad. Each selected item becomes a Missing Info asset so you can fill details later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createSelectedAssets} className="space-y-5">
          <input name="property_id" type="hidden" value={property.id} />
          <div className="grid gap-3 md:grid-cols-2">
            {options.map((option) => (
              <label
                className={`flex gap-3 rounded-lg border border-slate-200 p-4 transition-colors ${
                  existingAssetKeys.has(`${option.category}:${option.name.trim().toLowerCase()}`)
                    ? "bg-slate-100 text-slate-400"
                    : "cursor-pointer bg-slate-50 hover:bg-white"
                }`}
                key={`${option.category}-${option.name}`}
              >
                <input
                  className="mt-1 h-4 w-4 accent-slate-950"
                  disabled={existingAssetKeys.has(`${option.category}:${option.name.trim().toLowerCase()}`)}
                  name="assets"
                  type="checkbox"
                  value={`${option.category}::${option.name}`}
                />
                <span>
                  <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    {option.name}
                    {existingAssetKeys.has(`${option.category}:${option.name.trim().toLowerCase()}`) ? (
                      <Badge variant="secondary">Already added</Badge>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-sm leading-5 text-slate-500">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Unknown age, condition, and service details will be tracked as Missing Info.
            </p>
            <Button disabled={!hasAvailableOptions} type="submit">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create selected assets
            </Button>
          </div>
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
    <main className="min-h-screen bg-[#f7f9fb] text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
              <HomeIcon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Home Management OS</p>
              <h1 className="text-xl font-semibold">{propertyName}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{userEmail}</Badge>
            {propertyMeta ? <Badge variant="secondary">{propertyMeta}</Badge> : null}
            <Button variant="outline" size="sm">
              Switch property
            </Button>
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
      <div className="flex flex-col justify-center rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Badge variant="success" className="w-fit">
          First Property
        </Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight">
          Start with the home you want to protect first.
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The dashboard is property-centered. Once this first record exists, the app can
          attach rooms, systems, maintenance history, reminders, and documents to the right home.
        </p>
      </div>

      <Card>
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
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                name="name"
                placeholder="Primary Home"
                required
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Property type
              <select
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                inputMode="numeric"
                name="year_built"
                placeholder="1987"
              />
            </label>

            <label className="space-y-2 text-sm font-medium sm:col-span-2">
              Address line
              <input
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                name="address_line_1"
                placeholder="Optional for pilot setup"
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              City
              <input
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                name="city"
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              State
              <input
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                name="state"
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Postal code
              <input
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                name="postal_code"
              />
            </label>

            <label className="space-y-2 text-sm font-medium">
              Square feet
              <input
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-normal outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                inputMode="numeric"
                name="square_feet"
              />
            </label>

            <label className="space-y-2 text-sm font-medium sm:col-span-2">
              Notes
              <textarea
                className="min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
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
