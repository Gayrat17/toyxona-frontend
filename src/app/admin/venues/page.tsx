'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminHallsRequest, fetchAdminBarsRequest, approveVenueRequest } from '@/services/admin';
import { Check, X, RefreshCw, AlertCircle, Hotel, Wine, Sparkles } from 'lucide-react';

export default function AdminVenuesPage() {
  const queryClient = useQueryClient();

  // Queries for lookups
  const { data: halls = [], isLoading: loadingHalls, error: errorHalls } = useQuery({
    queryKey: ['adminHalls'],
    queryFn: fetchAdminHallsRequest,
  });

  const { data: bars = [], isLoading: loadingBars, error: errorBars } = useQuery({
    queryKey: ['adminBars'],
    queryFn: fetchAdminBarsRequest,
  });

  // Venue approval mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, type, approved }: { id: number; type: 'hall' | 'bar'; approved: boolean }) => 
      approveVenueRequest(id, type, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminHalls'] });
      queryClient.invalidateQueries({ queryKey: ['adminBars'] });
    },
  });

  const isLoading = loadingHalls || loadingBars;

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      
      {/* Header bar */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Joylar Tasdig&apos;i va Boshqaruvi</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['adminHalls'] });
              queryClient.invalidateQueries({ queryKey: ['adminBars'] });
            }}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            title="Yangilash"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="p-8 space-y-8 flex-1">
        
        {/* Errors view */}
        {(errorHalls || errorBars) && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-500 border border-rose-500/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Joy ma&apos;lumotlarini yuklashda xatolik yuz berdi. Sinov rejimida mock ma&apos;lumotlar yuklanishi mumkin.</span>
          </div>
        )}

        {/* Halls Section Table */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Hotel className="h-5 w-5 text-indigo-600" />
            <span>Restoranlar ro&apos;yxati</span>
          </h3>

          {isLoading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : halls.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm text-slate-500 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Restoran nomi</th>
                    <th className="px-6 py-4">Manzil</th>
                    <th className="px-6 py-4">Sig&apos;im</th>
                    <th className="px-6 py-4">Zakalat</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {halls.map((hall) => (
                    <tr key={`adm-hall-${hall.id}`}>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">{hall.name}</td>
                      <td className="px-6 py-4">{hall.address}</td>
                      <td className="px-6 py-4">{hall.max_capacity} kishi</td>
                      <td className="px-6 py-4">{parseFloat(hall.required_deposit).toLocaleString()} UZS</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          hall.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {hall.is_approved ? "Tasdiqlangan" : "Kutilmoqda"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!hall.is_approved ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => approveMutation.mutate({ id: hall.id, type: 'hall', approved: true })}
                              className="rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 text-xs font-bold flex items-center gap-1"
                            >
                              <Check className="h-4 w-4" /> Tasdiqlash
                            </button>
                            <button
                              onClick={() => approveMutation.mutate({ id: hall.id, type: 'hall', approved: false })}
                              className="rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 text-xs font-bold flex items-center gap-1"
                            >
                              <X className="h-4 w-4" /> Rad etish
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => approveMutation.mutate({ id: hall.id, type: 'hall', approved: false })}
                            className="text-xs font-semibold text-slate-400 hover:text-rose-500"
                          >
                            Tasdiqni bekor qilish
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Restoranlar topilmadi.</p>
          )}
        </div>

        {/* Bars Section Table */}
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Wine className="h-5 w-5 text-indigo-600" />
            <span>Barlar ro&apos;yxati</span>
          </h3>

          {isLoading ? (
            <div className="h-32 flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          ) : bars.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm text-slate-500 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Bar nomi</th>
                    <th className="px-6 py-4">Manzil</th>
                    <th className="px-6 py-4">Sig&apos;im</th>
                    <th className="px-6 py-4">Soatbay Narx</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {bars.map((bar) => (
                    <tr key={`adm-bar-${bar.id}`}>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">{bar.name}</td>
                      <td className="px-6 py-4">{bar.address}</td>
                      <td className="px-6 py-4">{bar.capacity} kishi</td>
                      <td className="px-6 py-4">{parseFloat(bar.price_per_hour).toLocaleString()} UZS</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          bar.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {bar.is_approved ? "Tasdiqlangan" : "Kutilmoqda"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!bar.is_approved ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => approveMutation.mutate({ id: bar.id, type: 'bar', approved: true })}
                              className="rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 text-xs font-bold flex items-center gap-1"
                            >
                              <Check className="h-4 w-4" /> Tasdiqlash
                            </button>
                            <button
                              onClick={() => approveMutation.mutate({ id: bar.id, type: 'bar', approved: false })}
                              className="rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 text-xs font-bold flex items-center gap-1"
                            >
                              <X className="h-4 w-4" /> Rad etish
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => approveMutation.mutate({ id: bar.id, type: 'bar', approved: false })}
                            className="text-xs font-semibold text-slate-400 hover:text-rose-500"
                          >
                            Tasdiqni bekor qilish
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Barlar topilmadi.</p>
          )}
        </div>

      </div>
    </div>
  );
}
