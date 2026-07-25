'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchHallsRequest, fetchShiftsRequest, createShiftBlockRequest } from '@/services/venues';
import { WeddingHall, Shift, PaginatedResponse } from '@/types';
import { SkeletonCardLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import { AlertCircle, Check } from 'lucide-react';

export default function OwnerCalendarPage() {
  const { data: hallsRes, isLoading: loadingHalls, isError: errorHalls, refetch: refetchHalls } = useQuery<PaginatedResponse<WeddingHall>>({
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
      setError("Iltimos to'yxona, smena va sanani tanlang.");
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
      setError(err.response?.data?.detail || "Sanani bloklashda xatolik yuz berdi.");
    }
  };

  const isLoading = loadingHalls || loadingShifts;

  if (isLoading) {
    return <SkeletonCardLoader count={1} />;
  }

  if (errorHalls) {
    return (
      <ErrorAlert 
        message="To'yxonalar ro'yxatini yuklashda xatolik yuz berdi." 
        onRetry={refetchHalls} 
      />
    );
  }

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-base font-bold text-slate-800 dark:text-white mb-2">Taqvim Smenasini Yopish (Bloklash)</h3>
      <p className="text-xs text-slate-400 mb-6">
        Muayyan to&apos;yxonadagi smenani belgilangan sanada bron qilishdan yopib qo&apos;yishingiz mumkin.
      </p>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-500 border border-rose-500/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-600 border border-emerald-500/20">
          <Check className="h-4 w-4 shrink-0" />
          <span>Smena belgilangan sanada muvaffaqiyatli bloklandi!</span>
        </div>
      )}

      <form onSubmit={handleBlockSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">To&apos;yxonani tanlang</label>
          <select
            required
            value={blockHallId}
            onChange={(e) => setBlockHallId(e.target.value)}
            className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
          >
            <option value="">-- To&apos;yxona tanlang --</option>
            {halls.map((h) => (
              <option key={`h-opt-${h.id}`} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Smenani tanlang</label>
          <select
            required
            value={blockShiftId}
            onChange={(e) => setBlockShiftId(e.target.value)}
            className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
          >
            <option value="">-- Smena tanlang --</option>
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Yopiladigan Sana</label>
          <input
            type="date"
            required
            value={blockDate}
            onChange={(e) => setBlockDate(e.target.value)}
            className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Yopish sababi</label>
          <input
            type="text"
            required
            placeholder="Masalan: Ta'mirlash yoki xususiy tadbir"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            className="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
          />
        </div>

        <button 
          type="submit"
          disabled={createBlockMutation.isPending}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl py-3.5 text-sm font-semibold transition-colors mt-2"
        >
          {createBlockMutation.isPending ? "Bloklanmoqda..." : "Smenani bloklash"}
        </button>
      </form>
    </div>
  );
}
