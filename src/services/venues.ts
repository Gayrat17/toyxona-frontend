import { api } from './api';
import { WeddingHall, Bar, Shift, Package, Decoration, PaginatedResponse, Region } from '@/types';

/**
 * Fetches all regions with nested districts from database.
 */
export const fetchRegionsRequest = async (): Promise<Region[]> => {
  const response = await api.get('/venues/regions/');
  if (response.data && response.data.results) {
    return response.data.results;
  }
  return Array.isArray(response.data) ? response.data : [];
};

export interface VenueFilterParams {
  page?: number;
  my_venues?: boolean;
  region?: string | number;
  district?: string | number;
  search?: string;
  min_capacity?: number;
}

/**
 * Fetches wedding halls from backend with pagination and filter support.
 */
export const fetchHallsRequest = async (
  page: number = 1,
  my_venues?: boolean,
  filters?: VenueFilterParams
): Promise<PaginatedResponse<WeddingHall>> => {
  const params: any = { page, ...filters };
  if (my_venues) params.my_venues = true;
  const response = await api.get('/venues/halls/', { params });
  if (Array.isArray(response.data)) {
    return {
      count: response.data.length,
      next: null,
      previous: null,
      results: response.data,
    };
  }
  return response.data;
};

/**
 * Fetches a single wedding hall by its ID.
 */
export const fetchHallByIdRequest = async (id: number): Promise<WeddingHall> => {
  const response = await api.get(`/venues/halls/${id}/`);
  return response.data;
};

/**
 * Fetches bars from backend with pagination and filter support.
 */
export const fetchBarsRequest = async (
  page: number = 1,
  my_venues?: boolean,
  filters?: VenueFilterParams
): Promise<PaginatedResponse<Bar>> => {
  const params: any = { page, ...filters };
  if (my_venues) params.my_venues = true;
  const response = await api.get('/venues/bars/', { params });
  if (Array.isArray(response.data)) {
    return {
      count: response.data.length,
      next: null,
      previous: null,
      results: response.data,
    };
  }
  return response.data;
};

/**
 * Fetches a single bar by its ID.
 */
export const fetchBarByIdRequest = async (id: number): Promise<Bar> => {
  const response = await api.get(`/venues/bars/${id}/`);
  return response.data;
};

/**
 * Fetches all shifts.
 */
export const fetchShiftsRequest = async (): Promise<Shift[]> => {
  const response = await api.get('/venues/shifts/');
  return response.data;
};

/**
 * Fetches all packages.
 */
export const fetchPackagesRequest = async (): Promise<Package[]> => {
  const response = await api.get('/venues/packages/');
  return response.data;
};

/**
 * Fetches all decorations.
 */
export const fetchDecorationsRequest = async (): Promise<Decoration[]> => {
  const response = await api.get('/venues/decorations/');
  return response.data;
};

/**
 * Creates a new Wedding Hall (supports JSON or FormData for media uploads).
 */
export const createHallRequest = async (data: FormData | any): Promise<WeddingHall> => {
  const response = await api.post('/venues/halls/', data);
  return response.data;
};

export const createBarRequest = async (data: FormData | any): Promise<Bar> => {
  const response = await api.post('/venues/bars/', data);
  return response.data;
};

export const updateHallRequest = async (id: number, data: FormData | any): Promise<WeddingHall> => {
  const response = await api.patch(`/venues/halls/${id}/`, data);
  return response.data;
};

export const updateBarRequest = async (id: number, data: FormData | any): Promise<Bar> => {
  const response = await api.patch(`/venues/bars/${id}/`, data);
  return response.data;
};

/**
 * Creates a new Shift for a Wedding Hall.
 */
export const createShiftRequest = async (data: {
  hall: number;
  name: string;
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
}): Promise<Shift> => {
  const response = await api.post('/venues/shifts/', data);
  return response.data;
};

/**
 * Creates a new Package for a Wedding Hall.
 */
export const createPackageRequest = async (data: {
  hall: number;
  guest_count: number;
  price: string;
  description: string;
}): Promise<Package> => {
  const response = await api.post('/venues/packages/', data);
  return response.data;
};

/**
 * Creates a new block for a specific date and shift.
 */
export const createShiftBlockRequest = async (data: {
  hall: number;
  shift: number;
  date: string; // YYYY-MM-DD
  reason: string;
}) => {
  const response = await api.post('/venues/blocks/', data);
  return response.data;
};
