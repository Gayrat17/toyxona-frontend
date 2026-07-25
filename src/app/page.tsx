'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchHallsRequest, fetchBarsRequest } from '@/services/venues';
import { Header } from '@/components/layout/header';
import { SearchBar } from '@/components/common/search-bar';
import { VenueCard } from '@/components/cards/venue-card';
import { SkeletonCardLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import { SlidersHorizontal, Hotel, Wine, Sparkles } from 'lucide-react';
import { WeddingHall, Bar, PaginatedResponse } from '@/types';

function HomeContent() {
  const searchParams = useSearchParams();

  // 1. Category state driven directly by URL (?category=halls | bars | all)
  const categoryParam = searchParams.get('category') || 'all';

  // 2. Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [minCapacity, setMinCapacity] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');

  // 3. Fetch halls and bars concurrently using React Query
  const { data: hallsRes, isLoading: loadingHalls, error: errorHalls, refetch: refetchHalls } = useQuery<PaginatedResponse<WeddingHall>>({
    queryKey: ['halls'],
    queryFn: () => fetchHallsRequest(1),
    staleTime: 0,
  });

  const { data: barsRes, isLoading: loadingBars, error: errorBars, refetch: refetchBars } = useQuery<PaginatedResponse<Bar>>({
    queryKey: ['bars'],
    queryFn: () => fetchBarsRequest(1),
    staleTime: 0,
  });

  const hallsList = hallsRes?.results || [];
  const barsList = barsRes?.results || [];
  
  // Combine & filter results based on URL category & filter controls
  let combinedList: (WeddingHall | Bar)[] = [];
  if (categoryParam === 'halls') {
    combinedList = hallsList;
  } else if (categoryParam === 'bars') {
    combinedList = barsList;
  } else {
    combinedList = [...hallsList, ...barsList];
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
  const isError = errorHalls || errorBars;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* 1. Global Header with URL Category Switcher */}
      <Header />

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 py-20 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-300 via-slate-900 to-slate-950" />
        <div className="mx-auto max-w-4xl px-4 text-center relative z-10 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Tadbiringiz uchun mukammal joy
          </h1>
          <p className="mx-auto max-w-xl text-base sm:text-lg text-slate-300">
            To&apos;yxonalarni smena bo&apos;yicha va barlarni soatbay oson qidirib toping, band qiling hamda tadbirlaringizni professional tashkillashtiring.
          </p>
        </div>
      </section>

      {/* 3. Refactored Search Bar Panel (Without Duplicate Category Switchers) */}
      <section className="mx-auto -mt-10 w-full max-w-6xl px-4 relative z-20">
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          minCapacity={minCapacity}
          setMinCapacity={setMinCapacity}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      </section>

      {/* 4. Catalog Grid Section */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Section title & count */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>Taklif etilayotgan joylar</span>
              {categoryParam === 'halls' && <span className="text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full">Faqat To&apos;yxonalar</span>}
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
        <p>&copy; {new Date().getFullYear()} TO&apos;YXONA B2B Platformasi. Barcha huquqlar himoyalangan.</p>
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
