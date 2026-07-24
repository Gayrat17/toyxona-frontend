import { api } from './api';
import { WeddingHall, Bar, Shift, Package, Decoration } from '@/types';

/**
 * Fetches all wedding halls from the backend.
 */
export const fetchHallsRequest = async (): Promise<WeddingHall[]> => {
  const response = await api.get('/venues/halls/');
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
 * Fetches all bars from the backend.
 */
export const fetchBarsRequest = async (): Promise<Bar[]> => {
  const response = await api.get('/venues/bars/');
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
 * Creates a new Wedding Hall.
 */
export const createHallRequest = async (data: {
  name: string;
  address: string;
  description: string;
  max_capacity: number;
  required_deposit: string;
}): Promise<WeddingHall> => {
  const response = await api.post('/venues/halls/', data);
  return response.data;
};

/**
 * Creates a new Bar.
 */
export const createBarRequest = async (data: {
  name: string;
  address: string;
  description: string;
  capacity: number;
  price_per_hour: string;
  required_deposit: string;
}): Promise<Bar> => {
  const response = await api.post('/venues/bars/', data);
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
