import ReactECharts from 'echarts-for-react';
import { Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { ChartEmpty } from '../feedback/ChartEmpty';
import { cn } from '../../lib/utils';
import { accentBg, accentHex } from '../../lib/colors';
import { useThemeStore } from '../../store/themeStore';
import { TRAFFIC_BY_LOCATION } from '../../data/dashboardData';
import { useDashboardOverview } from '../../features/dashboard/useDashboard';
import { usePeriodParam } from '../../features/dashboard/usePeriodParam';
import { PERIOD_LABELS } from '../../types/dashboard';

export const TrafficByLocation = () => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const [period] = usePeriodParam();
  const { data } = useDashboardOverview(period);
  const rows = data?.trafficByLocation ?? TRAFFIC_BY_LOCATION;
  const hasData = rows.length > 0 && rows.some((r) => r.percentage > 0);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? 'rgba(28, 28, 28, 0.92)' : 'rgba(255, 255, 255, 0.96)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(28, 28, 28, 0.10)',
      textStyle: {
        color: isDark ? '#FFFFFF' : '#1C1C1C',
        fontSize: 12,
        fontFamily: 'Inter',
      },
      formatter: (params: { name: string; value: number; percent: number }) =>
        `${params.name}: ${params.value}%`,
      padding: [8, 12],
      borderRadius: 8,
    },
    series: [
      {
        type: 'pie',
        radius: ['62%', '92%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 4,
          itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.25)' },
        },
        data: rows.map((r) => ({
          name: r.country,
          value: r.percentage,
          itemStyle: { color: accentHex(r.color), borderWidth: 0 },
        })),
      },
    ],
  };

  return (
    <Card className="bg-surface h-[340px] flex flex-col">
      <h3 className="text-primary text-sm font-semibold mb-4">Leads by Owner</h3>
      {hasData ? (
        <div className="flex-1 grid grid-cols-2 items-center gap-4">
          <div className="h-full">
            <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge />
          </div>
          <div className="space-y-4">
            {rows.map((item) => (
              <div key={item.country} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', accentBg(item.color))} />
                  <span className="text-primary text-xs truncate">{item.country}</span>
                </div>
                <span className="text-primary text-xs font-medium shrink-0">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1">
          <ChartEmpty
            icon={<Users size={32} strokeWidth={1.25} />}
            message={`No team member has leads in ${PERIOD_LABELS[period]}.`}
            hint="Once anyone creates leads in this period, their share will appear here."
          />
        </div>
      )}
    </Card>
  );
};
