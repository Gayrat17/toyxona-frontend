import type { UserRole } from '@/types';

export function roleHome(role: UserRole): string {
  return role === 'ADMIN'
    ? '/admin/dashboard'
    : role === 'VENUE_OWNER'
      ? '/dashboard/venues'
      : '/';
}

export function safeRedirect(value: string | null, role: UserRole): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\\r\n]/.test(value)
  )
    return roleHome(role);
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return roleHome(role);
  }
  if (decoded.startsWith('//') || /[\\\r\n]/.test(decoded))
    return roleHome(role);
  const url = new URL(value, 'https://toyxona.local');
  const pathname = new URL(decoded, 'https://toyxona.local').pathname;
  if (
    url.origin !== 'https://toyxona.local' ||
    /^\/(login|register)(\/|$)/.test(pathname)
  )
    return roleHome(role);
  if (/^\/admin(\/|$)/.test(pathname) && role !== 'ADMIN')
    return roleHome(role);
  if (/^\/dashboard(\/|$)/.test(pathname) && role !== 'VENUE_OWNER')
    return roleHome(role);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function safeExternalUrl(value?: string | null): string | undefined {
  try {
    const url = new URL(value || '');
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
