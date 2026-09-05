import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchBarsRequest, fetchHallsRequest } from '@/services/venues';
import { useAuth } from '@/store/auth-context';

export function useOwnerVenues(tab: 'halls' | 'bars' = 'halls', page = 1) {
  const { user } = useAuth();
  const hallsQuery = useQuery({
    queryKey: ['owner_venues', user?.id, 'halls', page],
    queryFn: () => fetchHallsRequest(page, true),
    enabled: tab === 'halls' && !!user,
    placeholderData: keepPreviousData,
  });
  const barsQuery = useQuery({
    queryKey: ['owner_venues', user?.id, 'bars', page],
    queryFn: () => fetchBarsRequest(page, true),
    enabled: tab === 'bars' && !!user,
    placeholderData: keepPreviousData,
  });
  const active = tab === 'halls' ? hallsQuery : barsQuery;
  return {
    halls: hallsQuery.data?.results || [],
    bars: barsQuery.data?.results || [],
    count: active.data?.count || 0,
    hasNextPage: !!active.data?.next,
    hasPreviousPage: !!active.data?.previous,
    isLoading: active.isLoading,
    isFetching: active.isFetching,
    isError: active.isError,
    error: active.error,
    refetchHalls: hallsQuery.refetch,
    refetchBars: barsQuery.refetch,
  };
}
