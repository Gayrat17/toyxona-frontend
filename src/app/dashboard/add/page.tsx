'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { VenueForm } from '@/components/forms/venue-form';
import { createBarRequest, createHallRequest } from '@/services/venues';

export default function AddVenuePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <p className="text-sm leading-relaxed text-ink-soft">
        Joyingiz haqidagi ma’lumotlarni kiriting. Saqlangandan so‘ng rasmlar,
        smenalar va narxlarni boshqarishingiz mumkin.
      </p>
      <VenueForm
        onSave={async (data, type) => {
          const venue = await (type === 'HALL'
            ? createHallRequest(data)
            : createBarRequest(data));
          void queryClient.invalidateQueries({ queryKey: ['owner_venues'] });
          void queryClient.invalidateQueries({ queryKey: ['ownerHalls'] });
          void queryClient.invalidateQueries({
            queryKey: [type === 'HALL' ? 'halls' : 'bars'],
          });
          router.push(
            `/dashboard/venues/${type === 'HALL' ? 'halls' : 'bars'}/${venue.id}`,
          );
          return venue;
        }}
      />
    </div>
  );
}
