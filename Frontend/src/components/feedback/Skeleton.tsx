import { cn } from '../../lib/utils';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn('bg-primary/5 rounded animate-pulse', className)} aria-hidden="true" />
);
