'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchBarByIdRequest } from '@/services/venues';
import { Bar } from '@/types';
import { SkeletonCardLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import { ArrowLeft, Wine, MapPin, Users, DollarSign, Clock } from 'lucide-react';
import Link from 'next/link';

export default function BarDetailPage() {
  const params = useParams();
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
        <Link href="/dashboard/venues" className="inline-flex items-center gap-2 text-sm font-semibold text-gold-strong hover:text-gold-strong">
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
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft dark:text-ink-soft hover:text-gold-strong transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Ro&apos;yxatga qaytish
      </Link>

      <div className="rounded-2xl border border-line bg-white p-8 shadow-sm dark:border-line dark:bg-surface space-y-6">
        <div className="flex items-start justify-between border-b border-line dark:border-line pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-tint px-3 py-1 text-xs font-bold text-gold-strong mb-2">
              <Wine className="h-3.5 w-3.5" /> Bar / Lounge ID: #{bar.id}
            </span>
            <h1 className="text-2xl font-black text-ink dark:text-ink">{bar.name}</h1>
            <p className="text-sm text-ink-faint mt-1 flex items-center gap-1">
              <MapPin className="h-4 w-4 text-ink-faint" /> {bar.address}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-line dark:border-line bg-surface-2/60 dark:bg-surface-2/60 p-4 flex items-center gap-3">
            <Users className="h-6 w-6 text-gold-strong" />
            <div>
              <p className="text-xs uppercase font-bold text-ink-faint">Sig&apos;im</p>
              <p className="text-base font-extrabold text-ink dark:text-ink">{bar.capacity} kishi</p>
            </div>
          </div>

          <div className="rounded-xl border border-line dark:border-line bg-surface-2/60 dark:bg-surface-2/60 p-4 flex items-center gap-3">
            <Clock className="h-6 w-6 text-gold" />
            <div>
              <p className="text-xs uppercase font-bold text-ink-faint">Soatbay Narx</p>
              <p className="text-base font-extrabold text-gold-strong dark:text-gold-strong">
                {parseFloat(bar.price_per_hour).toLocaleString()} UZS
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-line dark:border-line bg-surface-2/60 dark:bg-surface-2/60 p-4 flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-success" />
            <div>
              <p className="text-xs uppercase font-bold text-ink-faint">Zakalat</p>
              <p className="text-base font-extrabold text-success dark:text-success">
                {parseFloat(bar.required_deposit).toLocaleString()} UZS
              </p>
            </div>
          </div>
        </div>

        {bar.description && (
          <div className="pt-4 border-t border-line dark:border-line">
            <h4 className="text-xs font-bold uppercase text-ink-faint tracking-wider mb-2">Batafsil Tavsif</h4>
            <p className="text-sm text-ink-soft dark:text-ink-soft leading-relaxed">{bar.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
