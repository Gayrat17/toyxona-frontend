'use client';

import React from 'react';
import { Search, MapPin, Users, Calendar, ArrowRight, Hotel, Wine, LayoutGrid, RotateCcw } from 'lucide-react';

import { Region, District } from '@/types';

interface SearchBarProps {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedCategory: 'all' | 'halls' | 'bars';
  setSelectedCategory: (category: 'all' | 'halls' | 'bars') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  minCapacity: number;
  setMinCapacity: (capacity: number) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dbRegions?: Region[];
  onResetFilters?: () => void;
  onSearchSubmit?: () => void;
}

export function SearchBar({
  selectedRegion,
  setSelectedRegion,
  selectedDistrict,
  setSelectedDistrict,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  minCapacity,
  setMinCapacity,
  selectedDate,
  setSelectedDate,
  dbRegions = [],
  onResetFilters,
  onSearchSubmit,
}: SearchBarProps) {
  const selectedRegionObj = React.useMemo(() => {
    if (!selectedRegion || !dbRegions.length) return null;
    return dbRegions.find((r) => String(r.id) === selectedRegion) || null;
  }, [selectedRegion, dbRegions]);

  const districts: District[] = selectedRegionObj?.districts || [];

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedRegion(val);
    setSelectedDistrict('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  const hasActiveFilters = Boolean(
    selectedRegion || selectedDistrict || searchQuery || minCapacity > 0 || selectedDate || selectedCategory !== 'all'
  );

  const categoryTabs = [
    { id: 'all' as const, label: 'Barchasi', icon: LayoutGrid },
    { id: 'halls' as const, label: 'To‘y zallari', icon: Hotel },
    { id: 'bars' as const, label: 'Barlar', icon: Wine },
  ];

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="card-lux overflow-hidden">
        {/* Concierge strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-gold-tint/60 px-5 py-3.5">
          <div className="flex items-center gap-1.5 rounded-full border border-line-strong bg-surface p-1">
            {categoryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-[#ecd49c] to-[#c9a35f] text-[#251b0c] shadow-[0_6px_14px_-6px_rgba(150,110,50,0.7)]'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {hasActiveFilters && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1.5 rounded-full border border-danger/30 bg-danger/5 px-3.5 py-1.5 text-xs font-bold text-danger transition-colors hover:bg-danger/10"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Filtrlarni tozalash</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-5 px-5 py-5 lg:grid-cols-12 lg:items-end">
          {/* Location + search text */}
          <div className="space-y-2.5 lg:col-span-5">
            <label className="field-label flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-gold" />
              <span>Joylashuv va nom</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedRegion}
                onChange={handleRegionChange}
                className="select-lux !py-2.5 !text-xs"
              >
                <option value="">Barcha viloyatlar</option>
                {dbRegions.map((region) => (
                  <option key={`r-${region.id}`} value={String(region.id)}>
                    {region.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedDistrict}
                disabled={!selectedRegion}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="select-lux !py-2.5 !text-xs"
              >
                <option value="">Barcha tumanlar</option>
                {districts.map((dist) => (
                  <option key={`d-${dist.id}`} value={String(dist.id)}>
                    {dist.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-gold" />
              <input
                type="text"
                placeholder="Qaysi zallarni qidiryapsiz?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-lux !py-2.5 pl-10 !text-xs"
              />
            </div>
          </div>

          {/* Capacity */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between">
              <label className="field-label flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-gold" />
                <span>Minimal sig‘im</span>
              </label>
              <span className="text-xs font-extrabold text-gold-strong">
                {minCapacity === 0 ? 'Barchasi' : `${minCapacity} kishi`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="50"
              value={minCapacity}
              onChange={(e) => setMinCapacity(parseInt(e.target.value))}
              className="mt-4 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line-strong accent-[var(--gold)]"
            />
            <div className="mt-1 flex justify-between text-[10px] font-bold text-ink-faint">
              <span>0</span>
              <span>500+</span>
            </div>
          </div>

          {/* Date */}
          <div className="lg:col-span-2">
            <label className="field-label mb-2.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gold" />
              <span>Tadbir sanasi</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-lux !py-2.5 !text-xs"
            />
          </div>

          {/* Submit */}
          <div className="lg:col-span-2">
            <button type="submit" className="btn-gold w-full">
              <span>Qidirish</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
