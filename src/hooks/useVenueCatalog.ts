'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchHallsRequest, fetchBarsRequest, fetchRegionsRequest } from '@/services/venues';
import { WeddingHall, Bar, PaginatedResponse, Region } from '@/types';

export interface VenueFilters {
  region?: string;
  district?: string;
  search?: string;
  min_capacity?: number;
}

export interface UseVenueCatalogReturn {
  // Filter state
  selectedRegion: string;
  setSelectedRegion: (v: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (v: string) => void;
  selectedCategory: 'all' | 'halls' | 'bars';
  setSelectedCategory: (v: 'all' | 'halls' | 'bars') => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  minCapacity: number;
  setMinCapacity: (v: number) => void;
  selectedDate: string;
  setSelectedDate: (v: string) => void;

  // Search mode
  isSearchActive: boolean;
  searchCardYOffset: number;
  returnCardYOffset: number;
  heroHeightRef: React.MutableRefObject<number>;
  heroRef: React.RefObject<HTMLElement | null>;
  searchPanelRef: React.RefObject<HTMLDivElement | null>;

  // Data
  hallsList: WeddingHall[];
  barsList: Bar[];
  combinedList: (WeddingHall | Bar)[];
  dbRegions: Region[];
  isLoading: boolean;
  isError: boolean;
  refetchAll: () => void;

  // Actions
  activateSearch: (e?: React.SyntheticEvent) => void;
  handleResetFilters: () => void;
  handleCategoryChange: (cat: 'all' | 'halls' | 'bars') => void;
  handleSearchSubmit: () => void;
}

/**
 * Core state and data hook for the home page catalog.
 * Extracts all search/filter state, URL sync, scroll logic, and data fetching
 * out of page.tsx so the component stays focused on rendering only.
 */
export function useVenueCatalog(): UseVenueCatalogReturn {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categoryParam = (searchParams.get('category') as 'all' | 'halls' | 'bars') || 'all';

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'halls' | 'bars'>(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [minCapacity, setMinCapacity] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(categoryParam !== 'all');
  const [searchCardYOffset, setSearchCardYOffset] = useState<number>(0);
  const [returnCardYOffset, setReturnCardYOffset] = useState<number>(0);

  const searchPanelRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const heroHeightRef = useRef<number>(460);

  // Measure and cache Hero section height whenever rendered
  useEffect(() => {
    if (heroRef.current && heroRef.current.offsetHeight > 100) {
      heroHeightRef.current = heroRef.current.offsetHeight;
    }
  });

  // Sync category state when URL changes
  useEffect(() => {
    setSelectedCategory(categoryParam);
    if (categoryParam !== 'all') setIsSearchActive(true);
  }, [categoryParam]);

  const scrollToTop = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const lenis = (window as unknown as { lenis?: { scrollTo: (v: number, opts: object) => void } }).lenis;
      if (lenis?.scrollTo) lenis.scrollTo(0, { immediate: true });
    } catch {
      // lenis scroll fallback
    }
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const activateSearch = useCallback(
    (e?: React.SyntheticEvent) => {
      if (e?.target && (e.target as HTMLElement).closest('[data-back-button]')) return;
      if (!isSearchActive) {
        let initialOffset = 0;
        if (searchPanelRef.current) {
          const rect = searchPanelRef.current.getBoundingClientRect();
          // Target position in venue list mode: Header (72px) + pt-6 (24px) + back button row (~36px)
          const targetTop = 132;
          initialOffset = Math.round(rect.top - targetTop);
        }
        setReturnCardYOffset(0);
        setSearchCardYOffset(initialOffset);
        setIsSearchActive(true);
        scrollToTop();
      }
    },
    [isSearchActive, scrollToTop],
  );

  const handleCategoryChange = useCallback(
    (cat: 'all' | 'halls' | 'bars') => {
      activateSearch();
      setSelectedCategory(cat);
      const params = new URLSearchParams(searchParams.toString());
      if (cat === 'all') {
        params.delete('category');
      } else {
        params.set('category', cat);
      }
      const query = params.toString();
      router.push(query ? `/?${query}` : '/', { scroll: false });
    },
    [activateSearch, searchParams, router],
  );

  const handleSearchSubmit = useCallback(() => {
    if (!isSearchActive) {
      activateSearch();
    } else {
      const el = document.getElementById('katalog');
      if (el && window.scrollY > 200) {
        const lenis = (window as unknown as { lenis?: { scrollTo: (target: string, opts: object) => void } }).lenis;
        if (lenis) {
          lenis.scrollTo('#katalog', { offset: -80 });
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [isSearchActive, activateSearch]);

  const handleResetFilters = useCallback(() => {
    let currentTop = 132;
    if (searchPanelRef.current) {
      currentTop = searchPanelRef.current.getBoundingClientRect().top;
    }
    const isSm = typeof window !== 'undefined' && window.innerWidth >= 640;
    const headerHeight = isSm ? 72 : 64;
    const marginOffset = isSm ? 80 : 64;
    const homeTop = headerHeight + (heroHeightRef.current || 460) - marginOffset;
    const offset = Math.round(currentTop - homeTop);

    setReturnCardYOffset(offset);
    setSearchCardYOffset(0);
    scrollToTop();
    setSelectedRegion('');
    setSelectedDistrict('');
    setSelectedCategory('all');
    setSearchQuery('');
    setMinCapacity(0);
    setSelectedDate('');
    setIsSearchActive(false);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    const query = params.toString();
    router.push(query ? `/?${query}` : '/', { scroll: false });
  }, [scrollToTop, searchParams, router]);

  // Build filter params
  const filterParams: VenueFilters = {};
  if (selectedRegion) filterParams.region = selectedRegion;
  if (selectedDistrict) filterParams.district = selectedDistrict;
  if (searchQuery.trim()) filterParams.search = searchQuery.trim();
  if (minCapacity > 0) filterParams.min_capacity = minCapacity;

  const shouldFetchHalls = selectedCategory === 'all' || selectedCategory === 'halls';
  const shouldFetchBars = selectedCategory === 'all' || selectedCategory === 'bars';

  const { data: dbRegions = [] } = useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: fetchRegionsRequest,
    staleTime: 0,
  });

  const {
    data: hallsRes,
    isLoading: loadingHalls,
    error: errorHalls,
    refetch: refetchHalls,
  } = useQuery<PaginatedResponse<WeddingHall>>({
    queryKey: ['halls', filterParams, selectedCategory],
    queryFn: () => fetchHallsRequest(1, false, filterParams),
    staleTime: 0,
    enabled: shouldFetchHalls,
  });

  const {
    data: barsRes,
    isLoading: loadingBars,
    error: errorBars,
    refetch: refetchBars,
  } = useQuery<PaginatedResponse<Bar>>({
    queryKey: ['bars', filterParams, selectedCategory],
    queryFn: () => fetchBarsRequest(1, false, filterParams),
    staleTime: 0,
    enabled: shouldFetchBars,
  });

  const hallsList = hallsRes?.results || [];
  const barsList = barsRes?.results || [];

  let combinedList: (WeddingHall | Bar)[] = [];
  if (selectedCategory === 'halls') combinedList = hallsList;
  else if (selectedCategory === 'bars') combinedList = barsList;
  else combinedList = [...hallsList, ...barsList];

  const isLoading = (shouldFetchHalls && loadingHalls) || (shouldFetchBars && loadingBars);
  const isError = !!(errorHalls || errorBars);

  const refetchAll = useCallback(() => {
    refetchHalls();
    refetchBars();
  }, [refetchHalls, refetchBars]);

  return {
    selectedRegion, setSelectedRegion,
    selectedDistrict, setSelectedDistrict,
    selectedCategory, setSelectedCategory,
    searchQuery, setSearchQuery,
    minCapacity, setMinCapacity,
    selectedDate, setSelectedDate,
    isSearchActive,
    searchCardYOffset,
    returnCardYOffset,
    heroHeightRef,
    heroRef,
    searchPanelRef,
    hallsList,
    barsList,
    combinedList,
    dbRegions,
    isLoading,
    isError,
    refetchAll,
    activateSearch,
    handleResetFilters,
    handleCategoryChange,
    handleSearchSubmit,
  };
}
