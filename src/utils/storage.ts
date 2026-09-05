export const STORAGE_EVENT = 'toyxona:storage';

export function readStorage(key: string): string | null {
  try {
    return typeof window === 'undefined'
      ? null
      : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string | null): boolean {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
    window.dispatchEvent(new Event(STORAGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function subscribeStorage(listener: () => void) {
  window.addEventListener('storage', listener);
  window.addEventListener(STORAGE_EVENT, listener);
  return () => {
    window.removeEventListener('storage', listener);
    window.removeEventListener(STORAGE_EVENT, listener);
  };
}
