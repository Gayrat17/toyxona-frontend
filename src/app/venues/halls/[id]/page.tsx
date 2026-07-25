'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchHallByIdRequest } from '@/services/venues';
import { HallBookingForm } from '@/components/common/hall-booking-form';
import { VenueCalendar } from '@/components/common/venue-calendar';
import { useAuth } from '@/store/auth-context';
import Link from 'next/link';
import { 
  Sparkles, MapPin, Users, Hotel, ArrowLeft, Heart, Share2, LogIn, LogOut, 
  User as UserIcon, Car, Wifi, Wind, Volume2, ShieldCheck, Utensils, Coffee, 
  Play, ExternalLink, Image as ImageIcon
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
  security: { label: 'Qo\'riqlash va Video-kuzatuv', icon: ShieldCheck },
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
  const { user, logout } = useAuth();
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  // Fetch hall details using react-query
  const { data: hall, isLoading, error } = useQuery<WeddingHall>({
    queryKey: ['hall', hallId],
    queryFn: () => fetchHallByIdRequest(hallId),
    enabled: !isNaN(hallId),
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !hall) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 text-center dark:bg-slate-950 px-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Zal topilmadi</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-xs">
          Siz qidirayotgan to&apos;yxona ma&apos;lumotlari topilmadi yoki backend tizimi bilan ulanish mavjud emas.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" /> Bosh sahifaga qaytish
        </Link>
      </div>
    );
  }

  const coverUrl = getVenueCover(hall);
  const galleryImages = (hall.gallery_images || []).map((img: any) => ({
    id: img.id,
    url: getMediaUrl(img.image_url || img.image),
  })).filter((img: any) => Boolean(img.url));

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-6 w-6" />
            <span>TO&apos;YXONA</span>
          </Link>

          {/* User actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={
                    user.role === 'ADMIN'
                      ? '/admin/dashboard'
                      : user.role === 'VENUE_OWNER'
                      ? '/dashboard/venues'
                      : '/'
                  }
                  className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-800/80 dark:hover:text-indigo-400 transition-colors shadow-sm cursor-pointer"
                >
                  <UserIcon className="h-4 w-4 text-indigo-500" />
                  <span>{user.first_name || 'Foydalanuvchi'}</span>
                  {user.role === 'VENUE_OWNER' && (
                    <span className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      Joy egasi
                    </span>
                  )}
                  {user.role === 'ADMIN' && (
                    <span className="rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-600 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      Admin
                    </span>
                  )}
                </Link>
                <button
                  onClick={logout}
                  className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-900"
                  title="Chiqish"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
              >
                <LogIn className="h-4 w-4" />
                <span>Kirish</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Back navigation */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Bosh sahifaga qaytish</span>
        </Link>

        {/* Details Grid Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Columns - Details, description, gallery, and occupancy calendar */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Main Cover Banner */}
            <div className="relative h-96 w-full overflow-hidden rounded-3xl bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 group">
              {coverUrl ? (
                <>
                  <img 
                    src={coverUrl} 
                    alt={hall.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 via-teal-600 to-indigo-700 opacity-80" />
                </>
              )}
              
              {/* Graphic Overlay info */}
              <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col gap-2 text-white">
                <span className="inline-flex items-center gap-1 rounded-md bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white w-fit">
                  <Hotel className="h-3.5 w-3.5" /> To&apos;yxona
                </span>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-md">{hall.name}</h1>
                <p className="text-sm text-slate-200 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0 text-emerald-400" /> {hall.address}
                </p>
              </div>

              {/* Share & Wishlist Floating buttons */}
              <div className="absolute top-6 right-6 flex gap-3 z-20">
                <button className="rounded-full bg-slate-900/40 p-2.5 backdrop-blur-md text-white hover:bg-slate-900/60 transition-colors shadow-sm">
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="rounded-full bg-slate-900/40 p-2.5 backdrop-blur-md text-white hover:bg-slate-900/60 transition-colors shadow-sm">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Photo Gallery Section */}
            {galleryImages.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-indigo-600" />
                  <span>Rasmlar Galereyasi ({galleryImages.length})</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {galleryImages.map((img, idx) => (
                    <div 
                      key={`g-${img.id || idx}`}
                      onClick={() => setActiveImageModal(img.url)}
                      className="relative h-32 overflow-hidden rounded-2xl border border-slate-200 shadow-sm cursor-pointer group dark:border-slate-800"
                    >
                      <img 
                        src={img.url} 
                        alt={`Gallery ${idx + 1}`} 
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        Kattalashtirish
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hall Specs Summary Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Zal ma&apos;lumotlari</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Maksimal Sig&apos;im</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 flex items-center gap-2">
                    <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    {hall.max_capacity} kishi
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Talab qilinadigan zakalat</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {parseFloat(hall.required_deposit).toLocaleString()} UZS
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <h4 className="font-bold text-slate-800 dark:text-white mb-2">Tavsif</h4>
                <p className="text-sm text-slate-600 leading-relaxed dark:text-slate-300 whitespace-pre-line">
                  {hall.description || "Zal haqida batafsil ma'lumot kiritilmagan."}
                </p>
              </div>

              {/* Amenities */}
              {Array.isArray(hall.amenities) && hall.amenities.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-4">Mavjud qulayliklar</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {hall.amenities.map((key) => {
                      const item = AMENITY_MAP[key] || { label: key, icon: Sparkles };
                      const Icon = item.icon;
                      return (
                        <div key={key} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-3 text-xs font-bold text-slate-700 dark:text-slate-200">
                          <Icon className="h-4 w-4 text-indigo-500 shrink-0" />
                          <span>{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Video and Map External Links */}
              {(hall.video_url || hall.map_link) && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-4">
                  {hall.video_url && (
                    <a
                      href={hall.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 px-4 py-2.5 text-xs font-bold hover:bg-rose-100 transition-colors"
                    >
                      <Play className="h-4 w-4 fill-rose-600" />
                      <span>Video Sharhni Ko&apos;rish (YouTube)</span>
                    </a>
                  )}

                  {hall.map_link && (
                    <a
                      href={hall.map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 px-4 py-2.5 text-xs font-bold hover:bg-indigo-100 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Xaritada Ochish</span>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Occupancy Calendar visualization */}
            <VenueCalendar hallId={hall.id} />

          </div>

          {/* Right Column - Booking Form sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <HallBookingForm hall={hall} />
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Image Modal */}
      {activeImageModal && (
        <div 
          onClick={() => setActiveImageModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-hidden rounded-3xl bg-black">
            <img src={activeImageModal} alt="Enlarged gallery view" className="h-full w-full object-contain" />
            <button 
              onClick={() => setActiveImageModal(null)}
              className="absolute top-4 right-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/40 backdrop-blur-md transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Footer bar */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-950 mt-12">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Toyxona B2B Platformasi. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}
