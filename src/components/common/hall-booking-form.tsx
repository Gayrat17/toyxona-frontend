'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchShiftsRequest, fetchPackagesRequest, fetchDecorationsRequest } from '@/services/venues';
import { createHallBookingRequest } from '@/services/bookings';
import { WeddingHall, Shift, Package, Decoration } from '@/types';
import { Calendar, Users, DollarSign, Sparkles, CheckCircle, Phone, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface HallBookingFormProps {
  hall: WeddingHall;
}

export const HallBookingForm: React.FC<HallBookingFormProps> = ({ hall }) => {
  const [date, setDate] = useState('');
  const [selectedShift, setSelectedShift] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedDecoration, setSelectedDecoration] = useState<number | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch shifts, packages, and decorations
  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ['shifts'],
    queryFn: fetchShiftsRequest,
  });

  const { data: packages = [] } = useQuery<Package[]>({
    queryKey: ['packages'],
    queryFn: fetchPackagesRequest,
  });

  const { data: decorations = [] } = useQuery<Decoration[]>({
    queryKey: ['decorations'],
    queryFn: fetchDecorationsRequest,
  });

  // Client-side filtering by hall_id
  const hallShifts = shifts.filter((s) => s.hall === hall.id && s.is_active);
  const hallPackages = packages.filter((p) => p.hall === hall.id);
  const hallDecorations = decorations.filter((d) => d.hall === hall.id);

  // Calculate real-time pricing sum
  const activePackage = hallPackages.find((p) => p.id === selectedPackage);
  const activeDecoration = hallDecorations.find((d) => d.id === selectedDecoration);

  const packagePrice = activePackage ? parseFloat(activePackage.price) : 0;
  const decorationPrice = activeDecoration ? parseFloat(activeDecoration.additional_price) : 0;
  const totalSum = packagePrice + decorationPrice;
  const requiredDeposit = parseFloat(hall.required_deposit);

  // Today's date formatted as YYYY-MM-DD to restrict past date selections
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getQuickDate = (type: 'today' | 'tomorrow' | 'saturday' | 'sunday') => {
    const d = new Date();
    if (type === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (type === 'saturday') {
      const day = d.getDay();
      const diff = (6 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
    } else if (type === 'sunday') {
      const day = d.getDay();
      const diff = (0 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + diff);
    }
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatSelectedDateUz = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0]);
    const monthIdx = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    const monthsUz = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];
    const d = new Date(year, monthIdx, day);
    const weekDaysUz = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

    return `${day}-${monthsUz[monthIdx]} ${year}, ${weekDaysUz[d.getDay()]}`;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError("Sanani tanlang.");
      return;
    }
    if (!selectedShift) {
      setError("Smenani tanlang.");
      return;
    }
    if (!selectedPackage) {
      setError("Paketni tanlang.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createHallBookingRequest({
        hall: hall.id,
        date,
        shift: selectedShift,
        package: selectedPackage,
        decoration: selectedDecoration,
      });
      setSuccessModalOpen(true);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("Bron qilish uchun iltimos avval tizimga kiring.");
      } else if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors[0]);
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Ushbu sana va smena band bo'lishi mumkin. Iltimos boshqa variant tanlang.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      
      {/* Booking Form Layout Card */}
      <form onSubmit={handleBooking} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span>Zalni band qilish</span>
        </h3>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-500 border border-rose-500/20">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Date Selection */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white shadow-sm">
                1
              </span>
              <span>Sanani tanlang</span>
            </label>

            {date && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle className="h-3 w-3" /> Tanlandi
              </span>
            )}
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-indigo-600 dark:text-indigo-400">
              <Calendar className="h-5 w-5" />
            </div>
            <input
              type="date"
              min={getTodayString()}
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full rounded-2xl border border-slate-200 bg-slate-50/80 py-3 pl-11 pr-4 text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-indigo-300 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-white dark:hover:border-indigo-700 dark:focus:border-indigo-500 dark:focus:bg-slate-900"
            />
          </div>

          {/* Formatted Date Uzbek Preview Banner */}
          {date && (
            <div className="flex items-center justify-between rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 p-3 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 transition-all">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Tanlangan sana:</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-300 text-sm">{formatSelectedDateUz(date)}</span>
            </div>
          )}

          {/* Quick Date Select Presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Tezkor tanlov:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { label: 'Bugun', key: 'today' as const },
                { label: 'Ertaga', key: 'tomorrow' as const },
                { label: 'Kelasi Shanba', key: 'saturday' as const },
                { label: 'Kelasi Yakshanba', key: 'sunday' as const },
              ].map((preset) => {
                const targetDate = getQuickDate(preset.key);
                const isSelected = date === targetDate;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => setDate(targetDate)}
                    className={`rounded-xl py-2 px-2.5 text-xs font-bold transition-all duration-150 border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-100/80 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400 border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Shift Selection */}
        <div className="mt-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            2. Smenani tanlang
          </label>
          <div className="mt-2 space-y-2">
            {hallShifts.length > 0 ? (
              hallShifts.map((shift) => (
                <label
                  key={shift.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all duration-200 ${
                    selectedShift === shift.id
                      ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-950/20'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="shift"
                    value={shift.id}
                    checked={selectedShift === shift.id}
                    onChange={() => setSelectedShift(shift.id)}
                    className="sr-only"
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{shift.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {shift.start_time.substring(0, 5)} - {shift.end_time.substring(0, 5)}
                    </p>
                  </div>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                    selectedShift === shift.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                  }`}>
                    {selectedShift === shift.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </label>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">Hozircha smenalar qo'shilmagan.</p>
            )}
          </div>
        </div>

        {/* 3. Package Selection */}
        <div className="mt-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            3. Paketni tanlang
          </label>
          <div className="mt-2 space-y-2">
            {hallPackages.length > 0 ? (
              hallPackages.map((pkg) => (
                <label
                  key={pkg.id}
                  className={`flex cursor-pointer items-start justify-between rounded-xl border p-3 transition-all duration-200 ${
                    selectedPackage === pkg.id
                      ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-950/20'
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="package"
                    value={pkg.id}
                    checked={selectedPackage === pkg.id}
                    onChange={() => setSelectedPackage(pkg.id)}
                    className="sr-only"
                  />
                  <div className="text-sm pr-4">
                    <p className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span>{pkg.guest_count} kishilik</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{pkg.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {parseFloat(pkg.price).toLocaleString()} UZS
                    </p>
                    <div className={`mt-2 ml-auto h-4 w-4 rounded-full border flex items-center justify-center ${
                      selectedPackage === pkg.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                    }`}>
                      {selectedPackage === pkg.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </label>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">Zal uchun narx paketlari kiritilmagan.</p>
            )}
          </div>
        </div>

        {/* 4. Decoration Selection */}
        <div className="mt-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            4. Bezatish (Dekoratsiya) - ixtiyoriy
          </label>
          <div className="mt-2 space-y-2">
            {/* Standard "no decoration" option */}
            <label
              className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all duration-200 ${
                selectedDecoration === null
                  ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-950/20'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50'
              }`}
            >
              <input
                type="radio"
                name="decoration"
                value="none"
                checked={selectedDecoration === null}
                onChange={() => setSelectedDecoration(null)}
                className="sr-only"
              />
              <div className="text-sm">
                <p className="font-semibold text-slate-700 dark:text-slate-200">Oddiy bezatish (Standard)</p>
                <p className="text-xs text-slate-400 mt-0.5">Zalning standart bezaklari qo&apos;shimcha to&apos;lovsiz</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-slate-500">0 UZS</p>
                <div className={`mt-2 ml-auto h-4 w-4 rounded-full border flex items-center justify-center ${
                  selectedDecoration === null ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                }`}>
                  {selectedDecoration === null && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </label>

            {hallDecorations.map((dec) => (
              <label
                key={dec.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all duration-200 ${
                  selectedDecoration === dec.id
                    ? 'border-indigo-500 bg-indigo-500/10 dark:bg-indigo-950/20'
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50'
                }`}
              >
                <input
                  type="radio"
                  name="decoration"
                  value={dec.id}
                  checked={selectedDecoration === dec.id}
                  onChange={() => setSelectedDecoration(dec.id)}
                  className="sr-only"
                />
                <div className="text-sm">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{dec.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Premium dizayndagi maxsus bezak</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    +{parseFloat(dec.additional_price).toLocaleString()} UZS
                  </p>
                  <div className={`mt-2 ml-auto h-4 w-4 rounded-full border flex items-center justify-center ${
                    selectedDecoration === dec.id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                  }`}>
                    {selectedDecoration === dec.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Real-time Pricing Summary display */}
        <div className="mt-8 rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Jami hisoblangan:</span>
            <span className="font-bold text-slate-800 dark:text-white text-base">
              {totalSum.toLocaleString()} UZS
            </span>
          </div>
          <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" /> Talab qilinadigan zakalat:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {requiredDeposit.toLocaleString()} UZS
            </span>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Bron qilish so'rovini yuborish"
          )}
        </button>
      </form>

      {/* Success Modal Overlay Dialog */}
      {successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 text-center animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSuccessModalOpen(false)}
              className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle className="h-8 w-8" />
            </div>

            <h3 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">
              So&apos;rovingiz qabul qilindi!
            </h3>
            
            <p className="mt-3 text-sm text-slate-500 leading-relaxed dark:text-slate-400">
              Restoran egasi bilan oflayn uchrashib, nikoh shartnomasini tuzish va zakalat to&apos;lovini kelishish uchun quyidagi raqamga bog&apos;laning:
            </p>

            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/80 dark:border-slate-800/60">
              <Phone className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-bold text-slate-800 dark:text-white text-lg">
                {hall.owner_phone || "+998 90 123 45 67"}
              </span>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSuccessModalOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Yopish
              </button>
              <Link
                href="/"
                className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white text-center hover:bg-indigo-500"
              >
                Bosh sahifa
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default HallBookingForm;
