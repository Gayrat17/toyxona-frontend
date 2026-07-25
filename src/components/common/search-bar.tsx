'use client';

import React from 'react';
import { Search, Users, Calendar, ArrowRight } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  minCapacity: number;
  setMinCapacity: (capacity: number) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onSearchSubmit?: () => void;
}

export function SearchBar({
  searchQuery,
  setSearchQuery,
  minCapacity,
  setMinCapacity,
  selectedDate,
  setSelectedDate,
  onSearchSubmit,
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/95 transition-all">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
          
          {/* Part 1: Nom yoki manzil bo'yicha qidiruv */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-3 lg:pb-0 lg:pr-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Joy yoki Manzil
            </label>
            <div className="relative mt-1 flex items-center">
              <Search className="absolute left-3 h-5 w-5 text-indigo-500 shrink-0" />
              <input
                type="text"
                placeholder="Qaysi to'yxona yoki barni qidiryapsiz?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border-0 bg-transparent py-2 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none dark:text-slate-100 font-semibold"
              />
            </div>
          </div>

          {/* Part 2: Minimal Sig'im (Slider) */}
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 pb-3 lg:pb-0 lg:px-4">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Minimal Sig&apos;im
              </label>
              <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                {minCapacity === 0 ? "Barchasi" : `${minCapacity} kishi`}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <Users className="h-5 w-5 text-indigo-500 shrink-0" />
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
          <div className="lg:col-span-3 border-b lg:border-b-0 border-slate-100 dark:border-slate-800 pb-3 lg:pb-0 lg:px-4">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tadbir Sanasi
            </label>
            <div className="relative mt-1 flex items-center">
              <Calendar className="absolute left-3 h-5 w-5 text-indigo-500 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full rounded-xl border-0 bg-transparent py-1.5 pl-10 pr-3 text-sm font-semibold text-slate-800 focus:outline-none dark:text-slate-100"
              />
            </div>
          </div>

          {/* Action Button: Qidirish */}
          <div className="lg:col-span-1 flex justify-end">
            <button
              type="submit"
              className="w-full lg:w-auto h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
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
