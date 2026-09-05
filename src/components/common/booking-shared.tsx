'use client';

import Link from 'next/link';
import { Calendar, CheckCircle, Phone } from 'lucide-react';
import { localDateString, formatDateUz, quickDate } from '@/utils/date';
import { Modal } from './modal';

export function BookingDateField({
  date,
  onChange,
}: {
  date: string;
  onChange: (date: string) => void;
}) {
  return (
    <div className="space-y-3">
      <label htmlFor="booking-date" className="field-label">
        1. Tadbir sanasi
      </label>
      <div className="relative">
        <Calendar className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
        <input
          id="booking-date"
          type="date"
          required
          min={localDateString()}
          value={date}
          onChange={(e) => onChange(e.target.value)}
          className="input-lux input-with-icon"
        />
      </div>
      {date && (
        <p className="rounded-xl border border-gold/30 bg-gold-tint/60 p-3 text-xs font-bold leading-relaxed text-gold-strong">
          {formatDateUz(date)}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { key: 'today', label: 'Bugun' },
            { key: 'tomorrow', label: 'Ertaga' },
            { key: 'saturday', label: 'Shanba' },
            { key: 'sunday', label: 'Yakshanba' },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            aria-pressed={date === quickDate(key)}
            onClick={() => onChange(quickDate(key))}
            className={`rounded-full border px-2 py-2 text-xs font-bold ${date === quickDate(key) ? 'border-gold bg-gold-tint text-gold-strong' : 'border-line text-ink-soft hover:border-gold'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function BookingSuccess({
  open,
  onClose,
  phone,
}: {
  open: boolean;
  onClose: () => void;
  phone?: string;
}) {
  const phoneNumber = phone?.replace(/[^+\d]/g, '');
  return (
    <Modal open={open} onClose={onClose} title="So‘rovingiz qabul qilindi!">
      <div className="space-y-5 p-6 text-center">
        <CheckCircle className="mx-auto h-12 w-12 text-success" />
        <p className="text-sm leading-relaxed text-ink-soft">
          Bu hali yakuniy tasdiq emas. Joy egasi bilan shartlarni va zakalat
          to‘lovini kelishib oling.
        </p>
        {phoneNumber ? (
          <a
            href={`tel:${phoneNumber}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold-tint p-4 font-bold text-gold-strong"
          >
            <Phone className="h-5 w-5" />
            {phone}
          </a>
        ) : (
          <p className="text-sm text-ink-soft">
            Joy egasining telefon raqami ko‘rsatilmagan. Egasi so‘rovingizni
            ko‘rib chiqishini kuting.
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={onClose} className="btn-outline">
            Davom etish
          </button>
          <Link href="/" className="btn-gold">
            Bosh sahifa
          </Link>
        </div>
      </div>
    </Modal>
  );
}

export function BookingHeading({ title }: { title: string }) {
  return (
    <div className="bg-espresso p-5 sm:px-6">
      <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#d4b77e]">
        Bron qilish
      </p>
      <h2 className="mt-1 font-display text-xl font-bold text-[#f2e9d6]">
        {title}
      </h2>
    </div>
  );
}
