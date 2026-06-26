'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from './ToastProvider';

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <ToastProvider>
    <AuthProvider>{children}</AuthProvider>
  </ToastProvider>
);
