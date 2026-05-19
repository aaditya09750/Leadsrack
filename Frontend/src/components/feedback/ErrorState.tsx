import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}: ErrorStateProps) => (
  <div
    role="alert"
    className={cn(
      'flex flex-col items-center justify-center text-center py-10 px-6 rounded-xl border border-border bg-surface',
      className,
    )}
  >
    <AlertTriangle size={20} className="text-accent-brand mb-3" />
    <h3 className="text-primary text-sm font-semibold">{title}</h3>
    <p className="text-secondary text-xs mt-1 max-w-md">{message}</p>
    {onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 px-3 py-1.5 rounded-lg bg-accent-brand text-white text-xs font-medium hover:opacity-90 transition-opacity"
      >
        Try again
      </button>
    ) : null}
  </div>
);
