'use client';

import React from 'react';
import { getErrorMessage } from '@/utils/errors';
import { ErrorAlert } from '@/components/common/error-alert';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminHallsRequest,
  fetchAdminBarsRequest,
  approveVenueRequest,
} from '@/services/admin';
import { Check, X, RefreshCw, Hotel, Wine } from 'lucide-react';

function ApprovalPill({ approved }: { approved?: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
        approved
          ? 'border-success/40 bg-success/10 text-success'
          : 'border-gold/50 bg-gold/15 text-gold-strong'
      }`}
    >
      {approved === undefined
        ? 'Holati noma’lum'
        : approved
          ? 'Tasdiqlangan'
          : 'Tasdiqlanmagan'}
    </span>
  );
}

export default function AdminVenuesPage() {
  const queryClient = useQueryClient();

  const {
    data: halls = [],
    isLoading: loadingHalls,
    error: errorHalls,
  } = useQuery({
    queryKey: ['adminHalls'],
    queryFn: fetchAdminHallsRequest,
  });

  const {
    data: bars = [],
    isLoading: loadingBars,
    error: errorBars,
  } = useQuery({
    queryKey: ['adminBars'],
    queryFn: fetchAdminBarsRequest,
  });

  const approveMutation = useMutation({
    mutationFn: ({
      id,
      type,
      approved,
    }: {
      id: number;
      type: 'hall' | 'bar';
      approved: boolean;
    }) => approveVenueRequest(id, type, approved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminHalls'] });
      queryClient.invalidateQueries({ queryKey: ['adminBars'] });
    },
  });

  const isLoading = loadingHalls || loadingBars;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          Joylarni ko‘rib chiqing va e’lonlarni tasdiqlang.
        </p>
        <button
          type="button"
          aria-label="Yangilash"
          onClick={() => {
            void queryClient.invalidateQueries({ queryKey: ['adminHalls'] });
            void queryClient.invalidateQueries({ queryKey: ['adminBars'] });
          }}
          className="btn-outline !px-3 !py-2"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-8">
        {(errorHalls || errorBars) && (
          <ErrorAlert
            message={getErrorMessage(
              errorHalls || errorBars,
              'Joylarni yuklab bo‘lmadi.',
            )}
            onRetry={() => {
              void queryClient.invalidateQueries({ queryKey: ['adminHalls'] });
              void queryClient.invalidateQueries({ queryKey: ['adminBars'] });
            }}
          />
        )}
        {approveMutation.error && (
          <ErrorAlert
            message={getErrorMessage(
              approveMutation.error,
              'Joy holatini o‘zgartirib bo‘lmadi.',
            )}
          />
        )}
        {approveMutation.isSuccess && (
          <p
            role="status"
            className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm font-bold text-success"
          >
            Joyning tasdiqlash holati yangilandi.
          </p>
        )}
        {/* Halls table */}
        <div className="card-lux overflow-hidden">
          <div className="flex items-center justify-between border-b border-line bg-surface-2/50 px-6 py-4">
            <h3 className="flex items-center gap-2.5 font-display text-base font-bold text-ink">
              <Hotel className="h-5 w-5 text-gold" />
              To&apos;y zallari
            </h3>
            <span className="badge-outline">{halls.length} ta</span>
          </div>

          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <span className="h-8 w-8 rotate-45 animate-spin rounded-sm border-2 border-gold border-t-transparent" />
            </div>
          ) : halls.length > 0 ? (
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Joylar jadvali"
            >
              <p className="sticky left-0 w-fit px-5 py-2 text-xs text-ink-soft sm:hidden">
                Jadvalni yon tomonga suring ↔
              </p>
              <table className="table-lux">
                <thead>
                  <tr>
                    <th>Nomi</th>
                    <th>Manzil</th>
                    <th>Sig&apos;im</th>
                    <th>Zakalat</th>
                    <th>Status</th>
                    <th className="text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {halls.map((hall) => (
                    <tr key={`adm-hall-${hall.id}`}>
                      <td className="table-copy font-extrabold text-ink">
                        {hall.name}
                      </td>
                      <td className="table-copy">{hall.address}</td>
                      <td>{hall.max_capacity} kishi</td>
                      <td>
                        {parseFloat(hall.required_deposit).toLocaleString(
                          'uz-UZ',
                        )}{' '}
                        UZS
                      </td>
                      <td>
                        <ApprovalPill approved={hall.is_approved} />
                      </td>
                      <td className="text-right">
                        {hall.is_approved === undefined ? (
                          <span className="text-xs text-ink-soft">
                            Tasdiqlash holati berilmagan
                          </span>
                        ) : !hall.is_approved ? (
                          <div className="flex justify-end gap-2">
                            <button
                              disabled={approveMutation.isPending}
                              onClick={() =>
                                approveMutation.mutate({
                                  id: hall.id,
                                  type: 'hall',
                                  approved: true,
                                })
                              }
                              className="btn-outline !px-3.5 !py-1.5 !text-[11px] !border-success/50 !text-success hover:!bg-success hover:!text-paper"
                            >
                              <Check className="h-3.5 w-3.5" /> Tasdiqlash
                            </button>
                            <button
                              disabled={approveMutation.isPending}
                              onClick={() =>
                                approveMutation.mutate({
                                  id: hall.id,
                                  type: 'hall',
                                  approved: false,
                                })
                              }
                              className="btn-outline !px-3.5 !py-1.5 !text-[11px] !border-danger/50 !text-danger hover:!bg-danger hover:!text-paper"
                            >
                              <X className="h-3.5 w-3.5" /> Rad etish
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled={approveMutation.isPending}
                            onClick={() =>
                              approveMutation.mutate({
                                id: hall.id,
                                type: 'hall',
                                approved: false,
                              })
                            }
                            className="text-xs font-bold text-ink-faint transition-colors hover:text-danger"
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
            <p className="px-6 py-10 text-center text-sm font-semibold italic text-ink-faint">
              {errorHalls
                ? 'Restoranlar yuklanmadi.'
                : 'Restoranlar topilmadi.'}
            </p>
          )}
        </div>

        {/* Bars table */}
        <div className="card-lux overflow-hidden">
          <div className="flex items-center justify-between border-b border-line bg-surface-2/50 px-6 py-4">
            <h3 className="flex items-center gap-2.5 font-display text-base font-bold text-ink">
              <Wine className="h-5 w-5 text-gold" />
              Barlar
            </h3>
            <span className="badge-outline">{bars.length} ta</span>
          </div>

          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <span className="h-8 w-8 rotate-45 animate-spin rounded-sm border-2 border-gold border-t-transparent" />
            </div>
          ) : bars.length > 0 ? (
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Joylar jadvali"
            >
              <p className="sticky left-0 w-fit px-5 py-2 text-xs text-ink-soft sm:hidden">
                Jadvalni yon tomonga suring ↔
              </p>
              <table className="table-lux">
                <thead>
                  <tr>
                    <th>Nomi</th>
                    <th>Manzil</th>
                    <th>Sig&apos;im</th>
                    <th>Soatbay narx</th>
                    <th>Status</th>
                    <th className="text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {bars.map((bar) => (
                    <tr key={`adm-bar-${bar.id}`}>
                      <td className="table-copy font-extrabold text-ink">
                        {bar.name}
                      </td>
                      <td className="table-copy">{bar.address}</td>
                      <td>{bar.capacity} kishi</td>
                      <td>
                        {parseFloat(bar.price_per_hour).toLocaleString('uz-UZ')}{' '}
                        UZS
                      </td>
                      <td>
                        <ApprovalPill approved={bar.is_approved} />
                      </td>
                      <td className="text-right">
                        {bar.is_approved === undefined ? (
                          <span className="text-xs text-ink-soft">
                            Tasdiqlash holati berilmagan
                          </span>
                        ) : !bar.is_approved ? (
                          <div className="flex justify-end gap-2">
                            <button
                              disabled={approveMutation.isPending}
                              onClick={() =>
                                approveMutation.mutate({
                                  id: bar.id,
                                  type: 'bar',
                                  approved: true,
                                })
                              }
                              className="btn-outline !px-3.5 !py-1.5 !text-[11px] !border-success/50 !text-success hover:!bg-success hover:!text-paper"
                            >
                              <Check className="h-3.5 w-3.5" /> Tasdiqlash
                            </button>
                            <button
                              disabled={approveMutation.isPending}
                              onClick={() =>
                                approveMutation.mutate({
                                  id: bar.id,
                                  type: 'bar',
                                  approved: false,
                                })
                              }
                              className="btn-outline !px-3.5 !py-1.5 !text-[11px] !border-danger/50 !text-danger hover:!bg-danger hover:!text-paper"
                            >
                              <X className="h-3.5 w-3.5" /> Rad etish
                            </button>
                          </div>
                        ) : (
                          <button
                            disabled={approveMutation.isPending}
                            onClick={() =>
                              approveMutation.mutate({
                                id: bar.id,
                                type: 'bar',
                                approved: false,
                              })
                            }
                            className="text-xs font-bold text-ink-faint transition-colors hover:text-danger"
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
            <p className="px-6 py-10 text-center text-sm font-semibold italic text-ink-faint">
              {errorBars ? 'Barlar yuklanmadi.' : 'Barlar topilmadi.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
