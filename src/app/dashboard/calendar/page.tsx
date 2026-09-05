'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarOff, Check } from 'lucide-react';
import { useAuth } from '@/store/auth-context';
import {
  fetchOwnerHallsRequest,
  fetchShiftsRequest,
  createShiftBlockRequest,
} from '@/services/venues';
import { getErrorMessage } from '@/utils/errors';
import { localDateString, parseLocalDate } from '@/utils/date';
import { ErrorAlert } from '@/components/common/error-alert';
import { LoadingState } from '@/components/common/loading-state';
import { VenueCalendar } from '@/components/common/venue-calendar';

export default function OwnerCalendarPage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const halls = useQuery({
    queryKey: ['ownerHalls', user?.id],
    queryFn: fetchOwnerHallsRequest,
  });
  const shifts = useQuery({
    queryKey: ['shifts'],
    queryFn: fetchShiftsRequest,
  });
  const [hallId, setHallId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const mutation = useMutation({
    mutationFn: createShiftBlockRequest,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['calendar'] });
      setSuccess(true);
      setDate('');
    },
  });
  const ownerHalls =
    halls.data?.filter((hall) => hall.owner === user?.id) || [];
  const availableShifts =
    shifts.data?.filter(
      (shift) => shift.hall === Number(hallId) && shift.is_active,
    ) || [];
  if (halls.isLoading || shifts.isLoading) return <LoadingState />;
  if (halls.isError || shifts.isError)
    return (
      <ErrorAlert
        message="Zallar yoki smenalarni yuklab bo‘lmadi."
        onRetry={() => {
          void halls.refetch();
          void shifts.refetch();
        }}
      />
    );
  if (!ownerHalls.length)
    return (
      <div className="card-lux mx-auto max-w-xl p-8 text-center">
        <h2 className="font-display text-xl font-bold">
          Hali to‘y zali qo‘shilmagan
        </h2>
        <p className="mt-3 text-sm text-ink-soft">
          Smenalarni bloklash uchun avval o‘z zalingizni qo‘shing.
        </p>
        <Link href="/dashboard/add" className="btn-gold mt-5">
          Joy qo‘shish
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="card-lux overflow-hidden">
        <div className="bg-espresso p-5 sm:p-7">
          <h2 className="flex items-center gap-3 font-display text-xl font-bold text-[#f2e9d6]">
            <CalendarOff className="h-6 w-6 shrink-0 text-gold" />
            Taqvim smenasini bloklash
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#c4b496]">
            Ta’mirlash yoki xususiy tadbir uchun smenani bronlardan yoping.
          </p>
        </div>
        <form
          aria-label="Smenani bloklash"
          onSubmit={async (event) => {
            event.preventDefault();
            if (mutation.isPending) return;
            setError(null);
            setSuccess(false);
            if (
              !ownerHalls.some((hall) => hall.id === Number(hallId)) ||
              !availableShifts.some((shift) => shift.id === Number(shiftId))
            )
              return setError(
                'O‘zingizga tegishli zal va uning faol smenasini tanlang.',
              );
            if (
              !parseLocalDate(date) ||
              date < localDateString() ||
              !reason.trim()
            )
              return setError('Kelgusi sana va bloklash sababini kiriting.');
            try {
              await mutation.mutateAsync({
                hall: Number(hallId),
                shift: Number(shiftId),
                date,
                reason: reason.trim(),
              });
            } catch (err) {
              setError(getErrorMessage(err));
            }
          }}
          className="space-y-5 p-5 sm:p-7"
        >
          {error && <ErrorAlert message={error} />}
          {success && (
            <div
              role="status"
              className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-3 text-sm font-bold text-success"
            >
              <Check className="h-5 w-5 shrink-0" />
              Smena belgilangan sanada bloklandi.
            </div>
          )}
          <fieldset
            disabled={mutation.isPending}
            className="grid gap-5 sm:grid-cols-2"
          >
            <div>
              <label htmlFor="block-hall" className="field-label">
                Restoranni tanlang
              </label>
              <select
                id="block-hall"
                required
                value={hallId}
                onChange={(e) => {
                  setHallId(e.target.value);
                  setShiftId('');
                  setSuccess(false);
                }}
                className="select-lux mt-2"
              >
                <option value="">Restoran tanlang</option>
                {ownerHalls.map((hall) => (
                  <option key={hall.id} value={hall.id}>
                    {hall.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="block-shift" className="field-label">
                Smenani tanlang
              </label>
              <select
                id="block-shift"
                required
                disabled={!hallId || !availableShifts.length}
                value={shiftId}
                onChange={(e) => {
                  setShiftId(e.target.value);
                  setSuccess(false);
                }}
                className="select-lux mt-2"
              >
                <option value="">Smena tanlang</option>
                {availableShifts.map((shift) => (
                  <option key={shift.id} value={shift.id}>
                    {shift.name} ({shift.start_time.slice(0, 5)} –{' '}
                    {shift.end_time.slice(0, 5)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="block-date" className="field-label">
                Yopiladigan sana
              </label>
              <input
                id="block-date"
                type="date"
                min={localDateString()}
                required
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSuccess(false);
                }}
                className="input-lux mt-2"
              />
            </div>
            <div>
              <label htmlFor="block-reason" className="field-label">
                Yopish sababi
              </label>
              <input
                id="block-reason"
                required
                maxLength={255}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Masalan: ta’mirlash"
                className="input-lux mt-2"
              />
            </div>
          </fieldset>
          {hallId && !availableShifts.length && (
            <p className="text-sm text-ink-soft">
              Bu zalda faol smena yo‘q.{' '}
              <Link
                href={`/dashboard/venues/halls/${hallId}`}
                className="font-bold text-gold-strong underline"
              >
                Smena qo‘shish
              </Link>
            </p>
          )}
          <button
            type="submit"
            disabled={mutation.isPending || !availableShifts.length}
            className="btn-ink w-full"
          >
            {mutation.isPending ? 'Bloklanmoqda…' : 'Smenani bloklash'}
          </button>
        </form>
      </section>
      {hallId && (
        <VenueCalendar
          key={hallId}
          type="halls"
          id={Number(hallId)}
          onSelectDate={(value) => {
            setDate(value);
            setSuccess(false);
          }}
        />
      )}
    </div>
  );
}
