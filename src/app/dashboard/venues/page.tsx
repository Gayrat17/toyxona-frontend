'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOwnerVenues } from '@/hooks/useOwnerVenues';
import { SkeletonCardLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import {
  Hotel,
  Wine,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { getVenueCover } from '@/utils/media';
import { MediaImage } from '@/components/common/media-image';
import { getErrorMessage } from '@/utils/errors';

function OwnerVenuesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab');
  const activeTab: 'halls' | 'bars' = tabParam === 'bars' ? 'bars' : 'halls';

  const pageParam = Number(searchParams.get('page') || '1');
  const currentPage =
    !Number.isSafeInteger(pageParam) || pageParam < 1 ? 1 : pageParam;

  const {
    halls,
    bars,
    count,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isFetching,
    isError,
    error,
    refetchHalls,
    refetchBars,
  } = useOwnerVenues(activeTab, currentPage);

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
    if (newPage >= 1) {
      updateUrlParams(activeTab, newPage);
    }
  };

  const activeList = activeTab === 'halls' ? halls : bars;

  return (
    <div className="space-y-8">
      {/* Top controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex w-fit max-w-full flex-wrap items-center gap-1.5 rounded-full border border-line bg-surface p-1.5">
          <button
            aria-pressed={activeTab === 'halls'}
            onClick={() => handleTabChange('halls')}
            className={`flex items-center gap-2 rounded-full px-3 py-2.5 sm:px-5 text-[13px] font-extrabold transition-all ${
              activeTab === 'halls'
                ? 'bg-gradient-to-br from-[#ecd49c] to-[#c9a35f] text-[#251b0c] shadow-[0_8px_18px_-8px_rgba(150,110,50,0.7)]'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            <Hotel className="h-4 w-4" />
            <span>To‘y zallari</span>
          </button>

          <button
            aria-pressed={activeTab === 'bars'}
            onClick={() => handleTabChange('bars')}
            className={`flex items-center gap-2 rounded-full px-3 py-2.5 sm:px-5 text-[13px] font-extrabold transition-all ${
              activeTab === 'bars'
                ? 'bg-gradient-to-br from-[#ecd49c] to-[#c9a35f] text-[#251b0c] shadow-[0_8px_18px_-8px_rgba(150,110,50,0.7)]'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            <Wine className="h-4 w-4" />
            <span>Barlar / Lounge</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {isFetching && !isLoading && (
            <span className="flex animate-pulse items-center gap-1.5 text-xs font-bold text-gold-strong">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Yuklanmoqda...
            </span>
          )}

          <Link href="/dashboard/add" className="btn-gold !py-2.5 !text-[13px]">
            <Plus className="h-4 w-4" />
            <span>Yangi joy qo&apos;shish</span>
          </Link>
        </div>
      </div>

      {/* Loading */}
      {isLoading && <SkeletonCardLoader count={4} />}

      {/* Error */}
      {isError && (
        <ErrorAlert
          message={getErrorMessage(error, 'Joylar ro‘yxatini yuklab bo‘lmadi.')}
          onRetry={() => {
            if (activeTab === 'halls') void refetchHalls();
            else void refetchBars();
          }}
        />
      )}

      {isError && currentPage > 1 && (
        <button
          type="button"
          onClick={() => updateUrlParams(activeTab, 1)}
          className="btn-outline"
        >
          Birinchi sahifaga qaytish
        </button>
      )}
      {/* Empty */}
      {!isLoading && !isError && activeList.length === 0 && (
        <div className="card-lux flex flex-col items-center p-12 text-center">
          <span className="flex h-16 w-16 rotate-45 items-center justify-center border border-gold/50 bg-gold-tint">
            {activeTab === 'halls' ? (
              <Hotel className="h-7 w-7 rotate-[-45deg] text-gold-strong" />
            ) : (
              <Wine className="h-7 w-7 rotate-[-45deg] text-gold-strong" />
            )}
          </span>
          <h3 className="mt-6 font-display text-xl font-bold text-ink">
            Hozircha hech narsa yo&apos;q
          </h3>
          <p className="mt-2 max-w-md text-sm text-ink-soft">
            Sizda hali {activeTab === 'halls' ? "to'y zallari" : 'barlar'}{' '}
            ro&apos;yxati yaratilmagan. Birinchi joyni qo&apos;shib, bron qabul
            qilishni boshlang.
          </p>
          <Link href="/dashboard/add" className="btn-gold mt-7">
            <Plus className="h-4 w-4" />
            <span>Yangi joy qo&apos;shish</span>
          </Link>
        </div>
      )}

      {/* Cards */}
      {!isLoading && !isError && activeList.length > 0 && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {activeTab === 'halls'
              ? halls.map((hall, index) => (
                  <Link
                    key={`hall-${hall.id}`}
                    href={`/dashboard/venues/halls/${hall.id}`}
                    className="card-lux card-lux-hover group block overflow-hidden"
                  >
                    {getVenueCover(hall) ? (
                      <div className="relative h-44 w-full overflow-hidden">
                        <MediaImage
                          src={getVenueCover(hall)!}
                          alt={hall.name}
                          priority={index === 0}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="pattern-weave flex h-32 w-full items-center justify-center border-b border-line bg-surface-2/60">
                        <span className="flex items-center gap-2 text-xs font-bold text-ink-faint">
                          <Hotel className="h-5 w-5 text-gold" /> Rasm
                          yuklanmagan
                        </span>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <span className="badge-gold">
                          <Hotel className="h-3 w-3" /> To&apos;y zali
                        </span>
                        <span className="flex items-center gap-1 text-xs font-extrabold text-ink-faint transition-colors group-hover:text-gold-strong">
                          Batafsil <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <h4 className="mt-3 font-display text-xl font-bold text-ink transition-colors group-hover:text-gold-strong">
                        {hall.name}
                      </h4>
                      <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink-faint">
                        <MapPin className="h-4 w-4 shrink-0 text-gold" />{' '}
                        {hall.address}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3 border-t border-dashed border-line pt-4 text-xs font-bold text-ink-soft">
                        <span className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-3 py-1.5">
                          <Users className="h-4 w-4 text-gold" /> Sig&apos;im:{' '}
                          {hall.max_capacity} kishi
                        </span>
                        <span className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-3 py-1.5">
                          Zakalat:{' '}
                          {parseFloat(hall.required_deposit).toLocaleString(
                            'uz-UZ',
                          )}{' '}
                          UZS
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              : bars.map((bar, index) => (
                  <Link
                    key={`bar-${bar.id}`}
                    href={`/dashboard/venues/bars/${bar.id}`}
                    className="card-lux card-lux-hover group block overflow-hidden"
                  >
                    {getVenueCover(bar) ? (
                      <div className="relative h-44 w-full overflow-hidden">
                        <MediaImage
                          src={getVenueCover(bar)!}
                          alt={bar.name}
                          priority={index === 0}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="pattern-weave flex h-32 w-full items-center justify-center border-b border-line bg-surface-2/60">
                        <span className="flex items-center gap-2 text-xs font-bold text-ink-faint">
                          <Wine className="h-5 w-5 text-gold" /> Rasm
                          yuklanmagan
                        </span>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <span className="badge-gold">
                          <Wine className="h-3 w-3" /> Bar / Lounge
                        </span>
                        <span className="flex items-center gap-1 text-xs font-extrabold text-ink-faint transition-colors group-hover:text-gold-strong">
                          Batafsil <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                      <h4 className="mt-3 font-display text-xl font-bold text-ink transition-colors group-hover:text-gold-strong">
                        {bar.name}
                      </h4>
                      <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink-faint">
                        <MapPin className="h-4 w-4 shrink-0 text-gold" />{' '}
                        {bar.address}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3 border-t border-dashed border-line pt-4 text-xs font-bold text-ink-soft">
                        <span className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-3 py-1.5">
                          <Users className="h-4 w-4 text-gold" /> Sig&apos;im:{' '}
                          {bar.capacity} kishi
                        </span>
                        <span className="flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-3 py-1.5">
                          Soatbay:{' '}
                          {parseFloat(bar.price_per_hour).toLocaleString(
                            'uz-UZ',
                          )}{' '}
                          UZS
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
            <p className="text-xs font-bold text-ink-faint">
              Jami: <span className="text-ink">{count} ta</span> · Sahifa{' '}
              <span className="text-ink">{currentPage}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPreviousPage || isFetching}
                className="flex items-center gap-1 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-extrabold text-ink-soft transition-all hover:border-gold/60 hover:text-gold-strong disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Oldingi
              </button>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage || isFetching}
                className="flex items-center gap-1 rounded-full border border-line bg-surface px-3.5 py-2 text-xs font-extrabold text-ink-soft transition-all hover:border-gold/60 hover:text-gold-strong disabled:cursor-not-allowed disabled:opacity-40"
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
