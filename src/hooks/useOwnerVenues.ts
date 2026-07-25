import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchHallsRequest, fetchBarsRequest } from '@/services/venues';
import { WeddingHall, Bar, PaginatedResponse } from '@/types';

const PAGE_SIZE = 10; // Default Django REST Framework Page Size

/**
 * Custom React Query hook for Server-Side Paginated fetching of Venue Owner's halls or bars.
 * Includes queryKey binding ['owner_venues', tab, page], smooth pagination (keepPreviousData),
 * and passes my_venues=true so backend filters exclusively for the logged in user's venues.
 */
export function useOwnerVenues(tab: 'halls' | 'bars' = 'halls', page: number = 1) {
  const hallsQuery = useQuery<PaginatedResponse<WeddingHall>>({
    queryKey: ['owner_venues', 'halls', page],
    queryFn: () => fetchHallsRequest(page, true),
    enabled: tab === 'halls',
    placeholderData: keepPreviousData,
    staleTime: 0,
  });

  const barsQuery = useQuery<PaginatedResponse<Bar>>({
    queryKey: ['owner_venues', 'bars', page],
    queryFn: () => fetchBarsRequest(page, true),
    enabled: tab === 'bars',
    placeholderData: keepPreviousData,
    staleTime: 0,
  });

  const activeQuery = tab === 'halls' ? hallsQuery : barsQuery;
  const count = activeQuery.data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return {
    halls: hallsQuery.data?.results || [],
    bars: barsQuery.data?.results || [],
    count,
    totalPages,
    isFetching: activeQuery.isFetching,
    isLoading: activeQuery.isLoading,
    isError: activeQuery.isError,
    error: activeQuery.error,
    refetchHalls: hallsQuery.refetch,
    refetchBars: barsQuery.refetch,
  };
}
