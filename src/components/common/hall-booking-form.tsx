'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchShiftsRequest, fetchPackagesRequest, fetchDecorationsRequest } from '@/services/venues';
import { createHallBookingRequest } from '@/services/bookings';
import { WeddingHall, Shift, Package, Decoration } from '@/types';
import { Calendar, Users, Sparkles, CheckCircle, Phone, X, AlertCircle, Gem, Clock3 } from 'lucide-react';
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

  const hallShifts = shifts.filter((s) => s.hall === hall.id && s.is_active);
  const hallPackages = packages.filter((p) => p.hall === hall.id);
  const hallDecorations = decorations.filter((d) => d.hall === hall.id);

  const activePackage = hallPackages.find((p) => p.id === selectedPackage);
  const activeDecoration = hallDecorations.find((d) => d.id === selectedDecoration);

  const packagePrice = activePackage ? parseFloat(activePackage.price) : 0;
  const decorationPrice = activeDecoration ? parseFloat(activeDecoration.additional_price) : 0;
  const totalSum = packagePrice + decorationPrice;
  const requiredDeposit = parseFloat(hall.required_deposit);

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
    if (!selectedShift) {
      setError('Smenani tanlang.');
      return;
    }
    if (!selectedPackage) {
      setError('Paketni tanlang.');
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
        setError('Bron qilish uchun iltimos avval tizimga kiring.');
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

  /* Radio card shared styles */
  const optionState = (active: boolean) =>
    `flex cursor-pointer items-start justify-between rounded-xl border p-3.5 transition-all duration-200 ${
      active
        ? 'border-gold bg-gold-tint shadow-[0_10px_24px_-14px_rgba(150,110,50,0.65)]'
        : 'border-line bg-surface hover:border-gold/50 hover:bg-gold-tint/40'
    }`;

  const radioDot = (active: boolean) => (
    <span
      className={`ml-auto mt-1 flex h-[18px] w-[18px] shrink-0 rotate-45 items-center justify-center border transition-colors ${
        active ? 'border-gold-strong bg-gradient-to-br from-[#ecd49c] to-[#c9a35f]' : 'border-line-strong'
      }`}
    >
      {active && <span className="h-1.5 w-1.5 bg-[#251b0c]" />}
    </span>
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
            <h3 className="mt-1 font-display text-xl font-bold text-[#f2e9d6]">Zalni band qilish</h3>
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
              <label className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 rotate-45 items-center justify-center bg-gradient-to-br from-[#ecd49c] to-[#c9a35f] text-[10px] font-black text-[#251b0c]">
                  <span className="rotate-[-45deg]">1</span>
                </span>
                <span className="text-[11px] font-black uppercase tracking-[0.16em] text-ink-soft">
                  Sanani tanlang
                </span>
              </label>
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

          {/* 2. Shift */}
          <div>
            <label className="mb-2.5 flex items-center gap-2.5">
              <span className="flex h-5 w-5 rotate-45 items-center justify-center bg-gradient-to-br from-[#ecd49c] to-[#c9a35f] text-[10px] font-black text-[#251b0c]">
                <span className="rotate-[-45deg]">2</span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-ink-soft">
                Smenani tanlang
              </span>
            </label>
            <div className="space-y-2">
              {hallShifts.length > 0 ? (
                hallShifts.map((shift) => (
                  <label key={shift.id} className={optionState(selectedShift === shift.id)}>
                    <input
                      type="radio"
                      name="shift"
                      value={shift.id}
                      checked={selectedShift === shift.id}
                      onChange={() => setSelectedShift(shift.id)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-2.5">
                      <Clock3 className="h-4 w-4 text-gold" />
                      <div>
                        <p className="text-sm font-extrabold text-ink">{shift.name}</p>
                        <p className="mt-0.5 text-xs font-semibold text-ink-faint">
                          {shift.start_time.substring(0, 5)} — {shift.end_time.substring(0, 5)}
                        </p>
                      </div>
                    </div>
                    {radioDot(selectedShift === shift.id)}
                  </label>
                ))
              ) : (
                <p className="text-xs italic text-ink-faint">Hozircha smenalar qo&apos;shilmagan.</p>
              )}
            </div>
          </div>

          {/* 3. Package */}
          <div>
            <label className="mb-2.5 flex items-center gap-2.5">
              <span className="flex h-5 w-5 rotate-45 items-center justify-center bg-gradient-to-br from-[#ecd49c] to-[#c9a35f] text-[10px] font-black text-[#251b0c]">
                <span className="rotate-[-45deg]">3</span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-ink-soft">
                Paketni tanlang
              </span>
            </label>
            <div className="space-y-2">
              {hallPackages.length > 0 ? (
                hallPackages.map((pkg) => (
                  <label key={pkg.id} className={optionState(selectedPackage === pkg.id)}>
                    <input
                      type="radio"
                      name="package"
                      value={pkg.id}
                      checked={selectedPackage === pkg.id}
                      onChange={() => setSelectedPackage(pkg.id)}
                      className="sr-only"
                    />
                    <div className="pr-3">
                      <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink">
                        <Users className="h-4 w-4 text-gold" />
                        {pkg.guest_count} kishilik
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs font-medium text-ink-faint">{pkg.description}</p>
                      <p className="mt-1.5 text-sm font-black text-gold-strong">
                        {parseFloat(pkg.price).toLocaleString('uz-UZ')} UZS
                      </p>
                    </div>
                    {radioDot(selectedPackage === pkg.id)}
                  </label>
                ))
              ) : (
                <p className="text-xs italic text-ink-faint">Zal uchun narx paketlari kiritilmagan.</p>
              )}
            </div>
          </div>

          {/* 4. Decoration */}
          <div>
            <label className="mb-2.5 flex items-center gap-2.5">
              <span className="flex h-5 w-5 rotate-45 items-center justify-center bg-gradient-to-br from-[#ecd49c] to-[#c9a35f] text-[10px] font-black text-[#251b0c]">
                <span className="rotate-[-45deg]">4</span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-ink-soft">
                Bezatish — ixtiyoriy
              </span>
            </label>
            <div className="space-y-2">
              <label className={optionState(selectedDecoration === null)}>
                <input
                  type="radio"
                  name="decoration"
                  value="none"
                  checked={selectedDecoration === null}
                  onChange={() => setSelectedDecoration(null)}
                  className="sr-only"
                />
                <div className="pr-3">
                  <p className="text-sm font-extrabold text-ink">Oddiy bezatish</p>
                  <p className="mt-0.5 text-xs font-medium text-ink-faint">
                    Zalning standart bezaklari qo&apos;shimcha to&apos;lovsiz
                  </p>
                  <p className="mt-1.5 text-sm font-black text-ink-soft">0 UZS</p>
                </div>
                {radioDot(selectedDecoration === null)}
              </label>

              {hallDecorations.map((dec) => (
                <label key={dec.id} className={optionState(selectedDecoration === dec.id)}>
                  <input
                    type="radio"
                    name="decoration"
                    value={dec.id}
                    checked={selectedDecoration === dec.id}
                    onChange={() => setSelectedDecoration(dec.id)}
                    className="sr-only"
                  />
                  <div className="pr-3">
                    <p className="flex items-center gap-1.5 text-sm font-extrabold text-ink">
                      <Gem className="h-4 w-4 text-gold" />
                      {dec.name}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-ink-faint">Premium dizayndagi maxsus bezak</p>
                    <p className="mt-1.5 text-sm font-black text-gold-strong">
                      +{parseFloat(dec.additional_price).toLocaleString('uz-UZ')} UZS
                    </p>
                  </div>
                  {radioDot(selectedDecoration === dec.id)}
                </label>
              ))}
            </div>
          </div>

          {/* Pricing summary — receipt style */}
          <div className="rounded-xl border border-dashed border-line-strong bg-surface-2/60 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-ink-soft">Jami hisoblangan</span>
              <span className="font-display text-lg font-bold text-ink">{totalSum.toLocaleString('uz-UZ')} UZS</span>
            </div>
            <div className="my-3 flex items-center gap-2">
              <span className="h-px flex-1 bg-line" />
              <Sparkles className="h-3 w-3 text-gold" />
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-[0.14em] text-ink-faint">Zakalat</span>
              <span className="font-black text-success">{requiredDeposit.toLocaleString('uz-UZ')} UZS</span>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-gold w-full !py-4">
            {isSubmitting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#251b0c] border-t-transparent" />
            ) : (
              'Bron so&apos;rovini yuborish'
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
                Zal egasi bilan oflayn uchrashib, shartnomani tuzish va zakalat to&apos;lovini
                kelishish uchun quyidagi raqamga bog&apos;laning:
              </p>

              <div className="mt-6 flex items-center justify-center gap-2.5 rounded-xl border border-gold/40 bg-gold-tint/60 p-4">
                <Phone className="h-5 w-5 shrink-0 text-gold-strong" />
                <span className="font-display text-lg font-bold tracking-wide text-ink">
                  {hall.owner_phone || '+998 90 123 45 67'}
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

export default HallBookingForm;
