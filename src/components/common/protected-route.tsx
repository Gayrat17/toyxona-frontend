'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/store/auth-context';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User role is not permitted, redirect to home page
        router.push('/');
      }
    }
  }, [user, loading, allowedRoles, router]);

  // Loading animation spinner
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 rotate-45 animate-spin rounded-sm border-2 border-gold border-t-transparent" />
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-ink-faint">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Hide children if unauthenticated or role is not allowed
  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
};
export default ProtectedRoute;
