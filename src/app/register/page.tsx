import { Suspense } from 'react';
import { AuthForm } from '@/components/forms/auth-form';
import { LoadingState } from '@/components/common/loading-state';

export const metadata = { title: 'Ro‘yxatdan o‘tish — TOYXONA' };
export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthForm mode="register" />
    </Suspense>
  );
}
