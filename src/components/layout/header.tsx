'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/store/auth-context';
import { Sparkles, Hotel, Wine, LayoutGrid, User as UserIcon, LogOut, LogIn, Sun, Moon } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
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

  const currentCategory = searchParams.get('category') || 'all';

  const handleCategorySelect = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    router.push(`/?${params.toString()}`);
  };

  const navItems = [
    { id: 'all', label: 'Barchasi', icon: LayoutGrid },
    { id: 'halls', label: "Restoranlar", icon: Hotel },
    { id: 'bars', label: 'Barlar', icon: Wine },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 font-black text-xl text-indigo-600 dark:text-indigo-400 tracking-wider">
          <Sparkles className="h-6 w-6 text-indigo-500" />
          <span>RESTORAN</span>
        </Link>

        {/* Global Category Navigation Switcher */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentCategory === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleCategorySelect(item.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all rounded-xl ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/50'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>

                {/* Active Underline Indicator Bar */}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Auth Profile & Theme Switcher */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-amber-400 transition-colors"
            title={isDark ? "Yorug' mavzuga o'tish" : "Qorong'u mavzuga o'tish"}
          >
            {isDark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={
                  user.role === 'ADMIN'
                    ? '/admin/dashboard'
                    : user.role === 'VENUE_OWNER'
                    ? '/dashboard/venues'
                    : '/'
                }
                className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-800/80 dark:hover:text-indigo-400 transition-colors shadow-sm cursor-pointer"
                title={
                  user.role === 'ADMIN'
                    ? "Superadmin paneliga o'tish"
                    : user.role === 'VENUE_OWNER'
                    ? "Joy egasi boshqaruv paneliga o'tish"
                    : "Bosh sahifa"
                }
              >
                <UserIcon className="h-4 w-4 text-indigo-500" />
                <span>{user.first_name || 'Foydalanuvchi'}</span>
                {user.role === 'VENUE_OWNER' && (
                  <span className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    Joy egasi
                  </span>
                )}
                {user.role === 'ADMIN' && (
                  <span className="rounded border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-600 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300">
                    Admin
                  </span>
                )}
              </Link>

              <button
                onClick={logout}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-900 transition-colors"
                title="Chiqish"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
            >
              <LogIn className="h-4 w-4" />
              <span>Kirish</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
