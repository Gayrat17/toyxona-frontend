'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { writeStorage } from '@/utils/storage';

function subscribe(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
  const onStorage = (event: StorageEvent) => {
    if (event.key === 'theme')
      document.documentElement.classList.toggle(
        'dark',
        event.newValue === 'dark',
      );
  };
  window.addEventListener('storage', onStorage);
  return () => {
    observer.disconnect();
    window.removeEventListener('storage', onStorage);
  };
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains('dark'),
    () => false,
  );
  const label = isDark ? 'Yorug‘ mavzuga o‘tish' : 'Qorong‘i mavzuga o‘tish';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => {
        document.documentElement.classList.toggle('dark', !isDark);
        writeStorage('theme', isDark ? 'light' : 'dark');
      }}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-gold hover:text-gold-strong"
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </button>
  );
}
