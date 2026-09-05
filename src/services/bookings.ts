import { api } from './api';
import { fetchCollection } from './collections';
import {
  HallCalendarData,
  BarCalendarData,
  HallBooking,
  BarBooking,
} from '@/types';

/**
 * Creates a new booking request for a wedding hall.
 */
export const createHallBookingRequest = async (bookingData: {
  hall: number;
  date: string; // YYYY-MM-DD
  shift: number;
  package: number;
  decoration?: number | null;
}) => {
  const response = await api.post('/bookings/hall/', bookingData);
  return response.data;
};

/**
 * Creates a new booking request for a bar.
 */
export const createBarBookingRequest = async (bookingData: {
  bar: number;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS or HH:MM
  end_time: string; // HH:MM:SS or HH:MM
  guest_count?: number | null;
}) => {
  const response = await api.post('/bookings/bar/', bookingData);
  return response.data;
};

/**
 * Fetches busy and blocked shifts for a wedding hall by year and month.
 */
export const fetchHallCalendarRequest = async (
  hallId: number,
  year: number,
  month: number,
): Promise<HallCalendarData> => {
  const response = await api.get(`/bookings/calendar/hall/${hallId}/`, {
    params: { year, month },
  });
  if (!Array.isArray(response.data?.busy_shifts))
    throw new Error('Serverdan noto‘g‘ri taqvim ma’lumoti keldi.');
  return response.data;
};

/**
 * Fetches received hall bookings for the logged in owner/admin.
 */
export const fetchHallBookingsRequest = async (): Promise<HallBooking[]> => {
  return fetchCollection<HallBooking>('/bookings/hall/');
};

/**
 * Fetches received bar bookings for the logged in owner/admin.
 */
export const fetchBarBookingsRequest = async (): Promise<BarBooking[]> => {
  return fetchCollection<BarBooking>('/bookings/bar/');
};

/**
 * Updates a wedding hall booking status.
 */
export const updateHallBookingStatus = async (
  id: number,
  status: 'CONFIRMED' | 'REJECTED' | 'HOLD',
): Promise<HallBooking> => {
  const response = await api.patch(`/bookings/hall/${id}/`, { status });
  return response.data;
};

/**
 * Updates a bar booking status.
 */
export const updateBarBookingStatus = async (
  id: number,
  status: 'CONFIRMED' | 'REJECTED' | 'HOLD',
): Promise<BarBooking> => {
  const response = await api.patch(`/bookings/bar/${id}/`, { status });
  return response.data;
};

export const fetchBarCalendarRequest = async (
  id: number,
  year: number,
  month: number,
): Promise<BarCalendarData> => {
  const response = await api.get(`/bookings/calendar/bar/${id}/`, {
    params: { year, month },
  });
  if (!Array.isArray(response.data?.busy_slots))
    throw new Error('Serverdan noto‘g‘ri taqvim ma’lumoti keldi.');
  return response.data;
};
