import axios, { type InternalAxiosRequestConfig } from 'axios';
import { readStorage, writeStorage } from '@/utils/storage';

export const API_URL = '/api/v1';
export const SESSION_EXPIRED_EVENT = 'toyxona:session-expired';
export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

type SessionRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _sessionVersion?: number;
};
let sessionVersion = 0;
let refreshPromise: Promise<string> | null = null;

export function clearSession() {
  sessionVersion += 1;
  refreshPromise = null;
  writeStorage('access_token', null);
  writeStorage('refresh_token', null);
  delete api.defaults.headers.common.Authorization;
}

export function saveSession(access: string, refresh?: string) {
  if (
    !writeStorage('access_token', access) ||
    (refresh && !writeStorage('refresh_token', refresh))
  ) {
    clearSession();
    throw new Error(
      'Hisobga kirish uchun brauzerda mahalliy saqlashga ruxsat bering.',
    );
  }
}

function expireSession() {
  clearSession();
  if (typeof window !== 'undefined')
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

function isCredentialRequest(config: InternalAxiosRequestConfig) {
  return (
    config.url?.includes('/auth/jwt/') ||
    (config.method === 'post' && config.url === '/auth/users/')
  );
}

api.interceptors.request.use((config: SessionRequest) => {
  if (
    config._sessionVersion !== undefined &&
    config._sessionVersion !== sessionVersion
  )
    return Promise.reject(
      new Error('Sessiya o‘zgargan. So‘rov bekor qilindi.'),
    );
  config._sessionVersion = sessionVersion;
  const token = readStorage('access_token');
  if (token && !isCredentialRequest(config))
    config.headers.Authorization = `Bearer ${token}`;
  else delete config.headers.Authorization;
  return config;
});

async function refreshAccessToken(refresh: string): Promise<string> {
  try {
    const { data } = await axios.post<{ access: string; refresh?: string }>(
      `${API_URL}/auth/jwt/refresh/`,
      { refresh },
      { timeout: 15000 },
    );
    // A request completing after logout must never restore the old session.
    if (readStorage('refresh_token') !== refresh)
      throw new Error('Sessiya o‘zgargan. Qayta kiring.');
    if (!data.access) throw new Error('Server kirish tokenini qaytarmadi.');
    saveSession(data.access, data.refresh);
    return data.access;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      [400, 401, 403].includes(error.response?.status || 0) &&
      readStorage('refresh_token') === refresh
    )
      expireSession();
    throw error;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);
    const original = error.config as SessionRequest | undefined;
    if (
      error.response?.status !== 401 ||
      !original ||
      isCredentialRequest(original)
    )
      return Promise.reject(error);
    // A late response from a logged-out account must not retry under a new account.
    if (original._sessionVersion !== sessionVersion)
      return Promise.reject(error);
    if (original._retry) {
      if (
        original.headers.Authorization ===
        `Bearer ${readStorage('access_token')}`
      )
        expireSession();
      return Promise.reject(error);
    }
    // A late 401 may belong to the token that a concurrent request already rotated.
    const currentAccess = readStorage('access_token');
    if (
      currentAccess &&
      original.headers.Authorization !== `Bearer ${currentAccess}`
    ) {
      original._retry = true;
      return api(original);
    }
    const refresh = readStorage('refresh_token');
    if (!refresh) {
      if (currentAccess) expireSession();
      return Promise.reject(error);
    }
    original._retry = true;
    // One refresh for all concurrent 401s, including token rotation.
    if (!refreshPromise) {
      const pending: Promise<string> = refreshAccessToken(refresh).finally(
        () => {
          if (refreshPromise === pending) refreshPromise = null;
        },
      );
      refreshPromise = pending;
    }
    try {
      const token = await refreshPromise;
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);
