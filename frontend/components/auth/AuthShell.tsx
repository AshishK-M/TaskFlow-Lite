import Link from 'next/link';
import type { ReactNode } from 'react';

export type AuthShellProps = {
  title: string;
  subtitle: ReactNode;
  footer: ReactNode;
  children: ReactNode;
};

export const AuthShell = ({ title, subtitle, footer, children }: AuthShellProps) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <header className="px-6 py-4">
      <Link href="/" className="inline-flex items-center gap-2 font-semibold text-slate-900">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white text-sm">K</span>
        Kanban
      </Link>
    </header>
    <main className="flex-1 flex items-center justify-center px-4 pb-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-soft p-6">{children}</div>
        <p className="mt-5 text-center text-sm text-slate-500">{footer}</p>
      </div>
    </main>
  </div>
);
