'use client';

import React, { useState } from 'react';
import { useAuth } from '@/store/auth-context';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Lock, Eye, EyeOff, AlertCircle, Crown, ArrowLeft, LogIn, Send,
} from 'lucide-react';
import { useUzbekPhoneInput } from '@/hooks/useUzbekPhoneInput';
import { STAR_LATTICE_PATTERN } from '@/constants/decoration';
import { TelegramAuthWidget } from '@/components/auth/TelegramAuthWidget';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, loading, user } = useAuth();
  const router = useRouter();
  const phone = useUzbekPhoneInput();
  const [authMethod, setAuthMethod] = useState<'telegram' | 'password'>('telegram');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user is already authenticated, redirect to appropriate page
  React.useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ADMIN') {
        router.replace('/admin/dashboard');
      } else if (user.role === 'VENUE_OWNER') {
        router.replace('/dashboard');
      } else {
        router.replace('/');
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.isValid()) {
      setError("Telefon raqami to'liq kiritilishi shart (masalan: +998 90 123 45 67).");
      return;
    }
    if (!password) {
      setError('Parolni kiritish shart.');
      return;
    }

    try {
      await login(phone.toE164(), password);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string; non_field_errors?: string[] } } };
      if (axiosErr.response?.data?.detail) {
        const detail = axiosErr.response.data.detail;
        if (detail.includes('No active account') || detail.includes('credentials')) {
          setError("Telefon raqami yoki parol noto'g'ri.");
        } else {
          setError(detail);
        }
      } else if (axiosErr.response?.data?.non_field_errors) {
        setError(axiosErr.response.data.non_field_errors[0]);
      } else {
        setError("Telefon raqami yoki parol noto'g'ri.");
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      {/* ── Left visual panel (desktop only) ─────────────────────── */}
      <div className="texture-grain relative hidden w-[38%] shrink-0 overflow-hidden lg:flex lg:flex-col">
        <img
          src="/images/auth-side.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-espresso/80 via-espresso/50 to-espresso/95" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: STAR_LATTICE_PATTERN }}
        />

        <div className="relative z-[2] flex h-full flex-col justify-between p-8 xl:p-10">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 rotate-45 items-center justify-center border border-gold/60 bg-gradient-to-br from-[#ecd49c] to-[#b08d4f] shadow-[0_8px_18px_-8px_rgba(150,110,50,0.7)]">
              <span className="flex h-7 w-7 -rotate-45 items-center justify-center">
                <Crown className="h-4 w-4 text-[#221a0f]" />
              </span>
            </span>
            <span>
              <span className="block font-display text-xl font-bold tracking-[0.08em] text-[#f2e9d6]">
                TOYXONA
              </span>
              <span className="text-[9px] font-bold uppercase tracking-[0.42em] text-gold">
                Luxe Venue
              </span>
            </span>
          </Link>

          {/* Editorial Quote */}
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/80" />
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            </div>
            <p className="mt-4 font-display text-[1.95rem] xl:text-[2.15rem] font-medium leading-snug text-[#f6efdd]">
              «Hashamat — bu
              <br />
              <span className="gold-text italic">an&apos;anadir»</span>
            </p>
            <p className="mt-2.5 max-w-xs text-xs leading-relaxed text-[#cbbc9c]">
              Minglab juftliklar eng unutilmas kunlarini bizning
              platformamizda boshlaydi. Sizga ham xush kelibsiz.
            </p>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8d7f63]">
            Toshkent · Samarqand · Buxoro
          </p>
        </div>
      </div>

      {/* ── Right: form panel ─────────────────────────────────────── */}
      <div className="pattern-weave flex flex-1 flex-col overflow-y-auto">
        <div className="flex min-h-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-[620px] lg:max-w-[640px]">
            {/* Back link */}
            <Link
              href="/"
              className="group mb-4 inline-flex items-center gap-2 text-xs font-semibold text-ink-faint transition-colors hover:text-gold-strong"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2 border border-line text-ink-soft transition-transform group-hover:-translate-x-0.5">
                <ArrowLeft className="h-3 w-3" />
              </span>
              <span>Bosh sahifaga qaytish</span>
            </Link>

            {/* Form card */}
            <motion.div
              className="card-lux p-5 sm:p-7"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 rotate-45 items-center justify-center border border-gold/60 bg-gold-tint shadow-[0_4px_12px_-4px_rgba(176,141,79,0.35)]">
                  <Crown className="h-4 w-4 -rotate-45 text-gold-strong" />
                </span>
                <div>
                  <h1 className="font-display text-xl sm:text-[22px] font-bold tracking-tight text-ink">
                    Xush kelibsiz
                  </h1>
                  <p className="mt-0.5 text-xs font-medium text-ink-soft">
                    Hisobingizga kiring
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="my-3.5 flex items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/40 to-gold/60" />
                <span className="h-1 w-1 rotate-45 bg-gold/70" />
                <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/40 to-gold/60" />
              </div>

              {/* Method Selector Tabs */}
              <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-surface-2 p-1.5 border border-line">
                <button
                  type="button"
                  onClick={() => { setAuthMethod('telegram'); setError(null); }}
                  className={`relative flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
                    authMethod === 'telegram'
                      ? 'bg-surface text-ink shadow-sm border border-line-strong'
                      : 'text-ink-soft hover:text-ink hover:bg-surface/50'
                  }`}
                >
                  <Send className="h-3.5 w-3.5 text-[#24A1DE]" />
                  <span>Telegram</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Tezkor
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMethod('password'); setError(null); }}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all ${
                    authMethod === 'password'
                      ? 'bg-surface text-ink shadow-sm border border-line-strong'
                      : 'text-ink-soft hover:text-ink hover:bg-surface/50'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5 text-gold" />
                  <span>Telefon & Parol</span>
                </button>
              </div>

              {authMethod === 'telegram' ? (
                <div className="mt-4">
                  <TelegramAuthWidget />
                </div>
              ) : (
                <>
                  {/* Error Notification */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="mt-3.5 flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-xs font-semibold text-danger"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form */}
                  <form className="mt-4 space-y-3.5" onSubmit={handleSubmit}>
                    {/* Phone */}
                    <div>
                      <label htmlFor="phone-number" className="field-label mb-1">
                        Telefon raqam
                      </label>
                      <div className="relative flex items-center">
                        <Phone className="pointer-events-none absolute left-3.5 h-4 w-4 text-gold" />
                        <input
                          id="phone-number"
                          name="phoneNumber"
                          type="tel"
                          inputMode="numeric"
                          required
                          placeholder="+998 90 123 45 67"
                          value={phone.value}
                          onChange={phone.handleChange}
                          onKeyDown={phone.handleKeyDown}
                          onFocus={phone.handleFocus}
                          onClick={phone.handleClick}
                          aria-label="Telefon raqam"
                          className="input-lux has-icon-left h-10 !pl-11 !pr-4 !py-0 font-medium text-xs"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label htmlFor="password" className="field-label mb-1">
                        Parol
                      </label>
                      <div className="relative flex items-center">
                        <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-gold" />
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          aria-label="Parol"
                          className="input-lux has-icon-left has-icon-right h-10 !pl-11 !pr-11 !py-0 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
                          className="absolute right-3.5 flex h-7 w-7 items-center justify-center text-ink-faint transition-colors hover:text-gold-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-gold mt-1.5 w-full !py-2.5 !text-xs flex items-center justify-center gap-2 font-bold tracking-wide"
                    >
                      {loading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#251b0c] border-t-transparent" />
                      ) : (
                        <>
                          <LogIn className="h-4 w-4 shrink-0" />
                          <span>Kirish</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* Switch link */}
              <div className="mt-4 border-t border-line/60 pt-3.5 text-center text-xs font-medium text-ink-soft">
                Hisobingiz yo&apos;qmi?{' '}
                <Link
                  href="/register"
                  className="font-bold text-gold-strong transition-colors hover:text-gold hover:underline"
                >
                  Ro&apos;yxatdan o&apos;ting
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
