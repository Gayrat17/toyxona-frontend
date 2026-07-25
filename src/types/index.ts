export type UserRole = 'CLIENT' | 'VENUE_OWNER' | 'ADMIN';

export interface User {
  id: number;
  phone_number: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role: UserRole;
  is_verified: boolean;
  telegram_chat_id?: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface VenueImage {
  id: number;
  image?: string;
  file?: string;
  image_url: string;
  type?: string;
  is_main?: boolean;
  position?: number;
  created_at: string;
}

export interface WeddingHall {
  id: number;
  owner: number;
  owner_phone?: string;
  name: string;
  address: string;
  description: string;
  max_capacity: number;
  required_deposit: string; // Decimals are serialized as strings in JSON API responses
  cover_image?: string | null;
  cover_image_url?: string | null;
  video_url?: string | null;
  map_link?: string | null;
  amenities?: string[];
  gallery_images?: VenueImage[];
  created_at: string;
}

export interface Bar {
  id: number;
  owner: number;
  owner_phone?: string;
  name: string;
  address: string;
  description: string;
  capacity: number;
  price_per_hour: string; // Decimal representation
  required_deposit: string; // Decimal representation
  cover_image?: string | null;
  cover_image_url?: string | null;
  video_url?: string | null;
  map_link?: string | null;
  amenities?: string[];
  gallery_images?: VenueImage[];
  created_at: string;
}

export interface Shift {
  id: number;
  hall: number;
  name: string; // e.g., "Tushlik" / "Kechki"
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  is_active: boolean;
}

export interface Package {
  id: number;
  hall: number;
  guest_count: number;
  price: string; // Decimal representation
  description: string;
}

export interface Decoration {
  id: number;
  hall: number;
  name: string;
  additional_price: string; // Decimal representation
}

export interface ShiftBlock {
  id: number;
  hall: number;
  shift: number;
  date: string; // YYYY-MM-DD
  reason: string;
}

export type BookingStatus = 'HOLD' | 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';

export interface BaseBooking {
  id: number;
  user: number;
  user_phone?: string;
  date: string; // YYYY-MM-DD
  total_price: string; // Decimal representation
  deposit_amount: string; // Decimal representation
  is_deposit_paid: boolean;
  status: BookingStatus;
  expires_at?: string | null; // ISO DateTime string
  meeting_date?: string | null; // ISO DateTime string
  admin_notes?: string | null;
  created_at: string;
  remaining_amount: number;
}

export interface HallBooking extends BaseBooking {
  hall: number;
  shift: number;
  package: number;
  decoration?: number | null;
}

export interface BarBooking extends BaseBooking {
  bar: number;
  start_time: string; // HH:MM:SS
  end_time: string; // HH:MM:SS
  guest_count?: number | null;
}

export type Booking = HallBooking | BarBooking;

export function isHallBooking(booking: Booking): booking is HallBooking {
  return (booking as HallBooking).hall !== undefined;
}

export function isBarBooking(booking: Booking): booking is BarBooking {
  return (booking as BarBooking).bar !== undefined;
}

export interface BusyShift {
  date: string;
  shift_id: number;
  shift_name: string;
  status: 'BOOKED' | 'BLOCKED';
  booking_status?: BookingStatus;
  reason?: string;
}

export interface HallCalendarData {
  hall_id: number;
  year: number;
  month: number;
  busy_shifts: BusyShift[];
}

export interface BusyBarSlot {
  date: string;
  start_time: string;
  end_time: string;
  status: 'BOOKED';
  booking_status: BookingStatus;
}

export interface BarCalendarData {
  bar_id: number;
  year: number;
  month: number;
  busy_slots: BusyBarSlot[];
}
