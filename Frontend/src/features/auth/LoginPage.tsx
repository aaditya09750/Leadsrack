import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { extractErrorMessage } from '../../lib/api';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { AuthShell, type AuthStep } from './AuthShell';

const loginSchema = z.object({
  email: z.string().email('Invalid email').max(254),
  password: z.string().min(1, 'Password is required').max(128),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-primary/5 border border-border text-primary text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent-brand';

const LOGIN_STEPS: AuthStep[] = [
  { label: 'Create account', state: 'done' },
  { label: 'Sign in to Leadsrack', state: 'active' },
  { label: 'Filter, export, track', state: 'upcoming' },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      const { user, token } = await login(values);
      setSession(token, user);
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from && from !== '/login' ? from : '/', { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      hero={{
        title: 'Welcome back to Leadsrack',
        subtitle: 'Sign in to pick up where you left off.',
      }}
      steps={LOGIN_STEPS}
    >
      <h1 className="font-display text-primary text-xl font-semibold">Sign In</h1>
      <p className="text-secondary text-xs mt-1 mb-7">
        Enter your credentials to access your dashboard.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-secondary text-xs mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={inputClass}
            placeholder="eg. you@example.com"
          />
          {errors.email ? (
            <p role="alert" className="text-xs text-red-400 mt-1">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className="block text-secondary text-xs mb-1.5">
            Password
          </label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            {...register('password')}
          />
          {errors.password ? (
            <p role="alert" className="text-xs text-red-400 mt-1">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-primary text-background text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="text-secondary text-xs text-center mt-6">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">
          Register
        </Link>
      </p>
    </AuthShell>
  );
};
