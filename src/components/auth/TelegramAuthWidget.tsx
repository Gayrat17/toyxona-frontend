'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from 'lucide-react';
import {
  initTelegramAuthRequest,
  checkTelegramAuthStatusRequest,
  TelegramAuthInitResponse,
} from '@/services/auth';
import { useAuth } from '@/store/auth-context';
import { useRouter } from 'next/navigation';

interface TelegramAuthWidgetProps {
  onSuccess?: () => void;
}

export const TelegramAuthWidget: React.FC<TelegramAuthWidgetProps> = ({
  onSuccess,
}) => {
  const { setAuthenticatedSession } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [initData, setInitData] = useState<TelegramAuthInitResponse | null>(null);
  const [status, setStatus] = useState<
    'PENDING' | 'AUTHENTICATED' | 'COMPLETED' | 'ERROR'
  >('PENDING');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(180);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // 1. Initialize Telegram Auth Session (auto-refreshes seamlessly)
  const startSession = useCallback(async (isAutoRefresh = false) => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    if (!isAutoRefresh) {
      setLoading(true);
    }
    setErrorMsg(null);

    try {
      const data = await initTelegramAuthRequest();
      setInitData(data);
      setTimeLeft(data.expires_in_seconds || 180);
      setStatus('PENDING');
    } catch (err: unknown) {
      if (!isAutoRefresh) {
        setStatus('ERROR');
        setErrorMsg("Telegram bilan bog'lanishda xatolik yuz berdi. Iltimos qaytadan urining.");
      }
    } finally {
      setLoading(false);
      isRefreshingRef.current = false;
    }
  }, []);

  useEffect(() => {
    startSession(false);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [startSession]);

  // 2. Countdown timer with seamless auto-renewal (3 daqiqa)
  useEffect(() => {
    if (status !== 'PENDING' || loading || !initData?.session_id) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Muddati tugaganda to'xtovsiz avtomatik yangi sessiya olinadi
          startSession(true);
          return 180;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, loading, initData?.session_id, startSession]);

  // 3. Polling check status
  useEffect(() => {
    if (status !== 'PENDING' || loading || !initData?.session_id) return;
    const currentSessionId = initData.session_id;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await checkTelegramAuthStatusRequest(currentSessionId);

        if (res.status === 'AUTHENTICATED' && res.access && res.refresh && res.user) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

          // Authenticate user in frontend state
          setAuthenticatedSession(res.access, res.refresh, res.user);
          setStatus('COMPLETED');

          const params = new URLSearchParams(window.location.search);
          const redirectPath = params.get('redirect');

          setTimeout(() => {
            if (onSuccess) {
              onSuccess();
            } else if (redirectPath) {
              router.replace(redirectPath);
            } else {
              if (res.user?.role === 'ADMIN') {
                router.replace('/admin/dashboard');
              } else if (res.user?.role === 'VENUE_OWNER') {
                router.replace('/dashboard/venues');
              } else {
                router.replace('/');
              }
            }
          }, 800);
        } else if (res.status === 'EXPIRED') {
          // Server tomondan expired bo'lsa yangitdan boshlanadi
          startSession(true);
        }
      } catch (err) {
        // Continue polling silently unless hard error
      }
    }, 2000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [status, loading, initData?.session_id, setAuthenticatedSession, onSuccess, router, startSession]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedTime = `${formattedMinutes}:${formattedSeconds}`;

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

        {/* Error State only */}
        {status === 'ERROR' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-8 text-center"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 border border-danger/20 text-danger">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h4 className="mb-1 text-base font-bold text-ink">
              Xatolik yuz berdi
            </h4>
            <p className="mb-5 max-w-xs text-xs leading-relaxed text-ink-soft">
              {errorMsg ||
                "Bog'lanishda xatolik yuz berdi. Iltimos, internetingizni tekshirib qaytadan urining."}
            </p>
            <button
              onClick={() => startSession(false)}
              className="btn-gold inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Qaytadan urinish</span>
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
            className="w-full"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 items-stretch w-full">
              {/* Left Column: QR Code Container */}
              <div className="relative flex flex-col items-center justify-center rounded-2xl border border-line-strong bg-white p-3.5 sm:p-4 shadow-sm dark:border-gold/25 dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
                <div className="relative rounded-xl bg-white p-1">
                  <QRCodeSVG
                    value={initData.bot_url}
                    size={156}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: 'https://telegram.org/img/t_logo.png',
                      x: undefined,
                      y: undefined,
                      height: 34,
                      width: 34,
                      excavate: true,
                    }}
                  />
                </div>

                {/* Countdown badge */}
                <div className="mt-2.5 flex items-center gap-1.5 rounded-full bg-[#f5ede2] border border-[#e2d5be] px-3 py-1 text-[11px] font-semibold text-[#5c4f39]">
                  <Clock className="h-3 w-3 text-[#b08d4f]" />
                  <span>Muddati:</span>
                  <span className="font-mono font-bold text-[#241c10]">{formattedTime}</span>
                  <span className="text-[10px] text-[#8d7f63]">daqiqa</span>
                  <button
                    type="button"
                    onClick={() => startSession(false)}
                    title="QR-kodni yangilash"
                    className="ml-1 rounded p-0.5 text-[#b08d4f] hover:text-[#5c4f39] transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
                <p className="mt-1 text-[10px] font-medium text-[#8d7f63]">
                  Kamerani QR-kodga qarating
                </p>
              </div>

              {/* Right Column: Live indicator, Guide, & Direct Open Button */}
              <div className="flex flex-col justify-between h-full space-y-2.5 sm:space-y-0">
                {/* Live Indicator Chip */}
                <div className="flex items-center justify-between rounded-xl border border-line bg-surface-2/80 px-3.5 py-2 text-xs font-semibold text-ink-soft">
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#24A1DE] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#24A1DE]" />
                    </span>
                    <span className="text-[11px]">Botda tasdiqlash kutilmoqda</span>
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Jonli
                  </span>
                </div>

                {/* Step-by-step Guide */}
                <div className="rounded-xl border border-line bg-surface-2/60 p-3 text-left">
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-ink">
                    <ShieldCheck className="h-3.5 w-3.5 text-gold-strong" />
                    <span>Tezkor yo&apos;riqnoma:</span>
                  </div>
                  <ol className="space-y-1.5 text-[11px] text-ink-soft">
                    <li className="flex items-start gap-2">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface border border-line text-[9px] font-bold text-gold-strong">
                        1
                      </span>
                      <span className="pt-0.5 leading-snug">
                        QR-kodni skanerlang yoki pastdagi tugmani bosing
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface border border-line text-[9px] font-bold text-gold-strong">
                        2
                      </span>
                      <span className="pt-0.5 leading-snug">
                        Botda <strong className="font-bold text-ink">Start</strong> tugmasini bosing
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface border border-line text-[9px] font-bold text-gold-strong">
                        3
                      </span>
                      <span className="pt-0.5 leading-snug">
                        <strong className="font-bold text-ink">📱 Telefon raqamni yuborish</strong> orqali kiring
                      </span>
                    </li>
                  </ol>
                </div>

                {/* Direct Open Button for Mobile / Desktop Telegram */}
                <a
                  href={initData.bot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#24A1DE] to-[#1c8bc5] px-4 py-2.5 text-xs font-bold text-white shadow-[0_6px_16px_-4px_rgba(36,161,222,0.45)] transition hover:from-[#1f93cb] hover:to-[#177db0] hover:shadow-[0_10px_20px_-4px_rgba(36,161,222,0.6)] active:scale-[0.99]"
                >
                  <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  <span>Telegram ilovasida ochish</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-75 transition-transform group-hover:translate-x-1 group-hover:opacity-100" />
                </a>
              </div>
            </div>
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
