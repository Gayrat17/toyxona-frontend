import { api } from './api';
import type { User } from '@/types';

export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `+${digits.length === 9 ? `998${digits}` : digits}`;
}

export function isValidPhoneNumber(phone: string): boolean {
  return /^\+998\d{9}$/.test(formatPhoneNumber(phone));
}

export async function loginRequest(phone_number: string, password: string) {
  const { data } = await api.post<{ access: string; refresh: string }>(
    '/auth/jwt/create/',
    {
      phone_number: formatPhoneNumber(phone_number),
      password,
    },
  );
  return data;
}

export async function registerRequest(userData: {
  phone_number: string;
  first_name: string;
  password: string;
  re_password: string;
  role: 'CLIENT' | 'VENUE_OWNER';
}): Promise<User> {
  const { data } = await api.post<User>('/auth/users/', {
    ...userData,
    phone_number: formatPhoneNumber(userData.phone_number),
  });
  return data;
}

export async function fetchMeRequest(): Promise<User> {
  return (await api.get<User>('/auth/users/me/')).data;
}

/** The account exists even when the subsequent automatic sign-in fails. */
export class RegistrationCompleteError extends Error {
  constructor() {
    super(
      'Hisob yaratildi, ammo avtomatik kirish yakunlanmadi. Telefon raqamingiz va parolingiz bilan tizimga kiring.',
    );
    this.name = 'RegistrationCompleteError';
  }
}
