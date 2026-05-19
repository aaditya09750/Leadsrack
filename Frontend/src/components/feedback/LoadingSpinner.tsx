import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export const LoadingSpinner = ({ className, label = 'Loading' }: LoadingSpinnerProps) => (
  <div
    role="status"
    aria-live="polite"
    className={cn('inline-flex items-center gap-2 text-secondary text-sm', className)}
  >
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-secondary border-t-primary" />
    <span>{label}…</span>
  </div>
);
