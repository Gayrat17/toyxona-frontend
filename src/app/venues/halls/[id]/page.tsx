import { Suspense } from 'react';
import { VenueDetail } from '@/components/common/venue-detail';
import { LoadingState } from '@/components/common/loading-state';
export default function HallDetailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VenueDetail type="halls" />
    </Suspense>
  );
}
