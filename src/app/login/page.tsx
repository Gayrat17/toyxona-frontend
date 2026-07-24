'use client';

import React, { useState } from 'react';
import { useAuth } from '@/store/auth-context';
import Link from 'next/link';
import { Phone, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phoneNumber || !password) {
      setError("Telefon raqami va parolni kiritish shart.");
      return;
    }

    try {
      await login(phoneNumber, password);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors[0]);
      } else {
        setError("Telefon raqami yoki parol noto'g'ri.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      {/* Background decoration blur bubbles */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-pink-600/10 blur-3xl"></div>

      <div className="relative w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-950/40 p-8 backdrop-blur-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Tizimga Kirish
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Telefon raqamingiz va parolingizni kiriting
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="phone-number" className="block text-sm font-medium text-slate-300">
                Telefon raqam
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="phone-number"
                  name="phoneNumber"
                  type="text"
                  required
                  placeholder="+998901234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900/60 py-3 pl-10 pr-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                Parol
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900/60 py-3 pl-10 pr-10 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                "Kirish"
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-slate-400">Hisobingiz yo'qmi? </span>
          <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Ro'yxatdan o'ting
          </Link>
        </div>
      </div>
    </div>
  );
}
