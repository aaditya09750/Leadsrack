import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { extractErrorMessage } from '../../lib/api';

const loginSchema = z.object({
  email: z.string().email('Invalid email').max(254),
  password: z.string().min(1, 'Password is required').max(128),
});

type LoginFormValues = z.infer<typeof loginSchema>;

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
    <div className="min-h-screen bg-background font-sans text-primary flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <img
            src="/leadsrack-logo.jpg"
            alt="Leadsrack"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="text-primary text-lg font-semibold">Leadsrack</span>
        </div>

        <div className="bg-white/5 rounded-xl border border-border p-6">
          <h1 className="text-primary text-base font-semibold">Welcome back</h1>
          <p className="text-secondary text-xs mt-1 mb-6">Sign in to manage your leads.</p>

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
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-primary text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent-brand"
                placeholder="you@example.com"
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
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-primary text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent-brand"
                placeholder="••••••••"
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
              className="w-full py-2 rounded-lg bg-accent-brand text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-secondary text-xs text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-accent-brand hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
