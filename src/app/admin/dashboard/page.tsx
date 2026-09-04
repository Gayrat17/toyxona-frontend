'use client';

import React from 'react';
import { Users, Hotel, Calendar, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';

const STATS_DATA = [
  {
    name: 'Jami foydalanuvchilar',
    value: '1,248',
    change: '+12.5%',
    icon: Users,
  },
  {
    name: 'Faol joylar',
    value: '84',
    change: '+8.2%',
    icon: Hotel,
  },
  {
    name: 'Oylik bronlar',
    value: '312',
    change: '+24.1%',
    icon: Calendar,
  },
  {
    name: 'Platforma aylanmasi',
    value: '450M UZS',
    change: '+18.7%',
    icon: DollarSign,
  },
];

const MONTHLY_GROWTH = [
  { month: 'Mart', count: 120 },
  { month: 'Aprel', count: 180 },
  { month: 'May', count: 240 },
  { month: 'Iyun', count: 310 },
  { month: 'Iyul', count: 390 },
  { month: 'Avgust', count: 480 },
];

export default function AdminDashboardPage() {
  const maxCount = Math.max(...MONTHLY_GROWTH.map((d) => d.count));

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Top header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-paper-soft/90 px-8 backdrop-blur-md">
        <h2 className="font-display text-lg font-bold text-ink">Admin Dashboard</h2>
        <span className="badge-outline !border-wine/40 !bg-wine/10 !text-wine">Superadmin</span>
      </header>

      <div className="flex-1 space-y-8 p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS_DATA.map((stat, idx) => {
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

                <div className="mt-5 flex items-baseline gap-2.5">
                  <span className="font-display text-3xl font-bold text-ink">{stat.value}</span>
                  <span className="flex items-center gap-0.5 text-xs font-black text-success">
                    <ArrowUpRight className="h-3.5 w-3.5" /> {stat.change}
                  </span>
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
              Oxirgi 6 oy
            </span>
          </div>

          <div className="mt-8 flex h-64 flex-col justify-between gap-6 px-2 md:flex-row md:items-end">
            {MONTHLY_GROWTH.map((data, index) => {
              const percent = (data.count / maxCount) * 100;
              return (
                <div key={`chart-bar-${index}`} className="group flex flex-1 flex-col items-center">
                  <div className="relative -top-1 mb-2 rounded-md border border-gold/30 bg-espresso px-2.5 py-1 text-[11px] font-black text-gold-soft opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
                    {data.count} ta bron
                  </div>

                  <div className="relative flex h-48 w-full max-w-[60px] items-end overflow-hidden rounded-t-xl border border-line bg-surface-2/60">
                    <div
                      style={{ height: `${percent}%` }}
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
