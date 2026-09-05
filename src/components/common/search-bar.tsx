'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Hotel,
  LayoutGrid,
  MapPin,
  RotateCcw,
  Search,
  Users,
  Wine,
} from 'lucide-react';
import type { Region } from '@/types';
import { type CatalogFilters, EMPTY_FILTERS } from '@/utils/catalog';
import { localDateString } from '@/utils/date';
import { ErrorAlert } from './error-alert';

export function SearchBar({
  filters,
  regions,
  regionsLoading,
  regionsError,
  onRetryRegions,
  onSearch,
}: {
  filters: CatalogFilters;
  regions: Region[];
  regionsLoading: boolean;
  regionsError: boolean;
  onRetryRegions: () => void;
  onSearch: (filters: CatalogFilters) => void;
}) {
  const [draft, setDraft] = useState(filters);
  const districts =
    regions.find((region) => String(region.id) === draft.region)?.districts ||
    [];
  const set = <K extends keyof CatalogFilters>(
    key: K,
    value: CatalogFilters[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const hasFilters = Object.keys(EMPTY_FILTERS).some(
    (key) =>
      draft[key as keyof CatalogFilters] !==
      EMPTY_FILTERS[key as keyof CatalogFilters],
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(draft);
      }}
      className="card-lux overflow-hidden"
      aria-label="Joy qidirish"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-gold-tint/60 px-3 py-3.5 sm:px-5">
        <div
          className="flex max-w-full items-center gap-1 rounded-full border border-line-strong bg-surface p-1"
          role="group"
          aria-label="Joy turi"
        >
          {(
            [
              { id: 'all', label: 'Barchasi', icon: LayoutGrid },
              { id: 'halls', label: 'To‘y zallari', icon: Hotel },
              { id: 'bars', label: 'Barlar', icon: Wine },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={draft.category === id}
              onClick={() => {
                const next = { ...draft, category: id };
                setDraft(next);
                onSearch(next);
              }}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-bold sm:px-3.5 ${draft.category === id ? 'bg-gradient-to-br from-[#ecd49c] to-[#c9a35f] text-[#251b0c]' : 'text-ink-soft hover:bg-surface-2'}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </button>
          ))}
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setDraft(EMPTY_FILTERS);
              onSearch(EMPTY_FILTERS);
            }}
            className="flex items-center gap-1.5 rounded-full border border-line px-3 py-2 text-xs font-bold text-ink-soft hover:border-gold"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Filtrlarni tozalash
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-12 lg:items-end">
        <fieldset className="space-y-2.5 lg:col-span-5">
          <legend className="field-label mb-2 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-gold" />
            Joylashuv va nom
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <select
              aria-label="Viloyat"
              value={draft.region}
              disabled={regionsLoading || regionsError}
              onChange={(e) =>
                setDraft((current) => ({
                  ...current,
                  region: e.target.value,
                  district: '',
                }))
              }
              className="select-lux"
            >
              <option value="">
                {regionsLoading ? 'Yuklanmoqda…' : 'Barcha viloyatlar'}
              </option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Tuman"
              value={draft.district}
              disabled={!draft.region || !districts.length}
              onChange={(e) => set('district', e.target.value)}
              className="select-lux"
            >
              <option value="">Barcha tumanlar</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
            <input
              aria-label="Joy nomi"
              type="search"
              placeholder="Qaysi joyni qidiryapsiz?"
              value={draft.search}
              onChange={(e) => set('search', e.target.value)}
              className="input-lux input-with-icon"
            />
          </div>
        </fieldset>
        <div className="lg:col-span-3">
          <label
            htmlFor="min-capacity"
            className="field-label flex items-center gap-1.5"
          >
            <Users className="h-4 w-4 text-gold" />
            Minimal sig‘im
          </label>
          <output
            htmlFor="min-capacity"
            className="mt-2 block text-sm font-bold text-gold-strong"
          >
            {draft.min_capacity ? `${draft.min_capacity} kishi` : 'Barchasi'}
          </output>
          <input
            id="min-capacity"
            type="range"
            min={0}
            max={1000}
            step={50}
            value={draft.min_capacity}
            onChange={(e) => set('min_capacity', Number(e.target.value))}
            className="mt-3 w-full accent-[var(--gold)]"
          />
          <div className="flex justify-between text-xs text-ink-soft">
            <span>0</span>
            <span>1000</span>
          </div>
        </div>
        <div className="lg:col-span-2">
          <label
            htmlFor="event-date"
            className="field-label mb-2 flex items-center gap-1.5"
          >
            <Calendar className="h-4 w-4 text-gold" />
            Tadbir sanasi
          </label>
          <input
            id="event-date"
            type="date"
            min={localDateString()}
            value={draft.date}
            onChange={(e) => set('date', e.target.value)}
            className="input-lux"
          />
        </div>
        <div className="lg:col-span-2">
          <button type="submit" className="btn-gold w-full">
            <span>Qidirish</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      {regionsError && (
        <div className="px-5 pb-5">
          <ErrorAlert
            message="Hududlar yuklanmadi. Nom yoki sig‘im bo‘yicha qidirishingiz mumkin."
            onRetry={onRetryRegions}
          />
        </div>
      )}
    </form>
  );
}
