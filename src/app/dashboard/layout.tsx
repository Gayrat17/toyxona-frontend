'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Hotel, Plus, Clock, Calendar } from 'lucide-react';
import { ProtectedRoute } from '@/components/common/protected-route';
import {
  DashboardShell,
  type DashboardNavItem,
} from '@/components/layout/dashboard-shell';

const ITEMS: DashboardNavItem[] = [
  { label: 'Mening joylarim', href: '/dashboard/venues', icon: Hotel },
  { label: 'Yangi joy qo‘shish', href: '/dashboard/add', icon: Plus },
  { label: 'Bronlar', href: '/dashboard/bookings', icon: Clock },
  { label: 'Taqvimni bloklash', href: '/dashboard/calendar', icon: Calendar },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const title = /\/venues\/(halls|bars)\//.test(pathname)
    ? 'Joyni tahrirlash'
    : ITEMS.find((item) => item.href === pathname)?.label || 'Mening joylarim';
  return (
    <ProtectedRoute allowedRoles={['VENUE_OWNER']}>
      <DashboardShell items={ITEMS} title={title}>
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
