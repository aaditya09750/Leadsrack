import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { register as registerApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { extractErrorMessage } from '../../lib/api';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { AuthShell, type AuthStep } from './AuthShell';

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(50),
    lastName: z.string().trim().min(1, 'Last name is required').max(50),
    email: z.string().email('Invalid email').max(254),
    password: z.string().min(8, 'Must be at least 8 characters').max(128),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-primary/5 border border-border text-primary text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent-brand';

const REGISTER_STEPS: AuthStep[] = [
  { label: 'Create account', state: 'active' },
  { label: 'Add your first leads', state: 'upcoming' },
  { label: 'Filter, export, track', state: 'upcoming' },
];

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
      const name = `${values.firstName} ${values.lastName}`.trim();
      const { user, token } = await registerApi({
        name,
        email: values.email,
        password: values.password,
      });
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
    <AuthShell
      hero={{
        title: 'Get started with Leadsrack',
        subtitle: 'Complete these easy steps to register your account.',
      }}
      steps={REGISTER_STEPS}
    >
      <h1 className="font-display text-primary text-xl font-semibold">Sign Up Account</h1>
      <p className="text-secondary text-xs mt-1 mb-7">
        Enter your personal data to create your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className="block text-secondary text-xs mb-1.5">
              First Name
            </label>
            <input
              id="firstName"
              {...register('firstName')}
              autoComplete="given-name"
              className={inputClass}
              placeholder="eg. John"
            />
            {errors.firstName ? (
              <p role="alert" className="text-xs text-red-400 mt-1">
                {errors.firstName.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-secondary text-xs mb-1.5">
              Last Name
            </label>
            <input
              id="lastName"
              {...register('lastName')}
              autoComplete="family-name"
              className={inputClass}
              placeholder="eg. Francisco"
            />
            {errors.lastName ? (
              <p role="alert" className="text-xs text-red-400 mt-1">
                {errors.lastName.message}
              </p>
            ) : null}
          </div>
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
            className={inputClass}
            placeholder="eg. johnfrans@gmail.com"
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
            autoComplete="new-password"
            placeholder="Enter your password"
            {...register('password')}
          />
          {errors.password ? (
            <p role="alert" className="text-xs text-red-400 mt-1">
              {errors.password.message}
            </p>
          ) : (
            <p className="text-xs text-muted mt-1">Must be at least 8 characters.</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-secondary text-xs mb-1.5">
            Confirm Password
          </label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <p role="alert" className="text-xs text-red-400 mt-1">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-lg bg-primary text-background text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>

      <p className="text-secondary text-xs text-center mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
};
