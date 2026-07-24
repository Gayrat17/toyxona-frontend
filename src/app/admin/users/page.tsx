'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllUsersRequest, toggleUserStatusRequest } from '@/services/admin';
import { Search, UserMinus, UserCheck, RefreshCw, AlertCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { User } from '@/types';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch users query
  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['adminUsers'],
    queryFn: fetchAllUsersRequest,
  });

  // Toggle user freeze status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => 
      toggleUserStatusRequest(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  // Filter users by search term
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const phone = u.phone_number.toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || phone.includes(query);
  });

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      
      {/* Header bar */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Foydalanuvchilar Boshqaruvi</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['adminUsers'] })}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
            title="Yangilash"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="p-8 space-y-6 flex-1">
        
        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-sm text-rose-500 border border-rose-500/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>Foydalanuvchilarni yuklashda xatolik yuz berdi. Sinov rejimida mock ma&apos;lumotlar yuklanishi mumkin.</span>
          </div>
        )}

        {/* Search filter bar */}
        <div className="flex max-w-md items-center rounded-xl border border-slate-200 bg-white px-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Ism yoki telefon bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full border-0 bg-transparent py-2.5 pl-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100"
          />
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Foydalanuvchi</th>
                  <th className="px-6 py-4">Telefon Raqami</th>
                  <th className="px-6 py-4">Roli</th>
                  <th className="px-6 py-4">Verifikatsiya</th>
                  <th className="px-6 py-4">Hisob holati</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={`adm-usr-${u.id}`}>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                      {u.first_name || "Ismsiz"} {u.last_name || ""}
                    </td>
                    <td className="px-6 py-4">{u.phone_number}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.role === 'ADMIN' ? 'bg-rose-100 text-rose-700' :
                        u.role === 'VENUE_OWNER' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.is_verified ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.is_verified ? "Tasdiqlangan" : "Tasdiqlanmagan"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {u.is_active ? "Faol (Active)" : "Bloklangan"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'ADMIN' ? (
                        u.is_active ? (
                          <button
                            onClick={() => toggleStatusMutation.mutate({ id: u.id, isActive: false })}
                            className="rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1.5 text-xs font-bold flex items-center gap-1 ml-auto"
                          >
                            <UserMinus className="h-4 w-4" /> Bloklash (Freeze)
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleStatusMutation.mutate({ id: u.id, isActive: true })}
                            className="rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 text-xs font-bold flex items-center gap-1 ml-auto"
                          >
                            <UserCheck className="h-4 w-4" /> Blokdan ochish
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-slate-400 italic">Boshqarib bo&apos;lmaydi</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic">Foydalanuvchilar topilmadi.</p>
        )}

      </div>
    </div>
  );
}
