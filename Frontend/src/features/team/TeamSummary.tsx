import { Briefcase, Trophy, Users, type LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/feedback/Skeleton';
import { cn } from '../../lib/utils';
import type { TeamSummary as TeamSummaryData } from '../../types/team';

interface Props {
  summary?: TeamSummaryData;
  loading: boolean;
}

interface Tile {
  label: string;
  value: string;
  sub: string;
  Icon: ComponentType<LucideProps>;
  bg: string;
}

export const TeamSummary = ({ summary, loading }: Props) => {
  if (loading || !summary) {
    return (
      <div className="flex flex-wrap gap-5 px-7 py-7">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="w-full sm:w-[270px] h-[96px] rounded-xl" />
        ))}
      </div>
    );
  }

  const tiles: Tile[] = [
    {
      label: 'Total members',
      value: String(summary.totalMembers),
      sub: `${summary.adminCount} admin · ${summary.salesCount} sales`,
      Icon: Users,
      bg: 'bg-stat-views',
    },
    {
      label: 'Total leads',
      value: String(summary.totalLeads),
      sub: 'across the team',
      Icon: Briefcase,
      bg: 'bg-stat-visits',
    },
    {
      label: 'Top performer',
      value: summary.topPerformer?.name ?? '—',
      sub: summary.topPerformer
        ? `${summary.topPerformer.totalLeads} lead${summary.topPerformer.totalLeads === 1 ? '' : 's'}`
        : 'no leads yet',
      Icon: Trophy,
      bg: 'bg-stat-newUsers',
    },
  ];

  return (
    <div className="flex flex-wrap gap-5 px-7 py-7">
      {tiles.map((t) => (
        <Card
          key={t.label}
          className={cn('flex items-center gap-4 w-full sm:w-[270px] flex-shrink-0', t.bg)}
        >
          <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center shrink-0">
            <t.Icon size={22} strokeWidth={1.75} className="text-ink" />
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <span className="text-ink text-sm font-semibold leading-none">{t.label}</span>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-display text-ink text-2xl font-bold leading-none truncate">
                {t.value}
              </span>
              <span className="text-ink/70 text-xs truncate">{t.sub}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
