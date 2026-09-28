'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth-context';
import { LogOut, LogIn, Sun, Moon, Crown } from 'lucide-react';

interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps = {}) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const currentlyDark = root.classList.contains('dark');
    if (currentlyDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-500 ${
        scrolled
          ? 'bg-paper-soft/95 shadow-[0_12px_40px_-16px_rgba(64,48,20,0.45)] backdrop-blur-2xl border-b border-gold/20'
          : 'bg-paper-soft/70 backdrop-blur-md border-b border-transparent'
      }`}
    >
      {/* Gold hairline under header */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-6 py-3 sm:px-10 lg:px-12">
        {/* Brand — monogram + wordmark */}
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            if (onLogoClick) {
              onLogoClick();
            } else {
              router.push('/');
            }
          }}
          className="group flex items-center gap-3 cursor-pointer"
        >
          <span className="relative flex h-10 w-10 rotate-45 items-center justify-center border border-gold/70 bg-gradient-to-br from-[#ecd49c] to-[#b08d4f] shadow-[0_8px_18px_-8px_rgba(150,110,50,0.7)] transition-transform duration-300 group-hover:rotate-[50deg]">
            <span className="flex h-7 w-7 rotate-[-45deg] items-center justify-center border border-[#8a6a33]/50 bg-[#fffdf6]/90 dark:bg-[#211a10]/90">
              <Crown className="h-3.5 w-3.5 text-[#96743d]" />
            </span>
          </span>
          <span className="leading-none">
            <span className="block font-display text-2xl font-bold tracking-[0.08em] text-espresso dark:text-[#f2e9d6]">
              TOYXONA
            </span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.42em] text-gold-strong">
              Luxe Venue
            </span>
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-gold/60 hover:text-gold-strong"
            title={isDark ? "Yorug' mavzuga o'tish" : "Qorong'u mavzuga o'tish"}
          >
            {isDark ? <Sun className="h-[18px] w-[18px] text-gold" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2.5">
              <Link
                href={
                  user.role === 'ADMIN'
                    ? '/admin/dashboard'
                    : user.role === 'VENUE_OWNER'
                    ? '/dashboard/venues'
                    : '/'
                }
                className="flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] font-bold text-ink shadow-sm transition-all hover:border-gold/60 hover:text-gold-strong"
                title={
                  user.role === 'ADMIN'
                    ? "Superadmin paneliga o'tish"
                    : user.role === 'VENUE_OWNER'
                    ? "Joy egasi boshqaruv paneliga o'tish"
                    : 'Bosh sahifa'
                }
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#ecd49c] to-[#b08d4f] text-[11px] font-black text-[#251b0c]">
                  {(user.first_name || 'F').charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{user.first_name || 'Foydalanuvchi'}</span>
                {user.role === 'VENUE_OWNER' && (
                  <span className="badge-outline hidden lg:inline-flex">Joy egasi</span>
                )}
                {user.role === 'ADMIN' && (
                  <span className="badge-outline !border-wine/40 !bg-wine/10 !text-wine hidden lg:inline-flex">
                    Admin
                  </span>
                )}
              </Link>
              <button
                onClick={logout}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-danger/50 hover:text-danger"
                title="Chiqish"
              >
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-gold !px-5 !py-2.5 !text-[13px]">
              <LogIn className="h-4 w-4" />
              <span>Kirish</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
