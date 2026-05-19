import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { register as registerApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { extractErrorMessage } from '../../lib/api';

const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email').max(254),
  password: z.string().min(8, 'At least 8 characters').max(128),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitting(true);
    try {
      const { user, token } = await registerApi(values);
      setSession(token, user);
      toast.success('Account created');
      navigate('/', { replace: true });
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
          <h1 className="text-primary text-base font-semibold">Create your account</h1>
          <p className="text-secondary text-xs mt-1 mb-6">
            New accounts default to the &ldquo;sales&rdquo; role.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="block text-secondary text-xs mb-1.5">
                Full name
              </label>
              <input
                id="name"
                {...register('name')}
                autoComplete="name"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-primary text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent-brand"
                placeholder="Aaditya Gunjal"
              />
              {errors.name ? (
                <p role="alert" className="text-xs text-red-400 mt-1">
                  {errors.name.message}
                </p>
              ) : null}
            </div>

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
                autoComplete="new-password"
                {...register('password')}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border text-primary text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent-brand"
                placeholder="At least 8 characters"
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
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-secondary text-xs text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-brand hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
