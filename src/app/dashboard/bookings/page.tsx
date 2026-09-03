'use client';

import React from 'react';
import { useOwnerBookings } from '@/hooks/useOwnerBookings';
import { SkeletonTableLoader } from '@/components/common/skeleton-loader';
import { ErrorAlert } from '@/components/common/error-alert';
import { Check, Clock, X, Hotel, Wine, Inbox } from 'lucide-react';

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    CONFIRMED: { label: 'Tasdiqlangan', cls: 'border-success/40 bg-success/10 text-success' },
    REJECTED: { label: 'Rad etilgan', cls: 'border-danger/40 bg-danger/10 text-danger' },
    HOLD: { label: 'Muzlatilgan', cls: 'border-gold/50 bg-gold/15 text-gold-strong' },
    PENDING: { label: 'Kutilmoqda', cls: 'border-gold/50 bg-gold/15 text-gold-strong' },
    CANCELLED: { label: 'Bekor qilingan', cls: 'border-line-strong bg-surface-2 text-ink-faint' },
  };
  const item = map[status] || { label: status, cls: 'border-line-strong bg-surface-2 text-ink-faint' };
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${item.cls}`}>
      {item.label}
    </span>
  );
}

function DepositPill({ paid }: { paid: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
        paid ? 'border-success/40 bg-success/10 text-success' : 'border-gold/50 bg-gold/15 text-gold-strong'
      }`}
    >
      {paid ? "To'langan" : "To'lanmagan"}
    </span>
  );
}

function ActionButton({
  onClick,
  title,
  tone,
  icon: Icon,
}: {
  onClick: () => void;
  title: string;
  tone: 'success' | 'gold' | 'danger';
  icon: any;
}) {
  const tones = {
    success: 'border-success/40 text-success hover:bg-success hover:text-white',
    gold: 'border-gold/50 text-gold-strong hover:bg-gold hover:text-white',
    danger: 'border-danger/40 text-danger hover:bg-danger hover:text-white',
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-full border bg-transparent transition-all ${tones[tone]}`}
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
        message={error instanceof Error ? error.message : "Bronlar ro'yxatini yuklashda xatolik yuz berdi."}
        onRetry={() => {
          refetchHallBookings();
          refetchBarBookings();
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Hall bookings */}
      <div className="card-lux overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-surface-2/50 px-6 py-4">
          <h3 className="flex items-center gap-2.5 font-display text-base font-bold text-ink">
            <Hotel className="h-5 w-5 text-gold" />
            To&apos;y zaliga kelgan bronlar
          </h3>
          <span className="badge-outline">{hallBookings.length} ta</span>
        </div>

        {hallBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-lux">
              <thead>
                <tr>
                  <th>Mijoz</th>
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
                    <td className="font-extrabold text-ink">{b.user_phone || 'Mijoz'}</td>
                    <td>{b.date}</td>
                    <td className="font-bold text-gold-strong">{parseFloat(b.total_price).toLocaleString('uz-UZ')} UZS</td>
                    <td>
                      <DepositPill paid={b.is_deposit_paid} />
                    </td>
                    <td>
                      <StatusPill status={b.status} />
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <ActionButton
                          onClick={() => updateHallBookingStatus({ id: b.id, status: 'CONFIRMED' })}
                          title="Tasdiqlash"
                          tone="success"
                          icon={Check}
                        />
                        <ActionButton
                          onClick={() => updateHallBookingStatus({ id: b.id, status: 'HOLD' })}
                          title="Muzlatish"
                          tone="gold"
                          icon={Clock}
                        />
                        <ActionButton
                          onClick={() => updateHallBookingStatus({ id: b.id, status: 'REJECTED' })}
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
              To&apos;y zaliga kelib tushgan bronlar yo&apos;q.
            </p>
          </div>
        )}
      </div>

      {/* Bar bookings */}
      <div className="card-lux overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-surface-2/50 px-6 py-4">
          <h3 className="flex items-center gap-2.5 font-display text-base font-bold text-ink">
            <Wine className="h-5 w-5 text-gold" />
            Barga kelgan bronlar
          </h3>
          <span className="badge-outline">{barBookings.length} ta</span>
        </div>

        {barBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-lux">
              <thead>
                <tr>
                  <th>Mijoz</th>
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
                    <td className="font-extrabold text-ink">{b.user_phone || 'Mijoz'}</td>
                    <td>{b.date}</td>
                    <td>
                      {b.start_time} — {b.end_time}
                    </td>
                    <td className="font-bold text-gold-strong">{parseFloat(b.total_price).toLocaleString('uz-UZ')} UZS</td>
                    <td>
                      <StatusPill status={b.status} />
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <ActionButton
                          onClick={() => updateBarBookingStatus({ id: b.id, status: 'CONFIRMED' })}
                          title="Tasdiqlash"
                          tone="success"
                          icon={Check}
                        />
                        <ActionButton
                          onClick={() => updateBarBookingStatus({ id: b.id, status: 'HOLD' })}
                          title="Muzlatish"
                          tone="gold"
                          icon={Clock}
                        />
                        <ActionButton
                          onClick={() => updateBarBookingStatus({ id: b.id, status: 'REJECTED' })}
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
