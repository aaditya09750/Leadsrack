import type { ComponentType } from 'react';
import {
  BadgeCheck,
  Eye,
  Inbox,
  MousePointerClick,
  Percent,
  Sparkles,
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
import { usePeriodParam } from '../../features/dashboard/usePeriodParam';

const KPI_ICONS: Record<string, ComponentType<LucideProps>> = {
  // Lead-derived KPI keys (current backend)
  totalLeads: Users,
  newLeads: Sparkles,
  qualifiedLeads: BadgeCheck,
  conversionRate: Percent,
  // Legacy keys (offline fallback shape)
  views: Eye,
  visits: MousePointerClick,
  newUsers: UserPlus,
  activeUsers: Users,
};

// A KPI tile is "zero" if its value collapses to either "0" (counts) or "0.0%"
// (percentages). Used to surface a single all-zero hint above the cards instead
// of forcing each tile to grow an empty-state row.
function isZeroValue(value: string): boolean {
  const trimmed = value.trim();
  return trimmed === '0' || trimmed === '0.0%' || trimmed === '0%';
}

export const StatsGrid = () => {
  const [period] = usePeriodParam();
  const { data } = useDashboardOverview(period);
  const stats = data?.kpis ?? KPI_METRICS;
  const allZero = stats.length > 0 && stats.every((s) => isZeroValue(s.value));

  return (
    <div className="px-4 md:px-7 py-5 md:py-7">
      {allZero ? (
        <div className="mb-4 flex items-center gap-2 text-secondary text-xs">
          <Inbox size={14} strokeWidth={1.75} aria-hidden="true" />
          <span>
            No leads in the selected period. Try a wider range or create a new lead.
          </span>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-4 md:gap-5">
        {stats.map((stat) => {
          const Icon = KPI_ICONS[stat.key] ?? Eye;
          const hasChange = stat.change.trim().length > 0;
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
                  {hasChange ? (
                    <span className="inline-flex items-center gap-0.5 text-ink text-xs">
                      {stat.change}
                      {stat.positive ? (
                        <TrendingUp size={12} className="text-ink" />
                      ) : (
                        <TrendingDown size={12} className="text-ink" />
                      )}
                    </span>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
