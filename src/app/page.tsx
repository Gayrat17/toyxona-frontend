'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/store/auth-context';
import { roleHome } from '@/utils/navigation';
import {
  readCatalogFilters,
  catalogSearchParams,
  EMPTY_FILTERS,
  type CatalogFilters,
} from '@/utils/catalog';
import { nextPageNumber } from '@/services/collections';
import { useSearchParams, useRouter } from 'next/navigation';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  fetchHallsRequest,
  fetchBarsRequest,
  fetchRegionsRequest,
} from '@/services/venues';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SearchBar } from '@/components/common/search-bar';
import { VenueCard } from '@/components/cards/venue-card';
import { SkeletonCardLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import {
  Search,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Hotel,
  Wine,
  CalendarCheck2,
} from 'lucide-react';

const STAR_LATTICE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'%3E%3Cg fill='none' stroke='%23cda964' stroke-width='1'%3E%3Crect x='26' y='26' width='32' height='32'/%3E%3Crect x='26' y='26' width='32' height='32' transform='rotate(45 42 42)'/%3E%3Ccircle cx='42' cy='42' r='4.5'/%3E%3C/g%3E%3C/svg%3E\")";

/* Ornamental divider: line — diamond — line */
function OrnamentDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/70" />
      <span className="h-2 w-2 rotate-45 border border-gold bg-transparent" />
      <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
      <span className="h-2 w-2 rotate-45 border border-gold bg-transparent" />
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/70" />
    </div>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { user } = useAuth();
  const filters = readCatalogFilters(searchParams);
  const categoryParam = filters.category;
  const handleSearch = (next: CatalogFilters) => {
    const params = catalogSearchParams(next);
    router.push(`/${params.size ? `?${params}` : ''}#katalog`, {
      scroll: false,
    });
    document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
  };
  const regionsQuery = useQuery({
    queryKey: ['regions'],
    queryFn: fetchRegionsRequest,
    staleTime: 300000,
  });
  const shouldFetchHalls = categoryParam !== 'bars';
  const shouldFetchBars = categoryParam !== 'halls';
  const filterParams = {
    region: filters.region || undefined,
    district: filters.district || undefined,
    search: filters.search || undefined,
    min_capacity: filters.min_capacity || undefined,
    date: filters.date || undefined,
  };
  const hallsQuery = useInfiniteQuery({
    queryKey: ['halls', filterParams],
    queryFn: ({ pageParam }) =>
      fetchHallsRequest(pageParam, false, filterParams),
    initialPageParam: 1,
    getNextPageParam: (last) => nextPageNumber(last.next),
    enabled: shouldFetchHalls,
  });
  const barsQuery = useInfiniteQuery({
    queryKey: ['bars', filterParams],
    queryFn: ({ pageParam }) =>
      fetchBarsRequest(pageParam, false, filterParams),
    initialPageParam: 1,
    getNextPageParam: (last) => nextPageNumber(last.next),
    enabled: shouldFetchBars,
  });
  const hallsList = shouldFetchHalls
    ? hallsQuery.data?.pages.flatMap((page) => page.results) || []
    : [];
  const barsList = shouldFetchBars
    ? barsQuery.data?.pages.flatMap((page) => page.results) || []
    : [];
  const combinedList = [...hallsList, ...barsList].filter(
    (venue, index, list) =>
      list.findIndex(
        (item) =>
          item.id === venue.id &&
          'max_capacity' in item === 'max_capacity' in venue,
      ) === index,
  );
  const totalCount =
    (shouldFetchHalls ? hallsQuery.data?.pages[0].count || 0 : 0) +
    (shouldFetchBars ? barsQuery.data?.pages[0].count || 0 : 0);
  const isLoading =
    (shouldFetchHalls && hallsQuery.isLoading) ||
    (shouldFetchBars && barsQuery.isLoading);
  const isError =
    (shouldFetchHalls && hallsQuery.isError) ||
    (shouldFetchBars && barsQuery.isError);
  const hasNextPage =
    (shouldFetchHalls && hallsQuery.hasNextPage) ||
    (shouldFetchBars && barsQuery.hasNextPage);
  const loadingMore =
    hallsQuery.isFetchingNextPage || barsQuery.isFetchingNextPage;
  const loadMore = () => {
    if (shouldFetchHalls && hallsQuery.hasNextPage)
      void hallsQuery.fetchNextPage();
    if (shouldFetchBars && barsQuery.hasNextPage)
      void barsQuery.fetchNextPage();
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper font-sans">
      <Header />

      {/* ============ HERO ============ */}
      <section className="texture-grain relative flex min-h-[640px] sm:min-h-[85svh] items-center overflow-hidden">
        {/* Backdrop photo */}
        <div className="absolute inset-0">
          <Image
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            src="/images/hero-hall.jpg"
            alt=""
            className="hero-zoom h-full w-full object-cover object-center"
          />
          {/* Espresso scrim stack */}
          <div className="absolute inset-0 bg-gradient-to-b from-espresso/80 via-espresso/60 to-espresso/95" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(16,11,5,0.55)_100%)]" />
        </div>

        {/* Star lattice ornament layer */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: STAR_LATTICE }}
        />

        {/* Content */}
        <div className="relative z-[2] mx-auto flex max-w-5xl flex-col items-center px-4 pb-36 pt-20 sm:pb-44 sm:pt-28 text-center sm:px-6">
          {/* Eyebrow ornament */}
          <div className="fade-in-soft flex items-center gap-3 text-gold">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/80" />
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-[#dfc58f]">
              O‘zbekistondagi eng sara zallar
            </span>
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/80" />
          </div>

          {/* Headline */}
          <h1 className="mt-7 font-display text-[2.6rem] font-medium leading-[1.08] text-[#f6efdd] sm:text-6xl lg:text-7xl">
            Hashamatli kunlaringiz
            <br />
            <span className="gold-text italic">shu yerdan boshlanadi</span>
          </h1>

          <p className="mt-6 max-w-2xl text-[15px] font-medium leading-relaxed text-[#cbbc9c] sm:text-lg">
            To‘y zallari, restoranlar va barlarning bo‘sh sanalarini bir joyda
            ko‘ring — bir necha daqiqada ishonchli bron qiling va bayramingizdan
            zavq oling.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a href="#katalog" className="btn-gold">
              <Search className="h-4 w-4" />
              <span>Zal tanlash</span>
            </a>
            <a
              href="#qanday-ishlaydi"
              className="flex items-center justify-center gap-2 rounded-full border border-gold/50 px-6 py-3 text-[13px] font-extrabold tracking-wide text-[#dfc58f] transition-all hover:border-gold hover:bg-gold/10"
            >
              <span>Qanday ishlaydi?</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Stats strip */}
          <div className="mt-14 grid w-full max-w-2xl grid-cols-3 divide-x divide-gold/25 rounded-2xl border border-gold/25 bg-espresso/40 py-5 backdrop-blur-md">
            {[
              { value: '01', label: 'Joy tanlang' },
              { value: '02', label: 'Sanani ko‘ring' },
              { value: '03', label: 'So‘rov yuboring' },
            ].map((s) => (
              <div key={s.label} className="px-2">
                <p className="font-display text-2xl font-bold text-[#dfc58f] sm:text-3xl">
                  {s.value}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c4b496] sm:text-[11px]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SEARCH PANEL (overlaps hero) ============ */}
      <section className="relative z-30 mx-auto -mt-24 w-full max-w-6xl px-4 sm:px-6">
        <SearchBar
          key={searchParams.toString()}
          filters={filters}
          regions={regionsQuery.data || []}
          regionsLoading={regionsQuery.isLoading}
          regionsError={regionsQuery.isError}
          onRetryRegions={() => {
            void regionsQuery.refetch();
          }}
          onSearch={handleSearch}
        />
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section
        id="qanday-ishlaydi"
        className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6"
      >
        <div className="text-center">
          <p className="eyebrow justify-center">Marosim tartibi</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
            Uch qadamda <span className="gold-text italic">band qilish</span>
          </h2>
          <OrnamentDivider className="mt-6" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            {
              n: 'I',
              title: 'Zalni tanlang',
              text: 'Sig‘im, joylashuv va nom bo‘yicha filtrlar yordamida o‘zingizga mos hashamatli joyni toping.',
              icon: Hotel,
            },
            {
              n: 'II',
              title: 'Sanani ko‘ring',
              text: 'Bandlik taqvimi orqali bo‘sh smena va soatlarni bir qarashda ko‘rib chiqing.',
              icon: CalendarCheck2,
            },
            {
              n: 'III',
              title: 'Bron qiling',
              text: 'So‘rov yuboring. Joy egasi bilan shartlarni va zakalat to‘lovini kelishib oling.',
              icon: ShieldCheck,
            },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.n}
                className="card-lux card-lux-hover relative p-7 text-center"
              >
                <span className="pointer-events-none absolute -top-1 right-4 font-display text-[64px] font-bold leading-none text-gold/15">
                  {step.n}
                </span>
                <span className="mx-auto flex h-12 w-12 rotate-45 items-center justify-center border border-gold/50 bg-gold-tint">
                  <Icon className="h-5 w-5 rotate-[-45deg] text-gold-strong" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                  {step.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ CATALOG ============ */}
      <main
        id="katalog"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mb-10 text-center">
          <p className="eyebrow justify-center">Katalog</p>
          <h2 className="mt-3 flex flex-wrap items-center justify-center gap-3 font-display text-3xl font-bold text-ink sm:text-4xl">
            <span>Siz uchun taklif etilgan joylar</span>
            {categoryParam === 'halls' && (
              <span className="badge-outline">Faqat to‘y zallari</span>
            )}
            {categoryParam === 'bars' && (
              <span className="badge-outline">Faqat barlar</span>
            )}
          </h2>
          <OrnamentDivider className="mt-6" />
          <p className="mt-5 text-sm font-semibold text-ink-faint">
            {isLoading ? (
              'Joylar yuklanmoqda…'
            ) : isError && !combinedList.length ? (
              'Natijalarni yuklab bo‘lmadi'
            ) : (
              <>
                Jami <span className="text-gold-strong">{totalCount}</span> ta
                joy topildi
              </>
            )}
          </p>
        </div>

        {isError && (
          <div className="mb-8">
            <ErrorAlert
              message="Ayrim joylarni yuklab bo‘lmadi. Iltimos, qayta urinib ko‘ring."
              onRetry={() => {
                if (shouldFetchHalls) void hallsQuery.refetch();
                if (shouldFetchBars) void barsQuery.refetch();
              }}
            />
          </div>
        )}

        {isLoading && <SkeletonCardLoader count={6} />}

        {!isLoading && !isError && combinedList.length === 0 && (
          <div className="card-lux mx-auto flex max-w-xl flex-col items-center px-8 py-14 text-center">
            <span className="flex h-14 w-14 rotate-45 items-center justify-center border border-gold/50 bg-gold-tint">
              <Sparkles className="h-6 w-6 rotate-[-45deg] text-gold-strong" />
            </span>
            <h3 className="mt-6 font-display text-xl font-bold text-ink">
              Hech narsa topilmadi
            </h3>
            <p className="mt-2 text-sm text-ink-soft">
              Qidiruv yoki filtr mezonlarini o‘zgartirib ko‘ring.
            </p>
            <button
              type="button"
              onClick={() => handleSearch(EMPTY_FILTERS)}
              className="btn-outline mt-5"
            >
              Filtrlarni tozalash
            </button>
          </div>
        )}

        {combinedList.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {combinedList.map((venue) => {
              const isHall = 'max_capacity' in venue;
              return (
                <VenueCard
                  key={`${isHall ? 'hall' : 'bar'}-${venue.id}`}
                  venue={venue}
                  date={filters.date}
                />
              );
            })}
          </div>
        )}
        {hasNextPage && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="btn-outline"
            >
              {loadingMore ? 'Yuklanmoqda…' : 'Yana ko‘rsatish'}
            </button>
            <p className="mt-3 text-xs text-ink-soft">
              {totalCount} ta joydan {combinedList.length} tasi ko‘rsatilmoqda
            </p>
          </div>
        )}
      </main>

      {/* ============ OWNER CTA BAND ============ */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="texture-grain panel-dark relative overflow-hidden px-8 py-14 text-center sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: STAR_LATTICE }}
          />
          <div className="relative z-[2]">
            <p className="eyebrow justify-center !text-gold">
              Joy egasizmisiz?
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-[#f2e9d6] sm:text-4xl">
              Zalingizni minglab juftliklarga{' '}
              <span className="gold-text italic">tavsiya eting</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#b7a888]">
              To‘yxona yoki baringizni platformaga qo‘shing — bronlar, taqvim va
              mijozlar bilan ishlashni bitta panelda boshqaring.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href={user ? roleHome(user.role) : '/register?role=VENUE_OWNER'}
                className="btn-gold"
              >
                <Wine className="h-4 w-4" />
                <span>
                  {user?.role === 'CLIENT'
                    ? 'Joylarni ko‘rish'
                    : 'Joy qo‘shishni boshlash'}
                </span>
              </Link>
              <Link
                href={user ? roleHome(user.role) : '/login'}
                className="flex items-center justify-center gap-2 rounded-full border border-gold/40 px-6 py-3 text-[13px] font-extrabold text-[#dfc58f] transition-colors hover:border-gold hover:bg-gold/10"
              >
                <span>Panelga kirish</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
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
