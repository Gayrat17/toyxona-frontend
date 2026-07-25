'use client';

import React, { useState } from 'react';
import { useAuth } from '@/store/auth-context';
import Link from 'next/link';
import { Phone, Lock, User as UserIcon, Shield, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CLIENT' | 'VENUE_OWNER'>('CLIENT');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phoneNumber || !firstName || !password) {
      setError("Barcha maydonlarni to'ldirish shart.");
      return;
    }

    try {
      await register(phoneNumber, firstName, password, role);
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.phone_number) {
        const msg = Array.isArray(err.response.data.phone_number) ? err.response.data.phone_number[0] : err.response.data.phone_number;
        setError(msg.includes("exists") || msg.includes("already") || msg.includes("mavjud") ? "Ushbu telefon raqami allaqachon ro'yxatdan o'tgan." : msg);
      } else if (err.response?.data?.password) {
        setError(Array.isArray(err.response.data.password) ? err.response.data.password[0] : err.response.data.password);
      } else if (err.response?.data?.re_password) {
        setError(Array.isArray(err.response.data.re_password) ? err.response.data.re_password[0] : err.response.data.re_password);
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.response?.data && typeof err.response.data === 'object') {
        const firstKey = Object.keys(err.response.data)[0];
        const val = err.response.data[firstKey];
        setError(`${firstKey}: ${Array.isArray(val) ? val[0] : val}`);
      } else {
        setError("Ro'yxatdan o'tishda xatolik yuz berdi. Iltimos qaytadan urining.");
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
            Ro'yxatdan O'tish
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Katta imkoniyatlarga ega bo'lish uchun profil yarating
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
              <label htmlFor="first-name" className="block text-sm font-medium text-slate-300">
                Ismingiz
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="first-name"
                  name="firstName"
                  type="text"
                  required
                  placeholder="Ali"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900/60 py-3 pl-10 pr-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

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
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900/60 py-3 pl-10 pr-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Rolingizni tanlang</label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div
                  onClick={() => setRole('CLIENT')}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border p-3 transition-all duration-200 ${
                    role === 'CLIENT'
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <UserIcon className="mb-1 h-5 w-5" />
                  <span className="text-xs font-semibold">Mijoz (Client)</span>
                </div>

                <div
                  onClick={() => setRole('VENUE_OWNER')}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border p-3 transition-all duration-200 ${
                    role === 'VENUE_OWNER'
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <Shield className="mb-1 h-5 w-5" />
                  <span className="text-xs font-semibold">Joy Egasi (Owner)</span>
                </div>
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
                "Ro'yxatdan o'tish"
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-slate-400">Hisobingiz bormi? </span>
          <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Tizimga kiring
          </Link>
        </div>
      </div>
    </div>
  );
}
