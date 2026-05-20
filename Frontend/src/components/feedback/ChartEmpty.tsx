import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ChartEmptyProps {
  icon: ReactNode;
  message: string;
  hint?: string;
  className?: string;
}

// Inline empty state for use *inside* a Card (e.g. dashboard widgets), where the
// surrounding chrome already provides the surface and heading. Differs from
// `EmptyState` which is a full-width page-level slot.
export const ChartEmpty = ({ icon, message, hint, className }: ChartEmptyProps) => (
  <div
    className={cn(
      'flex h-full w-full flex-col items-center justify-center gap-2 text-center px-4 py-6',
      className,
    )}
  >
    <div className="text-secondary/70" aria-hidden="true">
      {icon}
    </div>
    <p className="text-primary text-xs font-medium max-w-[28ch]">{message}</p>
    {hint ? <p className="text-secondary text-[11px] max-w-[28ch] leading-relaxed">{hint}</p> : null}
  </div>
);
