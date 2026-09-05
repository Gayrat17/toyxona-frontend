'use client';

import { useState, useSyncExternalStore } from 'react';
import { Bookmark, Check, Share2 } from 'lucide-react';
import { readStorage, subscribeStorage, writeStorage } from '@/utils/storage';

const KEY = 'toyxona:saved-venues';
function savedKeys(value: string | null): string[] {
  try {
    const data: unknown = JSON.parse(value || '[]');
    return Array.isArray(data)
      ? data.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

export function VenueActions({
  venueKey,
  name,
}: {
  venueKey: string;
  name: string;
}) {
  const stored = useSyncExternalStore(
    subscribeStorage,
    () => readStorage(KEY),
    () => null,
  );
  const saved = savedKeys(stored).includes(venueKey);
  const [notice, setNotice] = useState('');
  const [sharing, setSharing] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={sharing}
          aria-label="Ulashish"
          onClick={async () => {
            if (sharing) return;
            setSharing(true);
            setNotice('');
            try {
              if (navigator.share)
                await navigator.share({
                  title: name,
                  url: window.location.href,
                });
              else {
                await navigator.clipboard.writeText(window.location.href);
                setNotice('Havola nusxalandi.');
              }
            } catch (error) {
              if (!(
                error instanceof DOMException && error.name === 'AbortError'
              ))
                setNotice(
                  'Havolani brauzer manzil satridan nusxalashingiz mumkin.',
                );
            } finally {
              setSharing(false);
            }
          }}
          className="btn-outline !gap-1.5 !px-4 !py-2 !text-xs"
        >
          <Share2 className="h-4 w-4" />
          Ulashish
        </button>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? 'Saqlanganlardan olib tashlash' : 'Joyni saqlash'}
          onClick={() => {
            const keys = savedKeys(readStorage(KEY));
            const success = writeStorage(
              KEY,
              JSON.stringify(
                saved
                  ? keys.filter((key) => key !== venueKey)
                  : [...new Set([...keys, venueKey])],
              ),
            );
            setNotice(
              success
                ? saved
                  ? 'Saqlanganlardan olib tashlandi.'
                  : 'Shu qurilmada saqlandi.'
                : 'Brauzerda mahalliy saqlashga ruxsat berilmagan.',
            );
          }}
          className="btn-outline !gap-1.5 !px-4 !py-2 !text-xs"
        >
          {saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          {saved ? 'Saqlangan' : 'Saqlash'}
        </button>
      </div>
      {notice && (
        <p
          role="status"
          className="max-w-sm text-xs leading-relaxed text-ink-soft"
        >
          {notice}
        </p>
      )}
    </div>
  );
}
