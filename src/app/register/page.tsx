'use client';

import React, { useState } from 'react';
import { useAuth } from '@/store/auth-context';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone, Lock, Eye, EyeOff, User as UserIcon, Shield,
  AlertCircle, Crown, ArrowLeft, UserPlus,
} from 'lucide-react';
import { useUzbekPhoneInput } from '@/hooks/useUzbekPhoneInput';
import { STAR_LATTICE_PATTERN } from '@/constants/decoration';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const phone = useUzbekPhoneInput();
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'CLIENT' | 'VENUE_OWNER'>('CLIENT');
  const [error, setError] = useState<string | null>(null);

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!e.ctrlKey && !e.metaKey && !e.altKey && /^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value.replace(/[0-9]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim()) {
      setError("Ismingizni kiritish shart.");
      return;
    }
    if (!phone.isValid()) {
      setError("Telefon raqami to'liq kiritilishi shart (masalan: +998 90 123 45 67).");
      return;
    }
    if (!password) {
      setError("Parolni kiritish shart.");
      return;
    }
    if (password.length < 8) {
      setError("Parol kamida 8 ta belgidan iborat bo'lishi shart.");
      return;
    }
    if (/^\d+$/.test(password)) {
      setError("Parol faqat raqamlardan iborat bo'lishi mumkin emas. Kamida bitta harf bo'lishi kerak.");
      return;
    }

    try {
      await register(phone.toE164(), firstName.trim(), password, role);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: {
          data?: Record<string, string | string[]>;
        };
      };
      const data = axiosErr.response?.data;
      if (!data) {
        setError("Ro'yxatdan o'tishda xatolik yuz berdi. Iltimos qaytadan urining.");
        return;
      }

      if (data.phone_number) {
        const msg = Array.isArray(data.phone_number) ? data.phone_number[0] : data.phone_number;
        if (/already|exists|mavjud/i.test(msg)) {
          setError("Ushbu telefon raqami allaqachon ro'yxatdan o'tgan. Iltimos, tizimga kiring.");
        } else {
          setError(msg);
        }
      } else if (data.password) {
        const errors = Array.isArray(data.password) ? data.password : [data.password];
        const combined = errors.join(' ');
        if (/least 8|too short|kamida 8/i.test(combined)) {
          setError("Parol kamida 8 ta belgidan iborat bo'lishi kerak.");
        } else if (/numeric|faqat raqam/i.test(combined)) {
          setError("Parol faqat raqamlardan iborat bo'lishi mumkin emas. Harflardan ham foydalaning.");
        } else if (/common|keng tarqalgan/i.test(combined)) {
          setError("Bu parol juda oddiy va keng tarqalgan. Murakkabroq parol tanlang.");
        } else {
          setError(errors[0]);
        }
      } else if (data.re_password) {
        const msg = Array.isArray(data.re_password) ? data.re_password[0] : data.re_password;
        setError(msg);
      } else if (data.non_field_errors) {
        const msg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
        setError(msg);
      } else if (data.detail) {
        setError(data.detail as string);
      } else {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];
        setError(`${firstKey}: ${Array.isArray(val) ? val[0] : val}`);
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
          style={{ backgroundImage: STAR_LATTICE_PATTERN }}
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
              Platformamizda zalingizni ro&apos;yxatdan o&apos;tkazing va minglab juftliklarga
              o&apos;z joyingizni taklif eting.
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
          <div className="w-full max-w-[400px]">
            <Link
              href="/"
              className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-faint transition-colors hover:text-gold-strong"
            >
              <ArrowLeft className="h-3 w-3" />
              Bosh sahifaga qaytish
            </Link>

            <motion.div
              className="card-lux p-6 sm:p-7"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <div className="flex items-center gap-3.5">
                <span className="flex h-10 w-10 shrink-0 rotate-45 items-center justify-center border border-gold/50 bg-gold-tint">
                  <Crown className="h-4 w-4 rotate-[-45deg] text-gold-strong" />
                </span>
                <div>
                  <h2 className="font-display text-[22px] font-bold leading-tight text-ink">
                    Ro&apos;yxatdan o&apos;tish
                  </h2>
                  <p className="mt-0.5 text-[12px] font-medium text-ink-soft">
                    Yangi hisob yaratish
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="mt-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/50" />
                <span className="h-1 w-1 rotate-45 bg-gold/60" />
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/50" />
              </div>

              {/* Error */}
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

              {/* Form */}
              <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                {/* Name */}
                <div>
                  <label htmlFor="first-name" className="field-label">Ism</label>
                  <div className="relative mt-1.5 flex items-center">
                    <UserIcon className="pointer-events-none absolute left-3.5 h-4 w-4 text-gold" />
                    <input
                      id="first-name"
                      name="firstName"
                      type="text"
                      required
                      placeholder="Ismingiz"
                      value={firstName}
                      onChange={handleNameChange}
                      onKeyDown={handleNameKeyDown}
                      aria-label="Ism"
                      className="input-lux has-icon-left h-11 !pl-11 !pr-4 !py-0"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone-number" className="field-label">Telefon raqam</label>
                  <div className="relative mt-1.5 flex items-center">
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
                      className="input-lux has-icon-left h-11 !pl-11 !pr-4 !py-0 font-medium"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="field-label">Parol</label>
                  <div className="relative mt-1.5 flex items-center">
                    <Lock className="pointer-events-none absolute left-3.5 h-4 w-4 text-gold" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Kamida 8 ta belgi"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-label="Parol"
                      className="input-lux has-icon-left has-icon-right h-11 !pl-11 !pr-11 !py-0"
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

                {/* Role selector */}
                <div>
                  <p className="field-label mb-2">Rolni tanlang</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { value: 'CLIENT', label: 'Mijoz', icon: UserIcon },
                        { value: 'VENUE_OWNER', label: 'Joy egasi', icon: Shield },
                      ] as const
                    ).map(({ value: v, label, icon: Icon }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setRole(v)}
                        className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-[12px] font-bold transition-all ${
                          role === v
                            ? 'border-gold bg-gold-tint text-gold-strong'
                            : 'border-line bg-surface text-ink-soft hover:border-gold/50'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold mt-2 w-full !py-3 !text-[13px] flex items-center justify-center gap-2"
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

              {/* Switch link */}
              <div className="mt-5 border-t border-dashed border-line pt-4 text-center text-[12px] font-semibold text-ink-soft">
                Hisobingiz bormi?{' '}
                <Link
                  href="/login"
                  className="font-extrabold text-gold-strong transition-colors hover:text-gold"
                >
                  Kirish
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
