'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Crown,
  Menu,
  LogOut,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/store/auth-context';
import { Modal } from '@/components/common/modal';
import { ThemeToggle } from '@/components/common/theme-toggle';

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function DashboardShell({
  children,
  items,
  title,
  admin = false,
}: {
  children: ReactNode;
  items: DashboardNavItem[];
  title: string;
  admin?: boolean;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const label = admin ? 'Admin paneli' : 'Joy egasi paneli';
  const navigation = (mobile: boolean) => (
    <nav
      aria-label={mobile ? 'Mobil boshqaruv menyusi' : 'Boshqaruv menyusi'}
      className="space-y-2 p-4"
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${active ? 'bg-[#c9a35f]/20 text-[#e9cf99]' : 'text-[#c4b496] hover:bg-white/5 hover:text-white'}`}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
      <Link
        href="/"
        onClick={() => setMenuOpen(false)}
        className="mt-5 flex items-center gap-3 border-t border-gold/20 px-4 pt-5 text-sm font-bold text-[#c4b496] hover:text-white"
      >
        <ArrowUpRight className="h-[18px] w-[18px]" /> Bosh sahifa
      </Link>
    </nav>
  );
  const profile = (
    <div className="m-4 flex items-center gap-3 rounded-xl border border-gold/20 bg-white/5 p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft font-bold text-[#251b0c]">
        {(user?.first_name || 'F').charAt(0).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-[#f2e9d6]">
          {user?.first_name || 'Foydalanuvchi'}
        </p>
        <p className="truncate text-xs text-[#c4b496]">{user?.phone_number}</p>
      </div>
      <button
        type="button"
        onClick={logout}
        aria-label="Chiqish"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#c4b496] hover:bg-white/10 hover:text-white"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <div className="flex min-h-dvh bg-paper">
      <a
        href="#panel-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:p-3"
      >
        Asosiy mazmunga o‘tish
      </a>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r border-gold/15 bg-espresso lg:flex">
        <Link
          href="/"
          className="flex h-20 shrink-0 items-center gap-3 border-b border-gold/20 px-6"
        >
          <Crown className="h-8 w-8 text-gold" />
          <span>
            <span className="block font-display text-xl font-bold tracking-wider text-[#f2e9d6]">
              TOYXONA
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#d4b77e]">
              {label}
            </span>
          </span>
        </Link>
        <div className="flex-1">{navigation(false)}</div>
        {profile}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-20 items-center justify-between gap-3 border-b border-line bg-paper-soft/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Menyuni ochish"
              aria-expanded={menuOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gold-strong lg:hidden">
                {label}
              </p>
              <h1 className="font-display text-base font-bold leading-tight text-ink sm:text-xl">
                {title}
              </h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="badge-outline !hidden sm:!inline-flex">
              {label}
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main id="panel-content" className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <Modal
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={label}
        className="!max-w-sm !bg-espresso !text-[#f2e9d6]"
      >
        {navigation(true)}
        {profile}
      </Modal>
    </div>
  );
}
