'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchBarByIdRequest } from '@/services/venues';
import { Bar } from '@/types';
import { SkeletonCardLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import { ArrowLeft, Wine, MapPin, Users, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';

export default function BarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const { data: bar, isLoading, isError, error } = useQuery<Bar>({
    queryKey: ['barDetail', id],
    queryFn: () => fetchBarByIdRequest(id),
    enabled: !!id,
  });

  if (isLoading) {
    return <SkeletonCardLoader count={1} />;
  }

  if (isError || !bar) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/venues" className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500">
          <ArrowLeft className="h-4 w-4" /> Orqaga qaytish
        </Link>
        <ErrorAlert message={error instanceof Error ? error.message : "Bar topilmadi."} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Link 
        href="/dashboard/venues" 
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Ro&apos;yxatga qaytish
      </Link>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-50 dark:bg-pink-950 px-3 py-1 text-xs font-bold text-pink-600 dark:text-pink-400 mb-2">
              <Wine className="h-3.5 w-3.5" /> Bar / Lounge ID: #{bar.id}
            </span>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">{bar.name}</h1>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="h-4 w-4 text-slate-400" /> {bar.address}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 flex items-center gap-3">
            <Users className="h-6 w-6 text-indigo-500" />
            <div>
              <p className="text-xs uppercase font-bold text-slate-400">Sig&apos;im</p>
              <p className="text-base font-extrabold text-slate-800 dark:text-white">{bar.capacity} kishi</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 flex items-center gap-3">
            <Clock className="h-6 w-6 text-amber-500" />
            <div>
              <p className="text-xs uppercase font-bold text-slate-400">Soatbay Narx</p>
              <p className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                {parseFloat(bar.price_per_hour).toLocaleString()} UZS
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-emerald-500" />
            <div>
              <p className="text-xs uppercase font-bold text-slate-400">Zakalat</p>
              <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {parseFloat(bar.required_deposit).toLocaleString()} UZS
              </p>
            </div>
          </div>
        </div>

        {bar.description && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Batafsil Tavsif</h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{bar.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
