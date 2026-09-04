'use client';

import React, { useState, useEffect } from 'react';
import { createBarBookingRequest } from '@/services/bookings';
import { Bar } from '@/types';
import { Calendar, Clock, Users, Sparkles, CheckCircle, Phone, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface BarBookingFormProps {
  bar: Bar;
}

const TIME_OPTIONS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00',
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

  const parseTimeToDecimal = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h + m / 60;
  };

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
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
    ];
    const d = new Date(year, monthIdx, day);
    const weekDaysUz = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];

    return `${day}-${monthsUz[monthIdx]} ${year}, ${weekDaysUz[d.getDay()]}`;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date) {
      setError('Sanani tanlang.');
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
        setError('Bron qilish uchun iltimos avval tizimga kiring.');
      } else if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors[0]);
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data) {
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

  const stepLabel = (n: number, text: string) => (
    <label className="flex items-center gap-2.5">
      <span className="flex h-5 w-5 rotate-45 items-center justify-center bg-gradient-to-br from-[#ecd49c] to-[#c9a35f] text-[10px] font-black text-[#251b0c]">
        <span className="rotate-[-45deg]">{n}</span>
      </span>
      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-ink-soft">{text}</span>
    </label>
  );

  return (
    <div className="relative">
      <form onSubmit={handleBooking} className="card-lux overflow-hidden">
        {/* Form header strip */}
        <div className="texture-grain relative bg-espresso px-6 py-5">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'%3E%3Cg fill='none' stroke='%23cda964' stroke-width='1'%3E%3Crect x='26' y='26' width='32' height='32'/%3E%3Crect x='26' y='26' width='32' height='32' transform='rotate(45 42 42)'/%3E%3Ccircle cx='42' cy='42' r='4.5'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="relative z-[2]">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Bron qilish</p>
            <h3 className="mt-1 font-display text-xl font-bold text-[#f2e9d6]">Barni band qilish</h3>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-danger/30 bg-danger/5 p-3.5 text-[13px] font-semibold text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Date */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              {stepLabel(1, 'Sanani tanlang')}
              {date && (
                <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-success">
                  <CheckCircle className="h-3 w-3" /> Tanlandi
                </span>
              )}
            </div>

            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
              <input
                type="date"
                min={getTodayString()}
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-lux !py-3 pl-10"
              />
            </div>

            {date && (
              <div className="flex items-center justify-between rounded-xl border border-gold/30 bg-gold-tint/70 px-3.5 py-2.5 text-xs">
                <span className="font-semibold text-ink-faint">Tanlangan sana:</span>
                <span className="font-extrabold text-gold-strong">{formatSelectedDateUz(date)}</span>
              </div>
            )}

            <div>
              <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.16em] text-ink-faint">
                Tezkor tanlov
              </span>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {[
                  { label: 'Bugun', key: 'today' as const },
                  { label: 'Ertaga', key: 'tomorrow' as const },
                  { label: 'Shanba', key: 'saturday' as const },
                  { label: 'Yakshanba', key: 'sunday' as const },
                ].map((preset) => {
                  const targetDate = getQuickDate(preset.key);
                  const isSelected = date === targetDate;
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => setDate(targetDate)}
                      className={`rounded-full border px-2 py-2 text-[11px] font-extrabold transition-all ${
                        isSelected
                          ? 'border-transparent bg-gradient-to-br from-[#ecd49c] to-[#c9a35f] text-[#251b0c] shadow-[0_8px_16px_-8px_rgba(150,110,50,0.7)]'
                          : 'border-line bg-surface text-ink-soft hover:border-gold/60 hover:text-gold-strong'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Time range */}
          <div>
            {stepLabel(2, 'Soat oralig‘i')}
            <div className="mt-2.5 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-ink-faint">
                  Boshlanish
                </label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="select-lux !py-2.5 pl-9 !text-sm"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={`start-${time}`} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.14em] text-ink-faint">
                  Tugash
                </label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
                  <select
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="select-lux !py-2.5 pl-9 !text-sm"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={`end-${time}`} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {duration <= 0 && startTime && endTime && (
              <p className="mt-2 text-xs font-semibold italic text-danger">
                Tugash soati boshlanish soatidan keyin bo&apos;lishi shart.
              </p>
            )}
          </div>

          {/* 3. Guests */}
          <div>
            {stepLabel(3, 'Mehmonlar soni')}
            <div className="relative mt-2.5">
              <Users className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
              <input
                type="number"
                min="1"
                max={bar.capacity}
                required
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                className="input-lux !py-3 pl-10"
              />
            </div>
            <p className="mt-1.5 text-[11px] font-semibold text-ink-faint">
              Maksimal sig&apos;im: {bar.capacity} kishi
            </p>
          </div>

          {/* Pricing receipt */}
          <div className="rounded-xl border border-dashed border-line-strong bg-surface-2/60 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-ink-soft">Soatlik narx</span>
              <span className="font-bold text-ink">{parseFloat(bar.price_per_hour).toLocaleString('uz-UZ')} UZS</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-ink-soft">Davomiyligi</span>
              <span className="font-bold text-ink">{duration} soat</span>
            </div>
            <div className="my-3 flex items-center gap-2">
              <span className="h-px flex-1 bg-line" />
              <Sparkles className="h-3 w-3 text-gold" />
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-soft">Jami</span>
              <span className="font-display text-lg font-bold text-ink">{totalPrice.toLocaleString('uz-UZ')} UZS</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-[0.14em] text-ink-faint">Zakalat</span>
              <span className="font-black text-success">
                {parseFloat(bar.required_deposit).toLocaleString('uz-UZ')} UZS
              </span>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting || duration <= 0} className="btn-gold w-full !py-4">
            {isSubmitting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#251b0c] border-t-transparent" />
            ) : (
              'Bron qilish'
            )}
          </button>
        </div>
      </form>

      {/* Success modal */}
      {successModalOpen && (
        <div className="fade-in-soft fixed inset-0 z-50 flex items-center justify-center bg-espresso/70 p-4 backdrop-blur-md">
          <div className="modal-pop relative w-full max-w-md overflow-hidden rounded-2xl border border-gold/40 bg-surface text-center shadow-2xl">
            <div className="texture-grain relative bg-espresso px-6 py-8">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.09]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'%3E%3Cg fill='none' stroke='%23cda964' stroke-width='1'%3E%3Crect x='26' y='26' width='32' height='32'/%3E%3Crect x='26' y='26' width='32' height='32' transform='rotate(45 42 42)'/%3E%3Ccircle cx='42' cy='42' r='4.5'/%3E%3C/g%3E%3C/svg%3E\")",
                }}
              />
              <button
                onClick={() => setSuccessModalOpen(false)}
                className="absolute right-4 top-4 rounded-full p-1.5 text-[#b7a888] transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <span className="relative z-[2] mx-auto flex h-14 w-14 rotate-45 items-center justify-center border border-gold/60 bg-gradient-to-br from-[#ecd49c] to-[#c9a35f] shadow-[0_14px_30px_-10px_rgba(150,110,50,0.8)]">
                <CheckCircle className="h-7 w-7 rotate-[-45deg] text-[#251b0c]" />
              </span>
            </div>

            <div className="p-6 sm:p-8">
              <h3 className="font-display text-2xl font-bold text-ink">So&apos;rovingiz qabul qilindi!</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Bar egasi bilan uchrashish, zakalat to&apos;lovini amalga oshirish va shartlarni
                kelishish uchun quyidagi raqamga bog&apos;laning:
              </p>

              <div className="mt-6 flex items-center justify-center gap-2.5 rounded-xl border border-gold/40 bg-gold-tint/60 p-4">
                <Phone className="h-5 w-5 shrink-0 text-gold-strong" />
                <span className="font-display text-lg font-bold tracking-wide text-ink">
                  {bar.owner_phone || '+998 90 123 45 67'}
                </span>
              </div>

              <div className="mt-7 flex gap-3">
                <button onClick={() => setSuccessModalOpen(false)} className="btn-quiet flex-1 !border !border-line">
                  Yopish
                </button>
                <Link href="/" className="btn-gold flex-1">
                  Bosh sahifa
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarBookingForm;
