'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

type DashboardShellProps = {
  children: ReactNode;
};

const navItems = [
  { href: ROUTES.boards, label: 'Boards' },
];

const pageTitleFor = (pathname: string) => {
  if (pathname === ROUTES.boards) return 'Boards';
  if (pathname.startsWith('/boards/')) return 'Board details';
  return 'Dashboard';
};

export const DashboardShell = ({ children }: DashboardShellProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  const signOut = () => {
    logout();
    router.replace(ROUTES.login);
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden border-r border-slate-200 bg-white lg:flex lg:h-screen lg:flex-col lg:sticky lg:top-0">
        <div className="border-b border-slate-200 px-6 py-5">
          <Link href={ROUTES.boards} className="inline-flex items-center gap-3 font-semibold text-slate-900">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm text-white">
              K
            </span>
            <span className="text-base">Kanban</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <Avatar name={user?.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" block onClick={signOut}>
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden"
                aria-label="Open navigation"
                aria-expanded={mobileOpen}
              >
                <span className="flex flex-col gap-1.5">
                  <span className="h-0.5 w-5 rounded-full bg-current" />
                  <span className="h-0.5 w-5 rounded-full bg-current" />
                  <span className="h-0.5 w-5 rounded-full bg-current" />
                </span>
              </button>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Workspace
                </p>
                <h1 className="truncate text-lg font-semibold text-slate-900">
                  {pageTitleFor(pathname)}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-3 sm:flex">
                <div className="text-right">
                  <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="truncate text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
              <Avatar name={user?.name} size="sm" />
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-hidden={!mobileOpen}>
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <Link
                href={ROUTES.boards}
                className="inline-flex items-center gap-3 font-semibold text-slate-900"
                onClick={() => setMobileOpen(false)}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm text-white">
                  K
                </span>
                Kanban
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-lg text-slate-700 hover:bg-slate-100"
                aria-label="Close navigation"
              >
                X
              </button>
            </div>

            <nav className="flex-1 space-y-2 px-3 py-4">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors',
                      active
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-slate-200 p-4">
              <div className="mb-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <Avatar name={user?.name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="truncate text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                block
                onClick={() => {
                  setMobileOpen(false);
                  signOut();
                }}
              >
                Sign out
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
