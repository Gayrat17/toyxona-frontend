'use client';

import Link from 'next/link';
import type { WeddingHall, Bar } from '@/types';
import { useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useAuth } from '@/store/auth-context';
import {
  fetchHallByIdRequest,
  fetchBarByIdRequest,
  updateHallRequest,
  updateBarRequest,
} from '@/services/venues';
import { isNotFound, getErrorMessage } from '@/utils/errors';
import { ErrorAlert } from '@/components/common/error-alert';
import { LoadingState } from '@/components/common/loading-state';
import { VenueForm } from './venue-form';
import { HallSetup } from './hall-setup';

export function EditVenuePage({ type }: { type: 'halls' | 'bars' }) {
  const { id: rawId } = useParams<{ id: string }>();
  const id = Number(rawId);
  const validId = Number.isSafeInteger(id) && id > 0;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery<WeddingHall | Bar>({
    queryKey: ['venue-edit', type, id, user?.id],
    queryFn: () =>
      type === 'halls' ? fetchHallByIdRequest(id) : fetchBarByIdRequest(id),
    enabled: validId,
  });
  const venue = query.data;
  const back = (
    <Link
      href={`/dashboard/venues?tab=${type}`}
      className="inline-flex items-center gap-2 text-sm font-bold text-gold-strong hover:underline"
    >
      <ArrowLeft className="h-4 w-4" />
      Joylar ro‘yxatiga qaytish
    </Link>
  );
  if (query.isLoading) return <LoadingState />;
  if (!venue || query.isError || !validId)
    return (
      <div className="space-y-5">
        {back}
        <ErrorAlert
          message={
            !validId || isNotFound(query.error)
              ? 'Joy topilmadi.'
              : getErrorMessage(
                  query.error,
                  'Joy ma’lumotlarini yuklab bo‘lmadi.',
                )
          }
          onRetry={
            validId
              ? () => {
                  void query.refetch();
                }
              : undefined
          }
        />
      </div>
    );
  if (venue.owner !== user?.id)
    return (
      <div className="space-y-5">
        {back}
        <ErrorAlert message="Faqat o‘zingizga tegishli joyni tahrirlashingiz mumkin." />
      </div>
    );
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {back}
        <Link
          href={`/venues/${type}/${id}`}
          className="btn-outline !py-2 !text-xs"
        >
          <ExternalLink className="h-4 w-4" />
          Ommaviy sahifa
        </Link>
      </div>
      <h2 className="break-words font-display text-2xl font-bold">
        {venue.name}
      </h2>
      <VenueForm
        key={`${type}-${id}`}
        venue={venue}
        onSave={async (data) => {
          const saved = await (type === 'halls'
            ? updateHallRequest(id, data)
            : updateBarRequest(id, data));
          queryClient.setQueryData(['venue-edit', type, id, user?.id], saved);
          void queryClient.invalidateQueries({ queryKey: ['owner_venues'] });
          void queryClient.invalidateQueries({ queryKey: ['ownerHalls'] });
          void queryClient.invalidateQueries({ queryKey: [type] });
          void queryClient.invalidateQueries({ queryKey: ['venue', type, id] });
          return saved;
        }}
      />
      {type === 'halls' && 'max_capacity' in venue && (
        <HallSetup hall={venue} />
      )}
    </div>
  );
}
