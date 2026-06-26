'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href={ROUTES.boards} className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white text-sm">K</span>
          Kanban
        </Link>
        {user ? (
          <Dropdown
            trigger={
              <span className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-slate-100">
                <Avatar name={user.name} size="sm" />
                <span className="hidden sm:inline text-sm font-medium text-slate-700">{user.name}</span>
              </span>
            }
            items={[
              {
                label: 'Sign out',
                destructive: true,
                onClick: () => {
                  logout();
                  router.replace(ROUTES.login);
                },
              },
            ]}
          />
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => router.push(ROUTES.login)}>
              Sign in
            </Button>
            <Button onClick={() => router.push(ROUTES.signup)}>Sign up</Button>
          </div>
        )}
      </div>
    </header>
  );
};
