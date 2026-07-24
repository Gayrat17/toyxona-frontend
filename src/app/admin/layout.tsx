'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/common/protected-route';
import { useAuth } from '@/store/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Hotel, Users, LogOut, Sparkles, MessageSquare } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        
        {/* Sidebar Nav */}
        <aside className="w-64 border-r border-slate-200 bg-slate-900 text-slate-300 dark:border-slate-800 flex flex-col shrink-0">
          <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800 text-white font-black text-xl tracking-wider">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            <span>ADMIN CORE</span>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-6">
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                pathname === '/admin/dashboard'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/venues"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                pathname === '/admin/venues'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Hotel className="h-5 w-5" />
              <span>Joylar</span>
            </Link>

            <Link
              href="/admin/users"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                pathname === '/admin/users'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Foydalanuvchilar</span>
            </Link>

            <Link
              href="/admin/settings/telegram"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                pathname === '/admin/settings/telegram'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Telegram Bot</span>
            </Link>
          </nav>

          <div className="border-t border-slate-800 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-800/40 p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.first_name || 'Admin'}</p>
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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
