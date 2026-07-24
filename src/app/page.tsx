'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHallsRequest, fetchBarsRequest } from '@/services/venues';
import { VenueCard } from '@/components/cards/venue-card';
import { useAuth } from '@/store/auth-context';
import Link from 'next/link';
import { Search, Users, SlidersHorizontal, Sparkles, Wine, Hotel, LogOut, User as UserIcon, LogIn } from 'lucide-react';
import { WeddingHall, Bar } from '@/types';

export default function Home() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [minCapacity, setMinCapacity] = useState(0);
  const [category, setCategory] = useState<'ALL' | 'HALL' | 'BAR'>('ALL');

  // Fetch halls and bars concurrently using React Query
  const { data: halls, isLoading: loadingHalls, error: errorHalls } = useQuery<WeddingHall[]>({
    queryKey: ['halls'],
    queryFn: fetchHallsRequest,
  });

  const { data: bars, isLoading: loadingBars, error: errorBars } = useQuery<Bar[]>({
    queryKey: ['bars'],
    queryFn: fetchBarsRequest,
  });

  // Client-side filtering logic
  const hallsList = halls || [];
  const barsList = bars || [];
  
  let combinedList: (WeddingHall | Bar)[] = [];
  if (category === 'ALL') {
    combinedList = [...hallsList, ...barsList];
  } else if (category === 'HALL') {
    combinedList = hallsList;
  } else {
    combinedList = barsList;
  }

  // Filter by search text (name or address)
  if (searchQuery.trim() !== '') {
    combinedList = combinedList.filter((v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Filter by capacity
  if (minCapacity > 0) {
    combinedList = combinedList.filter((v) => {
      const cap = 'max_capacity' in v ? v.max_capacity : v.capacity;
      return cap >= minCapacity;
    });
  }

  const isLoading = loadingHalls || loadingBars;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-6 w-6" />
            <span>TOYXO&apos;NA</span>
          </Link>

          {/* Navigation links (Tabs) */}
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => { setCategory('ALL'); setMinCapacity(0); }} 
              className={`text-sm font-semibold transition-colors ${category === 'ALL' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300'}`}
            >
              Barchasi
            </button>
            <button 
              onClick={() => { setCategory('HALL'); }}
              className={`text-sm font-semibold transition-colors flex items-center gap-1 ${category === 'HALL' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300'}`}
            >
              <Hotel className="h-4 w-4" /> To&apos;yxonalar
            </button>
            <button 
              onClick={() => { setCategory('BAR'); }}
              className={`text-sm font-semibold transition-colors flex items-center gap-1 ${category === 'BAR' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 hover:text-indigo-600 dark:text-slate-300'}`}
            >
              <Wine className="h-4 w-4" /> Barlar
            </button>
          </nav>

          {/* Auth Trigger Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  <span>{user.first_name || 'Foydalanuvchi'}</span>
                </div>
                <button
                  onClick={logout}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-900"
                  title="Chiqish"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
              >
                <LogIn className="h-4 w-4" />
                <span>Kirish</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-20 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-300 via-slate-900 to-slate-950" />
        <div className="mx-auto max-w-4xl px-4 text-center relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Tadbiringiz uchun mukammal joy
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
            To&apos;yxonalarni smena bo&apos;yicha va barlarni soatbay oson qidirib toping, band qiling hamda tadbirlaringizni professional tashkillashtiring.
          </p>
        </div>
      </section>

      {/* Filter and Search Panel */}
      <section className="mx-auto -mt-10 w-full max-w-6xl px-4 relative z-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/90 dark:backdrop-blur-md">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Search query input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Qidiruv
              </label>
              <div className="relative mt-2">
                <Search className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nom yoki manzil bo'yicha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Capacity filter slider */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Minimal Sig&apos;im
                </label>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {minCapacity === 0 ? "Barchasi" : `${minCapacity} kishi`}
                </span>
              </div>
              <div className="relative mt-4 flex items-center gap-3">
                <Users className="h-5 w-5 text-slate-400 shrink-0" />
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

            {/* Category tabs selector inside filters */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Kategoriya
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  onClick={() => setCategory('ALL')}
                  className={`rounded-lg py-2 text-xs font-semibold transition-all ${category === 'ALL' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}
                >
                  Hammasi
                </button>
                <button
                  onClick={() => setCategory('HALL')}
                  className={`rounded-lg py-2 text-xs font-semibold transition-all ${category === 'HALL' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}
                >
                  To&apos;yxona
                </button>
                <button
                  onClick={() => setCategory('BAR')}
                  className={`rounded-lg py-2 text-xs font-semibold transition-all ${category === 'BAR' ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}
                >
                  Bar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid Section */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Section title and summary count */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Taklif etilayotgan joylar</h2>
            <p className="text-sm text-slate-500 mt-1">Jami {combinedList.length} ta natija topildi</p>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-xs font-medium">Filtrlash faol</span>
          </div>
        </div>

        {/* Query Error prompt */}
        {(errorHalls || errorBars) && (
          <div className="rounded-xl bg-rose-500/10 p-4 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-center mb-8">
            <p className="font-semibold">Ma&apos;lumotlarni yuklashda xatolik yuz berdi.</p>
            <p className="text-xs mt-1">Backend server ishga tushirilganligini va ulanish to&apos;g&apos;ri sozlanganligini tekshiring.</p>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-pulse dark:border-slate-800 dark:bg-slate-950">
                <div className="h-48 w-full bg-slate-200 dark:bg-slate-800" />
                <div className="p-5 space-y-4">
                  <div className="h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="h-8 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-8 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : combinedList.length > 0 ? (
          // Grid layout displaying populated Venue Cards
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {combinedList.map((venue) => (
              <VenueCard key={`${'max_capacity' in venue ? 'hall' : 'bar'}-${venue.id}`} venue={venue} />
            ))}
          </div>
        ) : (
          // Empty State Prompt
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-900">
              <Search className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-white">Hech narsa topilmadi</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-xs">
              Siz kiritgan filtrlarga mos keladigan to&apos;yxona yoki bar topilmadi. Qidiruv so&apos;rovini o&apos;zgartirib ko&apos;ring.
            </p>
          </div>
        )}
      </main>

      {/* Footer bar */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Toyxona & Bar Booking. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}
