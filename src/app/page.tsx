'use client';

import React, { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPlatformStatsRequest } from '@/services/admin';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SearchBar } from '@/components/common/search-bar';
import { VenueCard } from '@/components/cards/venue-card';
import { SkeletonCardLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import { FadeIn } from '@/components/motion/fade-in';
import { StaggerContainer, StaggerItem } from '@/components/motion/stagger-container';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Search, ShieldCheck, Sparkles, ArrowRight, ArrowLeft, Hotel, Wine, CalendarCheck2 } from 'lucide-react';
import { WeddingHall, Bar } from '@/types';
import { useVenueCatalog } from '@/hooks/useVenueCatalog';
import {
  STAR_LATTICE_PATTERN,
  MARQUEE_SCROLL_INPUT,
  MARQUEE_SCALE_OUTPUT,
  MARQUEE_OPACITY_INPUT,
  MARQUEE_OPACITY_OUTPUT,
  SMOOTH_SPRING,
  EASE_OUT_EXPO,
} from '@/constants/decoration';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Ornamental divider: line — diamond — line */
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
 * Duplicates a list until it has at least `minCount` items so the marquee
 * track always fills the screen and loops seamlessly.
 */
function getRepeatedHalf<T>(list: T[], minCount: number = 8): T[] {
  if (!list || list.length === 0) return [];
  let result: T[] = [];
  while (result.length < minCount) result = [...result, ...list];
  return result;
}

// ─── ScrollMarqueeRow ────────────────────────────────────────────────────────

interface ScrollMarqueeRowProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  category: 'halls' | 'bars';
  count: number;
  items: (WeddingHall | Bar)[];
  direction: 'right' | 'left';
  onCategoryChange: (cat: 'all' | 'halls' | 'bars') => void;
}

function ScrollMarqueeRow({
  icon: Icon,
  title,
  subtitle,
  category,
  count,
  items,
  direction,
  onCategoryChange,
}: ScrollMarqueeRowProps) {
  const rowRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: rowRef, offset: ['start end', 'end start'] });

  const scale   = useTransform(scrollYProgress, MARQUEE_SCROLL_INPUT,  MARQUEE_SCALE_OUTPUT);
  const opacity = useTransform(scrollYProgress, MARQUEE_OPACITY_INPUT, MARQUEE_OPACITY_OUTPUT);
  const smoothScale   = useSpring(scale,   SMOOTH_SPRING);
  const smoothOpacity = useSpring(opacity, SMOOTH_SPRING);

  return (
    <div ref={rowRef} className="w-full">
      <div className="mx-auto mb-3.5 flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-gold/40 bg-gold-tint text-gold-strong">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold text-ink sm:text-xl">{title}</h3>
            <p className="text-[11px] sm:text-xs text-ink-muted">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onCategoryChange(category)}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-gold-strong hover:text-gold transition-colors cursor-pointer"
        >
          <span>Barchasi ({count})</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Marquee track: kattalashadi va shaffoflikdan ochiladi scroll bilan */}
      <motion.div
        style={{ scale: smoothScale, opacity: smoothOpacity }}
        className="relative w-full overflow-hidden py-3 will-change-transform origin-center"
      >
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-28 bg-gradient-to-r from-paper to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-28 bg-gradient-to-l from-paper to-transparent" />

        <div className={`${direction === 'right' ? 'animate-marquee-right' : 'animate-marquee-left'} flex shrink-0`}>
          <div className="flex shrink-0 items-stretch gap-5 pr-5">
            {items.map((item, idx) => (
              <div key={`track1-${item.id}-${idx}`} className="w-[295px] sm:w-[352px] shrink-0">
                <VenueCard venue={item} compact />
              </div>
            ))}
          </div>
          <div className="flex shrink-0 items-stretch gap-5 pr-5" aria-hidden="true">
            {items.map((item, idx) => (
              <div key={`track2-${item.id}-${idx}`} className="w-[295px] sm:w-[352px] shrink-0">
                <VenueCard venue={item} compact />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── HomeContent ─────────────────────────────────────────────────────────────

function HomeContent() {
  const catalog = useVenueCatalog();
  const {
    selectedRegion, setSelectedRegion,
    selectedDistrict, setSelectedDistrict,
    selectedCategory,
    searchQuery, setSearchQuery,
    minCapacity, setMinCapacity,
    selectedDate, setSelectedDate,
    isSearchActive,
    searchCardYOffset,
    returnCardYOffset,
    heroRef,
    heroHeightRef,
    searchPanelRef,
    hallsList,
    barsList,
    combinedList,
    dbRegions,
    isLoading,
    isError,
    refetchAll,
    activateSearch,
    handleResetFilters,
    handleCategoryChange,
    handleSearchSubmit,
  } = catalog;

  const { data: platformStats } = useQuery({
    queryKey: ['platformStats'],
    queryFn: fetchPlatformStatsRequest,
    staleTime: 30000,
  });

  const repeatedHallsHalf = getRepeatedHalf(hallsList, 8);
  const repeatedBarsHalf  = getRepeatedHalf(barsList, 8);

  // Hero parallax
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroBgY           = useTransform(heroScrollProgress, [0, 1], ['0%', '-10%']);
  const latticeY          = useTransform(heroScrollProgress, [0, 1], ['0%', '-6%']);
  const heroContentOpacity = useTransform(heroScrollProgress, [0, 0.6], [1, 0]);
  const heroContentY       = useTransform(heroScrollProgress, [0, 0.6], ['0%', '-12%']);

  return (
    <div className="flex min-h-screen flex-col bg-paper font-sans">
      <Header onLogoClick={handleResetFilters} />

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <motion.div
        animate={{ opacity: isSearchActive ? 0 : 1 }}
        transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
        style={{ display: isSearchActive ? 'none' : 'block' }}
        className="bg-espresso"
      >
        <section
          ref={heroRef}
          className="texture-grain relative flex items-center overflow-hidden bg-espresso text-[#f6efdd]"
        >
          {/* Parallax backdrop photo */}
          <motion.div
            className="absolute -top-24 -bottom-36 inset-x-0 will-change-transform bg-espresso"
            style={{ y: heroBgY }}
          >
            <img
              src="/images/hero-hall.jpg"
              alt=""
              className="h-full w-full scale-[1.18] object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-espresso/85 via-espresso/65 to-espresso/95" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(16,11,5,0.6)_100%)]" />
          </motion.div>

          {/* Solid bottom fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-espresso via-espresso/90 to-transparent z-[2]" />

          {/* Star lattice ornament */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-[0.08] will-change-transform z-[1]"
            style={{ backgroundImage: STAR_LATTICE_PATTERN, y: latticeY }}
          />

          {/* Hero content */}
          <motion.div
            className="relative z-[3] mx-auto flex max-w-4xl flex-col items-center px-4 pt-10 pb-20 sm:pt-14 sm:pb-24 lg:pt-16 lg:pb-28 text-center sm:px-6 will-change-transform"
            style={{ opacity: heroContentOpacity, y: heroContentY }}
          >
            {/* Eyebrow ornament */}
            <motion.div
              className="flex items-center gap-3 text-gold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }}
            >
              <span className="h-px w-8 sm:w-10 bg-gradient-to-r from-transparent to-gold/80" />
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.32em] text-gold-soft">
                O'zbekistondagi eng sara zallar
              </span>
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
              <span className="h-px w-8 sm:w-10 bg-gradient-to-l from-transparent to-gold/80" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="mt-4 sm:mt-5 font-display text-3xl font-medium leading-[1.12] text-[#f6efdd] sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: EASE_OUT_EXPO }}
            >
              Hashamatli kunlaringiz
              <br />
              <span className="gold-text italic">shu yerdan boshlanadi</span>
            </motion.h1>

            <motion.p
              className="mt-3 sm:mt-4 max-w-xl text-[14px] sm:text-base font-medium leading-relaxed text-[#cbbc9c]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: EASE_OUT_EXPO }}
            >
              To&apos;y zallari, restoranlar va barlarning bo&apos;sh sanalarini bir joyda ko&apos;ring —
              bir necha daqiqada ishonchli bron qiling va bayramingizdan zavq oling.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="mt-6 flex flex-wrap items-center justify-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55, ease: EASE_OUT_EXPO }}
            >
              <button
                type="button"
                onClick={activateSearch}
                className="btn-gold cursor-pointer !py-2.5 !px-5 text-[13px]"
              >
                <Search className="h-4 w-4" />
                <span>Zal tanlash</span>
              </button>
              <a
                href="#qanday-ishlaydi"
                onClick={(e) => {
                  e.preventDefault();
                  const lenis = (window as unknown as { lenis?: { scrollTo: (t: string, o: object) => void } }).lenis;
                  if (lenis) {
                    lenis.scrollTo('#qanday-ishlaydi', { offset: -40 });
                  } else {
                    document.getElementById('qanday-ishlaydi')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 text-[12px] font-extrabold tracking-wide text-gold-soft transition-all hover:border-gold hover:bg-gold/10"
              >
                <span>Qanday ishlaydi?</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              className="mt-8 grid w-full max-w-xl grid-cols-3 divide-x divide-gold/25 rounded-2xl border border-gold/25 bg-espresso/40 py-3.5 backdrop-blur-md"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.7, ease: EASE_OUT_EXPO }}
            >
              {[
                { value: `${platformStats?.active_venues ?? (hallsList.length + barsList.length)}+`, label: 'Sara zallar' },
                { value: `${platformStats?.total_regions ?? (dbRegions.length || 14)}`, label: 'Viloyatlar' },
                { value: `${platformStats?.total_bookings ?? 0}+`, label: 'Bronlar soni' },
              ].map((s) => (
                <div key={s.label} className="px-2">
                  <p className="font-display text-xl sm:text-2xl font-bold text-gold-soft">{s.value}</p>
                  <p className="mt-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-[#9d8e6e]">
                    {s.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>
      </motion.div>

      {/* ── SEARCH PANEL ──────────────────────────────────────────────────────── */}
      <motion.div
        ref={searchPanelRef}
        animate={
          isSearchActive
            ? { y: [searchCardYOffset, 0] }
            : returnCardYOffset !== 0
            ? { y: [returnCardYOffset, 0] }
            : { y: 0 }
        }
        transition={{ duration: 0.75, ease: EASE_OUT_EXPO }}
        className={`relative z-30 mx-auto w-full max-w-6xl px-4 sm:px-6 ${
          isSearchActive ? 'pt-6 pb-2 mt-0' : '-mt-16 sm:-mt-20'
        }`}
        onFocusCapture={activateSearch}
        onClickCapture={activateSearch}
      >
        {isSearchActive && (
          <motion.div
            className="mb-3 flex items-center"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            <button
              type="button"
              data-back-button="true"
              onClick={(e) => {
                e.stopPropagation();
                handleResetFilters();
              }}
              className="group inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-surface/95 px-3.5 py-1.5 text-xs font-bold text-ink shadow-sm backdrop-blur-md transition-all hover:border-gold hover:bg-gold-tint hover:text-gold-strong cursor-pointer"
              title="Bosh sahifaga qaytish"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-gold-strong transition-transform group-hover:-translate-x-1" />
              <span>Orqaga</span>
            </button>
          </motion.div>
        )}

        <SearchBar
          selectedRegion={selectedRegion}
          setSelectedRegion={(val: string) => { setSelectedRegion(val); activateSearch(); }}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={(val: string) => { setSelectedDistrict(val); activateSearch(); }}
          selectedCategory={selectedCategory}
          setSelectedCategory={handleCategoryChange}
          searchQuery={searchQuery}
          setSearchQuery={(val) => { setSearchQuery(val); activateSearch(); }}
          minCapacity={minCapacity}
          setMinCapacity={(val) => { setMinCapacity(val); activateSearch(); }}
          selectedDate={selectedDate}
          setSelectedDate={(val) => { setSelectedDate(val); activateSearch(); }}
          dbRegions={dbRegions}
          onResetFilters={handleResetFilters}
          onSearchSubmit={handleSearchSubmit}
        />
      </motion.div>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <motion.div
        initial={false}
        animate={{ height: isSearchActive ? 0 : 'auto', opacity: isSearchActive ? 0 : 1 }}
        transition={{ duration: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ overflow: 'hidden', pointerEvents: isSearchActive ? 'none' : 'auto' }}
      >
        <section id="qanday-ishlaydi" className="mx-auto w-full max-w-6xl px-4 pt-10 sm:pt-12 pb-2 sm:px-6">
          <FadeIn className="text-center">
            <p className="eyebrow justify-center">Marosim tartibi</p>
            <h2 className="mt-2.5 font-display text-2xl font-bold text-ink sm:text-3xl">
              Uch qadamda <span className="gold-text italic">band qilish</span>
            </h2>
            <OrnamentDivider className="mt-4" />
          </FadeIn>

          <StaggerContainer className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3" staggerDelay={0.12}>
            {[
              { n: 'I',   title: 'Zalni tanlang',   text: "Sig'im, joylashuv va narh bo'yicha filtrlar yordamida o'zingizga mos hashamatli joyni toping.", icon: Hotel },
              { n: 'II',  title: "Sanani ko'ring",   text: "Bandlik taqvimi orqali bo'sh smena va soatlarni bir qarashda ko'rib chiqing.", icon: CalendarCheck2 },
              { n: 'III', title: 'Bron qiling',      text: "Zakalatni to'lab, so'rovingizni yuboring — egasi tez orada tasdiqlaydi.", icon: ShieldCheck },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <StaggerItem key={step.n}>
                  <div className="card-lux card-lux-hover relative p-5 sm:p-6 text-center h-full">
                    <span className="pointer-events-none absolute -top-1 right-4 font-display text-[54px] font-bold leading-none text-gold/15">
                      {step.n}
                    </span>
                    <span className="mx-auto flex h-11 w-11 rotate-45 items-center justify-center border border-gold/50 bg-gold-tint">
                      <Icon className="h-4 w-4 rotate-[-45deg] text-gold-strong" />
                    </span>
                    <h3 className="mt-4 font-display text-base font-bold text-ink">{step.title}</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">{step.text}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>
      </motion.div>

      {/* ── CATALOG ───────────────────────────────────────────────────────────── */}
      <motion.main
        key={isSearchActive ? `search-catalog-${selectedCategory}` : 'home-catalog'}
        id="katalog"
        className={`w-full flex-1 ${isSearchActive ? 'py-6' : 'pt-6 pb-16 sm:pt-8 sm:pb-20'}`}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="mb-6 sm:mb-8 text-center">
            <p className="eyebrow justify-center">Katalog</p>
            <h2 className="mt-2.5 flex flex-wrap items-center justify-center gap-3 font-display text-2xl font-bold text-ink sm:text-3xl">
              <span>Siz uchun taklif etilgan joylar</span>
              {selectedCategory === 'halls' && <span className="badge-outline">Faqat to&apos;y zallari</span>}
              {selectedCategory === 'bars'  && <span className="badge-outline">Faqat barlar</span>}
            </h2>
            <OrnamentDivider className="mt-4" />
            <p className="mt-3.5 text-xs sm:text-sm font-semibold text-ink-faint">
              Jami <span className="text-gold-strong">{combinedList.length}</span> ta joy topildi
            </p>
          </FadeIn>

          {isError && (
            <div className="mb-8">
              <ErrorAlert
                message="Ma'lumotlarni yuklashda xatolik yuz berdi. Backend server ishga tushirilganini tekshiring."
                onRetry={refetchAll}
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
                Qidiruv yoki filtr mezonlarini o&apos;zgartirib ko&apos;ring — sizga mos zal albatta bor.
              </p>
            </FadeIn>
          )}
        </div>

        {/* Marquee rows (home mode) */}
        {!isLoading && !isError && !isSearchActive && combinedList.length > 0 && (
          <div className="space-y-8 sm:space-y-10">
            {hallsList.length > 0 && (
              <ScrollMarqueeRow
                icon={Hotel}
                title="To'y zallari"
                subtitle="Hashamatli va ko'rkam tantana maskanlari"
                category="halls"
                count={hallsList.length}
                items={repeatedHallsHalf}
                direction="right"
                onCategoryChange={handleCategoryChange}
              />
            )}
            {barsList.length > 0 && (
              <ScrollMarqueeRow
                icon={Wine}
                title="Barlar va Restoranlar"
                subtitle="Shinam uchrashuvlar va maxsus tadbirlar uchun"
                category="bars"
                count={barsList.length}
                items={repeatedBarsHalf}
                direction="left"
                onCategoryChange={handleCategoryChange}
              />
            )}
          </div>
        )}

        {/* Static grid (search mode) */}
        {!isLoading && !isError && isSearchActive && combinedList.length > 0 && (
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <StaggerContainer
              key={`stagger-search-${selectedCategory}-${combinedList.length}`}
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

      {/* ── OWNER CTA BAND ────────────────────────────────────────────────────── */}
      <motion.div
        initial={false}
        animate={{ height: isSearchActive ? 0 : 'auto', opacity: isSearchActive ? 0 : 1 }}
        transition={{ duration: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ overflow: 'hidden', pointerEvents: isSearchActive ? 'none' : 'auto' }}
      >
        <section className="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="texture-grain panel-dark relative overflow-hidden px-8 py-14 text-center sm:px-12">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{ backgroundImage: STAR_LATTICE_PATTERN }}
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
                    To&apos;yxona yoki baringizni platformaga qo&apos;shing — bronlar, taqvim va mijozlar
                    bilan ishlashni bitta panelda boshqaring.
                  </p>
                </FadeIn>
                <FadeIn delay={0.35}>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                    <a href="/register" className="btn-gold">
                      <Wine className="h-4 w-4" />
                      <span>Joy qo&apos;shishni boshlash</span>
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
