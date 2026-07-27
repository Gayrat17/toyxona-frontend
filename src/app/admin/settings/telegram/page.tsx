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
  AlertCircle 
} from 'lucide-react';

export default function TelegramBotSettingsPage() {
  const queryClient = useQueryClient();
  const [showToken, setShowToken] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [token, setToken] = useState('');
  const [name, setName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [webhook, setWebhook] = useState('');

  // Fetch bot config
  const { data: config, isLoading, error, refetch } = useQuery<TelegramBotConfig>({
    queryKey: ['telegramBotConfig'],
    queryFn: fetchBotConfigRequest,
  });

  // Update inputs when data is fetched
  useEffect(() => {
    if (config) {
      setToken(config.bot_token || '');
      setName(config.bot_name || '');
      setShortDesc(config.short_description || '');
      setDesc(config.description || '');
      setWebhook(config.webhook_url || '');
    }
  }, [config]);

  // Mutation to update and configure bot
  const updateMutation = useMutation({
    mutationFn: (updatedData: Partial<TelegramBotConfig>) => updateBotConfigRequest(updatedData),
    onSuccess: (data) => {
      queryClient.setQueryData(['telegramBotConfig'], data.config);
      setToast({ message: data.message, type: 'success' });
      // Clear toast after 5 seconds
      setTimeout(() => setToast(null), 5000);
    },
    onError: (err: any) => {
      const errMsg = err.response?.data?.message || err.message || "Botni sozlashda xatolik yuz berdi.";
      setToast({ message: errMsg, type: 'error' });
      // Clear toast after 7 seconds
      setTimeout(() => setToast(null), 7000);
    }
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
      webhook_url: webhook
    });
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Header bar */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Telegram Bot Sozlamalari</h2>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isLoading}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          title="Yangilash"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <div className="p-8 space-y-6 flex-1 max-w-4xl w-full mx-auto">
        {/* Toast Notification */}
        {toast && (
          <div className={`flex items-start gap-3 rounded-xl p-4 border text-sm shadow-md transition-all ${
            toast.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{toast.type === 'success' ? 'Muvaffaqiyatli' : 'Xatolik'}</p>
              <p className="mt-0.5">{toast.message}</p>
            </div>
          </div>
        )}

        {/* Load Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-600 border border-amber-500/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Sozlamalarni yuklashda muammo yuz berdi. Sinov rejimida mock ma&apos;lumotlar yuklandi.</span>
          </div>
        )}

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            
            {/* Status Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ulanish Holati</h3>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    config?.is_active 
                      ? 'bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/10' 
                      : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 dark:text-white">
                        {config?.bot_name || "Noma'lum bot"}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        config?.is_active 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {config?.is_active ? 'Faol' : 'Faol emas / Sozlanmagan'}
                      </span>
                    </div>
                    {config?.bot_username && (
                      <a 
                        href={`https://t.me/${config.bot_username}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-indigo-600 hover:underline dark:text-indigo-400 font-medium block mt-0.5"
                      >
                        @{config.bot_username}
                      </a>
                    )}
                  </div>
                </div>
                {config?.updated_at && (
                  <div className="text-xs text-slate-400 self-end sm:self-center">
                    Oxirgi yangilanish: {new Date(config.updated_at).toLocaleString('uz-UZ')}
                  </div>
                )}
              </div>
            </div>

            {/* Config Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
                <Globe className="h-5 w-5 text-indigo-500" />
                <h3 className="font-bold text-slate-800 dark:text-white">Bot Sozlamalari Formasi</h3>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                
                {/* Bot Token */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Bot Tokeni</span>
                    <span className="text-xs text-slate-400">Telegram @BotFather orqali olinadi</span>
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Masalan: 1234567890:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                      className="block w-full rounded-xl border border-slate-200 bg-transparent py-3 pl-4 pr-12 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:text-slate-100"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    >
                      {showToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Bot Name & Webhook URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Botning Ko&apos;rinadigan Nomi
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Restoran Admin Bot"
                      className="block w-full rounded-xl border border-slate-200 bg-transparent py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Webhook URL</span>
                      <button 
                        type="button"
                        onClick={handleAutoDetectWebhook}
                        className="text-xs text-indigo-600 hover:underline dark:text-indigo-400 flex items-center gap-1 font-medium"
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
                      className="block w-full rounded-xl border border-slate-200 bg-transparent py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Qisqa Tavsif (Short Description)
                  </label>
                  <input
                    type="text"
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    placeholder="Bot ochilganda ko'rinadigan qisqa matn (max 120 belgi)"
                    maxLength={120}
                    className="block w-full rounded-xl border border-slate-200 bg-transparent py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    To&apos;liq Ma&apos;lumot (Description)
                  </label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Botning 'About' bo'limida ko'rinadigan batafsil tavsif matni"
                    rows={4}
                    className="block w-full rounded-xl border border-slate-200 bg-transparent py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Submit button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Bot sozlanmoqda...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Saqlash va Botni ishga tushirish</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Info notice */}
            <div className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-800/40 flex items-start gap-3">
              <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Telegram Botni Sozlash Bo&apos;yicha Yo&apos;riqnoma:</p>
                <p>1. Telegramda <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400">@BotFather</a> orqali yangi bot yarating va olingan API Tokenni kiritib saqlang.</p>
                <p>2. Token saqlanganda backend Telegram API bilan bog&apos;lanib, bot ismini, tavsiflarini, menyu buyruqlarini va Webhook URL manzilingizni avtomatik ravishda konfiguratsiya qiladi.</p>
                <p>3. Webhook muvaffaqiyatli ulanishi uchun Webhook URL manzilingiz Telegram serverlari kirishi mumkin bo&apos;lgan ochiq HTTPS domen (yoki ngrok manzili) bo&apos;lishi shart.</p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
