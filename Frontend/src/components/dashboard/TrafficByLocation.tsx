import ReactECharts from 'echarts-for-react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { accentBg, accentHex } from '../../lib/colors';
import { useThemeStore } from '../../store/themeStore';
import { TRAFFIC_BY_LOCATION } from '../../data/dashboardData';
import { useDashboardOverview } from '../../features/dashboard/useDashboard';

export const TrafficByLocation = () => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  const { data } = useDashboardOverview();
  const rows = data?.trafficByLocation ?? TRAFFIC_BY_LOCATION;

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
      <h3 className="text-primary text-sm font-semibold mb-4">Traffic by Location</h3>
      <div className="flex-1 grid grid-cols-2 items-center gap-4">
        <div className="h-full">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge />
        </div>
        <div className="space-y-4">
          {rows.map((item) => (
            <div key={item.country} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className={cn('w-1.5 h-1.5 rounded-full', accentBg(item.color))} />
                <span className="text-primary text-xs">{item.country}</span>
              </div>
              <span className="text-primary text-xs font-medium">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
