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
