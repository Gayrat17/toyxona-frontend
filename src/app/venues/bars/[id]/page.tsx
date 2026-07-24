'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchBarByIdRequest } from '@/services/venues';
import { BarBookingForm } from '@/components/common/bar-booking-form';
import { useAuth } from '@/store/auth-context';
import Link from 'next/link';
import { Sparkles, MapPin, Users, Wine, ArrowLeft, Heart, Share2, LogIn, LogOut, User as UserIcon, Clock } from 'lucide-react';
import { Bar } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BarDetailPage({ params }: PageProps) {
  const resolvedParams = React.use(params);
  const barId = parseInt(resolvedParams.id);
  const { user, logout } = useAuth();

  // Fetch bar details using react-query
  const { data: bar, isLoading, error } = useQuery<Bar>({
    queryKey: ['bar', barId],
    queryFn: () => fetchBarByIdRequest(barId),
    enabled: !isNaN(barId),
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

  if (error || !bar) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 text-center dark:bg-slate-950 px-4">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Bar topilmadi</h3>
        <p className="mt-2 text-sm text-slate-500 max-w-xs">
          Siz qidirayotgan bar ma&apos;lumotlari topilmadi yoki backend tizimi bilan ulanish mavjud emas.
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

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      
      {/* Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-black text-xl text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-6 w-6" />
            <span>TOYXO&apos;NA</span>
          </Link>

          {/* User actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  <span>{user.first_name || 'Foydalanuvchi'}</span>
                </div>
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
          
          {/* Left Columns - Details, description, and gallery */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Gallery Placeholder */}
            <div className="relative h-96 w-full overflow-hidden rounded-3xl bg-slate-200 dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              {/* CSS Gradient mesh background representing a beautiful bar view */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 via-indigo-600 to-pink-500 opacity-70" />
              
              {/* Graphic Overlay representation */}
              <div className="relative z-10 flex flex-col items-center gap-4 text-white text-center px-6">
                <div className="rounded-full bg-white/10 p-5 backdrop-blur-md">
                  <Wine className="h-16 w-16" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight">{bar.name}</h2>
                <p className="text-sm text-slate-100 flex items-center gap-1.5 justify-center">
                  <MapPin className="h-4 w-4 shrink-0" /> {bar.address}
                </p>
              </div>

              {/* Share & Wishlist Floating buttons */}
              <div className="absolute top-6 right-6 flex gap-3 z-20">
                <button className="rounded-full bg-white/20 p-2.5 backdrop-blur-md text-white hover:bg-white/30 transition-colors shadow-sm">
                  <Share2 className="h-5 w-5" />
                </button>
                <button className="rounded-full bg-white/20 p-2.5 backdrop-blur-md text-white hover:bg-white/30 transition-colors shadow-sm">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Bar Specs Summary Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Bar ma&apos;lumotlari</h3>
              
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Sig&apos;imi</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-white mt-1 flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    {bar.capacity} kishi
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Soatbay Narx</span>
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
                    <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    {parseFloat(bar.price_per_hour).toLocaleString()} UZS
                  </span>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Kafolat zakalati</span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {parseFloat(bar.required_deposit).toLocaleString()} UZS
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
                <h4 className="font-semibold text-slate-800 dark:text-white">Tavsif</h4>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed dark:text-slate-300">
                  {bar.description || "Bar haqida batafsil ma'lumot kiritilmagan. Soatbay ijara va uchrashuv tafsilotlari bo'yicha bar egasiga murojaat qilishingiz mumkin."}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BarBookingForm bar={bar} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-950 mt-12">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Toyxona & Bar Booking. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
}
