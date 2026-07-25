'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/protected-route';
import { useAuth } from '@/store/auth-context';
import { 
  LayoutDashboard, Hotel, Plus, Clock, Calendar, LogOut, RefreshCw 
} from 'lucide-react';

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
    {
      label: 'Mening joylarim',
      href: '/dashboard/venues',
      icon: Hotel,
    },
    {
      label: "Yangi joy qo'shish",
      href: '/dashboard/add',
      icon: Plus,
    },
    {
      label: 'Bronlar',
      href: '/dashboard/bookings',
      icon: Clock,
    },
    {
      label: 'Kalendarni bloklash',
      href: '/dashboard/calendar',
      icon: Calendar,
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
      
      {/* Permanent Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-slate-900 text-slate-300 dark:border-slate-800 flex flex-col shrink-0">
        
        {/* Brand Logo */}
        <div className="flex h-16 shrink-0 items-center gap-2 px-6 border-b border-slate-800 text-white font-black text-xl tracking-wider">
          <LayoutDashboard className="h-6 w-6 text-indigo-400" />
          <span>B2B PANEL</span>
        </div>

        {/* Navigation list with usePathname active highlighting */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/dashboard/venues' && pathname === '/dashboard');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile & logout */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/40 p-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.first_name || 'Joy egasi'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.phone_number}</p>
            </div>
            <button 
              onClick={logout}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-500"
              title="Chiqish"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900 sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {pathname === '/dashboard/venues' && "Mening Joylarim Ro'yxati"}
            {pathname === '/dashboard/add' && "Yangi Joy Qo'shish"}
            {pathname === '/dashboard/bookings' && "Foydalanuvchilardan kelgan bronlar"}
            {pathname === '/dashboard/calendar' && "Taqvim Smenalarini Bloklash"}
            {(pathname === '/dashboard' || !['/dashboard/venues', '/dashboard/add', '/dashboard/bookings', '/dashboard/calendar'].includes(pathname)) && "Mening Joylarim Ro'yxati"}
          </h2>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              Venue Owner
            </span>
          </div>
        </header>

        {/* Dynamic sub-route content */}
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
