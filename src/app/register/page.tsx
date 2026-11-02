'use client';

import React from 'react';
import { useAuth } from '@/store/auth-context';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Crown, ArrowLeft, ShieldCheck, Send } from 'lucide-react';
import { STAR_LATTICE_PATTERN } from '@/constants/decoration';
import { TelegramAuthWidget } from '@/components/auth/TelegramAuthWidget';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { loading, user } = useAuth();
  const router = useRouter();

  // If user is already authenticated, redirect to appropriate page
  React.useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ADMIN') {
        router.replace('/admin/dashboard');
      } else if (user.role === 'VENUE_OWNER') {
        router.replace('/dashboard/venues');
      } else {
        router.replace('/');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen overflow-hidden bg-paper">
      {/* ── Left visual panel (desktop only) ─────────────────────── */}
      <div className="texture-grain relative hidden w-[38%] shrink-0 overflow-hidden lg:flex lg:flex-col">
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

        <div className="relative z-[2] flex h-full flex-col justify-between p-8 xl:p-10">
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
            <p className="mt-4 font-display text-[1.95rem] xl:text-[2.15rem] font-medium leading-snug text-[#f6efdd]">
              Sizning baxtingiz —
              <br />
              <span className="gold-text italic">bizning burchimiz</span>
            </p>
            <p className="mt-2.5 max-w-xs text-xs leading-relaxed text-[#cbbc9c]">
              O&apos;zbekistonning eng yaxshi to&apos;yxona va restoranlarini bir zumda
              toping va xavfsiz bron qiling.
            </p>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#8d7f63]">
            Toshkent · Samarqand · Buxoro
          </p>
        </div>
      </div>

      {/* ── Right: Telegram auth panel ─────────────────────────────── */}
      <div className="pattern-weave flex flex-1 flex-col overflow-y-auto">
        <div className="flex min-h-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-[620px] lg:max-w-[640px]">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-faint transition-colors hover:text-gold-strong"
            >
              <ArrowLeft className="h-3 w-3" />
              Bosh sahifaga qaytish
            </Link>

            <motion.div
              className="card-lux p-5 sm:p-7"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 rotate-45 items-center justify-center border border-gold/50 bg-gold-tint">
                  <Crown className="h-4 w-4 rotate-[-45deg] text-gold-strong" />
                </span>
                <div>
                  <h2 className="font-display text-xl sm:text-[22px] font-bold leading-tight text-ink">
                    Ro&apos;yxatdan o&apos;tish
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-ink-soft">
                    Telegram orqali 100% xavfsiz va tasdiqlangan hisob
                  </p>
                </div>
              </div>

              {/* Badge info */}
              <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>Begona raqam kiritilmaydi, faqat o&apos;zingizning tasdiqlangan hisobingiz yaratiladi.</span>
              </div>

              {/* Telegram Auth Widget */}
              <div className="mt-4">
                <TelegramAuthWidget />
              </div>

              {/* Switch link */}
              <div className="mt-4 border-t border-dashed border-line pt-3.5 text-center text-xs font-semibold text-ink-soft">
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
