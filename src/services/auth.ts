import { api } from './api';
import { User } from '../types';

/**
 * Sends a request to retrieve JWT access and refresh tokens.
 */
export const loginRequest = async (phone_number: string, password: string) => {
  const response = await api.post('/auth/jwt/create/', { phone_number, password });
  return response.data; // Expected output: { access: string, refresh: string }
};

/**
 * Registers a new user.
 */
export const registerRequest = async (userData: any) => {
  const response = await api.post('/auth/users/', userData);
  return response.data; // Returns created User object
};

/**
 * Fetches the currently logged in user's profile information.
 */
export const fetchMeRequest = async (): Promise<User> => {
  const response = await api.get('/auth/users/me/');
  return response.data;
};
