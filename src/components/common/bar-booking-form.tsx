'use client';

import React, { useState, useEffect } from 'react';
import { createBarBookingRequest } from '@/services/bookings';
import { Bar } from '@/types';
import { Calendar, Clock, Users, DollarSign, Sparkles, CheckCircle, Phone, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface BarBookingFormProps {
  bar: Bar;
}

const TIME_OPTIONS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", 
  "20:00", "21:00", "22:00", "23:00"
];

export const BarBookingForm: React.FC<BarBookingFormProps> = ({ bar }) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('22:00');
  const [guestCount, setGuestCount] = useState<number>(10);
  
  const [duration, setDuration] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Time difference parsing helper
  const parseTimeToDecimal = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h + m / 60;
  };

  // Real-time calculation on input state changes
  useEffect(() => {
    if (startTime && endTime) {
      const start = parseTimeToDecimal(startTime);
      const end = parseTimeToDecimal(endTime);
      const diff = end - start;

      if (diff > 0) {
        setDuration(diff);
        setTotalPrice(diff * parseFloat(bar.price_per_hour));
      } else {
        setDuration(0);
        setTotalPrice(0);
      }
    }
  }, [startTime, endTime, bar.price_per_hour]);

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

    if (duration <= 0) {
      setError("Tugash soati boshlanish soatidan keyin bo'lishi shart.");
      return;
    }

    if (guestCount > bar.capacity) {
      setError(`Mehmonlar soni bar sig'imidan (${bar.capacity} kishi) oshmasligi kerak.`);
      return;
    }

    setIsSubmitting(true);

    try {
      await createBarBookingRequest({
        bar: bar.id,
        date,
        start_time: startTime,
        end_time: endTime,
        guest_count: guestCount,
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
      } else if (err.response?.data) {
        // Collect field validation messages dynamically
        const firstErrorKey = Object.keys(err.response.data)[0];
        const errorVal = err.response.data[firstErrorKey];
        if (Array.isArray(errorVal)) {
          setError(`${firstErrorKey}: ${errorVal[0]}`);
        } else {
          setError(JSON.stringify(err.response.data));
        }
      } else {
        setError("Ushbu vaqtda bar band bo'lishi mumkin. Iltimos boshqa soat oralig'ini tanlang.");
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
          <span>Barni band qilish</span>
        </h3>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-500 border border-rose-500/20">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Date Picker */}
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

        {/* 2. Start & End Time Dropdowns */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Boshlanish soati
            </label>
            <div className="relative mt-2">
              <Clock className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={`start-${time}`} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tugash soati
            </label>
            <div className="relative mt-2">
              <Clock className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {TIME_OPTIONS.map((time) => (
                  <option key={`end-${time}`} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {duration <= 0 && startTime && endTime && (
          <p className="mt-2 text-xs text-rose-500 italic">
            Tugash soati boshlanish soatidan keyin bo&apos;lishi shart.
          </p>
        )}

        {/* 3. Guest Count Number Input */}
        <div className="mt-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            3. Mehmonlar soni
          </label>
          <div className="relative mt-2">
            <Users className="absolute top-3 left-3 h-5 w-5 text-slate-400" />
            <input
              type="number"
              min="1"
              max={bar.capacity}
              required
              value={guestCount}
              onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Maksimal sig&apos;im: {bar.capacity} kishi
          </p>
        </div>

        {/* Pricing calculation summary display */}
        <div className="mt-8 rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Soatlik narxi:</span>
            <span className="font-semibold text-slate-800 dark:text-white">
              {parseFloat(bar.price_per_hour).toLocaleString()} UZS
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-slate-500">Davomiyligi:</span>
            <span className="font-semibold text-slate-800 dark:text-white">
              {duration} soat
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-500 font-semibold">Jami hisoblangan:</span>
            <span className="font-bold text-slate-800 dark:text-white text-base">
              {totalPrice.toLocaleString()} UZS
            </span>
          </div>
          <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
            <span className="text-slate-400 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" /> Talab qilinadigan zakalat:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {parseFloat(bar.required_deposit).toLocaleString()} UZS
            </span>
          </div>
        </div>

        {/* Submit trigger button */}
        <button
          type="submit"
          disabled={isSubmitting || duration <= 0}
          className="mt-6 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            "Bron qilish"
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
              Bar egasi bilan uchrashish, zakalat to&apos;lovini amalga oshirish va shartlarni kelishish uchun quyidagi raqamga bog&apos;laning:
            </p>

            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/80 dark:border-slate-800/60">
              <Phone className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-bold text-slate-800 dark:text-white text-lg">
                {bar.owner_phone || "+998 90 123 45 67"}
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
export default BarBookingForm;
