'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHallByIdRequest } from '@/services/venues';
import { HallBookingForm } from '@/components/common/hall-booking-form';
import { VenueCalendar } from '@/components/common/venue-calendar';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import {
  MapPin, Users, Hotel, ArrowLeft, Share2, BadgeCheck,
  Car, Wifi, Wind, Volume2, ShieldCheck, Utensils, Coffee,
  Play, ExternalLink, Image as ImageIcon, X,
} from 'lucide-react';
import { WeddingHall } from '@/types';
import { getMediaUrl } from '@/utils/media';

interface PageProps {
  params: Promise<{ id: string }>;
}

const AMENITY_MAP: Record<string, { label: string; icon: any }> = {
  parking: { label: 'Avtoturargoh (Parking)', icon: Car },
  wifi: { label: 'Yuqori tezlikdagi Wi-Fi', icon: Wifi },
  ac: { label: 'Konditsioner tizimi', icon: Wind },
  sound: { label: 'Professional ovoz tizimi', icon: Volume2 },
  security: { label: "Qo'riqlash va Video-kuzatuv", icon: ShieldCheck },
  kitchen: { label: 'Professional oshxona', icon: Utensils },
  coffee: { label: 'Kofe / Choy hududi', icon: Coffee },
};

function getVenueCover(hall: WeddingHall): string | null {
  if (hall.cover_image_url) return getMediaUrl(hall.cover_image_url);
  if (hall.cover_image) return getMediaUrl(hall.cover_image);
  if (hall.gallery_images && hall.gallery_images.length > 0) {
    const first = hall.gallery_images[0];
    const url = first.image_url || first.image;
    if (url) return getMediaUrl(url);
  }
  return null;
}

export default function HallDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const hallId = parseInt(resolvedParams.id);
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  const { data: hall, isLoading, error } = useQuery<WeddingHall>({
    queryKey: ['hall', hallId],
    queryFn: () => fetchHallByIdRequest(hallId),
    enabled: !isNaN(hallId),
    staleTime: 0,
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

  if (error || !hall) {
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          <span className="flex h-14 w-14 rotate-45 items-center justify-center border border-gold/50 bg-gold-tint">
            <Hotel className="h-6 w-6 rotate-[-45deg] text-gold-strong" />
          </span>
          <h3 className="mt-6 font-display text-2xl font-bold text-ink">Zal topilmadi</h3>
          <p className="mt-2 max-w-xs text-sm text-ink-soft">
            Siz qidirayotgan restoran ma&apos;lumotlari topilmadi yoki server bilan ulanish mavjud emas.
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

  const coverUrl = getVenueCover(hall);
  const galleryImages = (hall.gallery_images || [])
    .map((img: any) => ({
      id: img.id,
      url: getMediaUrl(img.image_url || img.image),
    }))
    .filter((img: any) => Boolean(img.url));

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
          <span className="text-ink-soft">To&apos;y zallari</span>
          <span className="h-1 w-1 rotate-45 bg-gold/60" />
          <span className="truncate text-gold-strong">{hall.name}</span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ============ Left column ============ */}
          <div className="space-y-8 lg:col-span-2">
            {/* Cover banner with double-mat frame */}
            <div className="frame-mat overflow-hidden rounded-2xl p-2">
              <div className="group relative h-[24rem] w-full overflow-hidden rounded-xl bg-espresso">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={hall.name}
                    className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3a2e18] via-[#2a2113] to-[#1c1509]">
                    <div
                      className="absolute inset-0 opacity-[0.1]"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'%3E%3Cg fill='none' stroke='%23cda964' stroke-width='1'%3E%3Crect x='26' y='26' width='32' height='32'/%3E%3Crect x='26' y='26' width='32' height='32' transform='rotate(45 42 42)'/%3E%3Ccircle cx='42' cy='42' r='4.5'/%3E%3C/g%3E%3C/svg%3E\")",
                      }}
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/95 via-espresso/25 to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col items-start gap-3 text-white">
                  <span className="badge-gold">
                    <Hotel className="h-3 w-3" />
                    To&apos;y zali
                  </span>
                  <h1 className="font-display text-3xl font-bold tracking-tight drop-shadow-md sm:text-[2.6rem]">
                    {hall.name}
                  </h1>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-[#d8cbae]">
                    <MapPin className="h-4 w-4 shrink-0 text-gold" />
                    {hall.address}
                    {hall.region_name && <span className="text-[#a29377]">· {hall.region_name}</span>}
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

            {/* Gallery */}
            {galleryImages.length > 0 && (
              <div className="card-lux space-y-4 p-6">
                <h3 className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
                  <ImageIcon className="h-5 w-5 text-gold" />
                  <span>Galereya</span>
                  <span className="badge-outline">{galleryImages.length} ta rasm</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={`g-${img.id || idx}`}
                      onClick={() => setActiveImageModal(img.url)}
                      className="group relative h-32 overflow-hidden rounded-xl border border-line"
                    >
                      <img
                        src={img.url}
                        alt={`Gallery ${idx + 1}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <span className="absolute inset-0 flex items-center justify-center bg-espresso/40 text-[11px] font-extrabold uppercase tracking-widest text-[#f2e9d6] opacity-0 transition-opacity group-hover:opacity-100">
                        Ko&apos;rish
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specs card */}
            <div className="card-lux space-y-6 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-ink">Zal ma&apos;lumotlari</h3>
                <span className="h-px w-24 bg-gradient-to-r from-gold/60 to-transparent" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="pattern-weave rounded-xl border border-line bg-surface-2/60 p-5">
                  <span className="field-label">Maksimal sig&apos;im</span>
                  <span className="mt-1.5 flex items-center gap-2 font-display text-2xl font-bold text-ink">
                    <Users className="h-6 w-6 text-gold" />
                    {hall.max_capacity} kishi
                  </span>
                </div>

                <div className="pattern-weave rounded-xl border border-line bg-surface-2/60 p-5">
                  <span className="field-label">Talab qilinadigan zakalat</span>
                  <span className="mt-1.5 block font-display text-2xl font-bold text-gold-strong">
                    {parseFloat(hall.required_deposit).toLocaleString('uz-UZ')} UZS
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-line pt-5">
                <h4 className="text-xs font-black uppercase tracking-[0.16em] text-ink-faint">Tavsif</h4>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                  {hall.description || "Zal haqida batafsil ma'lumot kiritilmagan."}
                </p>
              </div>

              {Array.isArray(hall.amenities) && hall.amenities.length > 0 && (
                <div className="border-t border-dashed border-line pt-5">
                  <h4 className="text-xs font-black uppercase tracking-[0.16em] text-ink-faint">
                    Mavjud qulayliklar
                  </h4>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {hall.amenities.map((key) => {
                      const item = AMENITY_MAP[key] || { label: key, icon: Hotel };
                      const Icon = item.icon;
                      return (
                        <div
                          key={key}
                          className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/50 p-3.5 text-[13px] font-bold text-ink"
                        >
                          <span className="flex h-8 w-8 shrink-0 rotate-45 items-center justify-center border border-gold/40 bg-gold-tint">
                            <Icon className="h-3.5 w-3.5 rotate-[-45deg] text-gold-strong" />
                          </span>
                          <span>{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(hall.video_url || hall.map_link) && (
                <div className="flex flex-wrap gap-3 border-t border-dashed border-line pt-5">
                  {hall.video_url && (
                    <a
                      href={hall.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline !py-2.5 !text-xs"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      <span>Video sharhni ko&apos;rish</span>
                    </a>
                  )}
                  {hall.map_link && (
                    <a
                      href={hall.map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ink !py-2.5 !text-xs"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Xaritada ochish</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Occupancy calendar */}
            <VenueCalendar hallId={hall.id} />
          </div>

          {/* ============ Right: booking sidebar ============ */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <HallBookingForm hall={hall} />
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {activeImageModal && (
        <div
          onClick={() => setActiveImageModal(null)}
          className="fade-in-soft fixed inset-0 z-50 flex items-center justify-center bg-espresso/90 p-4 backdrop-blur-md"
        >
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-gold/30">
            <img src={activeImageModal} alt="Enlarged gallery view" className="h-full w-full object-contain" />
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute right-4 top-4 rounded-full border border-gold/40 bg-black/40 p-2 text-gold-soft backdrop-blur-md transition-colors hover:bg-gold hover:text-espresso"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
