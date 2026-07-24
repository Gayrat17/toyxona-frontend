import { api } from './api';
import { User, WeddingHall, Bar } from '@/types';

// Seeded initial mocks for robust frontend simulation if backend endpoints throw errors
const MOCK_USERS: User[] = [
  {
    id: 1,
    phone_number: "+998901234567",
    first_name: "Super",
    last_name: "Admin",
    role: "ADMIN",
    is_verified: true,
    is_staff: true,
    is_active: true,
    date_joined: "2026-01-10T12:00:00Z",
  },
  {
    id: 2,
    phone_number: "+998901112233",
    first_name: "Ahror",
    last_name: "Umarov",
    role: "VENUE_OWNER",
    is_verified: true,
    is_staff: false,
    is_active: true,
    date_joined: "2026-02-15T09:00:00Z",
  },
  {
    id: 3,
    phone_number: "+998904445566",
    first_name: "Sardor",
    last_name: "Karimov",
    role: "VENUE_OWNER",
    is_verified: true,
    is_staff: false,
    is_active: true,
    date_joined: "2026-03-01T14:30:00Z",
  },
  {
    id: 4,
    phone_number: "+998907778899",
    first_name: "Diyor",
    last_name: "Aliyev",
    role: "CLIENT",
    is_verified: false,
    is_staff: false,
    is_active: true,
    date_joined: "2026-04-20T10:15:00Z",
  }
];

let localUsersState = [...MOCK_USERS];

/**
 * Fetches all registered users (for admin panel view).
 */
export const fetchAllUsersRequest = async (): Promise<User[]> => {
  try {
    const response = await api.get('/admin/users/');
    return response.data;
  } catch (err) {
    console.warn("Using local mock users fallback dataset.");
    return localUsersState;
  }
};

/**
 * Toggles a user's is_active field status (freeze/unfreeze).
 */
export const toggleUserStatusRequest = async (id: number, isActive: boolean): Promise<User> => {
  try {
    const response = await api.patch(`/admin/users/${id}/`, { is_active: isActive });
    return response.data;
  } catch (err) {
    console.warn("Simulating user active status toggle locally.");
    localUsersState = localUsersState.map((u) => 
      u.id === id ? { ...u, is_active: isActive } : u
    );
    const updated = localUsersState.find((u) => u.id === id);
    if (!updated) throw new Error("Foydalanuvchi topilmadi");
    return updated;
  }
};

// Local venue mocks representing is_approved state simulations
interface AdminWeddingHall extends WeddingHall {
  is_approved?: boolean;
}

interface AdminBar extends Bar {
  is_approved?: boolean;
}

let localHallsState: AdminWeddingHall[] = [];
let localBarsState: AdminBar[] = [];

/**
 * Fetches all wedding halls for admin checkups.
 */
export const fetchAdminHallsRequest = async (): Promise<AdminWeddingHall[]> => {
  try {
    const response = await api.get('/venues/halls/');
    return response.data;
  } catch (err) {
    console.warn("Using local halls fallback dataset.");
    if (localHallsState.length === 0) {
      localHallsState = [
        {
          id: 1,
          owner: 2,
          name: "Yulduz To'yxonasi",
          address: "Toshkent sh., Chilonzor tumani",
          description: "Maksimal qulayliklarga ega hashamatli to'y zali",
          max_capacity: 500,
          required_deposit: "5000000.00",
          created_at: "2026-05-01T10:00:00Z",
          is_approved: false
        }
      ];
    }
    return localHallsState;
  }
};

/**
 * Fetches all bars for admin checkups.
 */
export const fetchAdminBarsRequest = async (): Promise<AdminBar[]> => {
  try {
    const response = await api.get('/venues/bars/');
    return response.data;
  } catch (err) {
    console.warn("Using local bars fallback dataset.");
    if (localBarsState.length === 0) {
      localBarsState = [
        {
          id: 1,
          owner: 3,
          name: "Retro Bar & Lounge",
          address: "Toshkent sh., Yunusobod tumani",
          description: "Soatbay ijaraga beriladigan shinam retro bar",
          capacity: 50,
          price_per_hour: "300000.00",
          required_deposit: "1000000.00",
          created_at: "2026-05-15T12:00:00Z",
          is_approved: true
        }
      ];
    }
    return localBarsState;
  }
};

/**
 * Approves or rejects a venue (Wedding Hall or Bar).
 */
export const approveVenueRequest = async (
  id: number,
  type: 'hall' | 'bar',
  approved: boolean
) => {
  try {
    const response = await api.patch(`/admin/venues/${type}/${id}/approve/`, { 
      is_approved: approved 
    });
    return response.data;
  } catch (err) {
    console.warn("Simulating venue approval status toggle locally.");
    if (type === 'hall') {
      localHallsState = localHallsState.map((h) => 
        h.id === id ? { ...h, is_approved: approved } : h
      );
    } else {
      localBarsState = localBarsState.map((b) => 
        b.id === id ? { ...b, is_approved: approved } : b
      );
    }
    return { success: true, id, type, is_approved: approved };
  }
};

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

let localBotConfigState: TelegramBotConfig = {
  bot_token: "654321...cba9",
  bot_username: "ToyxonaAdminBot",
  bot_name: "To'yxona Admin Bot",
  short_description: "Hisobni ulanish va bronlarni qabul qilish",
  description: "Bu bot orqali to'yxona va bar egalari bron so'rovlarini qabul qila oladilar.",
  webhook_url: "https://toyxona.uz/api/v1/notifications/webhook/",
  is_active: true,
  updated_at: "2026-07-16T13:47:00Z"
};

export const fetchBotConfigRequest = async (): Promise<TelegramBotConfig> => {
  try {
    const response = await api.get('/bot/admin/bot-config/');
    return response.data;
  } catch (err) {
    console.warn("Using local mock bot config fallback.");
    return localBotConfigState;
  }
};

export const updateBotConfigRequest = async (
  data: Partial<TelegramBotConfig>
): Promise<{ message: string; config: TelegramBotConfig }> => {
  try {
    const response = await api.patch('/bot/admin/bot-config/', data);
    return response.data;
  } catch (err) {
    console.warn("Using local mock bot config update.");
    localBotConfigState = {
      ...localBotConfigState,
      ...data,
      bot_username: data.bot_token ? "ToyxonaAdminBot" : localBotConfigState.bot_username,
      is_active: data.bot_token ? true : localBotConfigState.is_active,
      updated_at: new Date().toISOString()
    };
    return {
      message: "Bot tokeni qabul qilindi, nomi o'zgartirildi va Webhook muvaffaqiyatli ulandi! (MOCK)",
      config: localBotConfigState
    };
  }
};

