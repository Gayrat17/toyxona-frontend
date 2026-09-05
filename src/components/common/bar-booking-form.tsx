'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Bar } from '@/types';
import { useAuth } from '@/store/auth-context';
import {
  createBarBookingRequest,
  fetchBarCalendarRequest,
} from '@/services/bookings';
import { getErrorMessage } from '@/utils/errors';
import {
  isPastTime,
  localDateString,
  parseLocalDate,
  timeMinutes,
  timesOverlap,
} from '@/utils/date';
import { busyBarSlot, formatMoney } from '@/utils/booking';
import { ErrorAlert } from './error-alert';
import {
  BookingDateField,
  BookingHeading,
  BookingSuccess,
} from './booking-shared';

export function BarBookingForm({
  bar,
  date,
  onDateChange,
}: {
  bar: Bar;
  date: string;
  onDateChange: (date: string) => void;
}) {
  const { user } = useAuth();
  const client = useQueryClient();
  const [start, setStart] = useState('18:00');
  const [end, setEnd] = useState('22:00');
  const [guests, setGuests] = useState(String(Math.min(10, bar.capacity)));
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedDate = parseLocalDate(date);
  const validDate = !!selectedDate && date >= localDateString();
  const year = selectedDate?.getFullYear() || 0;
  const month = (selectedDate?.getMonth() ?? -1) + 1;
  const calendar = useQuery({
    queryKey: ['calendar', 'bars', bar.id, year, month],
    queryFn: () => fetchBarCalendarRequest(bar.id, year, month),
    enabled: validDate,
    staleTime: 15000,
  });
  const slots =
    calendar.data?.busy_slots.filter(
      (slot) => slot.date === date && busyBarSlot(slot),
    ) || [];
  const duration =
    Math.max(0, (timeMinutes(end) - timeMinutes(start)) / 60) || 0;
  const overlap = slots.some((slot) =>
    timesOverlap(start, end, slot.start_time, slot.end_time),
  );
  const guestCount = Number(guests);
  const validGuests =
    Number.isInteger(guestCount) &&
    guestCount >= 1 &&
    guestCount <= bar.capacity;
  const canBook =
    validDate &&
    duration > 0 &&
    validGuests &&
    !isPastTime(date, start) &&
    !overlap &&
    calendar.isSuccess &&
    !calendar.isFetching;
  const loginHref = `/login?next=${encodeURIComponent(`/venues/bars/${bar.id}${date ? `?date=${date}` : ''}`)}`;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    if (!user) return setError('Bron qilish uchun avval tizimga kiring.');
    if (!canBook)
      return setError(
        'Bo‘sh sana, to‘g‘ri vaqt oralig‘i va mehmonlar sonini tanlang.',
      );
    setSubmitting(true);
    try {
      await createBarBookingRequest({
        bar: bar.id,
        date,
        start_time: start,
        end_time: end,
        guest_count: guestCount,
      });
      onDateChange('');
      setSuccess(true);
      void client.invalidateQueries({ queryKey: ['calendar'] });
      void client.invalidateQueries({ queryKey: ['barBookings'] });
    } catch (err) {
      setError(getErrorMessage(err, 'Bron so‘rovini yuborib bo‘lmadi.'));
      void calendar.refetch();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form
        id="booking-form"
        onSubmit={submit}
        className="card-lux overflow-hidden"
        aria-label="Barni band qilish"
      >
        <BookingHeading title="Barni band qilish" />
        <fieldset disabled={submitting} className="space-y-6 p-5 sm:p-6">
          {error && <ErrorAlert message={error} />}
          <BookingDateField date={date} onChange={onDateChange} />
          {validDate && calendar.isError && (
            <ErrorAlert
              message="Band vaqtlarni tekshirib bo‘lmadi. Hozircha bron yuborilmaydi."
              onRetry={() => {
                void calendar.refetch();
              }}
            />
          )}
          {validDate && calendar.isFetching && (
            <p role="status" className="text-xs text-ink-soft">
              Band vaqtlar tekshirilmoqda…
            </p>
          )}
          {!!slots.length && (
            <div className="rounded-xl border border-line bg-surface-2 p-3">
              <p className="text-xs font-bold text-ink-soft">
                Bu sanadagi band vaqtlar:
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {slots.map((slot, index) => (
                  <li
                    key={index}
                    className="rounded-full border border-danger/30 bg-danger/10 px-2 py-1 text-xs font-bold text-danger"
                  >
                    {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <fieldset>
            <legend className="field-label mb-3">2. Soat oralig‘i</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-bold text-ink-soft">
                Boshlanish
                <input
                  type="time"
                  required
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="input-lux mt-2"
                />
              </label>
              <label className="block text-xs font-bold text-ink-soft">
                Tugash
                <input
                  type="time"
                  required
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="input-lux mt-2"
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              Bir kun ichidagi vaqt oralig‘ini tanlang.
            </p>
            {duration <= 0 && (
              <p role="status" className="mt-2 text-xs text-danger">
                Tugash vaqti boshlanish vaqtidan keyin bo‘lishi kerak.
              </p>
            )}
            {validDate && isPastTime(date, start) && (
              <p role="status" className="mt-2 text-xs text-danger">
                O‘tgan vaqtga bron berib bo‘lmaydi.
              </p>
            )}
            {overlap && (
              <p role="status" className="mt-2 text-xs font-bold text-danger">
                Tanlangan vaqt band vaqt bilan kesishmoqda. Boshqa vaqtni
                tanlang.
              </p>
            )}
          </fieldset>
          <label className="field-label">
            3. Mehmonlar soni
            <input
              type="number"
              min={1}
              max={bar.capacity}
              step={1}
              required
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="input-lux mt-3"
            />
            <span className="mt-2 block text-xs font-medium normal-case tracking-normal">
              Maksimal sig‘im: {bar.capacity} kishi
            </span>
          </label>
          <div className="space-y-3 rounded-xl border border-dashed border-line-strong bg-surface-2/60 p-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="text-ink-soft">Soatlik narx</span>
              <strong>{formatMoney(bar.price_per_hour)}</strong>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <span className="text-ink-soft">Davomiyligi</span>
              <strong>{duration} soat</strong>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-3">
              <span className="text-ink-soft">Jami</span>
              <strong>
                {formatMoney(duration * Number(bar.price_per_hour))}
              </strong>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <span className="text-ink-soft">Zakalat</span>
              <strong className="text-success">
                {formatMoney(bar.required_deposit)}
              </strong>
            </div>
            <p className="text-xs leading-relaxed text-ink-soft">
              Zakalat joy egasi bilan kelishilgan holda to‘lanadi.
            </p>
          </div>
          {user ? (
            <button
              type="submit"
              disabled={submitting || !canBook}
              className="btn-gold w-full !py-3.5"
            >
              {submitting ? 'Yuborilmoqda…' : 'Bron so‘rovini yuborish'}
            </button>
          ) : (
            <Link href={loginHref} className="btn-gold w-full !py-3.5">
              Bron qilish uchun kirish
            </Link>
          )}
        </fieldset>
      </form>
      <BookingSuccess
        open={success}
        onClose={() => setSuccess(false)}
        phone={bar.owner_phone}
      />
    </>
  );
}

export default BarBookingForm;
