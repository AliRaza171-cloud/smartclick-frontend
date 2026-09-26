"use client";

import { CloseIcon, Star } from "./icons";

export const PRICE_RANGES = [
  { id: "u1000", label: "Under Rs. 1,000", min: 0, max: 1000 },
  { id: "1000-3000", label: "Rs. 1,000 - 3,000", min: 1000, max: 3000 },
  { id: "3000-5000", label: "Rs. 3,000 - 5,000", min: 3000, max: 5000 },
  { id: "5000+", label: "Rs. 5,000+", min: 5000, max: Infinity },
] as const;

const DISCOUNTS = [10, 20, 30, 50];
const RATINGS = [4, 3];

export interface DealFilterState {
  price: string[];
  minDiscount: number | null;
  minRating: number | null;
  freeShipping: boolean;
}

export const EMPTY_FILTERS: DealFilterState = { price: [], minDiscount: null, minRating: null, freeShipping: false };

export const countActive = (f: DealFilterState) =>
  f.price.length + (f.minDiscount !== null ? 1 : 0) + (f.minRating !== null ? 1 : 0) + (f.freeShipping ? 1 : 0);

function Option({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1 text-sm text-sc-muted transition-colors hover:text-sc-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded"
        style={{ accentColor: "var(--sc-accent)" }}
      />
      {children}
    </label>
  );
}

function Group({ title, onClear, children }: { title: string; onClear?: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-sc-border py-4 last:border-0">
      <div className="mb-1.5 flex items-center justify-between">
        <h4 className="text-sm font-semibold">{title}</h4>
        {onClear && (
          <button onClick={onClear} aria-label={`Clear ${title}`} className="text-sc-faint hover:text-sc-ink">
            <CloseIcon size={14} />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export default function DealFilters({
  value,
  onChange,
}: {
  value: DealFilterState;
  onChange: (next: DealFilterState) => void;
}) {
  const set = (patch: Partial<DealFilterState>) => onChange({ ...value, ...patch });

  return (
    <aside className="rounded-2xl border border-sc-border bg-sc-surface px-4 pb-2 pt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold">Filters</h3>
        <button onClick={() => onChange(EMPTY_FILTERS)} className="text-xs font-medium text-sc-accent hover:underline">
          Clear All
        </button>
      </div>

      <Group title="Price Range" onClear={value.price.length ? () => set({ price: [] }) : undefined}>
        {PRICE_RANGES.map((r) => (
          <Option
            key={r.id}
            checked={value.price.includes(r.id)}
            onChange={() =>
              set({ price: value.price.includes(r.id) ? value.price.filter((x) => x !== r.id) : [...value.price, r.id] })
            }
          >
            {r.label}
          </Option>
        ))}
      </Group>

      <Group title="Discount" onClear={value.minDiscount !== null ? () => set({ minDiscount: null }) : undefined}>
        {DISCOUNTS.map((d) => (
          <Option key={d} checked={value.minDiscount === d} onChange={() => set({ minDiscount: value.minDiscount === d ? null : d })}>
            {d}%+
          </Option>
        ))}
      </Group>

      <Group title="Rating" onClear={value.minRating !== null ? () => set({ minRating: null }) : undefined}>
        {RATINGS.map((r) => (
          <Option key={r} checked={value.minRating === r} onChange={() => set({ minRating: value.minRating === r ? null : r })}>
            <span className="flex items-center gap-1">
              {r} <Star size={13} /> &amp; above
            </span>
          </Option>
        ))}
      </Group>

      <Group title="Shipping">
        <Option checked={value.freeShipping} onChange={() => set({ freeShipping: !value.freeShipping })}>
          Free Shipping
        </Option>
      </Group>
    </aside>
  );
}
