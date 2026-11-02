'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import {
  initTelegramAuthRequest,
  checkTelegramAuthStatusRequest,
  TelegramAuthInitResponse,
} from '@/services/auth';
import { useAuth } from '@/store/auth-context';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';

interface TelegramAuthWidgetProps {
  onSuccess?: () => void;
  defaultRole?: UserRole;
}

export const TelegramAuthWidget: React.FC<TelegramAuthWidgetProps> = ({
  onSuccess,
  defaultRole = 'CLIENT',
}) => {
  const { setAuthenticatedSession, updateUserRole } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [initData, setInitData] = useState<TelegramAuthInitResponse | null>(null);
  const [status, setStatus] = useState<
    'PENDING' | 'AUTHENTICATED' | 'COMPLETED' | 'EXPIRED' | 'ERROR'
  >('PENDING');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600);

  // New user onboarding state
  const [isNewUser, setIsNewUser] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRole);
  const [customName, setCustomName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize Telegram Auth Session
  const startSession = async () => {
    setLoading(true);
    setStatus('PENDING');
    setErrorMsg(null);
    setIsNewUser(false);

    try {
      const data = await initTelegramAuthRequest();
      setInitData(data);
      setTimeLeft(data.expires_in_seconds || 600);
      setLoading(false);
    } catch (err: unknown) {
      setLoading(false);
      setStatus('ERROR');
      setErrorMsg("Telegram bilan bog'lanishda xatolik yuz berdi. Iltimos qaytadan urining.");
    }
  };

  useEffect(() => {
    startSession();

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // 2. Countdown timer
  useEffect(() => {
    if (status !== 'PENDING' || loading || !initData) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setStatus('EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, loading, initData]);

  // 3. Polling check status
  useEffect(() => {
    if (status !== 'PENDING' || loading || !initData?.session_id) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await checkTelegramAuthStatusRequest(initData.session_id);

        if (res.status === 'AUTHENTICATED' && res.access && res.refresh && res.user) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

          // Authenticate user in frontend state
          setAuthenticatedSession(res.access, res.refresh, res.user);
          setCustomName(res.user.first_name || '');

          if (res.is_new_user) {
            setIsNewUser(true);
            setStatus('AUTHENTICATED');
          } else {
            setStatus('COMPLETED');
            if (onSuccess) {
              onSuccess();
            } else {
              if (res.user.role === 'ADMIN') {
                router.replace('/admin/dashboard');
              } else if (res.user.role === 'VENUE_OWNER') {
                router.replace('/dashboard');
              } else {
                router.replace('/');
              }
            }
          }
        } else if (res.status === 'EXPIRED') {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          setStatus('EXPIRED');
        }
      } catch (err) {
        // Continue polling silently unless hard error
      }
    }, 2000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [status, loading, initData, setAuthenticatedSession, onSuccess, router]);

  // Complete profile for new user
  const handleCompleteProfile = async () => {
    setSavingProfile(true);
    try {
      const updatedUser = await updateUserRole(selectedRole, customName.trim());
      setStatus('COMPLETED');
      if (onSuccess) {
        onSuccess();
      } else {
        if (updatedUser.role === 'ADMIN') {
          router.replace('/admin/dashboard');
        } else if (updatedUser.role === 'VENUE_OWNER') {
          router.replace('/dashboard');
        } else {
          router.replace('/');
        }
      }
    } catch (err) {
      // Fallback redirect
      if (selectedRole === 'VENUE_OWNER') {
        router.replace('/dashboard');
      } else {
        router.replace('/');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {/* Loading state */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="relative mb-4">
              <div className="h-12 w-12 rounded-full border-2 border-[#24A1DE]/25 border-t-[#24A1DE] animate-spin" />
              <Send className="absolute inset-0 m-auto h-5 w-5 text-[#24A1DE]" />
            </div>
            <p className="text-xs font-semibold text-ink-soft">
              Telegram sessiyasi tayyorlanmoqda...
            </p>
          </motion.div>
        )}

        {/* Error or Expired State */}
        {(status === 'ERROR' || status === 'EXPIRED') && (
          <motion.div
            key="expired"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 border border-danger/20 text-danger">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h4 className="mb-1 text-base font-bold text-ink">
              {status === 'EXPIRED'
                ? "Sessiya muddati tugadi"
                : "Xatolik yuz berdi"}
            </h4>
            <p className="mb-5 max-w-xs text-xs leading-relaxed text-ink-soft">
              {errorMsg ||
                "Xavfsizlik yuzasidan ushbu kirish sessiyasi muddati yakunlandi. Yangi QR-kod olish uchun tugmani bosing."}
            </p>
            <button
              onClick={startSession}
              className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Qaytadan boshlash</span>
            </button>
          </motion.div>
        )}

        {/* Pending: QR and Bot Link */}
        {status === 'PENDING' && !loading && initData && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center"
          >
            {/* QR Code Container */}
            <div className="relative mb-5 flex flex-col items-center rounded-2xl border border-line-strong bg-white p-5 shadow-sm dark:border-gold/25 dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
              <div className="relative rounded-xl bg-white p-1">
                <QRCodeSVG
                  value={initData.bot_url}
                  size={196}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: 'https://telegram.org/img/t_logo.png',
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>

              {/* Countdown badge (Warm ivory with dark text for reliable contrast inside white box) */}
              <div className="mt-3.5 flex items-center gap-1.5 rounded-full bg-[#f5ede2] border border-[#e2d5be] px-3.5 py-1 text-[11px] font-semibold text-[#5c4f39]">
                <Clock className="h-3.5 w-3.5 text-[#b08d4f]" />
                <span>Muddati:</span>
                <span className="font-mono font-bold text-[#241c10]">{formattedTime}</span>
              </div>
              <p className="mt-1.5 text-[10px] font-medium text-[#8d7f63]">
                Kamerani QR-kodga qarating
              </p>
            </div>

            {/* Direct Open Button for Mobile / Desktop Telegram */}
            <a
              href={initData.bot_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group mb-4 flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#24A1DE] to-[#1c8bc5] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(36,161,222,0.45)] transition hover:from-[#1f93cb] hover:to-[#177db0] hover:shadow-[0_12px_24px_-6px_rgba(36,161,222,0.6)] active:scale-[0.99]"
            >
              <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              <span>Telegram orqali tasdiqlash</span>
              <ArrowRight className="h-4 w-4 opacity-75 transition-transform group-hover:translate-x-1 group-hover:opacity-100" />
            </a>

            {/* Live Indicator Chip */}
            <div className="mb-5 flex items-center justify-center gap-2 rounded-full border border-line bg-surface-2/80 px-4 py-1.5 text-xs font-semibold text-ink-soft">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#24A1DE] opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#24A1DE]" />
              </span>
              <span>Botda tasdiqlash kutilmoqda...</span>
            </div>

            {/* Step-by-step Guide */}
            <div className="w-full rounded-2xl border border-line bg-surface-2/60 p-4 text-left">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold text-ink">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/15 text-gold-strong">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <span>Qanday amalga oshiriladi?</span>
              </div>
              <ol className="space-y-2.5 text-xs text-ink-soft">
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface border border-line text-[10px] font-bold text-gold-strong">
                    1
                  </span>
                  <span className="pt-0.5 leading-relaxed">
                    Yuqoridagi <strong className="font-bold text-ink">QR-kodni skanerlang</strong> yoki ko&apos;k tugmani bosing.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface border border-line text-[10px] font-bold text-gold-strong">
                    2
                  </span>
                  <span className="pt-0.5 leading-relaxed">
                    Bot ochilgach, <strong className="font-bold text-ink">Start</strong> tugmasini bosing.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface border border-line text-[10px] font-bold text-gold-strong">
                    3
                  </span>
                  <span className="pt-0.5 leading-relaxed">
                    <strong className="font-bold text-ink">📱 Telefon raqamni yuborish</strong> tugmasi orqali hisobingizni tasdiqlang.
                  </span>
                </li>
              </ol>
            </div>
          </motion.div>
        )}

        {/* Authenticated - New User Role Selection */}
        {status === 'AUTHENTICATED' && isNewUser && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col text-left"
          >
            <div className="mb-4 flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink">Telefon raqam tasdiqlandi!</h4>
                <p className="text-[11px] font-medium text-ink-soft">
                  Hisobingizni yakunlash uchun ma&apos;lumotlarni kiriting
                </p>
              </div>
            </div>

            {/* Name Input */}
            <div className="mb-4">
              <label htmlFor="user-custom-name" className="field-label mb-1.5">
                Ismingiz
              </label>
              <input
                id="user-custom-name"
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ismingizni kiriting"
                className="input-lux h-11"
              />
            </div>

            {/* Role Selection */}
            <div className="mb-5">
              <label className="field-label mb-2">
                Sizning maqsadingiz (Rolingiz)
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedRole('CLIENT')}
                  className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                    selectedRole === 'CLIENT'
                      ? 'border-gold bg-gold/10 text-ink shadow-sm ring-1 ring-gold'
                      : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink'
                  }`}
                >
                  <UserCheck
                    className={`mb-2 h-4 w-4 ${
                      selectedRole === 'CLIENT' ? 'text-gold' : 'text-ink-faint'
                    }`}
                  />
                  <span className="text-xs font-bold text-ink">Mijoz</span>
                  <span className="mt-0.5 text-[10px] leading-snug text-ink-soft">
                    To&apos;yxona va joylarni bron qilish
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('VENUE_OWNER')}
                  className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                    selectedRole === 'VENUE_OWNER'
                      ? 'border-gold bg-gold/10 text-ink shadow-sm ring-1 ring-gold'
                      : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink'
                  }`}
                >
                  <Building2
                    className={`mb-2 h-4 w-4 ${
                      selectedRole === 'VENUE_OWNER' ? 'text-gold' : 'text-ink-faint'
                    }`}
                  />
                  <span className="text-xs font-bold text-ink">Muassasa egasi</span>
                  <span className="mt-0.5 text-[10px] leading-snug text-ink-soft">
                    To&apos;yxona yoki barni boshqarish
                  </span>
                </button>
              </div>
            </div>

            <button
              onClick={handleCompleteProfile}
              disabled={savingProfile}
              className="btn-gold flex w-full items-center justify-center gap-2 py-3 text-xs font-bold disabled:opacity-50"
            >
              {savingProfile ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Tizimga kirish</span>
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Completed - Success Animation */}
        {status === 'COMPLETED' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="mb-1 text-base font-bold text-ink">
              Xush kelibsiz!
            </h4>
            <p className="text-xs text-ink-soft">
              Muvaffaqiyatli kirdingiz. Sahifaga yo&apos;naltirilmoqda...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
