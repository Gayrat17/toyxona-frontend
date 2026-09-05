'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, Eye, EyeOff, RefreshCw, Save } from 'lucide-react';
import {
  fetchBotConfigRequest,
  updateBotConfigRequest,
  type TelegramBotConfig,
} from '@/services/admin';
import { ErrorAlert } from '@/components/common/error-alert';
import { LoadingState } from '@/components/common/loading-state';
import { getErrorMessage } from '@/utils/errors';

function ConfigForm({ config }: { config: TelegramBotConfig }) {
  const client = useQueryClient();
  // An existing token may be masked by the backend. Never re-submit that placeholder.
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [name, setName] = useState(config.bot_name || '');
  const [shortDescription, setShortDescription] = useState(
    config.short_description || '',
  );
  const [description, setDescription] = useState(config.description || '');
  const [webhook, setWebhook] = useState(config.webhook_url || '');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const mutation = useMutation({
    mutationFn: updateBotConfigRequest,
    onSuccess: (data) => {
      client.setQueryData(['telegramBotConfig'], data.config);
      setToken('');
      setShowToken(false);
      setName(data.config.bot_name || '');
      setShortDescription(data.config.short_description || '');
      setDescription(data.config.description || '');
      setWebhook(data.config.webhook_url || '');
      setNotice(data.message || 'Sozlamalar saqlandi.');
    },
  });
  return (
    <div className="space-y-6">
      <section className="card-lux p-5 sm:p-7">
        <h2 className="field-label">Ulanish holati</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Bot className="h-10 w-10 shrink-0 text-gold-strong" />
          <div className="min-w-0">
            <p className="break-words font-display text-xl font-bold">
              {config.bot_name || 'Bot sozlanmagan'}
            </p>
            {config.bot_username &&
              /^[A-Za-z0-9_]+$/.test(config.bot_username) && (
                <a
                  href={`https://t.me/${config.bot_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gold-strong hover:underline"
                >
                  @{config.bot_username}
                </a>
              )}
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${config.is_active ? 'border-success/40 text-success' : 'border-line text-ink-soft'}`}
          >
            {config.is_active ? 'Faol' : 'Faol emas'}
          </span>
        </div>
        {config.updated_at && (
          <p className="mt-4 text-xs text-ink-soft">
            Oxirgi yangilanish:{' '}
            {new Date(config.updated_at).toLocaleString('uz-UZ')}
          </p>
        )}
      </section>
      <form
        aria-label="Telegram bot sozlamalari"
        onSubmit={async (event) => {
          event.preventDefault();
          if (mutation.isPending) return;
          setError(null);
          setNotice('');
          const cleanToken = token.trim();
          if (cleanToken && !/^\d+:[A-Za-z0-9_-]{20,}$/.test(cleanToken))
            return setError(
              'Bot tokeni noto‘g‘ri. BotFather bergan to‘liq tokenni kiriting.',
            );
          if (!name.trim()) return setError('Bot nomini kiriting.');
          if (webhook) {
            try {
              const url = new URL(webhook);
              if (
                url.protocol !== 'https:' ||
                ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
              )
                throw new Error();
            } catch {
              return setError(
                'Webhook uchun Telegram kira oladigan ochiq HTTPS manzilini kiriting.',
              );
            }
          }
          try {
            await mutation.mutateAsync({
              ...(cleanToken ? { bot_token: cleanToken } : {}),
              bot_name: name.trim(),
              short_description: shortDescription.trim(),
              description: description.trim(),
              webhook_url: webhook.trim() || null,
            });
          } catch (err) {
            setError(
              getErrorMessage(err, 'Bot sozlamalarini saqlab bo‘lmadi.'),
            );
          }
        }}
        className="card-lux space-y-5 p-5 sm:p-7"
      >
        <h2 className="font-display text-xl font-bold">Bot sozlamalari</h2>
        {error && <ErrorAlert message={error} />}
        {notice && (
          <p
            role="status"
            className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success"
          >
            {notice}
          </p>
        )}
        <fieldset disabled={mutation.isPending} className="space-y-5">
          <div>
            <label htmlFor="bot-token" className="field-label">
              Yangi bot tokeni
            </label>
            <div className="relative mt-2">
              <input
                id="bot-token"
                type={showToken ? 'text' : 'password'}
                autoComplete="off"
                spellCheck={false}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required={!config.bot_username && !config.bot_token}
                placeholder="BotFather bergan token"
                className="input-lux input-with-action"
                aria-describedby="bot-token-hint"
              />
              <button
                type="button"
                aria-label={
                  showToken ? 'Tokenni yashirish' : 'Tokenni ko‘rsatish'
                }
                aria-pressed={showToken}
                onClick={() => setShowToken(!showToken)}
                className="absolute right-1 top-0.5 flex h-10 w-10 items-center justify-center rounded-full text-ink-soft"
              >
                {showToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p
              id="bot-token-hint"
              className="mt-2 text-xs leading-relaxed text-ink-soft"
            >
              Mavjud tokenni o‘zgartirmaslik uchun bu maydonni bo‘sh qoldiring.
            </p>
          </div>
          <div>
            <label htmlFor="bot-name" className="field-label">
              Botning ko‘rinadigan nomi
            </label>
            <input
              id="bot-name"
              required
              maxLength={64}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-lux mt-2"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="webhook-url" className="field-label">
                Webhook URL
              </label>
              <button
                type="button"
                onClick={() => {
                  if (window.location.protocol !== 'https:')
                    return setError(
                      'Avto-aniqlash faqat ochiq HTTPS domenida ishlaydi. Webhook manzilini qo‘lda kiriting.',
                    );
                  setWebhook(`${window.location.origin}/api/v1/bot/webhook/`);
                  setError(null);
                }}
                className="text-xs font-bold text-gold-strong hover:underline"
              >
                Avto-aniqlash
              </button>
            </div>
            <input
              id="webhook-url"
              type="url"
              value={webhook}
              onChange={(e) => setWebhook(e.target.value)}
              placeholder="https://sayt.uz/api/v1/bot/webhook/"
              className="input-lux mt-2"
            />
          </div>
          <div>
            <label htmlFor="bot-short-description" className="field-label">
              Qisqa tavsif
            </label>
            <input
              id="bot-short-description"
              maxLength={120}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="input-lux mt-2"
            />
            <p className="mt-2 text-xs text-ink-soft">
              {shortDescription.length}/120 belgi
            </p>
          </div>
          <div>
            <label htmlFor="bot-description" className="field-label">
              To‘liq ma’lumot
            </label>
            <textarea
              id="bot-description"
              maxLength={512}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-lux mt-2"
            />
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-gold w-full sm:w-auto"
          >
            <Save className="h-4 w-4" />
            {mutation.isPending ? 'Saqlanmoqda…' : 'Saqlash va ishga tushirish'}
          </button>
        </fieldset>
      </form>
      <section className="rounded-xl border border-gold/30 bg-gold-tint/50 p-5 text-sm leading-relaxed text-ink-soft">
        <h2 className="font-bold text-ink">Sozlash tartibi</h2>
        <ol className="mt-3 list-inside list-decimal space-y-2">
          <li>
            <a
              href="https://t.me/BotFather"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-gold-strong underline"
            >
              BotFather
            </a>{' '}
            orqali bot yarating va tokenini kiriting.
          </li>
          <li>
            Webhook uchun Telegram serverlari kira oladigan HTTPS manzilidan
            foydalaning.
          </li>
          <li>
            Sozlamalarni saqlang. Ulanish holati server javobidan keyin
            yangilanadi.
          </li>
        </ol>
      </section>
    </div>
  );
}

export default function TelegramBotSettingsPage() {
  const query = useQuery({
    queryKey: ['telegramBotConfig'],
    queryFn: fetchBotConfigRequest,
  });
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          Bron bildirishnomalari uchun Telegram botni sozlang.
        </p>
        <button
          type="button"
          aria-label="Yangilash"
          disabled={query.isFetching}
          onClick={() => {
            void query.refetch();
          }}
          className="btn-outline !px-3 !py-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`}
          />
        </button>
      </div>
      {query.isLoading ? (
        <LoadingState />
      ) : query.isError || !query.data ? (
        <ErrorAlert
          message={getErrorMessage(
            query.error,
            'Bot sozlamalarini yuklab bo‘lmadi.',
          )}
          onRetry={() => {
            void query.refetch();
          }}
        />
      ) : (
        <ConfigForm config={query.data} />
      )}
    </div>
  );
}
