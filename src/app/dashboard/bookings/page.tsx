'use client';

import React from 'react';
import Link from 'next/link';
import { formatMoney } from '@/utils/booking';
import { getErrorMessage } from '@/utils/errors';
import { useOwnerBookings } from '@/hooks/useOwnerBookings';
import { SkeletonTableLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import {
  Check,
  Clock,
  X,
  Hotel,
  Wine,
  Inbox,
  type LucideIcon,
} from 'lucide-react';

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    CONFIRMED: {
      label: 'Tasdiqlangan',
      cls: 'border-success/40 bg-success/10 text-success',
    },
    REJECTED: {
      label: 'Rad etilgan',
      cls: 'border-danger/40 bg-danger/10 text-danger',
    },
    HOLD: {
      label: 'Vaqtincha band',
      cls: 'border-gold/50 bg-gold/15 text-gold-strong',
    },
    PENDING: {
      label: 'Kutilmoqda',
      cls: 'border-gold/50 bg-gold/15 text-gold-strong',
    },
    CANCELLED: {
      label: 'Bekor qilingan',
      cls: 'border-line-strong bg-surface-2 text-ink-faint',
    },
  };
  const item = map[status] || {
    label: status,
    cls: 'border-line-strong bg-surface-2 text-ink-faint',
  };
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${item.cls}`}
    >
      {item.label}
    </span>
  );
}

function DepositPill({ paid }: { paid: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
        paid
          ? 'border-success/40 bg-success/10 text-success'
          : 'border-gold/50 bg-gold/15 text-gold-strong'
      }`}
    >
      {paid ? "To'langan" : "To'lanmagan"}
    </span>
  );
}

function ActionButton({
  onClick,
  disabled,
  title,
  tone,
  icon: Icon,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  tone: 'success' | 'gold' | 'danger';
  icon: LucideIcon;
}) {
  const tones = {
    success: 'border-success/40 text-success hover:bg-success hover:text-paper',
    gold: 'border-gold/50 text-gold-strong hover:bg-gold hover:text-espresso',
    danger: 'border-danger/40 text-danger hover:bg-danger hover:text-paper',
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={title}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-full border bg-transparent transition-all disabled:opacity-40 ${tones[tone]}`}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

export default function OwnerBookingsPage() {
  const {
    hallBookings,
    barBookings,
    isLoading,
    isError,
    isUpdating,
    mutationError,
    mutationSuccess,
    error,
    updateHallBookingStatus,
    updateBarBookingStatus,
    refetchHallBookings,
    refetchBarBookings,
  } = useOwnerBookings();

  if (isLoading) {
    return <SkeletonTableLoader />;
  }

  if (isError) {
    return (
      <ErrorAlert
        message={getErrorMessage(error, 'Bronlarni yuklab bo‘lmadi.')}
        onRetry={() => {
          refetchHallBookings();
          refetchBarBookings();
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      {mutationError && (
        <ErrorAlert
          message={getErrorMessage(
            mutationError,
            'Bron holatini o‘zgartirib bo‘lmadi.',
          )}
        />
      )}
      {!isUpdating && !mutationError && mutationSuccess && (
        <p
          role="status"
          className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm font-bold text-success"
        >
          Bron holati yangilandi.
        </p>
      )}
      {/* Hall bookings */}
      <div className="card-lux overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2/50 px-6 py-4">
          <h3 className="flex items-center gap-2.5 font-display text-base font-bold text-ink">
            <Hotel className="h-5 w-5 text-gold" />
            To‘y zaliga kelgan bronlar
          </h3>
          <span className="badge-outline">{hallBookings.length} ta</span>
        </div>

        {hallBookings.length > 0 ? (
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Bronlar jadvali"
          >
            <p className="sticky left-0 w-fit px-5 py-2 text-xs text-ink-soft sm:hidden">
              Jadvalni yon tomonga suring ↔
            </p>
            <table className="table-lux">
              <thead>
                <tr>
                  <th>Mijoz</th>
                  <th>Joy</th>
                  <th>Sana</th>
                  <th>Jami narx</th>
                  <th>Zakalat</th>
                  <th>Status</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {hallBookings.map((b) => (
                  <tr key={`hb-${b.id}`}>
                    <td className="font-extrabold text-ink">
                      {b.user_phone || 'Mijoz'}
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/venues/halls/${b.hall}`}
                        className="font-bold text-gold-strong underline underline-offset-2"
                      >
                        To‘y zali #{b.hall}
                      </Link>
                      <span className="mt-1 block text-xs text-ink-soft">
                        Smena #{b.shift}
                      </span>
                    </td>
                    <td>{b.date}</td>
                    <td className="font-bold text-gold-strong">
                      {formatMoney(b.total_price)}
                    </td>
                    <td>
                      <DepositPill paid={b.is_deposit_paid} />
                    </td>
                    <td>
                      <StatusPill status={b.status} />
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <ActionButton
                          disabled={
                            isUpdating ||
                            b.status === 'CANCELLED' ||
                            b.status === 'REJECTED' ||
                            b.status === 'CONFIRMED'
                          }
                          onClick={() =>
                            updateHallBookingStatus({
                              id: b.id,
                              status: 'CONFIRMED',
                            })
                          }
                          title="Tasdiqlash"
                          tone="success"
                          icon={Check}
                        />
                        <ActionButton
                          disabled={
                            isUpdating ||
                            b.status === 'CANCELLED' ||
                            b.status === 'REJECTED' ||
                            b.status === 'HOLD'
                          }
                          onClick={() =>
                            updateHallBookingStatus({
                              id: b.id,
                              status: 'HOLD',
                            })
                          }
                          title="Vaqtincha band qilish"
                          tone="gold"
                          icon={Clock}
                        />
                        <ActionButton
                          disabled={
                            isUpdating ||
                            b.status === 'CANCELLED' ||
                            b.status === 'REJECTED'
                          }
                          onClick={() =>
                            updateHallBookingStatus({
                              id: b.id,
                              status: 'REJECTED',
                            })
                          }
                          title="Rad etish"
                          tone="danger"
                          icon={X}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <Inbox className="h-8 w-8 text-ink-faint/50" />
            <p className="mt-3 text-sm font-semibold italic text-ink-faint">
              To‘y zaliga kelib tushgan bronlar yo&apos;q.
            </p>
          </div>
        )}
      </div>

      {/* Bar bookings */}
      <div className="card-lux overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2/50 px-6 py-4">
          <h3 className="flex items-center gap-2.5 font-display text-base font-bold text-ink">
            <Wine className="h-5 w-5 text-gold" />
            Barga kelgan bronlar
          </h3>
          <span className="badge-outline">{barBookings.length} ta</span>
        </div>

        {barBookings.length > 0 ? (
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Bronlar jadvali"
          >
            <p className="sticky left-0 w-fit px-5 py-2 text-xs text-ink-soft sm:hidden">
              Jadvalni yon tomonga suring ↔
            </p>
            <table className="table-lux">
              <thead>
                <tr>
                  <th>Mijoz</th>
                  <th>Joy</th>
                  <th>Sana</th>
                  <th>Vaqt</th>
                  <th>Jami narx</th>
                  <th>Status</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {barBookings.map((b) => (
                  <tr key={`bb-${b.id}`}>
                    <td className="font-extrabold text-ink">
                      {b.user_phone || 'Mijoz'}
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/venues/bars/${b.bar}`}
                        className="font-bold text-gold-strong underline underline-offset-2"
                      >
                        Bar #{b.bar}
                      </Link>
                    </td>
                    <td>{b.date}</td>
                    <td>
                      {b.start_time} — {b.end_time}
                    </td>
                    <td className="font-bold text-gold-strong">
                      {formatMoney(b.total_price)}
                    </td>
                    <td>
                      <StatusPill status={b.status} />
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <ActionButton
                          disabled={
                            isUpdating ||
                            b.status === 'CANCELLED' ||
                            b.status === 'REJECTED' ||
                            b.status === 'CONFIRMED'
                          }
                          onClick={() =>
                            updateBarBookingStatus({
                              id: b.id,
                              status: 'CONFIRMED',
                            })
                          }
                          title="Tasdiqlash"
                          tone="success"
                          icon={Check}
                        />
                        <ActionButton
                          disabled={
                            isUpdating ||
                            b.status === 'CANCELLED' ||
                            b.status === 'REJECTED' ||
                            b.status === 'HOLD'
                          }
                          onClick={() =>
                            updateBarBookingStatus({ id: b.id, status: 'HOLD' })
                          }
                          title="Vaqtincha band qilish"
                          tone="gold"
                          icon={Clock}
                        />
                        <ActionButton
                          disabled={
                            isUpdating ||
                            b.status === 'CANCELLED' ||
                            b.status === 'REJECTED'
                          }
                          onClick={() =>
                            updateBarBookingStatus({
                              id: b.id,
                              status: 'REJECTED',
                            })
                          }
                          title="Rad etish"
                          tone="danger"
                          icon={X}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <Inbox className="h-8 w-8 text-ink-faint/50" />
            <p className="mt-3 text-sm font-semibold italic text-ink-faint">
              Barga kelib tushgan bronlar yo&apos;q.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
