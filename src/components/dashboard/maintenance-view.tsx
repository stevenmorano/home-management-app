import {
  CalendarCheck2,
  ChevronRight,
  ClipboardCheck,
  DollarSign,
  MapPin,
  Plus,
  Trash2,
  UserRound,
  Wrench
} from "lucide-react";
import Link from "next/link";

import {
  createWorkRecord,
  deleteWorkRecord,
  updateWorkRecord
} from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AssetSystemRow,
  PerformedByType,
  RoomRow,
  WorkRecordRow,
  WorkType
} from "@/types/database";

const fieldClassName =
  "mt-1 h-11 w-full rounded-xl border border-[var(--ledger-line)] bg-white px-3 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-blue-100";
const textareaClassName =
  "mt-1 min-h-28 w-full rounded-xl border border-[var(--ledger-line)] bg-white px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-blue-100";

const workTypeOptions: Array<{ label: string; value: WorkType }> = [
  { label: "Maintenance", value: "maintenance" },
  { label: "Repair", value: "repair" },
  { label: "Inspection", value: "inspection" },
  { label: "Upgrade", value: "upgrade" },
  { label: "Replacement", value: "replacement" },
  { label: "Other", value: "other" }
];

const performerOptions: Array<{ label: string; value: PerformedByType }> = [
  { label: "DIY", value: "diy" },
  { label: "Household member", value: "household_member" },
  { label: "Contractor", value: "contractor" },
  { label: "Other", value: "other" }
];

const workTypeLabels = Object.fromEntries(
  workTypeOptions.map((option) => [option.value, option.label])
) as Record<WorkType, string>;

const performerLabels = Object.fromEntries(
  performerOptions.map((option) => [option.value, option.label])
) as Record<PerformedByType, string>;

function getMaintenanceHref(
  propertyId: string,
  extraParams?: Record<string, string | undefined>
) {
  const params = new URLSearchParams({
    property: propertyId,
    tab: "maintenance"
  });

  Object.entries(extraParams ?? {}).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return `/dashboard?${params.toString()}`;
}

function formatCompletedDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    year: "numeric"
  }).format(date);
}

function getDateParts(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return {
    day: new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      timeZone: "UTC"
    }).format(date),
    month: new Intl.DateTimeFormat("en-US", {
      month: "short",
      timeZone: "UTC"
    }).format(date)
  };
}

function formatCost(record: WorkRecordRow) {
  if (record.cost_amount === null) {
    return null;
  }

  return new Intl.NumberFormat("en-US", {
    currency: record.cost_currency,
    style: "currency"
  }).format(record.cost_amount);
}

function getRecordContext(
  record: WorkRecordRow,
  assetMap: Map<string, AssetSystemRow>,
  roomMap: Map<string, RoomRow>
) {
  const assetName = record.asset_system_id
    ? assetMap.get(record.asset_system_id)?.name
    : null;
  const roomName = record.room_id ? roomMap.get(record.room_id)?.name : null;

  return [assetName, roomName].filter(Boolean).join(" · ") || "General property work";
}

function WorkRecordLedgerItem({
  assetMap,
  compact = false,
  propertyId,
  record,
  roomMap
}: {
  assetMap: Map<string, AssetSystemRow>;
  compact?: boolean;
  propertyId: string;
  record: WorkRecordRow;
  roomMap: Map<string, RoomRow>;
}) {
  const dateParts = getDateParts(record.completed_date);
  const cost = formatCost(record);
  const performedBy = record.provider_name || performerLabels[record.performed_by_type];

  return (
    <article className="group flex min-w-0 gap-3 rounded-[1.4rem] border border-[var(--ledger-line)] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--brand-soft)] text-center text-[var(--brand)]">
        <div>
          <p className="text-[0.65rem] font-black uppercase tracking-wide">{dateParts.month}</p>
          <p className="-mt-1 text-xl font-black">{dateParts.day}</p>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-black text-[var(--foreground)]">{record.title}</p>
            <p className="mt-0.5 truncate text-xs font-semibold text-[var(--ink-soft)]">
              {getRecordContext(record, assetMap, roomMap)}
            </p>
          </div>
          <Badge className="shrink-0" variant="secondary">
            {workTypeLabels[record.work_type]}
          </Badge>
        </div>
        {!compact ? (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--ink-soft)]">
            <span className="flex items-center gap-1">
              <UserRound className="h-3.5 w-3.5" aria-hidden="true" />
              {performedBy}
            </span>
            {cost ? (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" aria-hidden="true" />
                {cost}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      <Button asChild className="shrink-0 self-center rounded-xl" size="icon" variant="ghost">
        <Link
          aria-label={`Edit ${record.title}`}
          href={getMaintenanceHref(propertyId, { record: record.id })}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </article>
  );
}

function WorkRecordForm({
  assets,
  defaultAssetId,
  propertyId,
  record,
  rooms,
  today
}: {
  assets: AssetSystemRow[];
  defaultAssetId?: string;
  propertyId: string;
  record?: WorkRecordRow;
  rooms: RoomRow[];
  today: string;
}) {
  const isEditing = Boolean(record);
  const formAction = isEditing ? updateWorkRecord : createWorkRecord;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden rounded-[2rem] border-white bg-white shadow-2xl shadow-blue-100/70">
        <div className="bg-gradient-to-br from-blue-700 via-[var(--brand)] to-cyan-500 px-5 py-6 text-white sm:px-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">
            {isEditing ? "Care Ledger Entry" : "Completed Work"}
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">
            {isEditing ? "Update this record" : "Log maintenance"}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
            Record what happened while the details are fresh. Linked service dates stay
            current automatically.
          </p>
        </div>
        <CardContent className="p-4 sm:p-6">
          <form action={formAction} className="grid gap-4 sm:grid-cols-2">
            <input name="property_id" type="hidden" value={propertyId} />
            {record ? <input name="record_id" type="hidden" value={record.id} /> : null}

            <label className="space-y-1 text-sm font-bold sm:col-span-2">
              What was done?
              <input
                autoFocus={!isEditing}
                className={fieldClassName}
                defaultValue={record?.title ?? ""}
                maxLength={120}
                name="title"
                placeholder="Annual AC service"
                required
              />
            </label>

            <label className="space-y-1 text-sm font-bold">
              Work type
              <select
                className={fieldClassName}
                defaultValue={record?.work_type ?? "maintenance"}
                name="work_type"
              >
                {workTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-bold">
              Completed date
              <input
                className={fieldClassName}
                defaultValue={record?.completed_date ?? today}
                max={today}
                name="completed_date"
                required
                type="date"
              />
            </label>

            <label className="space-y-1 text-sm font-bold">
              Asset or system
              <select
                className={fieldClassName}
                defaultValue={record?.asset_system_id ?? defaultAssetId ?? ""}
                name="asset_system_id"
              >
                <option value="">General property work</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-bold">
              Room or location
              <select
                className={fieldClassName}
                defaultValue={record?.room_id ?? ""}
                name="room_id"
              >
                <option value="">No specific location</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-bold">
              Who did the work?
              <select
                className={fieldClassName}
                defaultValue={record?.performed_by_type ?? "diy"}
                name="performed_by_type"
              >
                {performerOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-sm font-bold">
              Provider name
              <input
                className={fieldClassName}
                defaultValue={record?.provider_name ?? ""}
                maxLength={160}
                name="provider_name"
                placeholder="Optional contractor or person"
              />
            </label>

            <label className="space-y-1 text-sm font-bold">
              Cost
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--ink-soft)]">
                  $
                </span>
                <input
                  className={`${fieldClassName} pl-7`}
                  defaultValue={record?.cost_amount ?? ""}
                  inputMode="decimal"
                  name="cost_amount"
                  placeholder="0.00"
                />
              </div>
            </label>

            <div className="hidden sm:block" aria-hidden="true" />

            <label className="space-y-1 text-sm font-bold sm:col-span-2">
              Description
              <textarea
                className={textareaClassName}
                defaultValue={record?.description ?? ""}
                maxLength={4000}
                name="description"
                placeholder="What was inspected, repaired, replaced, or serviced?"
              />
            </label>

            <label className="space-y-1 text-sm font-bold sm:col-span-2">
              Notes
              <textarea
                className={textareaClassName}
                defaultValue={record?.notes ?? ""}
                maxLength={4000}
                name="notes"
                placeholder="Warranty details, follow-up advice, or receipt location."
              />
            </label>

            <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
              {isEditing ? (
                <Button asChild className="h-11 rounded-xl" variant="ghost">
                  <Link href={getMaintenanceHref(propertyId)}>Cancel</Link>
                </Button>
              ) : null}
              <Button
                className="h-11 rounded-xl bg-[var(--brand)] px-6 hover:bg-[var(--brand-strong)]"
                type="submit"
              >
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                {isEditing ? "Save changes" : "Save completed work"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {record ? (
        <Card className="rounded-[1.6rem] border-rose-200 bg-rose-50/70">
          <CardHeader>
            <CardTitle className="text-lg text-rose-950">Delete this record</CardTitle>
            <CardDescription className="text-rose-800">
              This removes the history entry. It will not roll back the asset’s service date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={deleteWorkRecord} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <input name="record_id" type="hidden" value={record.id} />
              <label className="flex-1 space-y-1 text-sm font-bold text-rose-950">
                Type REMOVE to confirm
                <input
                  autoComplete="off"
                  className={fieldClassName}
                  name="confirm_delete"
                  pattern="REMOVE"
                  placeholder="REMOVE"
                  required
                />
              </label>
              <Button
                className="h-11 rounded-xl bg-rose-700 text-white hover:bg-rose-800"
                type="submit"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete record
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export function MaintenanceView({
  assets,
  defaultAssetId,
  propertyId,
  propertyName,
  records,
  rooms,
  selectedRecord,
  today
}: {
  assets: AssetSystemRow[];
  defaultAssetId?: string;
  propertyId: string;
  propertyName: string;
  records: WorkRecordRow[];
  rooms: RoomRow[];
  selectedRecord?: WorkRecordRow;
  today: string;
}) {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  const roomMap = new Map(rooms.map((room) => [room.id, room]));

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[1.08fr_0.92fr]">
      <WorkRecordForm
        assets={assets}
        defaultAssetId={defaultAssetId}
        propertyId={propertyId}
        record={selectedRecord}
        rooms={rooms}
        today={today}
      />

      <aside className="min-w-0">
        <div className="sticky top-4 rounded-[2rem] border border-white bg-gradient-to-br from-white to-blue-50/70 p-4 shadow-xl shadow-blue-100/60 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand)]">
                Care Ledger
              </p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-[var(--foreground)]">
                Recent work
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{propertyName}</p>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--brand)] text-white shadow-lg shadow-blue-200">
              <Wrench className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {records.length > 0 ? (
              records.map((record) => (
                <WorkRecordLedgerItem
                  assetMap={assetMap}
                  key={record.id}
                  propertyId={propertyId}
                  record={record}
                  roomMap={roomMap}
                />
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-blue-200 bg-white/80 p-6 text-center">
                <CalendarCheck2
                  className="mx-auto h-8 w-8 text-[var(--brand)]"
                  aria-hidden="true"
                />
                <p className="mt-3 font-black text-[var(--foreground)]">No completed work yet</p>
                <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                  Your first maintenance entry will begin this home’s care history.
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </section>
  );
}

export function RecentWorkSection({
  assets,
  propertyId,
  records,
  rooms
}: {
  assets: AssetSystemRow[];
  propertyId: string;
  records: WorkRecordRow[];
  rooms: RoomRow[];
}) {
  const assetMap = new Map(assets.map((asset) => [asset.id, asset]));
  const roomMap = new Map(rooms.map((room) => [room.id, room]));
  const recentRecords = records.slice(0, 3);

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-3xl border border-white bg-gradient-to-br from-white to-blue-50/70 p-4 shadow-xl shadow-blue-100/60">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--ink-soft)]">Care Ledger</p>
          <h3 className="text-xl font-black text-[var(--foreground)]">Recently completed</h3>
        </div>
        <Button asChild className="shrink-0 rounded-xl" size="sm" variant="ghost">
          <Link href={getMaintenanceHref(propertyId)}>
            View history
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        {recentRecords.length > 0 ? (
          recentRecords.map((record) => (
            <WorkRecordLedgerItem
              assetMap={assetMap}
              compact
              key={record.id}
              propertyId={propertyId}
              record={record}
              roomMap={roomMap}
            />
          ))
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-blue-200 bg-white/70 p-3">
            <CalendarCheck2 className="h-6 w-6 shrink-0 text-[var(--brand)]" aria-hidden="true" />
            <p className="text-sm leading-6 text-[var(--ink-soft)]">
              Completed maintenance will build a useful home history here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export function AssetWorkHistory({
  asset,
  propertyId,
  records
}: {
  asset: AssetSystemRow;
  propertyId: string;
  records: WorkRecordRow[];
}) {
  return (
    <div className="rounded-[1.75rem] bg-white p-4 shadow-sm ring-1 ring-blue-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[var(--foreground)]">Service history</p>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">Latest work linked to this item.</p>
        </div>
        <Button asChild className="shrink-0 rounded-xl" size="sm" variant="ghost">
          <Link
            href={getMaintenanceHref(propertyId, {
              asset: asset.id,
              mode: "new"
            })}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Log work
          </Link>
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        {records.length > 0 ? (
          records.slice(0, 5).map((record) => (
            <Link
              className="flex items-center gap-3 rounded-2xl bg-[var(--paper-muted)] p-3 transition hover:bg-[var(--brand-soft)]"
              href={getMaintenanceHref(propertyId, { record: record.id })}
              key={record.id}
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[var(--brand)] shadow-sm">
                <Wrench className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-[var(--foreground)]">{record.title}</p>
                <p className="text-xs text-[var(--ink-soft)]">
                  {formatCompletedDate(record.completed_date)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--ink-soft)]" aria-hidden="true" />
            </Link>
          ))
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-[var(--paper-muted)] p-3">
            <MapPin className="h-5 w-5 shrink-0 text-[var(--brand)]" aria-hidden="true" />
            <p className="text-sm leading-5 text-[var(--ink-soft)]">
              No work has been linked to this Service Passport yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
