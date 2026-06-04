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

import { createFirstProperty } from "@/app/dashboard/actions";
import { signOut } from "@/app/auth/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { PropertyRow, PropertyType } from "@/types/database";
import type { AssetStatus, AssetSummary, PropertySummary } from "@/types/home";

export const dynamic = "force-dynamic";

const assets: AssetSummary[] = [
  {
    name: "HVAC",
    category: "Heating and cooling",
    status: "due_soon",
    detail: "Last serviced 9 months ago",
    nextAction: "Schedule seasonal service"
  },
  {
    name: "Water heater",
    category: "Plumbing",
    status: "needs_attention",
    detail: "Estimated 13-20 years old",
    nextAction: "Review replacement plan"
  },
  {
    name: "Roof",
    category: "Exterior",
    status: "missing_info",
    detail: "Install year unknown",
    nextAction: "Add age or inspection date"
  },
  {
    name: "Gutters",
    category: "Exterior",
    status: "good",
    detail: "Cleaned October 2025",
    nextAction: "Next review in fall"
  }
];

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

const statusCounts = assets.reduce(
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

interface DashboardPageProps {
  searchParams?: Promise<{
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

function formatPropertyType(value: PropertyType) {
  return propertyTypeOptions.find((option) => option.value === value)?.label ?? "Property";
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

  return (
    <DashboardShell
      propertyName={property.name}
      propertyMeta={`${formatPropertyType(property.propertyType)} · ${property.location}`}
      userEmail={user.email ?? "Signed in"}
    >
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
                    This protected starter screen follows the MVP docs: guided inventory first,
                    visual status groups, work history, reminders, and optional uploads.
                  </p>
                </div>
                <Button>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add asset
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

            <section className="grid gap-4 md:grid-cols-2">
              {assets.map((asset) => {
                const meta = statusMeta[asset.status];
                const Icon = meta.icon;

                return (
                  <Card key={asset.name}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle>{asset.name}</CardTitle>
                          <CardDescription>{asset.category}</CardDescription>
                        </div>
                        <Badge variant={meta.badge}>{meta.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-3 text-sm">
                        <Icon className="mt-0.5 h-4 w-4 flex-none text-slate-500" aria-hidden="true" />
                        <div>
                          <p className="font-medium">{asset.nextAction}</p>
                          <p className="mt-1 text-slate-500">{asset.detail}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </section>
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
