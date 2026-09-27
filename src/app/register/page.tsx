'use client';

import React, { useState } from 'react';
import { useAuth } from '@/store/auth-context';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Lock, Eye, EyeOff, User as UserIcon, Shield,
  AlertCircle, Crown, ArrowLeft, UserPlus,
} from 'lucide-react';

const STAR_LATTICE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'%3E%3Cg fill='none' stroke='%23cda964' stroke-width='1'%3E%3Crect x='26' y='26' width='32' height='32'/%3E%3Crect x='26' y='26' width='32' height='32' transform='rotate(45 42 42)'/%3E%3Ccircle cx='42' cy='42' r='4.5'/%3E%3C/g%3E%3C/svg%3E\")";

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        const msg = Array.isArray(err.response.data.phone_number)
          ? err.response.data.phone_number[0]
          : err.response.data.phone_number;
        setError(
          msg.includes('exists') || msg.includes('already') || msg.includes('mavjud')
            ? "Ushbu telefon raqami allaqachon ro'yxatdan o'tgan."
            : msg
        );
      } else if (err.response?.data?.password) {
        setError(
          Array.isArray(err.response.data.password)
            ? err.response.data.password[0]
            : err.response.data.password
        );
      } else if (err.response?.data?.re_password) {
        setError(
          Array.isArray(err.response.data.re_password)
            ? err.response.data.re_password[0]
            : err.response.data.re_password
        );
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
    <div className="flex h-screen overflow-hidden bg-paper">
      {/* ── Left visual panel (desktop only) ─────────────────────── */}
      <div className="texture-grain relative hidden w-[44%] shrink-0 overflow-hidden lg:flex lg:flex-col">
        <img
          src="/images/auth-side.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-espresso/75 via-espresso/45 to-espresso/92" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: STAR_LATTICE }}
        />

        <div className="relative z-[2] flex h-full flex-col justify-between p-10">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3">
            <span className="relative flex h-9 w-9 rotate-45 items-center justify-center border border-gold/60 bg-gradient-to-br from-[#ecd49c] to-[#b08d4f] shadow-[0_8px_18px_-8px_rgba(150,110,50,0.7)]">
              <span className="flex h-[26px] w-[26px] rotate-[-45deg] items-center justify-center">
                <Crown className="h-3 w-3 text-[#221a0f]" />
              </span>
            </span>
            <span>
              <span className="block font-display text-[19px] font-bold tracking-[0.08em] text-[#f2e9d6]">
                TOYXONA
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.42em] text-gold">
                Luxe Venue
              </span>
            </span>
          </Link>

          {/* Quote */}
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/80" />
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            </div>
            <p className="mt-5 font-display text-[2.15rem] font-medium leading-snug text-[#f6efdd]">
              Sizning zalingiz —
              <br />
              <span className="gold-text italic">minglar orzusi</span>
            </p>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-[#cbbc9c]">
              Ro&apos;yxatdan o&apos;ting, zalingizni katalogga qo&apos;shing
              va birinchi bronlaringizni qabul qila boshlang.
            </p>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8d7f63]">
            Toshkent · Samarqand · Buxoro
          </p>
        </div>
      </div>

      {/* ── Right: form panel ─────────────────────────────────────── */}
      <div className="pattern-weave flex flex-1 flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8">
          <div className="w-full max-w-[420px]">
            {/* Back link */}
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-faint transition-colors hover:text-gold-strong"
            >
              <ArrowLeft className="h-3 w-3" />
              Bosh sahifaga qaytish
            </Link>

            {/* Form card */}
            <motion.div
              className="card-lux p-6 sm:p-7"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header — inline icon + title */}
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 rotate-45 items-center justify-center border border-gold/50 bg-gold-tint">
                  <Crown className="h-4 w-4 rotate-[-45deg] text-gold-strong" />
                </span>
                <div>
                  <h2 className="font-display text-[22px] font-bold leading-tight text-ink">
                    A&apos;zo bo&apos;lish
                  </h2>
                  <p className="mt-0.5 text-[12px] font-medium text-ink-soft">
                    Katta imkoniyatlar uchun profil yarating
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="mt-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/50" />
                <span className="h-1 w-1 rotate-45 bg-gold/60" />
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/50" />
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="mt-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 px-3 py-2.5 text-[12px] font-semibold text-danger"
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

              {/* ── Form ─────────────────────────────────────────── */}
              <form className="mt-5" onSubmit={handleSubmit}>
                {/* First Name */}
                <div>
                  <label htmlFor="first-name" className="field-label">
                    Ismingiz
                  </label>
                  <div className="relative mt-1.5 flex items-center">
                    <UserIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-gold" />
                    <input
                      id="first-name"
                      name="firstName"
                      type="text"
                      required
                      placeholder="Ali"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      aria-label="Ismingiz"
                      className="input-lux has-icon-left h-11 !pl-11 !pr-4 !py-0"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="mt-3">
                  <label htmlFor="phone-number" className="field-label">
                    Telefon raqam
                  </label>
                  <div className="relative mt-1.5 flex items-center">
                    <Phone className="pointer-events-none absolute left-3.5 h-4 w-4 text-gold" />
                    <input
                      id="phone-number"
                      name="phoneNumber"
                      type="text"
                      required
                      placeholder="+998 90 123 45 67"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      aria-label="Telefon raqam"
                      className="input-lux has-icon-left h-11 !pl-11 !pr-4 !py-0"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mt-3">
                  <label htmlFor="password" className="field-label">
                    Parol
                  </label>
                  <div className="relative mt-1.5 flex items-center">
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
                      className="input-lux has-icon-left has-icon-right h-11 !pl-11 !pr-11 !py-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Parolni yashirish" : "Parolni ko\u2018rsatish"}
                      className="absolute right-3.5 flex h-7 w-7 items-center justify-center text-ink-faint transition-colors hover:text-gold-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 rounded"
                    >
                      {showPassword
                        ? <EyeOff className="h-4 w-4" />
                        : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Role selector — compact horizontal toggle */}
                <div className="mt-3">
                  <span className="field-label">Rolingizni tanlang</span>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {/* CLIENT */}
                    <button
                      type="button"
                      onClick={() => setRole('CLIENT')}
                      aria-pressed={role === 'CLIENT'}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[12px] font-bold transition-all ${
                        role === 'CLIENT'
                          ? 'border-gold bg-gold-tint text-gold-strong shadow-[0_8px_18px_-10px_rgba(150,110,50,0.55)]'
                          : 'border-line bg-surface text-ink-soft hover:border-gold/40 hover:text-ink'
                      }`}
                    >
                      <UserIcon className={`h-4 w-4 shrink-0 ${role === 'CLIENT' ? 'text-gold-strong' : 'text-ink-faint'}`} />
                      <span>Mijoz</span>
                    </button>

                    {/* VENUE_OWNER */}
                    <button
                      type="button"
                      onClick={() => setRole('VENUE_OWNER')}
                      aria-pressed={role === 'VENUE_OWNER'}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[12px] font-bold transition-all ${
                        role === 'VENUE_OWNER'
                          ? 'border-gold bg-gold-tint text-gold-strong shadow-[0_8px_18px_-10px_rgba(150,110,50,0.55)]'
                          : 'border-line bg-surface text-ink-soft hover:border-gold/40 hover:text-ink'
                      }`}
                    >
                      <Shield className={`h-4 w-4 shrink-0 ${role === 'VENUE_OWNER' ? 'text-gold-strong' : 'text-ink-faint'}`} />
                      <span>Joy egasi</span>
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold mt-5 w-full !py-3 !text-[13px] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#251b0c] border-t-transparent" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 shrink-0" />
                      <span>Ro&apos;yxatdan o&apos;tish</span>
                    </>
                  )}
                </button>
              </form>

              {/* Switch to login */}
              <div className="mt-4 border-t border-dashed border-line pt-4 text-center text-[12px] font-semibold text-ink-soft">
                Hisobingiz bormi?{' '}
                <Link
                  href="/login"
                  className="font-extrabold text-gold-strong transition-colors hover:text-gold"
                >
                  Tizimga kiring
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
