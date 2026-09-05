'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Plus, Users } from 'lucide-react';
import type { WeddingHall } from '@/types';
import {
  createPackageRequest,
  createShiftRequest,
  fetchPackagesRequest,
  fetchShiftsRequest,
} from '@/services/venues';
import { timeMinutes } from '@/utils/date';
import { getErrorMessage } from '@/utils/errors';
import { moneySchema } from '@/lib/venue-form-schema';
import { ErrorAlert } from '@/components/common/error-alert';
import { LoadingState } from '@/components/common/loading-state';

export function HallSetup({ hall }: { hall: WeddingHall }) {
  const client = useQueryClient();
  const shifts = useQuery({
    queryKey: ['shifts'],
    queryFn: fetchShiftsRequest,
  });
  const packages = useQuery({
    queryKey: ['packages'],
    queryFn: fetchPackagesRequest,
  });
  const [name, setName] = useState('');
  const [start, setStart] = useState('11:00');
  const [end, setEnd] = useState('15:00');
  const [guests, setGuests] = useState(String(hall.max_capacity));
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const shiftMutation = useMutation({
    mutationFn: createShiftRequest,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['shifts'] });
      void client.invalidateQueries({ queryKey: ['calendar'] });
      setName('');
      setNotice('Smena qo‘shildi.');
    },
  });
  const packageMutation = useMutation({
    mutationFn: createPackageRequest,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['packages'] });
      setPrice('');
      setDescription('');
      setNotice('Narx paketi qo‘shildi.');
    },
  });
  const busy = shiftMutation.isPending || packageMutation.isPending;
  if (shifts.isLoading || packages.isLoading) return <LoadingState />;
  if (shifts.isError || packages.isError)
    return (
      <ErrorAlert
        message="Smena va paketlarni yuklab bo‘lmadi."
        onRetry={() => {
          void shifts.refetch();
          void packages.refetch();
        }}
      />
    );
  const hallShifts =
    shifts.data?.filter((shift) => shift.hall === hall.id) || [];
  const hallPackages =
    packages.data?.filter((pkg) => pkg.hall === hall.id) || [];

  return (
    <section className="space-y-5 border-t border-line pt-8">
      <div>
        <h2 className="font-display text-2xl font-bold">
          Smenalar va narx paketlari
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Mijozlar bron yuborishi uchun kamida bitta faol smena va paket
          qo‘shing.
        </p>
      </div>
      {error && <ErrorAlert message={error} />}
      {notice && (
        <p
          role="status"
          className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success"
        >
          {notice}
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card-lux p-5">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold">
            <Clock className="h-5 w-5 text-gold-strong" />
            Smenalar
          </h3>
          <ul className="my-4 space-y-2 text-sm">
            {hallShifts.map((shift) => (
              <li
                key={shift.id}
                className="flex flex-wrap justify-between gap-2 rounded-xl bg-surface-2 p-3"
              >
                <span>
                  {shift.name}
                  {!shift.is_active && ' (faol emas)'}
                </span>
                <span>
                  {shift.start_time.slice(0, 5)} – {shift.end_time.slice(0, 5)}
                </span>
              </li>
            ))}
            {!hallShifts.length && (
              <li className="text-ink-soft">Hozircha smena yo‘q.</li>
            )}
          </ul>
          <form
            aria-label="Smena qo‘shish"
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              setNotice('');
              if (busy) return;
              if (
                name.trim().length < 2 ||
                !(timeMinutes(end) > timeMinutes(start))
              )
                return setError(
                  'Smena nomini va to‘g‘ri vaqt oralig‘ini kiriting. Tugash vaqti boshlanishdan keyin bo‘lishi kerak.',
                );
              try {
                await shiftMutation.mutateAsync({
                  hall: hall.id,
                  name: name.trim(),
                  start_time: `${start}:00`,
                  end_time: `${end}:00`,
                });
              } catch (err) {
                setError(getErrorMessage(err));
              }
            }}
            className="space-y-3 border-t border-line pt-4"
          >
            <label className="block text-xs font-bold text-ink-soft">
              Smena nomi
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-lux mt-2"
                placeholder="Masalan: Tushlik"
              />
            </label>
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
            <button
              type="submit"
              disabled={busy}
              className="btn-outline w-full"
            >
              <Plus className="h-4 w-4" />
              {shiftMutation.isPending ? 'Saqlanmoqda…' : 'Smena qo‘shish'}
            </button>
          </form>
        </div>
        <div className="card-lux p-5">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold">
            <Users className="h-5 w-5 text-gold-strong" />
            Narx paketlari
          </h3>
          <ul className="my-4 space-y-2 text-sm">
            {hallPackages.map((pkg) => (
              <li
                key={pkg.id}
                className="flex flex-wrap justify-between gap-2 rounded-xl bg-surface-2 p-3"
              >
                <span>{pkg.guest_count} kishilik</span>
                <span>{Number(pkg.price).toLocaleString('uz-UZ')} UZS</span>
              </li>
            ))}
            {!hallPackages.length && (
              <li className="text-ink-soft">Hozircha paket yo‘q.</li>
            )}
          </ul>
          <form
            aria-label="Paket qo‘shish"
            onSubmit={async (event) => {
              event.preventDefault();
              setError(null);
              setNotice('');
              if (busy) return;
              if (
                !Number.isInteger(Number(guests)) ||
                Number(guests) < 1 ||
                Number(guests) > hall.max_capacity ||
                !moneySchema.safeParse(price).success ||
                Number(price) <= 0
              )
                return setError(
                  'Mehmonlar soni zal sig‘imidan oshmasligi, paket narxi esa noldan katta bo‘lishi kerak.',
                );
              try {
                await packageMutation.mutateAsync({
                  hall: hall.id,
                  guest_count: Number(guests),
                  price: price.trim(),
                  description: description.trim(),
                });
              } catch (err) {
                setError(getErrorMessage(err));
              }
            }}
            className="space-y-3 border-t border-line pt-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-bold text-ink-soft">
                Mehmonlar soni
                <input
                  type="number"
                  min={1}
                  max={hall.max_capacity}
                  required
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="input-lux mt-2"
                />
              </label>
              <label className="block text-xs font-bold text-ink-soft">
                Jami narx (UZS)
                <input
                  inputMode="decimal"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input-lux mt-2"
                />
              </label>
            </div>
            <label className="block text-xs font-bold text-ink-soft">
              Paket tavsifi
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-lux mt-2"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="btn-outline w-full"
            >
              <Plus className="h-4 w-4" />
              {packageMutation.isPending ? 'Saqlanmoqda…' : 'Paket qo‘shish'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
