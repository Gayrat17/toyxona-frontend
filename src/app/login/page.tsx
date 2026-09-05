import { Suspense } from 'react';
import { AuthForm } from '@/components/forms/auth-form';
import { LoadingState } from '@/components/common/loading-state';

export const metadata = { title: 'Kirish — TOYXONA' };
export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
