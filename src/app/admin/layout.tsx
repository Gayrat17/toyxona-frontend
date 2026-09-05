'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Hotel, Users, MessageSquare } from 'lucide-react';
import { ProtectedRoute } from '@/components/common/protected-route';
import {
  DashboardShell,
  type DashboardNavItem,
} from '@/components/layout/dashboard-shell';

const ITEMS: DashboardNavItem[] = [
  {
    href: '/admin/dashboard',
    label: 'Umumiy ko‘rsatkichlar',
    icon: LayoutDashboard,
  },
  { href: '/admin/venues', label: 'Joylar boshqaruvi', icon: Hotel },
  { href: '/admin/users', label: 'Foydalanuvchilar', icon: Users },
  {
    href: '/admin/settings/telegram',
    label: 'Telegram bot sozlamalari',
    icon: MessageSquare,
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <DashboardShell
        admin
        items={ITEMS}
        title={
          ITEMS.find((item) => item.href === pathname)?.label || 'Admin paneli'
        }
      >
        {children}
      </DashboardShell>
    </ProtectedRoute>
  );
}
