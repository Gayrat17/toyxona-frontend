import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchHallBookingsRequest, 
  fetchBarBookingsRequest, 
  updateHallBookingStatus, 
  updateBarBookingStatus 
} from '@/services/bookings';
import { HallBooking, BarBooking } from '@/types';

/**
 * Custom React Query hook for fetching and managing Venue Owner's bookings independently.
 * Only triggers HTTP GET requests when mounted on /dashboard/bookings page.
 */
export function useOwnerBookings() {
  const queryClient = useQueryClient();

  const hallBookingsQuery = useQuery<HallBooking[]>({
    queryKey: ['hallBookings'],
    queryFn: fetchHallBookingsRequest,
    staleTime: 1000 * 30, // 30 seconds
  });

  const barBookingsQuery = useQuery<BarBooking[]>({
    queryKey: ['barBookings'],
    queryFn: fetchBarBookingsRequest,
    staleTime: 1000 * 30,
  });

  const updateHallBookingMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'CONFIRMED' | 'REJECTED' | 'HOLD' }) => 
      updateHallBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hallBookings'] });
    },
  });

  const updateBarBookingMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'CONFIRMED' | 'REJECTED' | 'HOLD' }) => 
      updateBarBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barBookings'] });
    },
  });

  const isLoading = hallBookingsQuery.isLoading || barBookingsQuery.isLoading;
  const isError = hallBookingsQuery.isError || barBookingsQuery.isError;
  const error = hallBookingsQuery.error || barBookingsQuery.error;

  return {
    hallBookings: hallBookingsQuery.data || [],
    barBookings: barBookingsQuery.data || [],
    isLoading,
    isError,
    error,
    updateHallBookingStatus: updateHallBookingMutation.mutate,
    updateBarBookingStatus: updateBarBookingMutation.mutate,
    refetchHallBookings: hallBookingsQuery.refetch,
    refetchBarBookings: barBookingsQuery.refetch,
  };
}
