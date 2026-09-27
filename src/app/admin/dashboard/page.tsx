'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPlatformStatsRequest } from '@/services/admin';
import { Users, Hotel, Calendar, DollarSign, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['platformStats'],
    queryFn: fetchPlatformStatsRequest,
  });

  const monthlyGrowth = stats?.monthly_growth || [];
  const maxCount = Math.max(...monthlyGrowth.map((d) => d.count), 1);

  const formattedRevenue = stats?.total_revenue
    ? `${parseFloat(stats.total_revenue).toLocaleString('uz-UZ')} UZS`
    : '0 UZS';

  const statsCards = [
    {
      name: 'Jami foydalanuvchilar',
      value: stats ? stats.total_users.toString() : '...',
      label: 'Ro‘yxatdan o‘tganlar',
      icon: Users,
    },
    {
      name: 'Faol joylar',
      value: stats ? stats.active_venues.toString() : '...',
      label: `${stats?.total_halls ?? 0} zal, ${stats?.total_bars ?? 0} bar`,
      icon: Hotel,
    },
    {
      name: 'Jami bronlar',
      value: stats ? stats.total_bookings.toString() : '...',
      label: `Shu oyda: ${stats?.monthly_bookings ?? 0} ta`,
      icon: Calendar,
    },
    {
      name: 'Platforma aylanmasi',
      value: formattedRevenue,
      label: `Zakalatlar: ${stats?.total_deposits ? parseFloat(stats.total_deposits).toLocaleString('uz-UZ') : 0} UZS`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Top header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-paper-soft/90 px-8 backdrop-blur-md">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">Admin Dashboard</h2>
          <p className="text-[11px] font-semibold text-ink-faint">Real vaqt rejimidagi ma&apos;lumotlar</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-gold/60 hover:text-gold-strong"
            title="Yangilash"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <span className="badge-outline !border-wine/40 !bg-wine/10 !text-wine">Superadmin</span>
        </div>
      </header>

      <div className="flex-1 space-y-8 p-8">
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm font-semibold text-danger">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Statistika ma&apos;lumotlarini yuklashda xatolik yuz berdi. Backend server holatini tekshiring.</span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={`stat-${idx}`} className="card-lux card-lux-hover relative overflow-hidden p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-ink-faint">
                    {stat.name}
                  </span>
                  <span className="flex h-10 w-10 rotate-45 items-center justify-center border border-gold/40 bg-gold-tint">
                    <Icon className="h-4 w-4 rotate-[-45deg] text-gold-strong" />
                  </span>
                </div>

                <div className="mt-5">
                  <span className="font-display text-2xl font-bold text-ink sm:text-3xl">
                    {isLoading ? '...' : stat.value}
                  </span>
                  <p className="mt-1 text-xs font-semibold text-ink-faint">
                    {stat.label}
                  </p>
                </div>

                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
              </div>
            );
          })}
        </div>

        {/* Growth chart */}
        <div className="card-lux p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-line pb-5">
            <h3 className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
              <TrendingUp className="h-5 w-5 text-gold" />
              <span>Oylik bronlar o&apos;sishi</span>
            </h3>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
              Oxirgi 6 oy (Haqiqiy ma&apos;lumotlar)
            </span>
          </div>

          <div className="mt-8 flex h-64 flex-col justify-between gap-6 px-2 md:flex-row md:items-end">
            {monthlyGrowth.map((data, index) => {
              const percent = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
              return (
                <div key={`chart-bar-${index}`} className="group flex flex-1 flex-col items-center">
                  <div className="relative -top-1 mb-2 rounded-md border border-gold/30 bg-espresso px-2.5 py-1 text-[11px] font-black text-gold-soft opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
                    {data.count} ta bron
                  </div>

                  <div className="relative flex h-48 w-full max-w-[60px] items-end overflow-hidden rounded-t-xl border border-line bg-surface-2/60">
                    <div
                      style={{ height: `${Math.max(percent, 4)}%` }}
                      className="w-full bg-gradient-to-t from-[#96743d] via-[#b08d4f] to-[#e2c489] transition-all duration-500 group-hover:brightness-110"
                    />
                  </div>

                  <span className="mt-3 text-[11px] font-black uppercase tracking-[0.14em] text-ink-faint">
                    {data.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
