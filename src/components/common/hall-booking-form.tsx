'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, Users } from 'lucide-react';
import type { WeddingHall } from '@/types';
import { useAuth } from '@/store/auth-context';
import {
  fetchShiftsRequest,
  fetchPackagesRequest,
  fetchDecorationsRequest,
} from '@/services/venues';
import {
  fetchHallCalendarRequest,
  createHallBookingRequest,
} from '@/services/bookings';
import { getErrorMessage } from '@/utils/errors';
import { isPastTime, localDateString, parseLocalDate } from '@/utils/date';
import { busyShift, formatMoney } from '@/utils/booking';
import { ErrorAlert } from './error-alert';
import { LoadingState } from './loading-state';
import {
  BookingDateField,
  BookingHeading,
  BookingSuccess,
} from './booking-shared';

export function HallBookingForm({
  hall,
  date,
  onDateChange,
}: {
  hall: WeddingHall;
  date: string;
  onDateChange: (date: string) => void;
}) {
  const { user, loading } = useAuth();
  const client = useQueryClient();
  const [selection, setSelection] = useState<{
    id: number;
    date: string;
  } | null>(null);
  const [packageId, setPackageId] = useState<number | null>(null);
  const [decorationId, setDecorationId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shifts = useQuery({
    queryKey: ['shifts'],
    queryFn: fetchShiftsRequest,
  });
  const packages = useQuery({
    queryKey: ['packages'],
    queryFn: fetchPackagesRequest,
  });
  const decorations = useQuery({
    queryKey: ['decorations'],
    queryFn: fetchDecorationsRequest,
  });
  const selectedDate = parseLocalDate(date);
  const validDate = !!selectedDate && date >= localDateString();
  const year = selectedDate?.getFullYear() || 0;
  const month = (selectedDate?.getMonth() ?? -1) + 1;
  const calendar = useQuery({
    queryKey: ['calendar', 'halls', hall.id, year, month],
    queryFn: () => fetchHallCalendarRequest(hall.id, year, month),
    enabled: validDate,
    staleTime: 15000,
  });
  const hallShifts =
    shifts.data?.filter((shift) => shift.hall === hall.id && shift.is_active) ||
    [];
  const hallPackages =
    packages.data?.filter(
      (pkg) => pkg.hall === hall.id && pkg.guest_count <= hall.max_capacity,
    ) || [];
  const hallDecorations =
    decorations.data?.filter((decoration) => decoration.hall === hall.id) || [];
  const selectedShift =
    selection?.date === date
      ? hallShifts.find((shift) => shift.id === selection.id)
      : undefined;
  const activePackage = hallPackages.find((pkg) => pkg.id === packageId);
  const activeDecoration = hallDecorations.find(
    (decoration) => decoration.id === decorationId,
  );
  const blocked = (id: number) =>
    calendar.data?.busy_shifts.some(
      (item) => item.date === date && item.shift_id === id && busyShift(item),
    );
  const canBook =
    validDate &&
    selectedShift &&
    !blocked(selectedShift.id) &&
    !isPastTime(date, selectedShift.start_time) &&
    activePackage &&
    calendar.isSuccess &&
    !calendar.isFetching &&
    !shifts.isError &&
    !packages.isError &&
    (!decorationId || !!activeDecoration);
  const loginHref = `/login?next=${encodeURIComponent(`/venues/halls/${hall.id}${date ? `?date=${date}` : ''}`)}`;
  const optionClass = (selected: boolean, unavailable = false) =>
    `flex items-start gap-3 rounded-xl border p-3.5 text-sm ${unavailable ? 'cursor-not-allowed border-line bg-surface-2 text-ink-faint' : selected ? 'cursor-pointer border-gold bg-gold-tint' : 'cursor-pointer border-line bg-surface hover:border-gold'}`;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    if (!user) return setError('Bron qilish uchun avval tizimga kiring.');
    if (!canBook || !selectedShift || !activePackage)
      return setError('Bo‘sh sana, smena va narx paketini tanlang.');
    setSubmitting(true);
    try {
      await createHallBookingRequest({
        hall: hall.id,
        date,
        shift: selectedShift.id,
        package: activePackage.id,
        decoration: activeDecoration?.id || null,
      });
      setSelection(null);
      setSuccess(true);
      void client.invalidateQueries({ queryKey: ['calendar'] });
      void client.invalidateQueries({ queryKey: ['hallBookings'] });
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
        aria-label="Zalni band qilish"
      >
        <BookingHeading title="Zalni band qilish" />
        <fieldset disabled={submitting} className="space-y-6 p-5 sm:p-6">
          {error && <ErrorAlert message={error} />}
          <BookingDateField date={date} onChange={onDateChange} />
          {(shifts.isError || packages.isError) && (
            <ErrorAlert
              message="Bron variantlarini yuklab bo‘lmadi."
              onRetry={() => {
                void shifts.refetch();
                void packages.refetch();
              }}
            />
          )}
          {validDate && calendar.isError && (
            <ErrorAlert
              message="Bandlikni tekshirib bo‘lmadi. Hozircha bron yuborilmaydi."
              onRetry={() => {
                void calendar.refetch();
              }}
            />
          )}
          <fieldset>
            <legend className="field-label mb-3">2. Smenani tanlang</legend>
            {!date && (
              <p className="mb-3 text-xs text-ink-soft">
                Bo‘sh smenalarni ko‘rish uchun avval sanani tanlang.
              </p>
            )}
            {(shifts.isLoading || (validDate && calendar.isFetching)) && (
              <p role="status" className="mb-3 text-xs text-ink-soft">
                Smenalar tekshirilmoqda…
              </p>
            )}
            <div className="space-y-2">
              {hallShifts.map((shift) => {
                const unavailable =
                  !validDate ||
                  !calendar.isSuccess ||
                  calendar.isFetching ||
                  !!blocked(shift.id) ||
                  isPastTime(date, shift.start_time);
                return (
                  <label
                    key={shift.id}
                    className={optionClass(
                      selectedShift?.id === shift.id,
                      unavailable,
                    )}
                  >
                    <input
                      type="radio"
                      name="shift"
                      value={shift.id}
                      disabled={unavailable}
                      checked={selectedShift?.id === shift.id && !unavailable}
                      onChange={() => setSelection({ id: shift.id, date })}
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--gold)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold">
                        {shift.name}
                        {blocked(shift.id)
                          ? ' — band'
                          : validDate && isPastTime(date, shift.start_time)
                            ? ' — vaqt o‘tgan'
                            : ''}
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
                        <Clock className="h-3 w-3" />
                        {shift.start_time.slice(0, 5)} –{' '}
                        {shift.end_time.slice(0, 5)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            {!shifts.isLoading && !shifts.isError && !hallShifts.length && (
              <p className="text-sm text-ink-soft">
                Hali faol smenalar qo‘shilmagan.
              </p>
            )}
          </fieldset>
          <fieldset>
            <legend className="field-label mb-3">3. Paketni tanlang</legend>
            {packages.isLoading ? (
              <LoadingState />
            ) : (
              <div className="space-y-2">
                {hallPackages.map((pkg) => (
                  <label
                    key={pkg.id}
                    className={optionClass(packageId === pkg.id)}
                  >
                    <input
                      type="radio"
                      name="package"
                      value={pkg.id}
                      checked={packageId === pkg.id}
                      onChange={() => setPackageId(pkg.id)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--gold)]"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 font-bold">
                        <Users className="h-4 w-4 text-gold-strong" />
                        {pkg.guest_count} kishilik
                      </span>
                      <span className="mt-1 block text-xs text-ink-soft">
                        {pkg.description}
                      </span>
                      <span className="mt-2 block font-bold text-gold-strong">
                        {formatMoney(pkg.price)}
                      </span>
                    </span>
                  </label>
                ))}
                {!packages.isError && !hallPackages.length && (
                  <p className="text-sm text-ink-soft">
                    Hali narx paketlari kiritilmagan.
                  </p>
                )}
              </div>
            )}
          </fieldset>
          <div>
            <label htmlFor="decoration" className="field-label mb-3">
              4. Bezatish (ixtiyoriy)
            </label>
            <select
              id="decoration"
              value={decorationId || ''}
              onChange={(e) =>
                setDecorationId(e.target.value ? Number(e.target.value) : null)
              }
              disabled={decorations.isLoading || decorations.isError}
              className="select-lux"
            >
              <option value="">Standart bezatish — 0 UZS</option>
              {hallDecorations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} (+{formatMoney(item.additional_price)})
                </option>
              ))}
            </select>
            {decorations.isError && (
              <p className="mt-2 text-xs text-ink-soft">
                Qo‘shimcha bezaklar yuklanmadi. Standart variant bilan davom
                etish mumkin.
              </p>
            )}
          </div>
          <div className="space-y-3 rounded-xl border border-dashed border-line-strong bg-surface-2/60 p-4">
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="text-ink-soft">Jami hisoblangan</span>
              <strong>
                {activePackage
                  ? formatMoney(
                      Number(activePackage.price) +
                        Number(activeDecoration?.additional_price || 0),
                    )
                  : 'Paket tanlang'}
              </strong>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-3 text-sm">
              <span className="text-ink-soft">Zakalat</span>
              <strong className="text-success">
                {formatMoney(hall.required_deposit)}
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
            <Link
              href={loginHref}
              aria-disabled={loading}
              className="btn-gold w-full !py-3.5"
            >
              Bron qilish uchun kirish
            </Link>
          )}
        </fieldset>
      </form>
      <BookingSuccess
        open={success}
        onClose={() => setSuccess(false)}
        phone={hall.owner_phone}
      />
    </>
  );
}

export default HallBookingForm;
