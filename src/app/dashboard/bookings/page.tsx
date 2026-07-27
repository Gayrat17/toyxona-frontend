'use client';

import React from 'react';
import { useOwnerBookings } from '@/hooks/useOwnerBookings';
import { SkeletonTableLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import { Check, Clock, X } from 'lucide-react';

export default function OwnerBookingsPage() {
  const { 
    hallBookings, 
    barBookings, 
    isLoading, 
    isError, 
    error, 
    updateHallBookingStatus, 
    updateBarBookingStatus, 
    refetchHallBookings, 
    refetchBarBookings 
  } = useOwnerBookings();

  if (isLoading) {
    return <SkeletonTableLoader />;
  }

  if (isError) {
    return (
      <ErrorAlert 
        message={error instanceof Error ? error.message : "Bronlar ro'yxatini yuklashda xatolik yuz berdi."} 
        onRetry={() => { refetchHallBookings(); refetchBarBookings(); }} 
      />
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Hall Bookings table */}
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Restoranga olingan bronlar ({hallBookings.length})</h3>
        {hallBookings.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Mijoz</th>
                  <th className="px-6 py-4">Sana</th>
                  <th className="px-6 py-4">Jami Narx</th>
                  <th className="px-6 py-4">Zakalat holati</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {hallBookings.map((b) => (
                  <tr key={`hb-${b.id}`}>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                      {b.user_phone || "Mijoz"}
                    </td>
                    <td className="px-6 py-4">{b.date}</td>
                    <td className="px-6 py-4">{parseFloat(b.total_price).toLocaleString()} UZS</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        b.is_deposit_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {b.is_deposit_paid ? "To'langan" : "To'lanmagan"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        b.status === 'HOLD' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => updateHallBookingStatus({ id: b.id, status: 'CONFIRMED' })}
                        className="rounded p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        title="Tasdiqlash"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateHallBookingStatus({ id: b.id, status: 'HOLD' })}
                        className="rounded p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100"
                        title="Muzlatish"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateHallBookingStatus({ id: b.id, status: 'REJECTED' })}
                        className="rounded p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100"
                        title="Rad etish"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">Restoranga kelib tushgan bronlar yo&apos;q.</p>
        )}
      </div>

      {/* Bar Bookings table */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-800 dark:text-white mb-4">Barga olingan bronlar ({barBookings.length})</h3>
        {barBookings.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Mijoz</th>
                  <th className="px-6 py-4">Sana</th>
                  <th className="px-6 py-4">Vaqt</th>
                  <th className="px-6 py-4">Jami Narx</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {barBookings.map((b) => (
                  <tr key={`bb-${b.id}`}>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                      {b.user_phone || "Mijoz"}
                    </td>
                    <td className="px-6 py-4">{b.date}</td>
                    <td className="px-6 py-4">{b.start_time} - {b.end_time}</td>
                    <td className="px-6 py-4">{parseFloat(b.total_price).toLocaleString()} UZS</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        b.status === 'HOLD' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => updateBarBookingStatus({ id: b.id, status: 'CONFIRMED' })}
                        className="rounded p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        title="Tasdiqlash"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateBarBookingStatus({ id: b.id, status: 'HOLD' })}
                        className="rounded p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100"
                        title="Muzlatish"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => updateBarBookingStatus({ id: b.id, status: 'REJECTED' })}
                        className="rounded p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100"
                        title="Rad etish"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">Barga kelib tushgan bronlar yo&apos;q.</p>
        )}
      </div>

    </div>
  );
}
