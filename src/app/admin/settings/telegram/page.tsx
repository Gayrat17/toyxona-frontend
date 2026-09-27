'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBotConfigRequest, updateBotConfigRequest, TelegramBotConfig } from '@/services/admin';
import {
  Bot,
  CheckCircle2,
  XCircle,
  Save,
  Link as LinkIcon,
  Info,
  Globe,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

export default function TelegramBotSettingsPage() {
  const queryClient = useQueryClient();
  const [showToken, setShowToken] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [webhook, setWebhook] = useState('');

  const { data: config, isLoading, error, refetch } = useQuery<TelegramBotConfig>({
    queryKey: ['telegramBotConfig'],
    queryFn: fetchBotConfigRequest,
  });

  useEffect(() => {
    if (config) {
      setToken(config.bot_token || '');
      setName(config.bot_name || '');
      setShortDesc(config.short_description || '');
      setDesc(config.description || '');
      setWebhook(config.webhook_url || '');
    }
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: (updatedData: Partial<TelegramBotConfig>) => updateBotConfigRequest(updatedData),
    onSuccess: (data) => {
      queryClient.setQueryData(['telegramBotConfig'], data.config);
      setToast({ message: data.message, type: 'success' });
      setTimeout(() => setToast(null), 5000);
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || err.message || 'Botni sozlashda xatolik yuz berdi.';
      setToast({ message: errMsg, type: 'error' });
      setTimeout(() => setToast(null), 7000);
    },
  });

  const handleAutoDetectWebhook = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      let backendOrigin = origin;
      if (origin.includes('localhost:3000')) {
        backendOrigin = 'http://127.0.0.1:8000';
      } else if (origin.includes('127.0.0.1:3000')) {
        backendOrigin = 'http://127.0.0.1:8000';
      }
      setWebhook(`${backendOrigin}/api/v1/bot/webhook/`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      bot_token: token,
      bot_name: name,
      short_description: shortDesc,
      description: desc,
      webhook_url: webhook,
    });
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Top header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-paper-soft/90 px-8 backdrop-blur-md">
        <h2 className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
          <Bot className="h-5 w-5 text-gold" />
          Telegram Bot Sozlamalari
        </h2>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-gold/60 hover:text-gold-strong"
          title="Yangilash"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-8">
        {/* Toast */}
        {toast && (
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 text-sm font-semibold shadow-md ${
              toast.type === 'success'
                ? 'border-success/30 bg-success/10 text-success'
                : 'border-danger/30 bg-danger/10 text-danger'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-black">{toast.type === 'success' ? 'Muvaffaqiyatli' : 'Xatolik'}</p>
              <p className="mt-0.5 font-medium">{toast.message}</p>
            </div>
          </div>
        )}

        {/* Load error */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm font-semibold text-danger">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Telegram Bot sozlamalarini yuklashda xatolik yuz berdi. Backend server holatini tekshiring.</span>
          </div>
        )}

        {isLoading ? (
          <div className="card-lux flex h-64 items-center justify-center">
            <span className="h-8 w-8 rotate-45 animate-spin rounded-sm border-2 border-gold border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* Status card */}
            <div className="card-lux p-6">
              <h3 className="field-label">Ulanish holati</h3>
              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-12 w-12 rotate-45 items-center justify-center border ${
                      config?.is_active
                        ? 'border-success/40 bg-success/10'
                        : 'border-danger/40 bg-danger/10'
                    }`}
                  >
                    <Bot
                      className={`h-5 w-5 rotate-[-45deg] ${config?.is_active ? 'text-success' : 'text-danger'}`}
                    />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg font-bold text-ink">
                        {config?.bot_name || "Noma'lum bot"}
                      </span>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          config?.is_active
                            ? 'border-success/40 bg-success/10 text-success'
                            : 'border-danger/40 bg-danger/10 text-danger'
                        }`}
                      >
                        {config?.is_active ? 'Faol' : 'Faol emas'}
                      </span>
                    </div>
                    {config?.bot_username && (
                      <a
                        href={`https://t.me/${config.bot_username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 block text-sm font-bold text-gold-strong hover:underline"
                      >
                        @{config.bot_username}
                      </a>
                    )}
                  </div>
                </div>
                {config?.updated_at && (
                  <div className="text-xs font-semibold text-ink-faint sm:self-center">
                    Oxirgi yangilanish: {new Date(config.updated_at).toLocaleString('uz-UZ')}
                  </div>
                )}
              </div>
            </div>

            {/* Config form */}
            <div className="card-lux p-6 sm:p-8">
              <div className="flex items-center gap-2.5 border-b border-dashed border-line pb-5">
                <Globe className="h-5 w-5 text-gold" />
                <h3 className="font-display text-lg font-bold text-ink">Bot sozlamalari</h3>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                {/* Token */}
                <div>
                  <label className="flex items-center justify-between">
                    <span className="field-label">Bot tokeni</span>
                    <span className="text-[11px] font-semibold text-ink-faint">
                      Telegram @BotFather orqali olinadi
                    </span>
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                      className="input-lux !py-3 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint transition-colors hover:text-gold-strong"
                    >
                      {showToken ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Name + Webhook */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="field-label">Botning ko&apos;rinadigan nomi</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Restoran Admin Bot"
                      className="input-lux mt-2 !py-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center justify-between">
                      <span className="field-label">Webhook URL</span>
                      <button
                        type="button"
                        onClick={handleAutoDetectWebhook}
                        className="flex items-center gap-1 text-[11px] font-extrabold text-gold-strong hover:underline"
                      >
                        <LinkIcon className="h-3 w-3" />
                        Avto-aniqlash
                      </button>
                    </label>
                    <input
                      type="url"
                      value={webhook}
                      onChange={(e) => setWebhook(e.target.value)}
                      placeholder="https://site.uz/api/v1/notifications/webhook/"
                      className="input-lux mt-2 !py-3"
                    />
                  </div>
                </div>

                {/* Short description */}
                <div>
                  <label className="field-label">Qisqa tavsif</label>
                  <input
                    type="text"
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    placeholder="Bot ochilganda ko'rinadigan qisqa matn (max 120 belgi)"
                    maxLength={120}
                    className="input-lux mt-2 !py-3"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="field-label">To&apos;liq ma&apos;lumot</label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Botning 'About' bo'limida ko'rinadigan batafsil tavsif matni"
                    rows={4}
                    className="input-lux mt-2 !py-3"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={updateMutation.isPending} className="btn-gold">
                    {updateMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Bot sozlanmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Saqlash va ishga tushirish</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Info notice */}
            <div className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gold-tint/60 p-5">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-gold-strong" />
              <div className="space-y-1.5 text-xs leading-relaxed text-ink-soft">
                <p className="text-[13px] font-extrabold text-ink">
                  Telegram botni sozlash bo&apos;yicha yo&apos;riqnoma:
                </p>
                <p>
                  1. Telegramda{' '}
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-gold-strong hover:underline"
                  >
                    @BotFather
                  </a>{' '}
                  orqali yangi bot yarating va olingan API tokenni kiritib saqlang.
                </p>
                <p>
                  2. Token saqlanganda backend Telegram API bilan bog&apos;lanib, bot ismini,
                  tavsiflarini, menyu buyruqlarini va Webhook URL manzilingizni avtomatik
                  konfiguratsiya qiladi.
                </p>
                <p>
                  3. Webhook muvaffaqiyatli ulanishi uchun URL Telegram serverlari kirishi mumkin
                  bo&apos;lgan ochiq HTTPS domen (yoki ngrok manzili) bo&apos;lishi shart.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
