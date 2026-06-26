'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';

export const AuthGate = ({ children }: { children: ReactNode }) => {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace(ROUTES.login);
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
};
