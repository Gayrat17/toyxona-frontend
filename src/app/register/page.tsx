'use client';

import React, { useState } from 'react';
import { useAuth } from '@/store/auth-context';
import Link from 'next/link';
import { Phone, Lock, User as UserIcon, Shield, AlertCircle, Crown, ArrowLeft } from 'lucide-react';

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
          Array.isArray(err.response.data.password) ? err.response.data.password[0] : err.response.data.password
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
    <div className="flex min-h-screen bg-paper">
      {/* ============ Left: visual panel ============ */}
      <div className="texture-grain relative hidden w-[46%] overflow-hidden lg:block">
        <img src="/images/auth-side.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-espresso/70 via-espresso/40 to-espresso/90" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'%3E%3Cg fill='none' stroke='%23cda964' stroke-width='1'%3E%3Crect x='26' y='26' width='32' height='32'/%3E%3Crect x='26' y='26' width='32' height='32' transform='rotate(45 42 42)'/%3E%3Ccircle cx='42' cy='42' r='4.5'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative z-[2] flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 rotate-45 items-center justify-center border border-gold/60 bg-gradient-to-br from-[#ecd49c] to-[#b08d4f]">
              <span className="flex h-7 w-7 rotate-[-45deg] items-center justify-center">
                <Crown className="h-3.5 w-3.5 text-[#221a0f]" />
              </span>
            </span>
            <span>
              <span className="block font-display text-xl font-bold tracking-[0.08em] text-[#f2e9d6]">
                TOYXONA
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.42em] text-gold">Luxe Venue</span>
            </span>
          </Link>

          <div>
            <div className="flex items-center gap-3 text-gold">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/80" />
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
            </div>
            <p className="mt-6 font-display text-4xl font-medium leading-snug text-[#f6efdd]">
              Sizning zalingiz —
              <br />
              <span className="gold-text italic">minglar orzusi</span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#cbbc9c]">
              Ro&apos;yxatdan o&apos;ting, zalingizni katalogga qo&apos;shing va birinchi
              bronlaringizni qabul qila boshlang.
            </p>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8d7f63]">
            Toshkent · Samarqand · Buxoro
          </p>
        </div>
      </div>

      {/* ============ Right: form ============ */}
      <div className="pattern-weave flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-1.5 text-xs font-bold text-ink-faint transition-colors hover:text-gold-strong"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Bosh sahifaga qaytish
          </Link>

          <div className="card-lux p-8 sm:p-10">
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 rotate-45 items-center justify-center border border-gold/50 bg-gold-tint">
                <Crown className="h-5 w-5 rotate-[-45deg] text-gold-strong" />
              </span>
              <h2 className="mt-6 font-display text-3xl font-bold text-ink">A&apos;zo bo&apos;lish</h2>
              <p className="mt-2 text-[13px] font-medium text-ink-soft">
                Katta imkoniyatlar uchun profil yarating
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold/60" />
                <span className="h-1 w-1 rotate-45 bg-gold" />
                <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold/60" />
              </div>
            </div>

            {error && (
              <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger/5 p-3.5 text-[13px] font-semibold text-danger">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="first-name" className="field-label">
                  Ismingiz
                </label>
                <div className="relative mt-2">
                  <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
                  <input
                    id="first-name"
                    name="firstName"
                    type="text"
                    required
                    placeholder="Ali"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-lux !py-3 pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone-number" className="field-label">
                  Telefon raqam
                </label>
                <div className="relative mt-2">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
                  <input
                    id="phone-number"
                    name="phoneNumber"
                    type="text"
                    required
                    placeholder="+998 90 123 45 67"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="input-lux !py-3 pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="field-label">
                  Parol
                </label>
                <div className="relative mt-2">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-lux !py-3 pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="field-label">Rolingizni tanlang</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('CLIENT')}
                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-4 transition-all ${
                      role === 'CLIENT'
                        ? 'border-gold bg-gold-tint shadow-[0_10px_22px_-12px_rgba(150,110,50,0.6)]'
                        : 'border-line bg-surface hover:border-gold/50'
                    }`}
                  >
                    <UserIcon
                      className={`h-5 w-5 ${role === 'CLIENT' ? 'text-gold-strong' : 'text-ink-faint'}`}
                    />
                    <span
                      className={`text-xs font-extrabold ${
                        role === 'CLIENT' ? 'text-ink' : 'text-ink-soft'
                      }`}
                    >
                      Mijoz
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('VENUE_OWNER')}
                    className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-4 transition-all ${
                      role === 'VENUE_OWNER'
                        ? 'border-gold bg-gold-tint shadow-[0_10px_22px_-12px_rgba(150,110,50,0.6)]'
                        : 'border-line bg-surface hover:border-gold/50'
                    }`}
                  >
                    <Shield
                      className={`h-5 w-5 ${role === 'VENUE_OWNER' ? 'text-gold-strong' : 'text-ink-faint'}`}
                    />
                    <span
                      className={`text-xs font-extrabold ${
                        role === 'VENUE_OWNER' ? 'text-ink' : 'text-ink-soft'
                      }`}
                    >
                      Joy egasi
                    </span>
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-gold w-full !py-3.5">
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#251b0c] border-t-transparent" />
                ) : (
                  "Ro'yxatdan o'tish"
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-dashed border-line pt-6 text-center text-[13px] font-semibold text-ink-soft">
              Hisobingiz bormi?{' '}
              <Link href="/login" className="font-extrabold text-gold-strong transition-colors hover:text-gold">
                Tizimga kiring
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
