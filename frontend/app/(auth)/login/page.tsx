'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthShell } from '@/components/auth/AuthShell';
import { loginSchema, type LoginFormValues } from '@/components/auth/schemas';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { FormError } from '@/components/forms/FormError';
import { FormInput } from '@/components/forms/FormInput';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

const LoginForm = () => {
  const { login, user, ready } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('next') || ROUTES.boards;
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (ready && user) router.replace(redirectTo);
  }, [ready, user, router, redirectTo]);

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values);
      router.replace(redirectTo);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormError message={serverError} />
      <FormInput
        label="Email"
        type="email"
        autoComplete="email"
        required
        {...register('email')}
        error={errors.email?.message}
      />
      <FormInput
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        {...register('password')}
        error={errors.password?.message}
      />
      <Button type="submit" block loading={isSubmitting}>
        Sign in
      </Button>
    </form>
  );
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your boards."
      footer={
        <>
          New here?{' '}
          <Link href={ROUTES.signup} className="text-brand-700 font-medium hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense
        fallback={
          <div className="flex justify-center py-6 text-slate-400">
            <Spinner />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
