'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOwnerVenues } from '@/hooks/useOwnerVenues';
import { SkeletonCardLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import { 
  Hotel, Wine, MapPin, Users, DollarSign, ChevronLeft, ChevronRight, Plus, ArrowRight, RefreshCw 
} from 'lucide-react';
import { getMediaUrl } from '@/utils/media';

function getVenueCover(venue: any): string | null {
  if (venue.cover_image_url) return getMediaUrl(venue.cover_image_url);
  if (venue.cover_image) return getMediaUrl(venue.cover_image);
  if (venue.gallery_images && venue.gallery_images.length > 0) {
    const first = venue.gallery_images[0];
    const url = first.image_url || first.image;
    if (url) return getMediaUrl(url);
  }
  return null;
}

function OwnerVenuesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Read URL params (?tab=halls&page=1)
  const tabParam = searchParams.get('tab');
  const activeTab: 'halls' | 'bars' = tabParam === 'bars' ? 'bars' : 'halls';
  
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  // 2. Fetch server-side paginated data using TanStack Query
  const { 
    halls, 
    bars, 
    count, 
    totalPages, 
    isLoading, 
    isFetching, 
    isError, 
    error, 
    refetchHalls, 
    refetchBars 
  } = useOwnerVenues(activeTab, currentPage);

  // 3. Helper to update URL params cleanly
  const updateUrlParams = (newTab: 'halls' | 'bars', newPage: number) => {
    const params = new URLSearchParams();
    params.set('tab', newTab);
    params.set('page', newPage.toString());
    router.push(`/dashboard/venues?${params.toString()}`);
  };

  const handleTabChange = (newTab: 'halls' | 'bars') => {
    if (newTab !== activeTab) {
      updateUrlParams(newTab, 1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateUrlParams(activeTab, newPage);
    }
  };

  const activeList = activeTab === 'halls' ? halls : bars;

  return (
    <div className="space-y-8">
      
      {/* Top Controls: Tabs & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3 bg-slate-200/60 dark:bg-slate-900 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => handleTabChange('halls')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'halls'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Hotel className="h-4 w-4" />
            <span>To&apos;yxonalar</span>
          </button>

          <button
            onClick={() => handleTabChange('bars')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'bars'
                ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wine className="h-4 w-4" />
            <span>Barlar / Lounge</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Background Fetching Spinner */}
          {isFetching && !isLoading && (
            <span className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold animate-pulse">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Yuklanmoqda...
            </span>
          )}

          <Link
            href="/dashboard/add"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors w-fit"
          >
            <Plus className="h-4 w-4" />
            <span>Yangi joy qo&apos;shish</span>
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <SkeletonCardLoader count={4} />}

      {/* Error State */}
      {isError && (
        <ErrorAlert 
          message={error instanceof Error ? error.message : "Serverdan ma'lumotlarni yuklashda xatolik yuz berdi."}
          onRetry={() => { activeTab === 'halls' ? refetchHalls() : refetchBars(); }} 
        />
      )}

      {/* Empty State */}
      {!isLoading && !isError && activeList.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-4">
            {activeTab === 'halls' ? <Hotel className="h-8 w-8" /> : <Wine className="h-8 w-8" />}
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Hozircha hech narsa topilmadi
          </h3>
          <p className="mt-1 text-sm text-slate-400 max-w-md">
            Sizda hali {activeTab === 'halls' ? "to'yxonalar" : "barlar"} ro&apos;yxati yaratilmagan.
          </p>
          <Link
            href="/dashboard/add"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            <span>Yangi joy qo&apos;shish</span>
          </Link>
        </div>
      )}

      {/* Cards List */}
      {!isLoading && !isError && activeList.length > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {activeTab === 'halls'
              ? (halls as any[]).map((hall) => (
                  <Link
                    key={`hall-${hall.id}`}
                    href={`/dashboard/venues/halls/${hall.id}`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-500 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                  >
                    {getVenueCover(hall) ? (
                      <div className="h-44 w-full overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                        <img 
                          src={getVenueCover(hall)!} 
                          alt={hall.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="h-32 w-full overflow-hidden relative bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-100 dark:from-indigo-950/40 dark:to-slate-900 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs">
                          <Hotel className="h-6 w-6 opacity-60" />
                          <span>Rasm yuklanmagan</span>
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          <Hotel className="h-3.5 w-3.5" /> To&apos;yxona
                        </span>
                        <span className="text-xs font-semibold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-1 transition-colors">
                          Batafsil <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <h4 className="mt-3 text-xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {hall.name}
                      </h4>
                      <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" /> {hall.address}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-1.5 border border-slate-100 dark:border-slate-700">
                          <Users className="h-4 w-4 text-indigo-500" /> Sig&apos;im: {hall.max_capacity} kishi
                        </span>
                        <span className="flex items-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-1.5 border border-slate-100 dark:border-slate-700">
                          <DollarSign className="h-4 w-4 text-emerald-500" /> Zakalat: {parseFloat(hall.required_deposit).toLocaleString()} UZS
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              : (bars as any[]).map((bar) => (
                  <Link
                    key={`bar-${bar.id}`}
                    href={`/dashboard/venues/bars/${bar.id}`}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-pink-500 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                  >
                    {getVenueCover(bar) ? (
                      <div className="h-44 w-full overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                        <img 
                          src={getVenueCover(bar)!} 
                          alt={bar.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="h-32 w-full overflow-hidden relative bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-slate-100 dark:from-pink-950/40 dark:to-slate-900 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-pink-400 font-medium text-xs">
                          <Wine className="h-6 w-6 opacity-60" />
                          <span>Rasm yuklanmagan</span>
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <span className="inline-flex items-center gap-1 rounded-md bg-pink-50 dark:bg-pink-950 px-2.5 py-1 text-xs font-bold text-pink-600 dark:text-pink-400">
                          <Wine className="h-3.5 w-3.5" /> Bar / Lounge
                        </span>
                        <span className="text-xs font-semibold text-slate-400 group-hover:text-pink-600 dark:group-hover:text-pink-400 flex items-center gap-1 transition-colors">
                          Batafsil <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <h4 className="mt-3 text-xl font-bold text-slate-800 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {bar.name}
                      </h4>
                      <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" /> {bar.address}
                      </p>

                      <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-4 text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-1.5 border border-slate-100 dark:border-slate-700">
                          <Users className="h-4 w-4 text-indigo-500" /> Sig&apos;im: {bar.capacity} kishi
                        </span>
                        <span className="flex items-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-1.5 border border-slate-100 dark:border-slate-700">
                          <DollarSign className="h-4 w-4 text-amber-500" /> Soatbay: {parseFloat(bar.price_per_hour).toLocaleString()} UZS
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>

          {/* Server-Side Pagination Bar */}
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
            <p className="text-xs text-slate-500">
              Jami ob&apos;ektlar: <span className="font-bold text-slate-800 dark:text-white">{count} ta</span> (Sahifa <span className="font-bold text-slate-800 dark:text-white">{currentPage}</span> / {totalPages})
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isFetching}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                <ChevronLeft className="h-4 w-4" /> Oldingi
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => handlePageChange(pageNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isFetching}
                className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                Keyingi <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function OwnerVenuesPage() {
  return (
    <Suspense fallback={<SkeletonCardLoader count={4} />}>
      <OwnerVenuesContent />
    </Suspense>
  );
}
