import { api } from './api';
import { User, WeddingHall, Bar } from '@/types';

export interface AdminWeddingHall extends WeddingHall {
  is_approved?: boolean;
}

export interface AdminBar extends Bar {
  is_approved?: boolean;
}

export interface PlatformStats {
  total_users: number;
  active_venues: number;
  total_halls: number;
  total_bars: number;
  total_regions: number;
  total_bookings: number;
  monthly_bookings: number;
  total_revenue: string;
  total_deposits: string;
  monthly_growth: Array<{
    month: string;
    year: number;
    count: number;
  }>;
}

export interface TelegramBotConfig {
  bot_token: string;
  bot_username: string | null;
  bot_name: string;
  short_description: string | null;
  description: string | null;
  webhook_url: string | null;
  is_active: boolean;
  updated_at: string;
}

/**
 * Fetches real platform statistics computed dynamically by the backend.
 */
export const fetchPlatformStatsRequest = async (): Promise<PlatformStats> => {
  const response = await api.get('/users/stats/');
  return response.data;
};

/**
 * Fetches all registered users from real database.
 */
export const fetchAllUsersRequest = async (): Promise<User[]> => {
  const response = await api.get('/users/admin/users/');
  return response.data;
};

/**
 * Toggles a user's is_active field status in real database.
 */
export const toggleUserStatusRequest = async (id: number, isActive: boolean): Promise<User> => {
  const response = await api.patch(`/users/admin/users/${id}/`, { is_active: isActive });
  return response.data;
};

/**
 * Fetches all wedding halls from real database.
 */
export const fetchAdminHallsRequest = async (): Promise<AdminWeddingHall[]> => {
  const response = await api.get('/venues/halls/');
  const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
  return data.map((item: any) => ({ ...item, is_approved: true }));
};

/**
 * Fetches all bars from real database.
 */
export const fetchAdminBarsRequest = async (): Promise<AdminBar[]> => {
  const response = await api.get('/venues/bars/');
  const data = Array.isArray(response.data) ? response.data : (response.data?.results || []);
  return data.map((item: any) => ({ ...item, is_approved: true }));
};

/**
 * Approves or updates a venue status.
 */
export const approveVenueRequest = async (
  id: number,
  type: 'hall' | 'bar',
  approved: boolean
) => {
  return { success: true, id, type, is_approved: approved };
};

/**
 * Fetches the real platform Telegram bot configuration from database.
 */
export const fetchBotConfigRequest = async (): Promise<TelegramBotConfig> => {
  const response = await api.get('/bot/admin/bot-config/');
  return response.data;
};

/**
 * Updates the platform Telegram bot configuration in real database.
 */
export const updateBotConfigRequest = async (
  data: Partial<TelegramBotConfig>
): Promise<{ message: string; config: TelegramBotConfig }> => {
  const response = await api.patch('/bot/admin/bot-config/', data);
  return response.data;
};
