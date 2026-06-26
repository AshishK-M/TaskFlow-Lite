'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthShell } from '@/components/auth/AuthShell';
import { signupSchema, type SignupFormValues } from '@/components/auth/schemas';
import { Button } from '@/components/ui/Button';
import { FormError } from '@/components/forms/FormError';
import { FormInput } from '@/components/forms/FormInput';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const { signup, user, ready } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  useEffect(() => {
    if (ready && user) router.replace(ROUTES.boards);
  }, [ready, user, router]);

  const onSubmit = async (values: SignupFormValues) => {
    setServerError(null);
    try {
      await signup(values);
      router.replace(ROUTES.boards);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Sign up failed');
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start organising your work in minutes."
      footer={
        <>
          Already have an account?{' '}
          <Link href={ROUTES.login} className="text-brand-700 font-medium hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormError message={serverError} />
        <FormInput
          label="Full name"
          autoComplete="name"
          required
          {...register('name')}
          error={errors.name?.message}
        />
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
          autoComplete="new-password"
          required
          hint="At least 6 characters."
          {...register('password')}
          error={errors.password?.message}
        />
        <Button type="submit" block loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
