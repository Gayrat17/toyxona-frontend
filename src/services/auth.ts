import { api } from './api';
import { User } from '../types';
import { UserRole } from '../types';

/**
 * Formats user phone number to standard +998XXXXXXXXX format.
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.trim().replace(/\s+/g, '');
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('998')) {
      return `+${cleaned}`;
    }
    return `+998${cleaned}`;
  }
  return cleaned;
};

export interface RegisterData {
  phone_number: string;
  first_name: string;
  password: string;
  re_password: string;
  role: UserRole;
  last_name?: string;
  email?: string;
}

/**
 * Sends a request to retrieve JWT access and refresh tokens.
 */
export const loginRequest = async (phone_number: string, password: string) => {
  const formattedPhone = formatPhoneNumber(phone_number);
  const response = await api.post('/auth/jwt/create/', {
    phone_number: formattedPhone,
    password,
  });
  return response.data; // Expected output: { access: string, refresh: string }
};

/**
 * Registers a new user.
 */
export const registerRequest = async (userData: RegisterData) => {
  const formattedData: RegisterData = {
    ...userData,
    phone_number: userData.phone_number
      ? formatPhoneNumber(userData.phone_number)
      : userData.phone_number,
  };
  const response = await api.post('/auth/users/', formattedData);
  return response.data; // Returns created User object
};

/**
 * Fetches the currently logged in user's profile information.
 */
export const fetchMeRequest = async (): Promise<User> => {
  const response = await api.get('/auth/users/me/');
  return response.data;
};

export interface TelegramAuthInitResponse {
  session_id: string;
  bot_username: string;
  bot_url: string;
  expires_at: string;
  expires_in_seconds: number;
}

export interface TelegramAuthStatusResponse {
  status: 'PENDING' | 'AUTHENTICATED' | 'COMPLETED' | 'EXPIRED' | 'NOT_FOUND';
  access?: string;
  refresh?: string;
  is_new_user?: boolean;
  user?: User;
  detail?: string;
}

/**
 * Initializes a new Telegram QR / deep-link authentication session.
 */
export const initTelegramAuthRequest = async (): Promise<TelegramAuthInitResponse> => {
  const response = await api.post('/auth/telegram/init/');
  return response.data;
};

/**
 * Polls the status of an ongoing Telegram authentication session.
 */
export const checkTelegramAuthStatusRequest = async (
  sessionId: string
): Promise<TelegramAuthStatusResponse> => {
  const response = await api.get(`/auth/telegram/status/${sessionId}/`);
  return response.data;
};

/**
 * Sets role and name for newly registered Telegram users.
 */
export const completeProfileRequest = async (
  role: UserRole,
  firstName?: string,
  lastName?: string
): Promise<{ message: string; user: User }> => {
  const response = await api.post('/auth/complete-profile/', {
    role,
    first_name: firstName,
    last_name: lastName,
  });
  return response.data;
};

