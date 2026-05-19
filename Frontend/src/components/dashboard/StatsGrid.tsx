import type { ComponentType } from 'react';
import {
  Eye,
  MousePointerClick,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  type LucideProps,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { KPI_METRICS } from '../../data/dashboardData';
import { useDashboardOverview } from '../../features/dashboard/useDashboard';

const KPI_ICONS: Record<string, ComponentType<LucideProps>> = {
  views: Eye,
  visits: MousePointerClick,
  newUsers: UserPlus,
  activeUsers: Users,
};

export const StatsGrid = () => {
  const { data } = useDashboardOverview();
  const stats = data?.kpis ?? KPI_METRICS;

  return (
    <div className="flex flex-wrap gap-5 px-7 py-7">
      {stats.map((stat) => {
        const Icon = KPI_ICONS[stat.key] ?? Eye;
        return (
          <Card
            key={stat.key}
            className={cn(
              'flex items-center gap-4 w-full sm:w-[270px] flex-shrink-0',
              `bg-stat-${stat.bgKey}`,
            )}
          >
            <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center shrink-0">
              <Icon size={22} strokeWidth={1.75} className="text-ink" />
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <span className="text-ink text-sm font-semibold leading-none">{stat.title}</span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display text-ink text-2xl font-bold leading-none">
                  {stat.value}
                </span>
                <span className="inline-flex items-center gap-0.5 text-ink text-xs">
                  {stat.change}
                  {stat.positive ? (
                    <TrendingUp size={12} className="text-ink" />
                  ) : (
                    <TrendingDown size={12} className="text-ink" />
                  )}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
