'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Crown, Hotel, LayoutGrid, LogIn, LogOut, Wine } from 'lucide-react';
import { useAuth } from '@/store/auth-context';
import { roleHome } from '@/utils/navigation';
import { ThemeToggle } from '@/components/common/theme-toggle';

const ITEMS = [
  { id: 'all', label: 'Barchasi', icon: LayoutGrid },
  { id: 'halls', label: 'To‘y zallari', icon: Hotel },
  { id: 'bars', label: 'Barlar', icon: Wine },
];

function HeaderContent() {
  const params = useSearchParams();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const category = pathname.includes('/halls/')
    ? 'halls'
    : pathname.includes('/bars/')
      ? 'bars'
      : ['halls', 'bars'].includes(params.get('category') || '')
        ? params.get('category')
        : 'all';
  const nav = (mobile = false) => (
    <nav
      aria-label={mobile ? 'Mobil katalog' : 'Katalog'}
      className={
        mobile
          ? 'flex justify-center gap-2 border-t border-line/70 px-4 py-2 md:hidden'
          : 'hidden items-center gap-1 md:flex'
      }
    >
      {ITEMS.map(({ id, label, icon: Icon }) => {
        const next = new URLSearchParams(
          pathname === '/' ? params.toString() : '',
        );
        if (id === 'all') next.delete('category');
        else next.set('category', id);
        const active = category === id;
        return (
          <Link
            key={id}
            href={`/${next.size ? `?${next}` : ''}#katalog`}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold lg:px-4 ${active ? 'bg-gold-tint text-gold-strong' : 'text-ink-soft hover:bg-surface-2'}`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gold/30 bg-paper-soft/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="TOYXONA — bosh sahifa"
          className="flex shrink-0 items-center gap-2.5 sm:gap-3"
        >
          <span className="flex h-8 w-8 rotate-45 items-center justify-center border border-gold bg-gradient-to-br from-[#ecd49c] to-[#b08d4f] sm:h-10 sm:w-10">
            <Crown className="h-4 w-4 -rotate-45 text-[#251b0c]" />
          </span>
          <span>
            <span className="block font-display text-lg font-bold tracking-wider text-ink sm:text-2xl">
              TOYXONA
            </span>
            <span className="block text-[8px] font-bold uppercase tracking-[.3em] text-gold-strong">
              Luxe Venue
            </span>
          </span>
        </Link>
        {nav()}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <ThemeToggle />
          {loading ? (
            <span
              role="status"
              aria-label="Hisob yuklanmoqda"
              className="skeleton h-10 w-16 !rounded-full"
            />
          ) : user ? (
            <>
              <Link
                href={roleHome(user.role)}
                aria-label={
                  user.role === 'CLIENT' ? 'Bosh sahifa' : 'Boshqaruv paneli'
                }
                className="flex h-10 items-center gap-2 rounded-full border border-line bg-surface px-2.5 text-xs font-bold hover:border-gold"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-tint text-gold-strong">
                  {(user.first_name || 'F').charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-24 truncate lg:inline">
                  {user.first_name || 'Foydalanuvchi'}
                </span>
              </Link>
              <button
                type="button"
                onClick={logout}
                aria-label="Chiqish"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-soft hover:text-danger"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="btn-gold !gap-1.5 !px-3 !py-2.5 !text-xs sm:!px-5"
            >
              <LogIn className="h-4 w-4" />
              <span>Kirish</span>
            </Link>
          )}
        </div>
      </div>
      {nav(true)}
    </header>
  );
}

export function Header() {
  return (
    <Suspense
      fallback={
        <header className="h-28 border-b border-line bg-paper-soft md:h-18" />
      }
    >
      <HeaderContent />
    </Suspense>
  );
}
