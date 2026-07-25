'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { loginRequest, registerRequest, fetchMeRequest } from '@/services/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone_number: string, password: string) => Promise<void>;
  register: (phone_number: string, first_name: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load user profile on mount if access token is present
  const loadUser = async () => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const me = await fetchMeRequest();
      setUser(me);
    } catch (err) {
      // In case the token is expired/invalid, clear local tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (phone_number: string, password: string) => {
    setLoading(true);
    try {
      const tokens = await loginRequest(phone_number, password);
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
      }
      
      const me = await fetchMeRequest();
      setUser(me);

      // Redirect based on role
      if (me.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (me.role === 'VENUE_OWNER') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (phone_number: string, first_name: string, password: string, role: string) => {
    setLoading(true);
    try {
      await registerRequest({ phone_number, first_name, password, re_password: password, role });
      // Log in automatically after registration
      await login(phone_number, password);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
