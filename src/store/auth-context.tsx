'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import {
  loginRequest,
  registerRequest,
  fetchMeRequest,
  RegistrationCompleteError,
} from '@/services/auth';
import {
  clearSession,
  saveSession,
  SESSION_EXPIRED_EVENT,
} from '@/services/api';
import { readStorage } from '@/utils/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<User>;
  register: (
    phone: string,
    name: string,
    password: string,
    role: 'CLIENT' | 'VENUE_OWNER',
  ) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const router = useRouter();
  const generation = useRef(0);

  useEffect(() => {
    let active = true;
    const initialGeneration = generation.current;
    // Read browser storage after hydration; don't block public pages with a redirect.
    Promise.resolve().then(async () => {
      try {
        if (readStorage('access_token') || readStorage('refresh_token')) {
          const profile = await fetchMeRequest();
          if (active && initialGeneration === generation.current)
            setUser(profile);
        }
      } catch {
        if (active && initialGeneration === generation.current) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    });
    const onExpired = () => {
      generation.current += 1;
      setUser(null);
      queryClient.clear();
    };
    const onStorage = (event: StorageEvent) => {
      if (
        (event.key === 'access_token' || event.key === null) &&
        !readStorage('access_token')
      )
        onExpired();
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    window.addEventListener('storage', onStorage);
    return () => {
      active = false;
      window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
      window.removeEventListener('storage', onStorage);
    };
  }, [queryClient]);

  const login = async (phone: string, password: string): Promise<User> => {
    const currentGeneration = ++generation.current;
    clearSession();
    try {
      const tokens = await loginRequest(phone, password);
      if (currentGeneration !== generation.current)
        throw new Error('Kirish bekor qilindi.');
      saveSession(tokens.access, tokens.refresh);
      const profile = await fetchMeRequest();
      if (currentGeneration !== generation.current)
        throw new Error('Kirish bekor qilindi.');
      queryClient.clear();
      setUser(profile);
      return profile;
    } catch (error) {
      if (currentGeneration === generation.current) {
        clearSession();
        setUser(null);
      }
      throw error;
    }
  };

  const register = async (
    phone: string,
    name: string,
    password: string,
    role: 'CLIENT' | 'VENUE_OWNER',
  ) => {
    await registerRequest({
      phone_number: phone,
      first_name: name.trim(),
      password,
      re_password: password,
      role,
    });
    try {
      return await login(phone, password);
    } catch {
      // Retrying registration would create a duplicate account request.
      throw new RegistrationCompleteError();
    }
  };

  const logout = () => {
    generation.current += 1;
    clearSession();
    queryClient.clear();
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
