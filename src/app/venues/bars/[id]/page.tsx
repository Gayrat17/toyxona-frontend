'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBarByIdRequest } from '@/services/venues';
import { BarBookingForm } from '@/components/common/bar-booking-form';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { MapPin, Users, Wine, ArrowLeft, Share2, BadgeCheck, Clock } from 'lucide-react';
import { Bar } from '@/types';
import { getMediaUrl } from '@/utils/media';

interface PageProps {
  params: Promise<{ id: string }>;
}

function getVenueCover(bar: Bar): string | null {
  if (bar.cover_image_url) return getMediaUrl(bar.cover_image_url);
  if (bar.cover_image) return getMediaUrl(bar.cover_image);
  if (bar.gallery_images && bar.gallery_images.length > 0) {
    const first = bar.gallery_images[0];
    const url = first.image_url || first.image;
    if (url) return getMediaUrl(url);
  }
  return null;
}

export default function BarDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const barId = parseInt(resolvedParams.id);

  const { data: bar, isLoading, error } = useQuery<Bar>({
    queryKey: ['bar', barId],
    queryFn: () => fetchBarByIdRequest(barId),
    enabled: !isNaN(barId),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <span className="h-10 w-10 rotate-45 animate-spin rounded-sm border-2 border-gold border-t-transparent" />
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-ink-faint">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !bar) {
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <span className="flex h-14 w-14 rotate-45 items-center justify-center border border-gold/50 bg-gold-tint">
            <Wine className="h-6 w-6 rotate-[-45deg] text-gold-strong" />
          </span>
          <h3 className="mt-6 font-display text-2xl font-bold text-ink">Bar topilmadi</h3>
          <p className="mt-2 max-w-xs text-sm text-ink-soft">
            Siz qidirayotgan bar ma&apos;lumotlari topilmadi yoki server bilan ulanish mavjud emas.
          </p>
          <Link href="/" className="btn-gold mt-7">
            <ArrowLeft className="h-4 w-4" />
            <span>Bosh sahifaga qaytish</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const coverUrl = getVenueCover(bar);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-7 flex items-center gap-2 text-xs font-bold text-ink-faint">
          <Link href="/" className="transition-colors hover:text-gold-strong">
            Bosh sahifa
          </Link>
          <span className="h-1 w-1 rotate-45 bg-gold/60" />
          <span className="text-ink-soft">Barlar</span>
          <span className="h-1 w-1 rotate-45 bg-gold/60" />
          <span className="truncate text-gold-strong">{bar.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ============ Left column ============ */}
          <div className="space-y-8 lg:col-span-2">
            {/* Cover banner */}
            <div className="frame-mat overflow-hidden rounded-2xl p-2">
              <div className="group relative h-[24rem] w-full overflow-hidden rounded-xl bg-espresso">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={bar.name}
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#33203a] via-[#241531] to-[#150a1d]">
                    <div
                      className="absolute inset-0 opacity-[0.1]"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'%3E%3Cg fill='none' stroke='%23cda964' stroke-width='1'%3E%3Crect x='26' y='26' width='32' height='32'/%3E%3Crect x='26' y='26' width='32' height='32' transform='rotate(45 42 42)'/%3E%3Ccircle cx='42' cy='42' r='4.5'/%3E%3C/g%3E%3C/svg%3E\")",
                      }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-[#f2e9d6]">
                      <Wine className="h-14 w-14 text-gold-soft" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/95 via-espresso/25 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col items-start gap-3 text-white">
                  <span className="badge-gold">
                    <Wine className="h-3 w-3" />
                    Bar / Lounge
                  </span>
                  <h1 className="font-display text-3xl font-bold tracking-tight drop-shadow-md sm:text-[2.6rem]">
                    {bar.name}
                  </h1>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-[#d8cbae]">
                    <MapPin className="h-4 w-4 shrink-0 text-gold" />
                    {bar.address}
                    {bar.region_name && <span className="text-[#a29377]">· {bar.region_name}</span>}
                  </p>
                </div>

                <div className="absolute right-5 top-5 z-10 flex gap-2.5">
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-black/35 text-gold-soft backdrop-blur-md transition-colors hover:bg-gold hover:text-espresso"
                    title="Ulashish"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-black/35 text-gold-soft backdrop-blur-md transition-colors hover:bg-gold hover:text-espresso"
                    title="Saqlash"
                  >
                    <BadgeCheck className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Specs card */}
            <div className="card-lux space-y-6 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-ink">Bar ma&apos;lumotlari</h3>
                <span className="h-px w-24 bg-gradient-to-r from-gold/60 to-transparent" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="pattern-weave rounded-xl border border-line bg-surface-2/60 p-5">
                  <span className="field-label">Sig&apos;imi</span>
                  <span className="mt-1.5 flex items-center gap-2 font-display text-xl font-bold text-ink">
                    <Users className="h-5 w-5 shrink-0 text-gold" />
                    {bar.capacity} kishi
                  </span>
                </div>

                <div className="pattern-weave rounded-xl border border-line bg-surface-2/60 p-5">
                  <span className="field-label">Soatbay narx</span>
                  <span className="mt-1.5 flex items-center gap-2 font-display text-xl font-bold text-gold-strong">
                    <Clock className="h-5 w-5 shrink-0 text-gold" />
                    {parseFloat(bar.price_per_hour).toLocaleString('uz-UZ')} UZS
                  </span>
                </div>

                <div className="pattern-weave rounded-xl border border-line bg-surface-2/60 p-5">
                  <span className="field-label">Kafolat zakalati</span>
                  <span className="mt-1.5 block font-display text-xl font-bold text-success">
                    {parseFloat(bar.required_deposit).toLocaleString('uz-UZ')} UZS
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-line pt-5">
                <h4 className="text-xs font-black uppercase tracking-[0.16em] text-ink-faint">Tavsif</h4>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                  {bar.description ||
                    "Bar haqida batafsil ma'lumot kiritilmagan. Soatbay ijara va uchrashuv tafsilotlari bo'yicha bar egasiga murojaat qilishingiz mumkin."}
                </p>
              </div>
            </div>
          </div>

          {/* ============ Right: booking sidebar ============ */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BarBookingForm bar={bar} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
