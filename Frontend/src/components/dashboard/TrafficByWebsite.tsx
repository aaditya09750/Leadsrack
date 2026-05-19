import ReactECharts from 'echarts-for-react';
import { Card } from '../ui/Card';
import { accentHex } from '../../lib/colors';
import { useThemeStore } from '../../store/themeStore';
import { TRAFFIC_BY_WEBSITE } from '../../data/dashboardData';
import { useDashboardOverview } from '../../features/dashboard/useDashboard';

export const TrafficByWebsite = () => {
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';
  const axisColor = isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(28, 28, 28, 0.85)';
  const inactiveColor = isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(28, 28, 28, 0.10)';

  const { data } = useDashboardOverview();
  const rows = data?.trafficByWebsite ?? TRAFFIC_BY_WEBSITE;

  // ECharts category axis renders bottom-up by default; reverse so the first item is at the top.
  const ordered = [...rows].reverse();

  const option = {
    backgroundColor: 'transparent',
    grid: { left: 80, right: 8, top: 4, bottom: 4, containLabel: false },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: isDark ? 'rgba(28, 28, 28, 0.92)' : 'rgba(255, 255, 255, 0.96)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(28, 28, 28, 0.10)',
      textStyle: {
        color: isDark ? '#FFFFFF' : '#1C1C1C',
        fontSize: 12,
        fontFamily: 'Inter',
      },
      padding: [8, 12],
      borderRadius: 8,
      formatter: (params: Array<{ name: string; value: number }>) => {
        const head = params[0];
        return head ? `${head.name}: ${head.value}%` : '';
      },
    },
    xAxis: {
      type: 'value',
      max: 100,
      show: false,
    },
    yAxis: {
      type: 'category',
      data: ordered.map((r) => r.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: axisColor, fontSize: 12, fontFamily: 'Inter', margin: 12 },
    },
    series: [
      {
        type: 'bar',
        barWidth: 4,
        showBackground: true,
        backgroundStyle: { color: inactiveColor, borderRadius: 2 },
        data: ordered.map((r) => ({
          value: r.value,
          itemStyle: {
            color: r.active ? accentHex('purple') : inactiveColor,
            borderRadius: 2,
          },
        })),
      },
    ],
  };

  return (
    <Card className="bg-surface h-full flex flex-col">
      <h3 className="text-primary text-sm font-semibold mb-4">Traffic by Website</h3>
      <div className="flex-1 min-h-[260px]">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge />
      </div>
    </Card>
  );
};
