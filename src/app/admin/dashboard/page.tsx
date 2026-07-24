'use client';

import React from 'react';
import { Users, Hotel, Calendar, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';

const STATS_DATA = [
  {
    name: "Jami foydalanuvchilar (Total Users)",
    value: "1,248 kishi",
    change: "+12.5%",
    changeType: "positive",
    icon: Users,
    color: "from-blue-500 to-indigo-600"
  },
  {
    name: "Faol joylar (Active Venues)",
    value: "84 ta",
    change: "+8.2%",
    changeType: "positive",
    icon: Hotel,
    color: "from-emerald-500 to-teal-600"
  },
  {
    name: "Oylik bronlar (Monthly Bookings)",
    value: "312 ta",
    change: "+24.1%",
    changeType: "positive",
    icon: Calendar,
    color: "from-purple-500 to-pink-600"
  },
  {
    name: "Jami platforma aylanmasi (Revenue)",
    value: "450,000,000 UZS",
    change: "+18.7%",
    changeType: "positive",
    icon: DollarSign,
    color: "from-amber-500 to-orange-600"
  }
];

const MONTHLY_GROWTH = [
  { month: "Mart", count: 120 },
  { month: "Aprel", count: 180 },
  { month: "May", count: 240 },
  { month: "Iyun", count: 310 },
  { month: "Iyul", count: 390 },
  { month: "Avgust", count: 480 }
];

export default function AdminDashboardPage() {
  const maxCount = Math.max(...MONTHLY_GROWTH.map(d => d.count));

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      
      {/* Top Header bar */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Admin Dashboard Ko&apos;rinishi</h2>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
          Superadmin Panel
        </span>
      </header>

      {/* Grid Dashboard parameters */}
      <div className="p-8 space-y-8 flex-1">
        
        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATS_DATA.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={`stat-${idx}`} 
                className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {stat.name}
                  </span>
                  <div className={`rounded-xl bg-gradient-to-tr ${stat.color} p-2 text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-800 dark:text-white">{stat.value}</span>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight className="h-3.5 w-3.5" /> {stat.change}
                  </span>
                </div>
                
                {/* Visual subtle card bottom accent line */}
                <div className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r ${stat.color}`} />
              </div>
            );
          })}
        </div>

        {/* Dynamic Growth SVG Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              <span>Oylik buyurtmalar o&apos;sish grafigi (Bookings Growth)</span>
            </h3>
            <span className="text-xs font-semibold text-slate-400">Oxirgi 6 oy ko&apos;rsatkichlari</span>
          </div>

          {/* SVG Custom High-Fidelity Chart */}
          <div className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6 h-64 px-4">
            {MONTHLY_GROWTH.map((data, index) => {
              // Calculate dynamic heights percentages relative to max value
              const percent = (data.count / maxCount) * 100;
              return (
                <div key={`chart-bar-${index}`} className="flex-1 flex flex-col items-center group">
                  
                  {/* Tooltip bubble showing values on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-800 text-white text-xs px-2.5 py-1 rounded-md mb-2 shadow-sm font-bold relative -top-1">
                    {data.count} ta bron
                  </div>

                  {/* Visual bar graph */}
                  <div className="w-full max-w-[60px] rounded-t-xl bg-indigo-50 dark:bg-slate-800 h-48 relative flex items-end overflow-hidden border border-slate-100 dark:border-slate-800">
                    <div 
                      style={{ height: `${percent}%` }}
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300 transition-all duration-500"
                    />
                  </div>

                  {/* Month Label */}
                  <span className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">{data.month}</span>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
}
