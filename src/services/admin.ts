import { api } from './api';
import { fetchCollection } from './collections';
import type { User, WeddingHall, Bar } from '@/types';

// Never turn a failed administrative operation into a simulated success.
export const fetchAllUsersRequest = () =>
  fetchCollection<User>('/admin/users/');
export const fetchAdminHallsRequest = () =>
  fetchCollection<WeddingHall>('/venues/halls/');
export const fetchAdminBarsRequest = () =>
  fetchCollection<Bar>('/venues/bars/');

export async function toggleUserStatusRequest(
  id: number,
  isActive: boolean,
): Promise<User> {
  return (await api.patch<User>(`/admin/users/${id}/`, { is_active: isActive }))
    .data;
}

export async function approveVenueRequest(
  id: number,
  type: 'hall' | 'bar',
  approved: boolean,
) {
  return (
    await api.patch(`/admin/venues/${type}/${id}/approve/`, {
      is_approved: approved,
    })
  ).data;
}

export interface TelegramBotConfig {
  bot_token?: string;
  bot_username: string | null;
  bot_name: string;
  short_description: string | null;
  description: string | null;
  webhook_url: string | null;
  is_active: boolean;
  updated_at: string;
}

export async function fetchBotConfigRequest(): Promise<TelegramBotConfig> {
  return (await api.get<TelegramBotConfig>('/bot/admin/bot-config/')).data;
}

export async function updateBotConfigRequest(
  data: Partial<TelegramBotConfig>,
): Promise<{ message: string; config: TelegramBotConfig }> {
  return (await api.patch('/bot/admin/bot-config/', data)).data;
}
