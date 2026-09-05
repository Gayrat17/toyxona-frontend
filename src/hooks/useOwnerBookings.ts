import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchHallBookingsRequest,
  fetchBarBookingsRequest,
  updateHallBookingStatus,
  updateBarBookingStatus,
} from '@/services/bookings';
import { HallBooking, BarBooking } from '@/types';
import { useAuth } from '@/store/auth-context';

/**
 * Custom React Query hook for fetching and managing Venue Owner's bookings independently.
 * Only triggers HTTP GET requests when mounted on /dashboard/bookings page.
 */
export function useOwnerBookings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const hallBookingsQuery = useQuery<HallBooking[]>({
    queryKey: ['hallBookings', user?.id],
    enabled: !!user,
    queryFn: fetchHallBookingsRequest,
    staleTime: 1000 * 30, // 30 seconds
  });

  const barBookingsQuery = useQuery<BarBooking[]>({
    queryKey: ['barBookings', user?.id],
    enabled: !!user,
    queryFn: fetchBarBookingsRequest,
    staleTime: 1000 * 30,
  });

  const updateHallBookingMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: 'CONFIRMED' | 'REJECTED' | 'HOLD';
    }) => updateHallBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['hallBookings'] });
    },
  });

  const updateBarBookingMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: 'CONFIRMED' | 'REJECTED' | 'HOLD';
    }) => updateBarBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
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
    isUpdating:
      updateHallBookingMutation.isPending || updateBarBookingMutation.isPending,
    mutationError:
      updateHallBookingMutation.error || updateBarBookingMutation.error,
    mutationSuccess:
      updateHallBookingMutation.isSuccess || updateBarBookingMutation.isSuccess,
    error,
    updateHallBookingStatus: (
      variables: Parameters<typeof updateHallBookingMutation.mutate>[0],
    ) => {
      updateBarBookingMutation.reset();
      updateHallBookingMutation.mutate(variables);
    },
    updateBarBookingStatus: (
      variables: Parameters<typeof updateBarBookingMutation.mutate>[0],
    ) => {
      updateHallBookingMutation.reset();
      updateBarBookingMutation.mutate(variables);
    },
    refetchHallBookings: hallBookingsQuery.refetch,
    refetchBarBookings: barBookingsQuery.refetch,
  };
}
