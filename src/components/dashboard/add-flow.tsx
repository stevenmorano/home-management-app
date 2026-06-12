"use client";

import {
  Check,
  Droplet,
  Flame,
  Grid2X2,
  HomeIcon,
  Minus,
  Plus,
  ShieldCheck,
  Snowflake,
  Wrench,
  Zap
} from "lucide-react";
import { createElement, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AssetSystemCategory } from "@/types/database";

export type AddFlowStarterOption = {
  category: AssetSystemCategory;
  description: string;
  name: string;
  shortName?: string;
};

type ExistingStarterCount = {
  count: number;
  key: string;
};

type ReviewedStarter = AddFlowStarterOption & {
  names: string[];
  quantity: number;
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

export function DashboardAddFlow({
  createCustomAssetAction,
  createSelectedAssetsAction,
  existingStarterCounts,
  moreOptions,
  priorityOptions,
  propertyId
}: {
  createCustomAssetAction: (formData: FormData) => void;
  createSelectedAssetsAction: (formData: FormData) => void;
  existingStarterCounts: ExistingStarterCount[];
  moreOptions: AddFlowStarterOption[];
  priorityOptions: AddFlowStarterOption[];
  propertyId: string;
}) {
  const countMap = useMemo(
    () => new Map(existingStarterCounts.map((item) => [item.key, item.count])),
    [existingStarterCounts]
  );
  const [reviewMode, setReviewMode] = useState(false);
  const [selectedStarters, setSelectedStarters] = useState<Record<string, ReviewedStarter>>({});
  const selectedItems = Object.values(selectedStarters);
  const totalReviewedItems = selectedItems.reduce((total, item) => total + item.quantity, 0);

  function toggleStarter(option: AddFlowStarterOption) {
    const key = getStarterKey(option);

    setSelectedStarters((current) => {
      if (current[key]) {
        const next = { ...current };
        delete next[key];
        return next;
      }

      return {
        ...current,
        [key]: {
          ...option,
          names: [getDefaultReviewedName(option, getExistingCount(countMap, option))],
          quantity: 1
        }
      };
    });
  }

  function updateQuantity(option: AddFlowStarterOption, quantity: number) {
    const key = getStarterKey(option);

    setSelectedStarters((current) => {
      const currentItem = current[key] ?? {
        ...option,
        names: [],
        quantity: 0
      };
      const exactCount = getExistingCount(countMap, option);
      const names = Array.from({ length: quantity }).map(
        (_, index) => currentItem.names[index] ?? getDefaultReviewedName(option, exactCount + index)
      );

      return {
        ...current,
        [key]: {
          ...currentItem,
          names,
          quantity
        }
      };
    });
  }

  function updateName(option: AddFlowStarterOption, index: number, name: string) {
    const key = getStarterKey(option);

    setSelectedStarters((current) => {
      const currentItem = current[key];

      if (!currentItem) {
        return current;
      }

      const names = [...currentItem.names];
      names[index] = name;

      return {
        ...current,
        [key]: {
          ...currentItem,
          names
        }
      };
    });
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[0.94fr_1.06fr]">
      <Card className="rounded-3xl border-white bg-white shadow-xl shadow-blue-100/60">
        <CardHeader className="pb-3">
          <Badge variant="warning" className="w-fit">Guided Add</Badge>
          <CardTitle className="text-2xl font-black">Pick what you want to track</CardTitle>
          <CardDescription>
            Select the household items you have first. Then review quantities and names before anything is created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-[2rem] bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-3 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-black text-[var(--foreground)]">Popular picks</h4>
                <p className="text-sm text-[var(--ink-soft)]">Choose everything that belongs in this home.</p>
              </div>
              <Badge className="shrink-0" variant="secondary">
                {selectedItems.length ? `${selectedItems.length} selected` : "Multi-select"}
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6 xl:grid-cols-7">
              {priorityOptions.map((option) => (
                <StarterSelectionTile
                  exactCount={getExistingCount(countMap, option)}
                  isSelected={Boolean(selectedStarters[getStarterKey(option)])}
                  key={`priority-${option.category}-${option.name}`}
                  onToggle={() => toggleStarter(option)}
                  option={option}
                />
              ))}
            </div>
            <Button
              className="mt-4 h-11 w-full rounded-2xl bg-[var(--brand)] font-black hover:bg-[var(--brand-strong)]"
              disabled={selectedItems.length === 0}
              onClick={() => setReviewMode(true)}
              type="button"
            >
              Review selected
            </Button>
          </div>

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
                <StarterSelectionTile
                  exactCount={getExistingCount(countMap, option)}
                  isSelected={Boolean(selectedStarters[getStarterKey(option)])}
                  key={`more-${option.category}-${option.name}`}
                  onToggle={() => toggleStarter(option)}
                  option={option}
                />
              ))}
            </div>
          </details>
        </CardContent>
      </Card>

      <div className="space-y-4 xl:sticky xl:top-5 xl:self-start">
        {reviewMode && selectedItems.length > 0 ? (
          <StarterReviewPanel
            countMap={countMap}
            items={selectedItems}
            onRemove={(option) => toggleStarter(option)}
            onUpdateName={updateName}
            onUpdateQuantity={updateQuantity}
            propertyId={propertyId}
            selectedAction={createSelectedAssetsAction}
            totalReviewedItems={totalReviewedItems}
          />
        ) : (
          <ReviewEmptyPanel selectedCount={selectedItems.length} />
        )}
        <CustomAssetPanel createCustomAssetAction={createCustomAssetAction} propertyId={propertyId} />
      </div>
    </section>
  );
}

function StarterSelectionTile({
  exactCount,
  isSelected,
  onToggle,
  option
}: {
  exactCount: number;
  isSelected: boolean;
  onToggle: () => void;
  option: AddFlowStarterOption;
}) {
  const OptionIcon = getCategoryIcon(option.category);
  const optionVisual = getCategoryVisual(option.category);
  const displayName = getStarterDisplayName(option);

  return (
    <button
      aria-pressed={isSelected}
      className={`group relative flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border p-1.5 text-center shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${
        isSelected
          ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-lg shadow-blue-200/70"
          : "border-white bg-white/85 text-[var(--foreground)] hover:-translate-y-0.5 hover:shadow-lg"
      }`}
      onClick={onToggle}
      type="button"
    >
      <span className={`grid h-8 w-8 place-items-center rounded-2xl transition ${isSelected ? "bg-white/20 text-white" : `${optionVisual.bg} ${optionVisual.text}`}`}>
        {createElement(OptionIcon, { className: "h-4 w-4", "aria-hidden": true })}
      </span>
      <span className="min-w-0 text-[0.62rem] font-black leading-3">{displayName}</span>
      {isSelected ? (
        <span className="absolute left-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-white text-[var(--brand)]">
          <Check className="h-3 w-3" aria-hidden="true" />
        </span>
      ) : null}
      {exactCount > 0 ? (
        <span className={`absolute right-1 top-1 rounded-full px-1.5 py-0.5 text-[0.55rem] font-black uppercase tracking-wide ${isSelected ? "bg-white/20 text-white" : "bg-white text-[var(--ink-soft)]"}`}>
          {exactCount}
        </span>
      ) : null}
    </button>
  );
}

function ReviewEmptyPanel({ selectedCount }: { selectedCount: number }) {
  return (
    <Card className="overflow-hidden rounded-[2rem] border-white bg-white shadow-2xl shadow-blue-100/70">
      <CardHeader className="bg-gradient-to-br from-blue-600 via-[var(--brand)] to-cyan-500 text-white">
        <CardTitle className="text-2xl font-black text-white">Review before creating</CardTitle>
        <CardDescription className="text-white/80">
          {selectedCount > 0
            ? "Tap Review selected to set quantities and names."
            : "Select a few items, then give them recognizable names like Kitchen fridge or Basement furnace."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="rounded-2xl bg-[var(--paper-muted)] p-3 text-sm leading-6 text-[var(--ink-soft)]">
          The next step keeps duplicate things clear: Refrigerator can become Kitchen fridge and Basement fridge before the records are saved.
        </div>
      </CardContent>
    </Card>
  );
}

function StarterReviewPanel({
  countMap,
  items,
  onRemove,
  onUpdateName,
  onUpdateQuantity,
  propertyId,
  selectedAction,
  totalReviewedItems
}: {
  countMap: Map<string, number>;
  items: ReviewedStarter[];
  onRemove: (option: AddFlowStarterOption) => void;
  onUpdateName: (option: AddFlowStarterOption, index: number, name: string) => void;
  onUpdateQuantity: (option: AddFlowStarterOption, quantity: number) => void;
  propertyId: string;
  selectedAction: (formData: FormData) => void;
  totalReviewedItems: number;
}) {
  return (
    <Card className="overflow-hidden rounded-[2rem] border-white bg-white shadow-2xl shadow-blue-100/70">
      <CardHeader className="bg-gradient-to-br from-blue-600 via-[var(--brand)] to-cyan-500 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white/75">Step 2</p>
            <CardTitle className="mt-1 text-2xl font-black text-white">Review selected items</CardTitle>
            <CardDescription className="mt-1 text-white/80">
              Set quantity and names before creating records.
            </CardDescription>
          </div>
          <Badge className="shrink-0 bg-white/20 text-white" variant="secondary">
            {totalReviewedItems} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <form action={selectedAction} className="space-y-3">
          <input name="property_id" type="hidden" value={propertyId} />
          {items.map((item) => (
            <ReviewItem
              exactCount={getExistingCount(countMap, item)}
              item={item}
              key={getStarterKey(item)}
              onRemove={() => onRemove(item)}
              onUpdateName={(index, name) => onUpdateName(item, index, name)}
              onUpdateQuantity={(quantity) => onUpdateQuantity(item, quantity)}
            />
          ))}
          <Button className="h-12 w-full rounded-2xl bg-[var(--brand)] text-base font-black hover:bg-[var(--brand-strong)]" type="submit">
            <Plus className="h-5 w-5" aria-hidden="true" />
            Create {totalReviewedItems} {totalReviewedItems === 1 ? "item" : "items"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ReviewItem({
  exactCount,
  item,
  onRemove,
  onUpdateName,
  onUpdateQuantity
}: {
  exactCount: number;
  item: ReviewedStarter;
  onRemove: () => void;
  onUpdateName: (index: number, name: string) => void;
  onUpdateQuantity: (quantity: number) => void;
}) {
  const OptionIcon = getCategoryIcon(item.category);
  const optionVisual = getCategoryVisual(item.category);
  const quantityOptions = [1, 2, 3, 4];

  return (
    <div className="rounded-[1.5rem] border border-[var(--ledger-line)] bg-white p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${optionVisual.bg} ${optionVisual.text}`}>
          {createElement(OptionIcon, { className: "h-5 w-5", "aria-hidden": true })}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-black text-[var(--foreground)]">{item.name}</h4>
              <p className="text-xs leading-5 text-[var(--ink-soft)]">{getStarterNamePlaceholder(item)}</p>
            </div>
            <button
              aria-label={`Remove ${item.name}`}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--paper-muted)] text-[var(--ink-soft)] transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
              onClick={onRemove}
              type="button"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <label className="mt-3 block space-y-1 text-xs font-black uppercase tracking-[0.14em] text-[var(--ink-soft)]">
            Quantity
            <select
              className="h-10 w-full rounded-xl border border-[var(--ledger-line)] bg-white px-3 text-sm font-bold normal-case tracking-normal text-[var(--foreground)] outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-blue-100"
              onChange={(event) => onUpdateQuantity(Number(event.target.value))}
              value={item.quantity}
            >
              {quantityOptions.map((quantity) => (
                <option key={quantity} value={quantity}>
                  {quantity}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-3 grid gap-2">
            {Array.from({ length: item.quantity }).map((_, index) => {
              const fieldValue = item.names[index] ?? getDefaultReviewedName(item, exactCount + index);

              return (
                <label className="block space-y-1 text-xs font-black uppercase tracking-[0.14em] text-[var(--ink-soft)]" key={`${getStarterKey(item)}-${index}`}>
                  Name {item.quantity > 1 ? index + 1 : ""}
                  <input name="assets" type="hidden" value={`${item.category}::${fieldValue}`} />
                  <input
                    className="h-11 w-full rounded-xl border border-[var(--ledger-line)] bg-white px-3 text-sm font-bold normal-case tracking-normal text-[var(--foreground)] outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-blue-100"
                    onChange={(event) => onUpdateName(index, event.target.value)}
                    placeholder={getStarterNamePlaceholder(item)}
                    value={fieldValue}
                  />
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomAssetPanel({
  createCustomAssetAction,
  propertyId
}: {
  createCustomAssetAction: (formData: FormData) => void;
  propertyId: string;
}) {
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
      <form action={createCustomAssetAction} className="mt-3 grid gap-3">
        <input name="property_id" type="hidden" value={propertyId} />
        <label className="space-y-1 text-sm font-medium">
          Item name
          <input
            className="h-10 w-full rounded-md border border-[var(--ledger-line)] bg-white px-3 text-sm font-normal outline-none focus:border-[var(--foreground)] focus:ring-2 focus:ring-[var(--paper-muted)]"
            name="name"
            placeholder="Wine fridge, sauna, well pump, shed roof"
          />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Type
          <select
            className="h-10 w-full rounded-md border border-[var(--ledger-line)] bg-white px-3 text-sm font-normal outline-none focus:border-[var(--foreground)] focus:ring-2 focus:ring-[var(--paper-muted)]"
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

function getStarterKey(option: AddFlowStarterOption) {
  return `${option.category}:${option.name}`;
}

function getStarterDisplayName(option: AddFlowStarterOption) {
  if (option.shortName) {
    return option.shortName;
  }

  const compactNames: Record<string, string> = {
    dishwasher: "Dishwasher",
    "electrical panel": "Elec panel",
    fireplace: "Fireplace",
    "plumbing fixtures": "Plumbing",
    "range or oven": "Range",
    refrigerator: "Fridge",
    "smoke and safety systems": "Safety",
    thermostat: "Thermo",
    "water heater": "Water heater"
  };

  return compactNames[option.name.toLowerCase()] ?? option.name;
}

function getExistingCount(countMap: Map<string, number>, option: AddFlowStarterOption) {
  const key = `${option.category}:${option.name.trim().toLowerCase()}`;
  return countMap.get(key) ?? 0;
}

function getDefaultReviewedName(option: AddFlowStarterOption, indexWithExisting: number) {
  const examples = getStarterNamePlaceholder(option)
    .split(",")
    .map((example) => example.trim())
    .filter(Boolean);

  return examples[indexWithExisting] ?? (indexWithExisting > 0 ? `${option.name} ${indexWithExisting + 1}` : option.name);
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
    return "Kitchen fridge, basement fridge";
  }

  if (key.includes("dishwasher")) {
    return "Kitchen dishwasher, pantry dishwasher";
  }

  if (key.includes("range") || key.includes("oven")) {
    return "Kitchen range, wall oven";
  }

  if (key.includes("washer")) {
    return "Laundry washer";
  }

  if (key.includes("dryer")) {
    return "Laundry dryer";
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

  const examples: Partial<Record<AssetSystemCategory, string>> = {
    appliance: "Kitchen refrigerator, washer, dryer",
    deck: "Back deck, front porch, pool deck",
    hvac: "Upstairs HVAC, downstairs HVAC",
    water_heater: "Basement water heater",
    other: "Generator, EV charger, well pump"
  };

  return examples[option.category] ?? "Use the name people in your home would recognize";
}
