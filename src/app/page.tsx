'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchHallsRequest, fetchBarsRequest, fetchRegionsRequest } from '@/services/venues';
import { fetchPlatformStatsRequest } from '@/services/admin';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SearchBar } from '@/components/common/search-bar';
import { VenueCard } from '@/components/cards/venue-card';
import { SkeletonCardLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import { FadeIn } from '@/components/motion/fade-in';
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger-container';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Search, ShieldCheck, Sparkles, ArrowRight, ArrowLeft, Hotel, Wine, CalendarCheck2 } from 'lucide-react';
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

/**
 * Duplicates a list until it has at least `minCount` items, ensuring
 * that the marquee track always fills the screen and loops seamlessly.
 */
function getRepeatedHalf<T>(list: T[], minCount: number = 8): T[] {
  if (!list || list.length === 0) return [];
  let result: T[] = [];
  while (result.length < minCount) {
    result = [...result, ...list];
  }
  return result;
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = (searchParams.get('category') as 'all' | 'halls' | 'bars') || 'all';

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'halls' | 'bars'>(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [minCapacity, setMinCapacity] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(categoryParam !== 'all');

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      try {
        if ((window as any).lenis && typeof (window as any).lenis.scrollTo === 'function') {
          (window as any).lenis.scrollTo(0, { immediate: true });
        }
      } catch (err) {
        // lenis scroll fallback
      }
      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } catch (err) {
        window.scrollTo(0, 0);
      }
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  const activateSearch = () => {
    if (!isSearchActive) {
      if (typeof window !== 'undefined') {
        try {
          if ((window as any).lenis && typeof (window as any).lenis.scrollTo === 'function') {
            (window as any).lenis.scrollTo(0, { duration: 0.65 });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } catch (err) {
          window.scrollTo(0, 0);
        }
      }
      setIsSearchActive(true);
    }
  };

  // Sync category state when URL changes
  useEffect(() => {
    setSelectedCategory(categoryParam);
    if (categoryParam !== 'all') {
      setIsSearchActive(true);
    }
  }, [categoryParam]);

  const handleCategoryChange = (cat: 'all' | 'halls' | 'bars') => {
    activateSearch();
    setSelectedCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'all') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : '/', { scroll: false });
  };

  const handleSearchSubmit = () => {
    if (!isSearchActive) {
      activateSearch();
    } else {
      const el = document.getElementById('katalog');
      if (el && window.scrollY > 200) {
        if ((window as any).lenis) {
          (window as any).lenis.scrollTo('#katalog', { offset: -80 });
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  const handleResetFilters = () => {
    scrollToTop();
    setSelectedRegion('');
    setSelectedDistrict('');
    setSelectedCategory('all');
    setSearchQuery('');
    setMinCapacity(0);
    setSelectedDate('');
    setIsSearchActive(false);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    const query = params.toString();
    router.push(query ? `/?${query}` : '/', { scroll: false });
    requestAnimationFrame(() => {
      scrollToTop();
    });
  };

  const { data: dbRegions = [] } = useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: fetchRegionsRequest,
    staleTime: 0,
  });

  const { data: platformStats } = useQuery({
    queryKey: ['platformStats'],
    queryFn: fetchPlatformStatsRequest,
    staleTime: 30000,
  });

  const activeCategory = selectedCategory;

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

  const repeatedHallsHalf = getRepeatedHalf(hallsList, 8);
  const repeatedBarsHalf = getRepeatedHalf(barsList, 8);

  const isLoading = (shouldFetchHalls && loadingHalls) || (shouldFetchBars && loadingBars);
  const isError = errorHalls || errorBars;

  // ── Parallax refs for hero section ──────────────────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  // Backdrop moves upward subtly as user scrolls away
  const heroBgY = useTransform(heroScrollProgress, [0, 1], ['0%', '-10%']);
  // Floating ornament
  const latticeY = useTransform(heroScrollProgress, [0, 1], ['0%', '-6%']);
  // Hero content fades + rises gently as user scrolls away
  const heroContentOpacity = useTransform(heroScrollProgress, [0, 0.6], [1, 0]);
  const heroContentY = useTransform(heroScrollProgress, [0, 0.6], ['0%', '-12%']);

  return (
    <div className="flex min-h-screen flex-col bg-paper font-sans">
      <Header onLogoClick={handleResetFilters} />

      {/* ============ HERO (Collapses smoothly so SearchBar glides up) ============ */}
      <motion.div
        initial={false}
        animate={{
          height: isSearchActive ? 0 : 'auto',
          opacity: isSearchActive ? 0 : 1,
        }}
        transition={{
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          overflow: 'hidden',
          pointerEvents: isSearchActive ? 'none' : 'auto',
        }}
        className="bg-espresso"
      >
        <section
          ref={heroRef}
          className="texture-grain relative flex min-h-[92vh] items-center overflow-hidden bg-espresso text-[#f6efdd]"
        >
          {/* Parallax backdrop photo */}
          <motion.div
            className="absolute -inset-y-12 inset-x-0 will-change-transform bg-espresso"
            style={{ y: heroBgY }}
          >
            <img
              src="/images/hero-hall.jpg"
              alt=""
              className="h-full w-full scale-[1.15] object-cover object-center"
            />
            {/* Espresso scrim stack */}
            <div className="absolute inset-0 bg-gradient-to-b from-espresso/85 via-espresso/65 to-espresso/95" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(16,11,5,0.55)_100%)]" />
          </motion.div>

          {/* Star lattice ornament layer with subtle parallax */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-[0.08] will-change-transform"
            style={{ backgroundImage: STAR_LATTICE, y: latticeY }}
          />

          {/* Hero content — fades as you scroll out */}
          <motion.div
            className="relative z-[2] mx-auto flex max-w-5xl flex-col items-center px-4 pb-44 pt-44 text-center sm:px-6 will-change-transform"
            style={{ opacity: heroContentOpacity, y: heroContentY }}
          >
            {/* Eyebrow ornament */}
            <motion.div
              className="flex items-center gap-3 text-gold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/80" />
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
              <span className="text-[11px] font-extrabold uppercase tracking-[0.34em] text-gold-soft">
                O'zbekistondagi eng sara zallar
              </span>
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/80" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="mt-7 font-display text-[2.6rem] font-medium leading-[1.08] text-[#f6efdd] sm:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              Hashamatli kunlaringiz
              <br />
              <span className="gold-text italic">shu yerdan boshlanadi</span>
            </motion.h1>

            <motion.p
              className="mt-6 max-w-2xl text-[15px] font-medium leading-relaxed text-[#cbbc9c] sm:text-lg"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              To'y zallari, restoranlar va barlarning bo'sh sanalarini bir joyda ko'ring —
              bir necha daqiqada ishonchli bron qiling va bayramingizdan zavq oling.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="mt-9 flex flex-wrap items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                onClick={activateSearch}
                className="btn-gold cursor-pointer"
              >
                <Search className="h-4 w-4" />
                <span>Zal tanlash</span>
              </button>
              <a
                href="#qanday-ishlaydi"
                onClick={(e) => {
                  e.preventDefault();
                  if ((window as any).lenis) {
                    (window as any).lenis.scrollTo('#qanday-ishlaydi', { offset: -40 });
                  } else {
                    document.getElementById('qanday-ishlaydi')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-full border border-gold/50 px-6 py-3 text-[13px] font-extrabold tracking-wide text-gold-soft transition-all hover:border-gold hover:bg-gold/10"
              >
                <span>Qanday ishlaydi?</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              className="mt-14 grid w-full max-w-2xl grid-cols-3 divide-x divide-gold/25 rounded-2xl border border-gold/25 bg-espresso/40 py-5 backdrop-blur-md"
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {[
                {
                  value: `${platformStats?.active_venues ?? (hallsList.length + barsList.length)}+`,
                  label: 'Sara zallar',
                },
                {
                  value: `${platformStats?.total_regions ?? (dbRegions.length || 14)}`,
                  label: 'Viloyatlar',
                },
                {
                  value: `${platformStats?.total_bookings ?? 0}+`,
                  label: 'Bronlar soni',
                },
              ].map((s) => (
                <div key={s.label} className="px-2">
                  <p className="font-display text-2xl font-bold text-gold-soft sm:text-3xl">{s.value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9d8e6e] sm:text-[11px]">
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>
      </motion.div>

      {/* ============ SEARCH PANEL ============ */}
      <motion.div
        layout
        transition={{
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`relative z-30 mx-auto w-full max-w-6xl px-4 transition-[padding,margin] duration-500 sm:px-6 ${
          isSearchActive ? 'pt-6 pb-2 mt-0' : '-mt-24'
        }`}
        onFocusCapture={activateSearch}
        onClickCapture={activateSearch}
      >
        <AnimatePresence>
          {isSearchActive && (
            <motion.div
              className="mb-3 flex items-center justify-between"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              {/* Chap burchakdagi orqaga tugmasi */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="group inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-surface/95 px-3.5 py-1.5 text-xs font-bold text-ink shadow-sm backdrop-blur-md transition-all hover:border-gold hover:bg-gold-tint hover:text-gold-strong cursor-pointer"
                title="Bosh sahifaga qaytish"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-gold-strong transition-transform group-hover:-translate-x-1" />
                <span>Orqaga</span>
              </button>

              {/* O'ng burchakdagi orqaga tugmasi */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="group inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-surface/95 px-3.5 py-1.5 text-xs font-bold text-ink shadow-sm backdrop-blur-md transition-all hover:border-gold hover:bg-gold-tint hover:text-gold-strong cursor-pointer"
                title="Bosh sahifaga qaytish"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-gold-strong transition-transform group-hover:-translate-x-1" />
                <span>Orqaga</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <SearchBar
          selectedRegion={selectedRegion}
          setSelectedRegion={(val: string) => {
            setSelectedRegion(val);
            activateSearch();
          }}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={(val: string) => {
            setSelectedDistrict(val);
            activateSearch();
          }}
          selectedCategory={selectedCategory}
          setSelectedCategory={handleCategoryChange}
          searchQuery={searchQuery}
          setSearchQuery={(val) => {
            setSearchQuery(val);
            activateSearch();
          }}
          minCapacity={minCapacity}
          setMinCapacity={(val) => {
            setMinCapacity(val);
            activateSearch();
          }}
          selectedDate={selectedDate}
          setSelectedDate={(val) => {
            setSelectedDate(val);
            activateSearch();
          }}
          dbRegions={dbRegions}
          onResetFilters={handleResetFilters}
          onSearchSubmit={handleSearchSubmit}
        />
      </motion.div>

      {/* ============ HOW IT WORKS ============ */}
      <motion.div
        initial={false}
        animate={{
          height: isSearchActive ? 0 : 'auto',
          opacity: isSearchActive ? 0 : 1,
        }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          overflow: 'hidden',
          pointerEvents: isSearchActive ? 'none' : 'auto',
        }}
      >
        <section id="qanday-ishlaydi" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6">
          <FadeIn className="text-center">
            <p className="eyebrow justify-center">Marosim tartibi</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
              Uch qadamda <span className="gold-text italic">band qilish</span>
            </h2>
            <OrnamentDivider className="mt-6" />
          </FadeIn>

          <StaggerContainer className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3" staggerDelay={0.12}>
            {[
              {
                n: 'I',
                title: 'Zalni tanlang',
                text: "Sig\u2018im, joylashuv va narh bo\u2018yicha filtrlar yordamida o\u2018zingizga mos hashamatli joyni toping.",
                icon: Hotel,
              },
              {
                n: 'II',
                title: "Sanani ko\u2018ring",
                text: "Bandlik taqvimi orqali bo\u2018sh smena va soatlarni bir qarashda ko\u2018rib chiqing.",
                icon: CalendarCheck2,
              },
              {
                n: 'III',
                title: 'Bron qiling',
                text: "Zakalatni to\u2018lab, so\u2018rovingizni yuboring \u2014 egasi tez orada tasdiqlaydi.",
                icon: ShieldCheck,
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <StaggerItem key={step.n}>
                  <div className="card-lux card-lux-hover relative p-7 text-center h-full">
                    <span className="pointer-events-none absolute -top-1 right-4 font-display text-[64px] font-bold leading-none text-gold/15">
                      {step.n}
                    </span>
                    <span className="mx-auto flex h-12 w-12 rotate-45 items-center justify-center border border-gold/50 bg-gold-tint">
                      <Icon className="h-5 w-5 rotate-[-45deg] text-gold-strong" />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-bold text-ink">{step.title}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{step.text}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>
      </motion.div>

      {/* ============ CATALOG ============ */}
      <motion.main
        key={isSearchActive ? `search-catalog-${activeCategory}` : 'home-catalog'}
        id="katalog"
        className={`w-full flex-1 ${isSearchActive ? 'py-6' : 'py-20'}`}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mb-10 text-center">
            <p className="eyebrow justify-center">Katalog</p>
            <h2 className="mt-3 flex flex-wrap items-center justify-center gap-3 font-display text-3xl font-bold text-ink sm:text-4xl">
              <span>Siz uchun taklif etilgan joylar</span>
              {categoryParam === 'halls' && <span className="badge-outline">Faqat to'y zallari</span>}
              {categoryParam === 'bars' && <span className="badge-outline">Faqat barlar</span>}
            </h2>
            <OrnamentDivider className="mt-6" />
            <p className="mt-5 text-sm font-semibold text-ink-faint">
              Jami <span className="text-gold-strong">{combinedList.length}</span> ta joy topildi
            </p>
          </FadeIn>

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
            <FadeIn className="card-lux mx-auto flex max-w-xl flex-col items-center px-8 py-14 text-center">
              <span className="flex h-14 w-14 rotate-45 items-center justify-center border border-gold/50 bg-gold-tint">
                <Sparkles className="h-6 w-6 rotate-[-45deg] text-gold-strong" />
              </span>
              <h3 className="mt-6 font-display text-xl font-bold text-ink">Hech narsa topilmadi</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Qidiruv yoki filtr mezonlarini o'zgartirib ko'ring — sizga mos zal albatta bor.
              </p>
            </FadeIn>
          )}
        </div>

        {/* When NOT in search mode: 2 Marquee Rows */}
        {!isLoading && !isError && !isSearchActive && combinedList.length > 0 && (
          <div className="space-y-12">
            {/* Row 1: To'y zallari (chapdan o'ngga qarab) */}
            {hallsList.length > 0 && (
              <div className="w-full">
                <div className="mx-auto mb-4 flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/40 bg-gold-tint text-gold-strong">
                      <Hotel className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
                        To‘y zallari
                      </h3>
                      <p className="text-xs text-ink-muted">
                        Hashamatli va ko‘rkam tantana maskanlari
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('halls')}
                    className="group inline-flex items-center gap-1.5 text-xs font-bold text-gold-strong hover:text-gold transition-colors cursor-pointer"
                  >
                    <span>Barchasi ({hallsList.length})</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>

                {/* Marquee Row 1 track: chapdan o'ngga */}
                <div className="relative w-full overflow-hidden py-3">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-28 bg-gradient-to-r from-paper to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-28 bg-gradient-to-l from-paper to-transparent" />

                  <div className="animate-marquee-right flex shrink-0">
                    <div className="flex shrink-0 items-stretch gap-6 pr-6">
                      {repeatedHallsHalf.map((hall, idx) => (
                        <div key={`hall-track1-${hall.id}-${idx}`} className="w-[300px] sm:w-[360px] shrink-0">
                          <VenueCard venue={hall} />
                        </div>
                      ))}
                    </div>
                    <div className="flex shrink-0 items-stretch gap-6 pr-6" aria-hidden="true">
                      {repeatedHallsHalf.map((hall, idx) => (
                        <div key={`hall-track2-${hall.id}-${idx}`} className="w-[300px] sm:w-[360px] shrink-0">
                          <VenueCard venue={hall} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Row 2: Barlar va Restoranlar (o'ngdan chapga qarab) */}
            {barsList.length > 0 && (
              <div className="w-full">
                <div className="mx-auto mb-4 flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/40 bg-gold-tint text-gold-strong">
                      <Wine className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold text-ink sm:text-2xl">
                        Barlar va Restoranlar
                      </h3>
                      <p className="text-xs text-ink-muted">
                        Shinam uchrashuvlar va maxsus tadbirlar uchun
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('bars')}
                    className="group inline-flex items-center gap-1.5 text-xs font-bold text-gold-strong hover:text-gold transition-colors cursor-pointer"
                  >
                    <span>Barchasi ({barsList.length})</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>

                {/* Marquee Row 2 track: o'ngdan chapga */}
                <div className="relative w-full overflow-hidden py-3">
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-28 bg-gradient-to-r from-paper to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-28 bg-gradient-to-l from-paper to-transparent" />

                  <div className="animate-marquee-left flex shrink-0">
                    <div className="flex shrink-0 items-stretch gap-6 pr-6">
                      {repeatedBarsHalf.map((bar, idx) => (
                        <div key={`bar-track1-${bar.id}-${idx}`} className="w-[300px] sm:w-[360px] shrink-0">
                          <VenueCard venue={bar} />
                        </div>
                      ))}
                    </div>
                    <div className="flex shrink-0 items-stretch gap-6 pr-6" aria-hidden="true">
                      {repeatedBarsHalf.map((bar, idx) => (
                        <div key={`bar-track2-${bar.id}-${idx}`} className="w-[300px] sm:w-[360px] shrink-0">
                          <VenueCard venue={bar} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* When in search mode: Static 3-column Grid (harakat qilmaydigan holat) */}
        {!isLoading && !isError && isSearchActive && combinedList.length > 0 && (
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <StaggerContainer
              key={`stagger-search-${activeCategory}-${combinedList.length}`}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              staggerDelay={0.06}
            >
              {combinedList.map((venue) => {
                const isHall = 'max_capacity' in venue;
                return (
                  <StaggerItem key={`${isHall ? 'hall' : 'bar'}-${venue.id}`}>
                    <VenueCard venue={venue} />
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        )}
      </motion.main>

      {/* ============ OWNER CTA BAND ============ */}
      <motion.div
        initial={false}
        animate={{
          height: isSearchActive ? 0 : 'auto',
          opacity: isSearchActive ? 0 : 1,
        }}
        transition={{
          duration: 0.55,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          overflow: 'hidden',
          pointerEvents: isSearchActive ? 'none' : 'auto',
        }}
      >
        <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="texture-grain panel-dark relative overflow-hidden px-8 py-14 text-center sm:px-12">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: STAR_LATTICE }}
              />
              <div className="relative z-[2]">
                <FadeIn delay={0.05}>
                  <p className="eyebrow justify-center !text-gold">Joy egasizmisiz?</p>
                </FadeIn>
                <FadeIn delay={0.15}>
                  <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-[#f2e9d6] sm:text-4xl">
                    Zalingizni minglab juftliklarga{' '}
                    <span className="gold-text italic">tavsiya eting</span>
                  </h2>
                </FadeIn>
                <FadeIn delay={0.25}>
                  <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#b7a888]">
                    To'yxona yoki baringizni platformaga qo'shing — bronlar, taqvim va mijozlar
                    bilan ishlashni bitta panelda boshqaring.
                  </p>
                </FadeIn>
                <FadeIn delay={0.35}>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <a href="/register" className="btn-gold">
                      <Wine className="h-4 w-4" />
                      <span>Joy qo'shishni boshlash</span>
                    </a>
                    <a
                      href="/login"
                      className="flex items-center justify-center gap-2 rounded-full border border-gold/40 px-6 py-3 text-[13px] font-extrabold text-gold-soft transition-colors hover:border-gold hover:bg-gold/10"
                    >
                      <span>Panelga kirish</span>
                    </a>
                  </div>
                </FadeIn>
              </div>
            </div>
          </FadeIn>
        </section>
      </motion.div>

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
