'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchHallsRequest, fetchBarsRequest, fetchRegionsRequest } from '@/services/venues';
import { Header } from '@/components/layout/header';
import { SearchBar } from '@/components/common/search-bar';
import { VenueCard } from '@/components/cards/venue-card';
import { SkeletonCardLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import { SlidersHorizontal, Hotel, Wine, Sparkles } from 'lucide-react';
import { WeddingHall, Bar, PaginatedResponse, Region } from '@/types';

function HomeContent() {
  const searchParams = useSearchParams();

  // 1. Category state driven directly by URL (?category=halls | bars | all)
  const categoryParam = searchParams.get('category') || 'all';

  // 2. Filter states
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'halls' | 'bars'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minCapacity, setMinCapacity] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');

  const handleResetFilters = () => {
    setSelectedRegion('');
    setSelectedDistrict('');
    setSelectedCategory('all');
    setSearchQuery('');
    setMinCapacity(0);
    setSelectedDate('');
  };

  // 3. Fetch regions from backend API
  const { data: dbRegions = [] } = useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: fetchRegionsRequest,
    staleTime: 10 * 60 * 1000,
  });

  // 4. Fetch halls and bars concurrently from backend API with dynamic filter parameters
  const filterParams: Record<string, string | number> = {};
  if (selectedRegion) filterParams.region = selectedRegion;
  if (selectedDistrict) filterParams.district = selectedDistrict;
  if (searchQuery.trim()) filterParams.search = searchQuery.trim();
  if (minCapacity > 0) filterParams.min_capacity = minCapacity;

  const { data: hallsRes, isLoading: loadingHalls, error: errorHalls, refetch: refetchHalls } = useQuery<PaginatedResponse<WeddingHall>>({
    queryKey: ['halls', filterParams],
    queryFn: () => fetchHallsRequest(1, false, filterParams),
    staleTime: 0,
  });

  const { data: barsRes, isLoading: loadingBars, error: errorBars, refetch: refetchBars } = useQuery<PaginatedResponse<Bar>>({
    queryKey: ['bars', filterParams],
    queryFn: () => fetchBarsRequest(1, false, filterParams),
    staleTime: 0,
  });

  const hallsList = hallsRes?.results || [];
  const barsList = barsRes?.results || [];
  
  // Combine results based on Category selection (backend already filters by region, district, search, capacity)
  const activeCategory = selectedCategory !== 'all' ? selectedCategory : categoryParam;

  let combinedList: (WeddingHall | Bar)[] = [];
  if (activeCategory === 'halls') {
    combinedList = hallsList;
  } else if (activeCategory === 'bars') {
    combinedList = barsList;
  } else {
    combinedList = [...hallsList, ...barsList];
  }

  const isLoading = loadingHalls || loadingBars;
  const isError = errorHalls || errorBars;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* 1. Global Header with URL Category Switcher */}
      <Header />

      {/* 2. Hero Section with Light Animated Mesh Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-indigo-50/70 to-slate-100 dark:from-slate-950 dark:via-indigo-950/60 dark:to-slate-950 py-24 sm:py-32 transition-colors">
        {/* Animated Mesh Gradient Blobs Background (Light & Dark Variants) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Blob 1: Vibrant Indigo / Royal Blue */}
          <div className="animate-blob-1 absolute -top-16 -left-16 h-[420px] w-[420px] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-gradient-to-br from-indigo-500/75 via-blue-400/50 to-indigo-600/30 blur-[35px] border border-indigo-300/40 dark:from-indigo-600/80 dark:via-blue-800/70" />
          
          {/* Blob 2: Deep Purple / Violet */}
          <div className="animate-blob-2 absolute top-12 -right-16 h-[460px] w-[460px] rounded-[60%_40%_30%_70%/60%_30%_70%_40%] bg-gradient-to-br from-purple-600/75 via-violet-400/50 to-purple-700/30 blur-[35px] border border-purple-300/40 dark:from-purple-600/80 dark:via-purple-900/70" />

          {/* Blob 3: Warm Gold / Amber */}
          <div className="animate-blob-3 absolute -bottom-10 left-1/3 h-[360px] w-[360px] rounded-[50%_50%_40%_60%/40%_60%_50%_50%] bg-gradient-to-tr from-amber-400/80 via-yellow-300/60 to-amber-500/40 blur-[30px] border border-amber-300/50 dark:from-amber-500/70 dark:via-amber-700/50" />

          {/* Blob 4: Emerald / Mint Green */}
          <div className="animate-blob-4 absolute top-1/3 -left-10 h-[380px] w-[380px] rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-gradient-to-br from-emerald-400/75 via-teal-300/50 to-emerald-600/30 blur-[35px] border border-emerald-300/40 dark:from-emerald-600/70 dark:via-teal-800/50" />

          {/* Blob 5: Coral / Pink / Rose */}
          <div className="animate-blob-5 absolute bottom-10 right-10 h-[400px] w-[400px] rounded-[60%_40%_50%_50%/40%_60%_40%_60%] bg-gradient-to-tr from-rose-500/75 via-pink-400/50 to-rose-600/30 blur-[35px] border border-rose-300/40 dark:from-rose-600/70 dark:via-pink-900/50" />

          {/* Blob 6: Cyan / Sky Blue */}
          <div className="animate-blob-6 absolute -top-10 left-1/2 h-[340px] w-[340px] rounded-[55%_45%_35%_65%/45%_55%_65%_35%] bg-gradient-to-bl from-cyan-400/75 via-sky-300/50 to-blue-500/30 blur-[30px] border border-cyan-300/40 dark:from-cyan-500/70 dark:via-sky-800/50" />

          {/* Subtle Mask Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-white/50 dark:from-slate-950/30 dark:via-transparent dark:to-slate-950/80" />
        </div>

        {/* Hero Content with Marketing Typography & Value Props */}
        <div className="mx-auto max-w-4xl px-4 text-center relative z-10 space-y-6">
          
          {/* Marketing Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-4 py-1.5 text-xs sm:text-sm font-bold text-indigo-700 shadow-md backdrop-blur-md dark:border-indigo-800/80 dark:bg-slate-900/80 dark:text-indigo-300">
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
            <span>Eng sara restoran va barlar bitta platformada</span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] uppercase font-black text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
              Online Bron
            </span>
          </div>

          {/* Styled Hero Heading with Gradient Accent */}
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl text-slate-900 dark:text-white leading-[1.15]">
            Hayotingizdagi{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              muhim kunlar
            </span>{' '}
            uchun mukammal joy.
          </h1>

          {/* Subtitle with High-Converting Benefit Highlights */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg lg:text-xl text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
            Eng yaxshi restoran va barlarni osongina izlab toping.{' '}
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">O&apos;z vaqtingizni tejang</span>,{' '}
            <span className="font-extrabold text-purple-600 dark:text-purple-400">ishonchli bron qiling</span> va{' '}
            <span className="font-extrabold text-pink-600 dark:text-pink-400">bayramingizdan zavq oling</span>.
          </p>

          {/* Key Value Propositions / Trust Badges */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-extrabold text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 rounded-xl bg-white/70 dark:bg-slate-900/70 px-3.5 py-1.5 border border-slate-200/60 dark:border-slate-800/60 shadow-sm backdrop-blur-sm">
              <span className="text-emerald-500">✓</span>
              <span>100% Tasdiqlangan joylar</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-white/70 dark:bg-slate-900/70 px-3.5 py-1.5 border border-slate-200/60 dark:border-slate-800/60 shadow-sm backdrop-blur-sm">
              <span className="text-indigo-500">⚡</span>
              <span>1 daqiqada bron qilish</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-white/70 dark:bg-slate-900/70 px-3.5 py-1.5 border border-slate-200/60 dark:border-slate-800/60 shadow-sm backdrop-blur-sm">
              <span className="text-amber-500">⭐</span>
              <span>Smena va soatbay ijara</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Refactored Search Bar Panel (With Region, District & Category Filters) */}
      <section className="mx-auto -mt-10 w-full max-w-6xl px-4 relative z-20">
        <SearchBar
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          minCapacity={minCapacity}
          setMinCapacity={setMinCapacity}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dbRegions={dbRegions}
          onResetFilters={handleResetFilters}
        />
      </section>

      {/* 4. Catalog Grid Section */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Section title & count */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>Taklif etilayotgan joylar</span>
              {categoryParam === 'halls' && <span className="text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full">Faqat Restoranlar</span>}
              {categoryParam === 'bars' && <span className="text-xs font-semibold bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-2.5 py-0.5 rounded-full">Faqat Barlar</span>}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Jami {combinedList.length} ta joy topildi</p>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="text-xs font-medium">Filtrlash faol</span>
          </div>
        </div>

        {/* Error alert */}
        {isError && (
          <div className="mb-8">
            <ErrorAlert 
              message="Ma'lumotlarni yuklashda xatolik yuz berdi. Backend server ishga tushirilganini tekshiring." 
              onRetry={() => { refetchHalls(); refetchBars(); }} 
            />
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && <SkeletonCardLoader count={6} />}

        {/* Empty state */}
        {!isLoading && !isError && combinedList.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Sparkles className="h-12 w-12 text-slate-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Hech narsa topilmadi</h3>
            <p className="mt-1 text-sm text-slate-400">Qidiruv yoki filtr mezonlarini o&apos;zgartirib ko&apos;ring.</p>
          </div>
        )}

        {/* Venue catalog grid */}
        {!isLoading && !isError && combinedList.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {combinedList.map((venue) => {
              const isHall = 'max_capacity' in venue;
              return (
                <VenueCard
                  key={`${isHall ? 'hall' : 'bar'}-${venue.id}`}
                  venue={venue}
                />
              );
            })}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-950">
        <p>&copy; {new Date().getFullYear()} RESTORAN B2B Platformasi. Barcha huquqlar himoyalangan.</p>
      </footer>

    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<SkeletonCardLoader count={6} />}>
      <HomeContent />
    </Suspense>
  );
}
