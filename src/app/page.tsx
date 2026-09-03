'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchHallsRequest, fetchBarsRequest, fetchRegionsRequest } from '@/services/venues';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SearchBar } from '@/components/common/search-bar';
import { VenueCard } from '@/components/cards/venue-card';
import { SkeletonCardLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import { Search, ShieldCheck, Sparkles, ArrowRight, Hotel, Wine, CalendarCheck2 } from 'lucide-react';
import { WeddingHall, Bar, PaginatedResponse, Region } from '@/types';

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

  const categoryParam = searchParams.get('category') || 'all';

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

  const { data: dbRegions = [] } = useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: fetchRegionsRequest,
    staleTime: 0,
  });

  const activeCategory = selectedCategory !== 'all' ? selectedCategory : categoryParam;

  const filterParams: Record<string, string | number> = {};
  if (selectedRegion) filterParams.region = selectedRegion;
  if (selectedDistrict) filterParams.district = selectedDistrict;
  if (searchQuery.trim()) filterParams.search = searchQuery.trim();
  if (minCapacity > 0) filterParams.min_capacity = minCapacity;

  const shouldFetchHalls = activeCategory === 'all' || activeCategory === 'halls';
  const shouldFetchBars = activeCategory === 'all' || activeCategory === 'bars';

  const { data: hallsRes, isLoading: loadingHalls, error: errorHalls, refetch: refetchHalls } = useQuery<
    PaginatedResponse<WeddingHall>
  >({
    queryKey: ['halls', filterParams, activeCategory],
    queryFn: () => fetchHallsRequest(1, false, filterParams),
    staleTime: 0,
    enabled: shouldFetchHalls,
  });

  const { data: barsRes, isLoading: loadingBars, error: errorBars, refetch: refetchBars } = useQuery<
    PaginatedResponse<Bar>
  >({
    queryKey: ['bars', filterParams, activeCategory],
    queryFn: () => fetchBarsRequest(1, false, filterParams),
    staleTime: 0,
    enabled: shouldFetchBars,
  });

  const hallsList = hallsRes?.results || [];
  const barsList = barsRes?.results || [];

  let combinedList: (WeddingHall | Bar)[] = [];
  if (activeCategory === 'halls') {
    combinedList = hallsList;
  } else if (activeCategory === 'bars') {
    combinedList = barsList;
  } else {
    combinedList = [...hallsList, ...barsList];
  }

  const isLoading = (shouldFetchHalls && loadingHalls) || (shouldFetchBars && loadingBars);
  const isError = errorHalls || errorBars;

  return (
    <div className="flex min-h-screen flex-col bg-paper font-sans">
      <Header />

      {/* ============ HERO ============ */}
      <section className="texture-grain relative flex min-h-[92vh] items-center overflow-hidden">
        {/* Backdrop photo */}
        <div className="absolute inset-0">
          <img
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
        <div className="relative z-[2] mx-auto flex max-w-5xl flex-col items-center px-4 pb-44 pt-44 text-center sm:px-6">
          {/* Eyebrow ornament */}
          <div className="fade-in-soft flex items-center gap-3 text-gold">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/80" />
            <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-gold-soft">
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
            To‘y zallari, restoranlar va barlarning bo‘sh sanalarini bir joyda ko‘ring —
            bir necha daqiqada ishonchli bron qiling va bayramingizdan zavq oling.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a href="#katalog" className="btn-gold">
              <Search className="h-4 w-4" />
              <span>Zal tanlash</span>
            </a>
            <a
              href="#qanday-ishlaydi"
              className="flex items-center justify-center gap-2 rounded-full border border-gold/50 px-6 py-3 text-[13px] font-extrabold tracking-wide text-gold-soft transition-all hover:border-gold hover:bg-gold/10"
            >
              <span>Qanday ishlaydi?</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Stats strip */}
          <div className="mt-14 grid w-full max-w-2xl grid-cols-3 divide-x divide-gold/25 rounded-2xl border border-gold/25 bg-espresso/40 py-5 backdrop-blur-md">
            {[
              { value: '120+', label: 'Sara zallar' },
              { value: '15', label: 'Viloyatlar' },
              { value: '4 000+', label: 'Xursand juftliklar' },
            ].map((s) => (
              <div key={s.label} className="px-2">
                <p className="font-display text-2xl font-bold text-gold-soft sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9d8e6e] sm:text-[11px]">
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

      {/* ============ HOW IT WORKS ============ */}
      <section id="qanday-ishlaydi" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6">
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
              text: 'Sig‘im, joylashuv va narh bo‘yicha filtrlar yordamida o‘zingizga mos hashamatli joyni toping.',
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
              text: 'Zakalatni to‘lab, so‘rovingizni yuboring — egasi tez orada tasdiqlaydi.',
              icon: ShieldCheck,
            },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.n} className="card-lux card-lux-hover relative p-7 text-center">
                <span className="pointer-events-none absolute -top-1 right-4 font-display text-[64px] font-bold leading-none text-gold/15">
                  {step.n}
                </span>
                <span className="mx-auto flex h-12 w-12 rotate-45 items-center justify-center border border-gold/50 bg-gold-tint">
                  <Icon className="h-5 w-5 rotate-[-45deg] text-gold-strong" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{step.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ CATALOG ============ */}
      <main id="katalog" className="mx-auto w-full max-w-7xl flex-1 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="eyebrow justify-center">Katalog</p>
          <h2 className="mt-3 flex flex-wrap items-center justify-center gap-3 font-display text-3xl font-bold text-ink sm:text-4xl">
            <span>Siz uchun taklif etilgan joylar</span>
            {categoryParam === 'halls' && <span className="badge-outline">Faqat to‘y zallari</span>}
            {categoryParam === 'bars' && <span className="badge-outline">Faqat barlar</span>}
          </h2>
          <OrnamentDivider className="mt-6" />
          <p className="mt-5 text-sm font-semibold text-ink-faint">
            Jami <span className="text-gold-strong">{combinedList.length}</span> ta joy topildi
          </p>
        </div>

        {isError && (
          <div className="mb-8">
            <ErrorAlert
              message="Ma'lumotlarni yuklashda xatolik yuz berdi. Backend server ishga tushirilganini tekshiring."
              onRetry={() => {
                refetchHalls();
                refetchBars();
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
            <h3 className="mt-6 font-display text-xl font-bold text-ink">Hech narsa topilmadi</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Qidiruv yoki filtr mezonlarini o‘zgartirib ko‘ring — sizga mos zal albatta bor.
            </p>
          </div>
        )}

        {!isLoading && !isError && combinedList.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {combinedList.map((venue) => {
              const isHall = 'max_capacity' in venue;
              return (
                <VenueCard key={`${isHall ? 'hall' : 'bar'}-${venue.id}`} venue={venue} />
              );
            })}
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
            <p className="eyebrow justify-center !text-gold">Joy egasizmisiz?</p>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-[#f2e9d6] sm:text-4xl">
              Zalingizni minglab juftliklarga{' '}
              <span className="gold-text italic">tavsiya eting</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#b7a888]">
              To‘yxona yoki baringizni platformaga qo‘shing — bronlar, taqvim va mijozlar
              bilan ishlashni bitta panelda boshqaring.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a href="/register" className="btn-gold">
                <Wine className="h-4 w-4" />
                <span>Joy qo‘shishni boshlash</span>
              </a>
              <a
                href="/login"
                className="flex items-center justify-center gap-2 rounded-full border border-gold/40 px-6 py-3 text-[13px] font-extrabold text-gold-soft transition-colors hover:border-gold hover:bg-gold/10"
              >
                <span>Panelga kirish</span>
              </a>
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
