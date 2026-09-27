'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllUsersRequest, toggleUserStatusRequest } from '@/services/admin';
import { Search, UserMinus, UserCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { User } from '@/types';

function RolePill({ role }: { role: string }) {
  const map: Record<string, string> = {
    ADMIN: '!border-wine/40 !bg-wine/10 !text-wine',
    VENUE_OWNER: '',
  };
  return (
    <span className={`badge-outline ${map[role] || '!border-line-strong !bg-surface-2 !text-ink-soft'}`}>
      {role === 'VENUE_OWNER' ? 'Joy egasi' : role === 'CLIENT' ? 'Mijoz' : role}
    </span>
  );
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users = [], isLoading, error } = useQuery<User[]>({
    queryKey: ['adminUsers'],
    queryFn: fetchAllUsersRequest,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => toggleUserStatusRequest(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
  });

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const phone = u.phone_number.toLowerCase();
    const query = searchTerm.toLowerCase();
    return fullName.includes(query) || phone.includes(query);
  });

  return (
    <div className="flex flex-col flex-1 overflow-y-auto">
      {/* Top header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-paper-soft/90 px-8 backdrop-blur-md">
        <h2 className="font-display text-lg font-bold text-ink">Foydalanuvchilar boshqaruvi</h2>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['adminUsers'] })}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-gold/60 hover:text-gold-strong"
          title="Yangilash"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </header>

      <div className="flex-1 space-y-6 p-8">
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm font-semibold text-danger">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>
              Foydalanuvchilarni yuklashda xatolik yuz berdi. Backend server holatini tekshiring.
            </span>
          </div>
        )}

        {/* Search */}
        <div className="relative flex max-w-md items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-gold" />
          <input
            type="text"
            placeholder="Ism yoki telefon bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-lux pl-10"
          />
        </div>

        {/* Users table */}
        {isLoading ? (
          <div className="card-lux flex h-32 items-center justify-center">
            <span className="h-8 w-8 rotate-45 animate-spin rounded-sm border-2 border-gold border-t-transparent" />
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="card-lux overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-lux">
                <thead>
                  <tr>
                    <th>Foydalanuvchi</th>
                    <th>Telefon</th>
                    <th>Roli</th>
                    <th>Verifikatsiya</th>
                    <th>Holati</th>
                    <th className="text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={`adm-usr-${u.id}`}>
                      <td>
                        <span className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-tint text-xs font-black text-gold-strong">
                            {(u.first_name || 'I').charAt(0).toUpperCase()}
                          </span>
                          <span className="font-extrabold text-ink">
                            {u.first_name || 'Ismsiz'} {u.last_name || ''}
                          </span>
                        </span>
                      </td>
                      <td>{u.phone_number}</td>
                      <td>
                        <RolePill role={u.role} />
                      </td>
                      <td>
                        <span
                          className={`text-xs font-bold ${
                            u.is_verified ? 'text-success' : 'text-ink-faint'
                          }`}
                        >
                          {u.is_verified ? 'Tasdiqlangan' : 'Tasdiqlanmagan'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                            u.is_active
                              ? 'border-success/40 bg-success/10 text-success'
                              : 'border-danger/40 bg-danger/10 text-danger'
                          }`}
                        >
                          {u.is_active ? 'Faol' : 'Bloklangan'}
                        </span>
                      </td>
                      <td className="text-right">
                        {u.role !== 'ADMIN' ? (
                          u.is_active ? (
                            <button
                              onClick={() => toggleStatusMutation.mutate({ id: u.id, isActive: false })}
                              className="btn-outline !ml-auto !px-3.5 !py-1.5 !text-[11px] !border-danger/50 !text-danger hover:!bg-danger hover:!text-white"
                            >
                              <UserMinus className="h-3.5 w-3.5" /> Bloklash
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleStatusMutation.mutate({ id: u.id, isActive: true })}
                              className="btn-outline !ml-auto !px-3.5 !py-1.5 !text-[11px] !border-success/50 !text-success hover:!bg-success hover:!text-white"
                            >
                              <UserCheck className="h-3.5 w-3.5" /> Blokdan ochish
                            </button>
                          )
                        ) : (
                          <span className="text-xs italic text-ink-faint">Boshqarib bo&apos;lmaydi</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="py-10 text-center text-sm font-semibold italic text-ink-faint">Foydalanuvchilar topilmadi.</p>
        )}
      </div>
    </div>
  );
}
