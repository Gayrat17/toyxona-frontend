'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/store/auth-context';
import { roleHome } from '@/utils/navigation';
import { LoadingState } from './loading-state';
import type { UserRole } from '@/types';

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const allowed = !!user && (!allowedRoles || allowedRoles.includes(user.role));

  useEffect(() => {
    if (loading) return;
    if (!user)
      router.replace(
        `/login?next=${encodeURIComponent(pathname + window.location.search)}`,
      );
    else if (!allowed) router.replace(roleHome(user.role));
  }, [user, loading, allowed, pathname, router]);

  if (loading || !allowed) return <LoadingState />;
  return <>{children}</>;
}

export default ProtectedRoute;
