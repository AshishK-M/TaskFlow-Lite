'use client';

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { STORAGE_KEYS } from '@/constants/api';
import { storage } from '@/lib/storage';
import { authService } from '@/services/auth.service';
import type { LoginInput, SignupInput, User } from '@/types/auth';

export type AuthContextValue = {
  user: User | null;
  ready: boolean; // false until we have attempted to restore the session
  login: (input: LoginInput) => Promise<User>;
  signup: (input: SignupInput) => Promise<User>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = storage.get<string>(STORAGE_KEYS.token);
    const cached = storage.get<User>(STORAGE_KEYS.user);
    if (!token) {
      setReady(true);
      return;
    }
    if (cached) setUser(cached);
    authService
      .me()
      .then((me) => {
        setUser(me);
        storage.set(STORAGE_KEYS.user, me);
      })
      .catch(() => {
        storage.remove(STORAGE_KEYS.token);
        storage.remove(STORAGE_KEYS.user);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((token: string, u: User) => {
    storage.set(STORAGE_KEYS.token, token);
    storage.set(STORAGE_KEYS.user, u);
    setUser(u);
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      const session = await authService.login(input);
      persist(session.token, session.user);
      return session.user;
    },
    [persist],
  );

  const signup = useCallback(
    async (input: SignupInput) => {
      const session = await authService.signup(input);
      persist(session.token, session.user);
      return session.user;
    },
    [persist],
  );

  const logout = useCallback(() => {
    storage.remove(STORAGE_KEYS.token);
    storage.remove(STORAGE_KEYS.user);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, login, signup, logout }),
    [user, ready, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
