'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Hotel, Users, Wallet } from 'lucide-react';
import {
  fetchAdminBarsRequest,
  fetchAdminHallsRequest,
  fetchAllUsersRequest,
} from '@/services/admin';
import {
  fetchBarBookingsRequest,
  fetchHallBookingsRequest,
} from '@/services/bookings';
import { activeBooking, formatMoney } from '@/utils/booking';
import { UZ_MONTHS, localDateString } from '@/utils/date';
import { ErrorAlert } from '@/components/common/error-alert';
import { LoadingState } from '@/components/common/loading-state';

export default function AdminDashboardPage() {
  const users = useQuery({
    queryKey: ['adminUsers'],
    queryFn: fetchAllUsersRequest,
  });
  const halls = useQuery({
    queryKey: ['adminHalls'],
    queryFn: fetchAdminHallsRequest,
  });
  const bars = useQuery({
    queryKey: ['adminBars'],
    queryFn: fetchAdminBarsRequest,
  });
  const hallBookings = useQuery({
    queryKey: ['adminHallBookings'],
    queryFn: fetchHallBookingsRequest,
  });
  const barBookings = useQuery({
    queryKey: ['adminBarBookings'],
    queryFn: fetchBarBookingsRequest,
  });
  const queries = [users, halls, bars, hallBookings, barBookings];
  if (queries.some((query) => query.isLoading)) return <LoadingState />;
  const bookingsAvailable = !hallBookings.isError && !barBookings.isError;
  const bookings = [...(hallBookings.data || []), ...(barBookings.data || [])];
  const thisMonth = localDateString().slice(0, 7);
  const monthly = bookings.filter(
    (booking) =>
      booking.date.startsWith(thisMonth) && activeBooking(booking.status),
  );
  const stats = [
    {
      title: 'Jami foydalanuvchilar',
      value: users.isError ? '—' : String(users.data?.length || 0),
      icon: Users,
    },
    {
      title: 'Jami joylar',
      value:
        halls.isError || bars.isError
          ? '—'
          : String((halls.data?.length || 0) + (bars.data?.length || 0)),
      icon: Hotel,
    },
    {
      title: 'Shu oydagi faol bronlar',
      value: bookingsAvailable ? String(monthly.length) : '—',
      icon: CalendarDays,
    },
    {
      title: 'Tasdiqlangan bronlar summasi',
      value: bookingsAvailable
        ? formatMoney(
            monthly
              .filter((booking) => booking.status === 'CONFIRMED')
              .reduce((sum, booking) => sum + Number(booking.total_price), 0),
          )
        : '—',
      icon: Wallet,
    },
  ];
  const today = new Date();
  const growth = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - 5 + index, 1);
    const prefix = localDateString(date).slice(0, 7);
    return {
      key: prefix,
      label: UZ_MONTHS[date.getMonth()],
      count: bookings.filter(
        (booking) =>
          booking.date.startsWith(prefix) && activeBooking(booking.status),
      ).length,
    };
  });
  const maxCount = Math.max(1, ...growth.map((item) => item.count));
  return (
    <div className="space-y-7">
      {queries.some((query) => query.isError) && (
        <ErrorAlert
          message="Ayrim ko‘rsatkichlar yuklanmadi. Mavjud bo‘lmagan ma’lumotlar chiziqcha bilan ko‘rsatiladi."
          onRetry={() => {
            queries.forEach((query) => {
              void query.refetch();
            });
          }}
        />
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, icon: Icon }) => (
          <section key={title} className="card-lux p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xs font-bold uppercase leading-relaxed tracking-wider text-ink-soft">
                {title}
              </h2>
              <Icon className="h-6 w-6 shrink-0 text-gold-strong" />
            </div>
            <p className="mt-5 break-words font-display text-2xl font-bold">
              {value}
            </p>
          </section>
        ))}
      </div>
      <section className="card-lux p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <h2 className="font-display text-xl font-bold">Oylik bronlar</h2>
          <span className="text-xs font-bold text-ink-soft">Oxirgi 6 oy</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">
          Tadbir sanasi bo‘yicha faol bronlar. Rad etilgan va bekor qilingan
          so‘rovlar hisobga olinmaydi.
        </p>
        {!bookingsAvailable ? (
          <p className="py-10 text-center text-sm text-ink-soft">
            Diagramma uchun ma’lumot yuklanmadi.
          </p>
        ) : (
          <div className="mt-7 grid grid-cols-6 items-end gap-2 sm:gap-5">
            {growth.map((item) => (
              <div key={item.key} className="min-w-0 text-center">
                <p className="mb-2 text-xs font-bold text-ink-soft">
                  {item.count}
                </p>
                <div className="mx-auto flex h-40 w-full max-w-16 items-end border-b border-line">
                  <div
                    role="img"
                    aria-label={`${item.label}: ${item.count} ta bron`}
                    style={{ height: `${(item.count / maxCount) * 100}%` }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#96743d] to-[#dfc58f]"
                  />
                </div>
                <p
                  className="mt-3 truncate text-[10px] font-bold text-ink-soft sm:text-xs"
                  title={item.label}
                >
                  {item.label === 'Iyun' || item.label === 'Iyul'
                    ? item.label
                    : item.label.slice(0, 3)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/venues" className="btn-outline">
          Joylarni boshqarish
        </Link>
        <Link href="/admin/users" className="btn-outline">
          Foydalanuvchilar
        </Link>
      </div>
    </div>
  );
}
