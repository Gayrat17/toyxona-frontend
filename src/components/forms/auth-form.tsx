'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Crown,
  Eye,
  EyeOff,
  Lock,
  Phone,
  Shield,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/store/auth-context';
import { isValidPhoneNumber, RegistrationCompleteError } from '@/services/auth';
import { safeRedirect } from '@/utils/navigation';
import { getErrorMessage } from '@/utils/errors';
import { ErrorAlert } from '@/components/common/error-alert';
import { ThemeToggle } from '@/components/common/theme-toggle';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const registering = mode === 'register';
  const { user, loading, login, register } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const next = params.get('next');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'CLIENT' | 'VENUE_OWNER'>(
    params.get('role') === 'VENUE_OWNER' ? 'VENUE_OWNER' : 'CLIENT',
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountCreated, setAccountCreated] = useState(false);

  useEffect(() => {
    if (!loading && user && !submitting)
      router.replace(safeRedirect(next, user.role));
  }, [user, loading, submitting, next, router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting || loading || accountCreated) return;
    setError(null);
    if (!isValidPhoneNumber(phone))
      return setError('Telefon raqamini +998 XX XXX XX XX shaklida kiriting.');
    if (registering && name.trim().length < 2)
      return setError('Ismingizni to‘liq kiriting (kamida 2 belgi).');
    if (registering && password.length < 8)
      return setError('Parol kamida 8 ta belgidan iborat bo‘lishi kerak.');
    if (registering && password !== confirmation)
      return setError('Parollar bir xil emas. Qayta tekshiring.');
    setSubmitting(true);
    try {
      const profile = registering
        ? await register(phone, name, password, role)
        : await login(phone, password);
      router.replace(safeRedirect(next, profile.role));
    } catch (err) {
      if (err instanceof RegistrationCompleteError) {
        setAccountCreated(true);
        return;
      }
      setError(
        getErrorMessage(
          err,
          registering
            ? 'Ro‘yxatdan o‘tib bo‘lmadi. Qayta urinib ko‘ring.'
            : 'Hisobga kirib bo‘lmadi.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }
  const otherHref = `/${registering ? 'login' : 'register'}${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  return (
    <main className="flex min-h-dvh bg-paper">
      <div className="texture-grain relative hidden w-[46%] shrink-0 overflow-hidden lg:block">
        <Image
          src="/images/auth-side.jpg"
          alt=""
          fill
          sizes="46vw"
          loading="eager"
          fetchPriority="high"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-espresso/70 via-espresso/40 to-espresso/90" />
        <div className="pattern-star absolute inset-0 opacity-[.08]" />
        <div className="relative z-[2] flex min-h-dvh flex-col justify-between gap-14 p-12">
          <Link
            href="/"
            className="flex w-fit items-center gap-3 text-[#f2e9d6]"
          >
            <Crown className="h-8 w-8 text-gold" />
            <span className="font-display text-2xl font-bold tracking-wider">
              TOYXONA
            </span>
          </Link>
          <div>
            <span className="block h-px w-16 bg-gold" />
            <p className="mt-6 font-display text-4xl leading-snug text-[#f6efdd]">
              {registering ? 'Sizning bayramingiz —' : 'Hashamat — bu'}
              <br />
              <span className="gold-text italic">
                {registering ? 'bizning ilhomimiz' : 'an’anadir'}
              </span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#d4c6a9]">
              {registering
                ? 'Profil yarating: bayram uchun joy tanlang yoki o‘z zalingizni katalogga qo‘shing.'
                : 'Eng muhim kuningiz uchun munosib joyni toping. Yana bir bor xush kelibsiz!'}
            </p>
          </div>
          <p className="text-xs font-bold tracking-[.2em] text-[#c4b496]">
            Toshkent · Samarqand · Buxoro
          </p>
        </div>
      </div>
      <div className="pattern-weave flex min-w-0 flex-1 items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-soft hover:text-gold-strong"
            >
              <ArrowLeft className="h-4 w-4" />
              Bosh sahifaga qaytish
            </Link>
            <ThemeToggle />
          </div>
          <div className="card-lux p-5 sm:p-8">
            <div className="text-center">
              <Crown className="mx-auto h-8 w-8 text-gold-strong" />
              <h1 className="mt-5 font-display text-3xl font-bold">
                {registering ? 'A’zo bo‘lish' : 'Xush kelibsiz'}
              </h1>
              <p className="mt-2 text-sm text-ink-soft">
                {registering
                  ? 'Yangi imkoniyatlar uchun profil yarating'
                  : 'Davom etish uchun hisobingizga kiring'}
              </p>
            </div>
            <form onSubmit={submit} className="mt-7 space-y-5">
              {error && <ErrorAlert message={error} />}
              {accountCreated && (
                <p
                  role="status"
                  className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm leading-relaxed text-success"
                >
                  Hisob yaratildi, ammo avtomatik kirish yakunlanmadi. Telefon
                  raqamingiz va parolingiz bilan tizimga kiring.
                </p>
              )}
              {registering && (
                <div>
                  <label htmlFor="first-name" className="field-label">
                    Ismingiz
                  </label>
                  <div className="relative mt-2">
                    <UserRound className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
                    <input
                      id="first-name"
                      name="given-name"
                      autoComplete="given-name"
                      required
                      maxLength={150}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ali"
                      className="input-lux input-with-icon"
                    />
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="phone-number" className="field-label">
                  Telefon raqam
                </label>
                <div className="relative mt-2">
                  <Phone className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
                  <input
                    id="phone-number"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    maxLength={24}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                    className="input-lux input-with-icon"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="field-label">
                  Parol
                </label>
                <div className="relative mt-2">
                  <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-gold" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={
                      registering ? 'new-password' : 'current-password'
                    }
                    required
                    minLength={registering ? 8 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-lux input-with-icon input-with-action"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-0.5 flex h-10 w-10 items-center justify-center rounded-full text-ink-soft"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {registering && (
                  <p className="mt-2 text-xs text-ink-soft">
                    Kamida 8 belgi. Harf va raqamlardan foydalaning.
                  </p>
                )}
              </div>
              {registering && (
                <>
                  <div>
                    <label
                      htmlFor="password-confirmation"
                      className="field-label"
                    >
                      Parolni tasdiqlang
                    </label>
                    <input
                      id="password-confirmation"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={confirmation}
                      onChange={(e) => setConfirmation(e.target.value)}
                      className="input-lux mt-2"
                    />
                  </div>
                  <fieldset>
                    <legend className="field-label">Rolingizni tanlang</legend>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {(
                        [
                          { value: 'CLIENT', label: 'Mijoz', icon: UserRound },
                          {
                            value: 'VENUE_OWNER',
                            label: 'Joy egasi',
                            icon: Shield,
                          },
                        ] as const
                      ).map(({ value, label, icon: Icon }) => (
                        <label
                          key={value}
                          className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 ${role === value ? 'border-gold bg-gold-tint' : 'border-line bg-surface'}`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={value}
                            checked={role === value}
                            onChange={() => setRole(value)}
                            className="sr-only"
                          />
                          <Icon className="h-5 w-5 text-gold-strong" />
                          <span className="text-xs font-bold">{label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </>
              )}
              <button
                type="submit"
                disabled={loading || submitting || accountCreated}
                className="btn-gold w-full !py-3.5"
              >
                {accountCreated
                  ? 'Hisob yaratildi'
                  : submitting
                    ? 'Kutilmoqda…'
                    : registering
                      ? 'Ro‘yxatdan o‘tish'
                      : 'Kirish'}
              </button>
            </form>
            <p className="mt-7 border-t border-dashed border-line pt-5 text-center text-sm text-ink-soft">
              {registering ? 'Hisobingiz bormi?' : 'Hisobingiz yo‘qmi?'}{' '}
              <Link
                href={otherHref}
                className="font-bold text-gold-strong hover:underline"
              >
                {registering ? 'Tizimga kiring' : 'Ro‘yxatdan o‘ting'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
