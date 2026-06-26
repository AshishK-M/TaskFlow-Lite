import type { ReactNode } from 'react';
import { AuthGate } from '@/components/layout/AuthGate';
import { Navbar } from '@/components/layout/Navbar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </AuthGate>
  );
}
