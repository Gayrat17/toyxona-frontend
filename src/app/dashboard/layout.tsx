'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/protected-route';
import { useAuth } from '@/store/auth-context';
import { LayoutDashboard, Hotel, Plus, Clock, Calendar, LogOut, Crown } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['VENUE_OWNER']}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ProtectedRoute>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Mening joylarim', href: '/dashboard/venues', icon: Hotel },
    { label: "Yangi joy qo'shish", href: '/dashboard/add', icon: Plus },
    { label: 'Bronlar', href: '/dashboard/bookings', icon: Clock },
    { label: 'Kalendarni bloklash', href: '/dashboard/calendar', icon: Calendar },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-paper font-sans">
      {/* ============ Sidebar ============ */}
      <aside className="texture-grain relative flex w-64 shrink-0 flex-col border-r border-gold/15 bg-espresso text-[#e9dfc9]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='84' height='84' viewBox='0 0 84 84'%3E%3Cg fill='none' stroke='%23cda964' stroke-width='1'%3E%3Crect x='26' y='26' width='32' height='32'/%3E%3Crect x='26' y='26' width='32' height='32' transform='rotate(45 42 42)'/%3E%3Ccircle cx='42' cy='42' r='4.5'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        {/* Brand */}
        <div className="relative z-[2] flex h-16 shrink-0 items-center gap-3 border-b border-gold/15 px-6">
          <span className="relative flex h-9 w-9 rotate-45 items-center justify-center border border-gold/60 bg-gradient-to-br from-[#ecd49c] to-[#b08d4f]">
            <span className="flex h-6 w-6 rotate-[-45deg] items-center justify-center">
              <Crown className="h-3 w-3 text-[#221a0f]" />
            </span>
          </span>
          <div>
            <p className="font-display text-lg font-bold tracking-[0.08em] text-[#f2e9d6]">TOYXONA</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.36em] text-gold">Owner Panel</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="relative z-[2] flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/dashboard/venues' && pathname === '/dashboard');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#c9a35f]/25 to-transparent text-gold-soft'
                    : 'text-[#a29377] hover:bg-white/5 hover:text-[#e9dfc9]'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-gold" />
                )}
                <Icon className={`h-[18px] w-[18px] ${isActive ? 'text-gold' : 'text-[#7a6d52]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="relative z-[2] border-t border-gold/15 p-4">
          <div className="flex items-center gap-3 rounded-xl border border-gold/10 bg-white/5 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ecd49c] to-[#b08d4f] text-sm font-black text-[#251b0c]">
              {(user?.first_name || 'J').charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-[#f2e9d6]">{user?.first_name || 'Joy egasi'}</p>
              <p className="truncate text-[11px] text-[#8d7f63]">{user?.phone_number}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-lg p-1.5 text-[#8d7f63] transition-colors hover:bg-white/10 hover:text-[#e08b8b]"
              title="Chiqish"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </aside>

      {/* ============ Main panel ============ */}
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-line bg-paper-soft/90 px-8 backdrop-blur-md">
          <h2 className="font-display text-lg font-bold text-ink">
            {pathname === '/dashboard/add' && "Yangi joy qo'shish"}
            {pathname === '/dashboard/bookings' && 'Kelgan bronlar'}
            {pathname === '/dashboard/calendar' && 'Taqvimni bloklash'}
            {(!['/dashboard/add', '/dashboard/bookings', '/dashboard/calendar'].includes(pathname)) &&
              "Mening joylarim"}
          </h2>
          <span className="badge-outline">Joy egasi paneli</span>
        </header>

        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  );
}
