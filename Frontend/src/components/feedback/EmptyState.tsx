import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ title, description, action, className }: EmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center py-12 px-6 rounded-xl bg-surface border border-border',
      className,
    )}
  >
    <h3 className="text-primary text-sm font-semibold">{title}</h3>
    {description ? <p className="text-secondary text-xs mt-2 max-w-md">{description}</p> : null}
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);
