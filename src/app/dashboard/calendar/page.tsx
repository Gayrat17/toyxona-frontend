'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchHallsRequest, fetchShiftsRequest, createShiftBlockRequest } from '@/services/venues';
import { WeddingHall, Shift, PaginatedResponse } from '@/types';
import { SkeletonCardLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import { AlertCircle, Check, CalendarOff } from 'lucide-react';

export default function OwnerCalendarPage() {
  const { data: hallsRes, isLoading: loadingHalls, isError: errorHalls, refetch: refetchHalls } = useQuery<
    PaginatedResponse<WeddingHall>
  >({
    queryKey: ['ownerHalls'],
    queryFn: () => fetchHallsRequest(1),
    staleTime: 1000 * 60 * 5,
  });

  const halls = hallsRes?.results || [];

  const { data: shifts = [], isLoading: loadingShifts } = useQuery<Shift[]>({
    queryKey: ['shifts'],
    queryFn: fetchShiftsRequest,
    staleTime: 1000 * 60 * 5,
  });

  const [blockHallId, setBlockHallId] = useState('');
  const [blockShiftId, setBlockShiftId] = useState('');
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('Remont/Texnik sozlash');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createBlockMutation = useMutation({
    mutationFn: createShiftBlockRequest,
    onSuccess: () => {
      setSuccess(true);
      setBlockDate('');
      setBlockReason('Remont/Texnik sozlash');
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!blockHallId || !blockShiftId || !blockDate) {
      setError('Iltimos restoran, smena va sanani tanlang.');
      return;
    }

    try {
      await createBlockMutation.mutateAsync({
        hall: parseInt(blockHallId),
        shift: parseInt(blockShiftId),
        date: blockDate,
        reason: blockReason,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Sanani bloklashda xatolik yuz berdi.');
    }
  };

  const isLoading = loadingHalls || loadingShifts;

  if (isLoading) {
    return <SkeletonCardLoader count={1} />;
  }

  if (errorHalls) {
    return (
      <ErrorAlert message="Restoranlar ro'yxatini yuklashda xatolik yuz berdi." onRetry={refetchHalls} />
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="card-lux overflow-hidden">
        {/* Header strip */}
        <div className="texture-grain relative bg-espresso px-7 py-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.09]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'%3E%3Cg fill='none' stroke='%23cda964' stroke-width='1'%3E%3Crect x='26' y='26' width='32' height='32'/%3E%3Crect x='26' y='26' width='32' height='32' transform='rotate(45 42 42)'/%3E%3Ccircle cx='42' cy='42' r='4.5'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="relative z-[2] flex items-center gap-4">
            <span className="flex h-12 w-12 rotate-45 items-center justify-center border border-gold/50 bg-white/5">
              <CalendarOff className="h-5 w-5 rotate-[-45deg] text-gold" />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Boshqaruv</p>
              <h3 className="mt-0.5 font-display text-xl font-bold text-[#f2e9d6]">
                Taqvim smenasini yopish (bloklash)
              </h3>
            </div>
          </div>
          <p className="relative z-[2] mt-3 text-xs leading-relaxed text-[#b7a888]">
            Muayyan restorandagi smenani belgilangan sanada bron qilishdan yopib
            qo&apos;yishingiz mumkin — mijozlar taqvimda uni «Blok» ko&apos;rinishida ko&apos;radi.
          </p>
        </div>

        <form onSubmit={handleBlockSubmit} className="space-y-5 p-7">
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger/5 p-3.5 text-[13px] font-semibold text-danger">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/5 p-3.5 text-[13px] font-semibold text-success">
              <Check className="h-4 w-4 shrink-0" />
              <span>Smena belgilangan sanada muvaffaqiyatli bloklandi!</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="field-label">Restoranni tanlang</label>
              <select
                required
                value={blockHallId}
                onChange={(e) => setBlockHallId(e.target.value)}
                className="select-lux mt-2"
              >
                <option value="">— Restoran tanlang —</option>
                {halls.map((h) => (
                  <option key={`h-opt-${h.id}`} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label">Smenani tanlang</label>
              <select
                required
                value={blockShiftId}
                onChange={(e) => setBlockShiftId(e.target.value)}
                className="select-lux mt-2"
              >
                <option value="">— Smena tanlang —</option>
                {shifts
                  .filter((s) => !blockHallId || s.hall === parseInt(blockHallId))
                  .map((s) => (
                    <option key={`s-opt-${s.id}`} value={s.id}>
                      {s.name} ({s.start_time} - {s.end_time})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="field-label">Yopiladigan sana</label>
              <input
                type="date"
                required
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                className="input-lux mt-2"
              />
            </div>

            <div>
              <label className="field-label">Yopish sababi</label>
              <input
                type="text"
                required
                placeholder="Masalan: Ta'mirlash yoki xususiy tadbir"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="input-lux mt-2"
              />
            </div>
          </div>

          <button type="submit" disabled={createBlockMutation.isPending} className="btn-ink w-full !py-3.5">
            {createBlockMutation.isPending ? 'Bloklanmoqda...' : 'Smenani bloklash'}
          </button>
        </form>
      </div>
    </div>
  );
}
