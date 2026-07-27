'use client';

import React from 'react';
import { Search, MapPin, Users, Calendar, ArrowRight, Hotel, Wine, LayoutGrid, RotateCcw } from 'lucide-react';

import { Region } from '@/types';

export const UZ_REGIONS: Record<string, string[]> = {
  "Toshkent shahri": ["Yunusobod", "Chilonzor", "Mirzo Ulug'bek", "Yakkasaroy", "Mirobod", "Shayxontohur", "Olmazor", "Sergeli", "Yashnobod"],
  "Toshkent viloyati": ["Keles", "Chirchiq", "Olmaliq", "Angren", "Yangiyo'l", "Qibray", "Zangiota"],
  "Samarqand": ["Samarqand sh.", "Pastdarg'om", "Jomboy", "Toyloq", "Kattaqo'rg'on"],
  "Buxoro": ["Buxoro sh.", "G'ijduvon", "Kogon", "Romitsh"],
  "Farg'ona": ["Farg'ona sh.", "Marg'ilon", "Qo'qon", "Oltiariq"],
  "Namangan": ["Namangan sh.", "Chust", "Pop", "Kosonsoy"],
  "Andijon": ["Andijon sh.", "Asaka", "Shahrixon", "Xo'jaobod"],
};

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
  dbRegions,
  onResetFilters,
  onSearchSubmit,
}: SearchBarProps) {
  // Derive regions & districts from backend API or fallback to static list
  const regionsMap: Record<string, string[]> = React.useMemo(() => {
    if (dbRegions && dbRegions.length > 0) {
      const map: Record<string, string[]> = {};
      dbRegions.forEach((r) => {
        map[r.name] = (r.districts || []).map((d) => d.name);
      });
      return map;
    }
    return UZ_REGIONS;
  }, [dbRegions]);

  const districts = selectedRegion && regionsMap[selectedRegion] ? regionsMap[selectedRegion] : [];

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

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-2xl backdrop-blur-2xl dark:border-slate-800/90 dark:bg-slate-900/95 transition-all space-y-4">
        
        {/* Top Control Bar: Category Switcher & Filter Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          
          {/* Category Tabs (Barchasi, Restoranlar, Barlar) */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100/90 p-1 dark:bg-slate-800/90">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Barchasi</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('halls')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                selectedCategory === 'halls'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Hotel className="h-3.5 w-3.5 text-emerald-500" />
              <span>Restoranlar</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('bars')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
                selectedCategory === 'bars'
                  ? 'bg-white text-pink-600 shadow-sm dark:bg-slate-700 dark:text-pink-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Wine className="h-3.5 w-3.5 text-pink-500" />
              <span>Barlar</span>
            </button>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Filtrlarni tozalash</span>
            </button>
          )}
        </div>

        {/* Main Grid Filters */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
          
          {/* Part 1: Joy yoki Manzil (Region, District & Text Search) */}
          <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800/80 pb-3 lg:pb-0 lg:pr-4 space-y-2">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <MapPin className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span>Joy yoki Manzil (Viloyat va Tuman)</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {/* Region (Viloyat) Select */}
              <select
                value={selectedRegion}
                onChange={handleRegionChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 px-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Barcha viloyatlar</option>
                {Object.keys(regionsMap).map((reg) => (
                  <option key={`r-${reg}`} value={reg}>{reg}</option>
                ))}
              </select>

              {/* District (Tuman) Select */}
              <select
                value={selectedDistrict}
                disabled={!selectedRegion}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 px-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Barcha tumanlar</option>
                {districts.map((dist) => (
                  <option key={`d-${dist}`} value={dist}>{dist}</option>
                ))}
              </select>
            </div>

            {/* Qidiruv Input (Nomi bo'yicha) */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Qaysi restoran yoki barni qidiryapsiz?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700/80 dark:bg-slate-800/50 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Part 2: Minimal Sig'im (Slider) */}
          <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800/80 pb-3 lg:pb-0 lg:px-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <Users className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>Minimal Sig&apos;im</span>
              </label>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                {minCapacity === 0 ? "Barchasi" : `${minCapacity} kishi`}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="500"
                step="50"
                value={minCapacity}
                onChange={(e) => setMinCapacity(parseInt(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-700 accent-indigo-600"
              />
            </div>
          </div>

          {/* Part 3: Qachonga (Date Picker) */}
          <div className="lg:col-span-2 border-b lg:border-b-0 border-slate-100 dark:border-slate-800/80 pb-3 lg:pb-0 lg:px-4">
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span>Tadbir Sanasi</span>
            </label>
            <div className="relative mt-2 flex items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 py-2 px-3 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Action Button: Qidirish */}
          <div className="lg:col-span-2 flex justify-end">
            <button
              type="submit"
              className="w-full h-11 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Qidirish</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

        </div>
      </div>
    </form>
  );
}
